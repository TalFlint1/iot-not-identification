#############################
# Iterate by chunks w. BART #
#############################
from transformers import pipeline
import numpy as np
import pandas as pd
from .function_catalog import functions as master_functions
from .vendor_function_map import vendor_function_map
from .vendor_labeling import label_vendor
import ast
from nltk.tokenize import sent_tokenize
from transformers import AutoTokenizer
import nltk
nltk.download("punkt")
import io

# Load BART Zero-Shot Classifier
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-mnli")

def split_into_chunks(text, max_tokens=50):
    """
    Splits the text into chunks based on sentence boundaries,
    ensuring each chunk doesn't exceed the max token count.
    """
    if not text:
        return []

    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = ""
    current_tokens = 0

    for sentence in sentences:
        token_count = len(tokenizer.tokenize(sentence))
        if current_tokens + token_count <= max_tokens:
            current_chunk += " " + sentence
            current_tokens += token_count
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence
            current_tokens = token_count

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def normalize(text):
    return text.strip().lower() if text else ""

def get_candidate_labels(vendor=None):
    normalized_vendor = normalize(vendor)
    candidate_labels = vendor_function_map.get(normalized_vendor, master_functions)
    if not candidate_labels:  # Ensure labels are available
        raise ValueError(f"No candidate labels found for vendor: {vendor}")
    return candidate_labels

def clean_feature(feature):
    if not feature or (isinstance(feature, str) and not feature.strip()):
        return None

    # Flatten nested lists into a single readable paragraph
    if isinstance(feature, list):
        flat = []

        def flatten(item):
            if isinstance(item, list):
                for sub in item:
                    flatten(sub)
            else:
                flat.append(str(item))

        flatten(feature)
        return ". ".join(flat)

    return str(feature)

def detect_feature_type(col, val):
    """
    Detects the feature type (e.g., domain, description, mac) based on column name.
    Prioritizes enriched features with a higher weight.
    """
    val = str(val).lower()
    if 'enriched' in col:
        if 'dns' in col or 'host' in col:
            return "domain"
        if 'user_agent' in col:
            return "description"
        if 'mac' in col:
            return "mac"
        return "other"
    if 'dns' in col or 'host' in col:
        return "domain"
    if 'user_agent' in col:
        return "description"
    if 'mac' in col:
        return "mac"
    return "other"

def function_labeling(enriched_features, vendor=None, max_tokens=50):
    """
    Function labeling based on confident top-labels only (score ≥ 0.6).
    Only the most likely label per chunk is considered if it's confident enough.
    """
    if vendor and vendor.lower() in vendor_function_map:
        candidate_labels = vendor_function_map[vendor.lower()]
    else:
        candidate_labels = master_functions

    confidence_scores = {label: [] for label in candidate_labels}
    best_chunks = {}

    allowed_cols = [
        "enriched_hostnames", "enriched_dns_queries", "enriched_reverse_dns",
        "enriched_tls_server_names", "enriched_tls_cert_domains",
        "enriched_user_agents", "enriched_mac_address"]

    for feature, col in enriched_features:
        if not any(col.lower().startswith(allowed) for allowed in allowed_cols):
            continue

        cleaned = clean_feature(feature)
        if not cleaned:
            continue

        chunks = split_into_chunks(cleaned, max_tokens=max_tokens)
        for chunk in chunks:
            hypothesis_template = "This is a {} type of device."
            result = classifier(chunk, candidate_labels, hypothesis_template=hypothesis_template)

            scores = result["scores"]
            labels = result["labels"]

            if not scores or not labels:
                continue

            #🔍 DEBUG PRINT: All scores for this chunk
            print(f"\n[CHUNK DEBUG] {col} - Chunk: {chunk}...")
            for label, score in zip(labels, scores):
                print(f"    {label}: {score:.2f}")

            top_score = scores[0]
            top_label = labels[0]

            # Filter out low-confidence predictions
            if top_score < 0.6:
                continue

            col_lower = col.lower()
            if 'user_agent' in col_lower:
                weight = 1.5 if 'enriched' in col_lower else 1.2  # Stronger weight for user agent clues
            elif 'enriched' in col_lower:
                weight = 1.0
            else:
                weight = 0.5

            weighted_score = top_score * weight
            confidence_scores[top_label].append(weighted_score)

            # Update best chunk for this label if it's better
            if top_label not in best_chunks or weighted_score > best_chunks[top_label][0]:
                best_chunks[top_label] = (weighted_score, chunk)

    # Aggregate by averaging (or summing) scores for each label
    aggregated_scores = {}
    for label, scores in confidence_scores.items():
        if scores:
            aggregated_scores[label] = sum(scores) / len(scores)
        else:
            aggregated_scores[label] = 0

    # Sort labels by their aggregated score (descending)
    sorted_labels = sorted(aggregated_scores.items(), key=lambda x: x[1], reverse=True)

    final_label, final_score = sorted_labels[0]
    print(f"[TOP LABEL] {final_label} ({final_score:.2f})")

    if len(sorted_labels) > 1:
        second_label, second_score = sorted_labels[1]
        print(f"[SECOND LABEL] {second_label} ({second_score:.2f})")
    else:
        print("[SECOND LABEL] None")

    best_sequence = best_chunks.get(final_label, (0, "[No best sequence found]"))[1]


    print(f"[MATCHING CHUNK] Best matching chunk for '{final_label}':\n{best_sequence}")
    return final_label, aggregated_scores[final_label], best_sequence

def run_function_labeling_from_csv(csv_input):
    if isinstance(csv_input, str):
        csv_data = csv_input
        is_file_path = True
    elif hasattr(csv_input, 'read'):  # It's an uploaded file or other file-like object
        csv_data = csv_input
        is_file_path = False
    else:
        raise TypeError("Invalid input: expected a file path, string, or file-like object.")

    vendor_labels = label_vendor(csv_input)  # Pass the same input as-is
    if hasattr(csv_data, 'seek'):
        csv_data.seek(0)
    df = pd.read_csv(csv_data, dtype=str).fillna("")

    function_results = {}

    for index, row in df.iterrows():
        default_name = csv_input.split("/")[-1] if is_file_path else f"row_{index}"
        device_name = row.get("device_name", default_name)
        vendor, _ = vendor_labels.get(device_name, (None, 0))  # Get the vendor using the label_vendor result
        enriched_features = []

        # Prepare enriched features and detect their types
        for col, val in row.items():
            try:
                parsed = ast.literal_eval(val)
                enriched_features.append((parsed, col))  # Store feature and column name for later type detection
            except (ValueError, SyntaxError):
                enriched_features.append((val, col))

        print(f"\n[INFO] Classifying: {device_name}, Vendor: {vendor}")
        for feature, col in enriched_features:
            if "enriched_dns" in col.lower() or "enriched_hostname" in col.lower():
                print(f"[DEBUG] {device_name} - {col}: {feature}")
        final_label, score, justification = function_labeling(enriched_features, vendor)
        print(f"[RESULT] {device_name}: {final_label} ({score:.2f})")
        function_results[device_name] = (final_label, score, justification)

    final_results = []

    for device_name in function_results:
        function, score, justification = function_results[device_name]
        vendor, _ = vendor_labels.get(device_name, ("Unknown", 0))

        result = {
            "device": f"{vendor} {function}".strip(),
            "confidence": round(score * 100, 2),  # turn into percentage
            "justification": justification
        }
        final_results.append(result)

    return final_results[0]

if __name__ == "__main__":
    # Run the function labeling from the enriched dataset CSV
    run_function_labeling_from_csv("feature_extraction/data/output_test1_iot.csv")
