# from transformers import pipeline
# import numpy as np
# from feature_extraction.function_catalog import functions
# from feature_extraction.vendor_function_map import vendor_function_map

# # === Initialize RoBERTa Zero-Shot Classifier === #
# classifier = pipeline("zero-shot-classification", model="roberta-large-mnli")

# def normalize(text):
#     return text.strip().lower()

# def get_candidate_labels(vendor=None):
#     """
#     Returns a list of candidate labels based on the vendor.
#     Soft restriction: if vendor is known and mapped, use its functions; else use full list.
#     """
#     if vendor:
#         normalized_vendor = normalize(vendor)
#         if normalized_vendor in vendor_function_map:
#             return vendor_function_map[normalized_vendor]
#     return functions

# def classify_function(feature, candidate_labels):
#     """
#     Classifies a single enriched feature using RoBERTa and returns top label and its score.
#     """
#     result = classifier(feature, candidate_labels)
#     return result["labels"][0], result["scores"][0]

# def function_labeling(enriched_features, vendor=None):
#     """
#     Implements the function labeling algorithm with soft vendor-based restriction.
#     """
#     candidate_labels = get_candidate_labels(vendor)
#     confidence_scores = {label: [] for label in candidate_labels}

#     # Step 1: Run zero-shot classification for each enriched feature
#     for feature in enriched_features:
#         for label in candidate_labels:
#             _, confidence = classify_function(feature, [label])
#             confidence_scores[label].append(confidence)

#     # Step 2: Aggregate the scores (average)
#     aggregated_scores = {label: np.mean(scores) for label, scores in confidence_scores.items()}

#     # Step 3: Pick the label with the highest average score
#     final_label = max(aggregated_scores, key=aggregated_scores.get)
#     return final_label, aggregated_scores[final_label]

# # === Example usage === #
# if __name__ == "__main__":
#     enriched_features = [
#         "Smart lock that connects to the internet and secures doors.",
#         "Wearable health monitoring device that tracks steps and heart rate.",
#     ]
#     vendor = "Samsung"  # Optional: test with or without vendor
#     final_label, confidence = function_labeling(enriched_features, vendor)
#     print(f"Predicted Function: {final_label}, Confidence: {confidence:.2f}")

#################
# First Attempt #
#################
from transformers import pipeline
import numpy as np
import pandas as pd
from function_catalog import functions as master_functions
from vendor_function_map import vendor_function_map
from vendor_labeling import label_vendor
import ast

# Load RoBERTa Zero-Shot Classifier
classifier = pipeline("zero-shot-classification", model="roberta-large-mnli")

def normalize(text):
    return text.strip().lower() if text else ""

def get_candidate_labels(vendor=None):
    normalized_vendor = normalize(vendor)
    candidate_labels = vendor_function_map.get(normalized_vendor, master_functions)
    if not candidate_labels:  # Ensure labels are available
        raise ValueError(f"No candidate labels found for vendor: {vendor}")
    return candidate_labels

def classify_function(feature, candidate_labels):
    """
    Classifies a single enriched feature using RoBERTa and returns top label and its score.
    """
    result = classifier(feature, candidate_labels)
    print(f"[DEBUG] All label scores: {result['labels']} -> {result['scores']}")
    return result["labels"][0], result["scores"][0]

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
        return " ".join(flat)  # You can also join with ". " if you want more structure

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

def function_labeling(enriched_features, vendor=None):
    """
    Implements the function labeling algorithm with soft vendor-based restriction
    and feature-by-feature score aggregation.
    """
    candidate_labels = get_candidate_labels(vendor)
    confidence_scores = {label: [] for label in candidate_labels}

    # For each feature (loop through the enriched features)
    for feature, col in enriched_features:
        cleaned = clean_feature(feature)
        if not cleaned:
            continue
        print(f"Cleaning and classifying: {col}: {cleaned}")
        feature_type = detect_feature_type(col, cleaned)  # Detect the feature type
        print(f"Detected feature type: {feature_type}")
        
        result = classifier(cleaned, candidate_labels)  # Classify the cleaned feature

        # Apply weight based on feature type (higher weight for enriched fields)
        weight = 1.0 if 'enriched' in col else 0.5

        for label, score in zip(result["labels"], result["scores"]):
            confidence_scores[label].append(score * weight)

    # Average the scores
    aggregated_scores = {label: np.mean(scores) for label, scores in confidence_scores.items()}
    final_label = max(aggregated_scores, key=aggregated_scores.get)
    return final_label, aggregated_scores[final_label]

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
        final_label, score = function_labeling(enriched_features, vendor)
        print(f"[RESULT] {device_name}: {final_label} ({score:.2f})")
        function_results[device_name] = (final_label, score)

    return function_results

# Run the function labeling from the enriched dataset CSV
run_function_labeling_from_csv("data/enriched_dataset.csv")
