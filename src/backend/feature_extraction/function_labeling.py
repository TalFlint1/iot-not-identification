from transformers import pipeline
import numpy as np

# Initialize the zero-shot classifier with RoBERTa
classifier = pipeline("zero-shot-classification", model="roberta-large-mnli")

# Catalog of IoT functions (same as in function_catalog.py)
candidate_labels = [
    "Voice Assistant", "Smart Lighting", "Smart Thermostat", "Plug",
    "Security Cameras", "Health Wearables", "Smart Lock", "Smart Appliance",
    "Smart Refrigerator", "Smart Washing Machine", "Smart TV",
    "Smart Speakers", "Connected Vehicle", "Smart Home Hub", "Smart Kitchen Devices",
    "Smart Blinds", "Smart Faucets", "Smoke and CO Detectors", "Robot Vacuums",
    "Smart Fans", "Smart Pet Devices", "Amazon Echo", "Nest", "NETGEAR"
    # Include all your function labels here
]

# Example enriched feature values (replace with actual enriched values)
enriched_features = [
    "This device controls lighting and brightness with voice commands.",
    "Smart lock that connects to the internet and secures doors.",
    "Wearable health monitoring device that tracks steps and heart rate."
]

# Function to classify each enriched feature value with zero-shot classification
def classify_function(enriched_feature, candidate_labels):
    # Run zero-shot classification with RoBERTa
    result = classifier(enriched_feature, candidate_labels)
    return result["labels"][0], result["scores"][0]  # Return function label and confidence score

# Algorithm for function labeling based on the pseudo-code
def function_labeling(enriched_features, candidate_labels):
    # Initialize a dictionary to store the aggregated confidence scores for each function label
    confidence_scores = {label: [] for label in candidate_labels}

    # Step 1: Classify each enriched feature and collect confidence scores
    for feature in enriched_features:
        for label in candidate_labels:
            function_label, confidence = classify_function(feature, [label])
            confidence_scores[label].append(confidence)

    # Step 2: Aggregate confidence scores for each function label (average in this case)
    aggregated_scores = {label: np.mean(scores) for label, scores in confidence_scores.items()}

    # Step 3: Select the label with the highest aggregated confidence score
    final_label = max(aggregated_scores, key=aggregated_scores.get)
    return final_label, aggregated_scores[final_label]

# Example usage of the function labeling algorithm
final_function_label, confidence = function_labeling(enriched_features, candidate_labels)

print(f"Final Function Label: {final_function_label}, Confidence: {confidence}")
