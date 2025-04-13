#############################
# Iterate by chunks w. BART #
#############################
from transformers import pipeline
import numpy as np
import pandas as pd
from function_catalog import functions as master_functions
from vendor_function_map import vendor_function_map
from vendor_labeling import label_vendor
import ast
from nltk.tokenize import sent_tokenize
from transformers import AutoTokenizer
import nltk
nltk.download("punkt")

# Load RoBERTa Zero-Shot Classifier
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
    if 'enriched' in col:  # Give higher priority to enriched fields
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
    Implements the function labeling algorithm with soft vendor-based restriction
    and feature-by-feature score aggregation, integrating text chunking logic.
    """
    # Get candidate labels from vendor_function_map if vendor exists, else use master_functions
    if vendor and vendor.lower() in vendor_function_map:
        candidate_labels = vendor_function_map[vendor.lower()]
    else:
        candidate_labels = master_functions  # Fallback to general functions if vendor is not found
    
    confidence_scores = {label: [] for label in candidate_labels}
    best_chunks = {}

    # Define which columns to allow
    allowed_cols = ["enriched_hostnames", "enriched_dns_queries", "enriched_reverse_dns", "enriched_tls_server_names", "enriched_tls_cert_domains", "enriched_user_agents"]

    # For each feature (loop through the enriched features)
    for feature, col in enriched_features:
        if not any(col.lower().startswith(allowed) for allowed in allowed_cols):
            #print(f"[SKIPPED] Not an allowed column: {col}")
            continue

        cleaned = clean_feature(feature)
        if not cleaned:
            print(f"[SKIPPED] Empty feature in column: {col}")
            continue
        #print(f"Cleaning and classifying: {col}: {cleaned}")
        feature_type = detect_feature_type(col, cleaned)  # Detect the feature type
        #print(f"Detected feature type: {feature_type}")

        # Split large text features into chunks (if applicable)
        chunks = split_into_chunks(cleaned, max_tokens=max_tokens)
        for chunk in chunks:
            hypothesis_template = "This feature belongs to an IoT device and can perform the function of a {}."
            result = classifier(chunk, candidate_labels, hypothesis_template=hypothesis_template)
            print("this is result: ", result)

            # === Check if the prediction is meaningful ===
            scores = result["scores"]
            top_score = scores[0]
            second_score = scores[1] if len(scores) > 1 else 0
            score_diff = top_score - second_score

            # Only continue if the chunk is meaningful (customizable thresholds)
            if top_score < 0.4:
                print(f"[SKIPPED CHUNK] Not confident enough — top score: {top_score:.2f}, diff: {score_diff:.2f}")
                continue  # Skip this chunk

            # Apply weight based on feature type (higher weight for enriched fields)
            weight = 1.0 if 'enriched' in col else 0.5

            # Track both max score and its sequence
            for label, score in zip(result["labels"], result["scores"]):
                weighted_score = score * weight
                if not confidence_scores[label] or weighted_score > max(confidence_scores[label]):
                    confidence_scores[label].append(weighted_score)
                    best_chunks[label] = chunk  # NEW: Save best chunk for this label
    
    #Use the maximum score per label instead of the mean
    aggregated_scores = {label: max(scores) if scores else 0 for label, scores in confidence_scores.items()}
    final_label = max(aggregated_scores, key=aggregated_scores.get)
    best_sequence = best_chunks.get(final_label, "[No best sequence found]")
    print(f"[MATCHING CHUNK] Best matching chunk for '{final_label}':\n{best_sequence}")
    return final_label, aggregated_scores[final_label], best_sequence


# === Example usage from enriched CSV ===
def run_function_labeling_from_csv(csv_path):
    # Get vendor labels dynamically from vendor_labeling.py
    vendor_labels = label_vendor(csv_path)  # This will give a dictionary of device_name -> (vendor, count)
    
    df = pd.read_csv(csv_path, dtype=str).fillna("")

    function_results = {}

    for index, row in df.iterrows():
        device_name = row.get("device_name", f"row_{index}")
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
        # Print enriched DNS and hostname for this device
        for feature, col in enriched_features:
            if "enriched_dns" in col.lower() or "enriched_hostname" in col.lower():
                print(f"[DEBUG] {device_name} - {col}: {feature}")
        final_label, score, justification = function_labeling(enriched_features, vendor)
        print(f"[RESULT] {device_name}: {final_label} ({score:.2f})")
        function_results[device_name] = (final_label, score)

    final_results = []

    for device_name in function_results:
        function, score = function_results[device_name]
        vendor, _ = vendor_labels.get(device_name, ("Unknown", 0))
        
        result = {
            "device": f"{vendor} {function}".strip(),
            "confidence": round(score * 100, 2),  # turn into percentage
            "justification": justification
        }
        final_results.append(result)

    return final_results[0]

# Run the function labeling from the enriched dataset CSV
run_function_labeling_from_csv("data/enriched_dataset2.csv")
