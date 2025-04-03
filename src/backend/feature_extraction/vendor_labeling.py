# import pandas as pd
# from fuzzywuzzy import fuzz
# from vendor_catalog import vendors  # Import vendors from your vendor_catalog.py

# # Function to calculate fuzzy confidence score for a vendor in a given feature
# def calculate_confidence(vendor, feature):
#     # Using fuzzywuzzy to calculate the ratio of similarity between the vendor name and the feature value
#     similarity_score = fuzz.partial_ratio(vendor.lower(), feature.lower())  # Case-insensitive comparison
#     return similarity_score

# # Function to perform vendor labeling
# def label_vendor(enriched_data_path):
#     # Load the enriched dataset
#     enriched_data = pd.read_csv(enriched_data_path)

#     # Initialize a dictionary to hold the total score for each vendor
#     vendor_scores = {vendor: 0 for vendor in vendors}

#     # Loop through each row in the enriched dataset (each feature for a device)
#     for index, row in enriched_data.iterrows():
#         # Loop through all the feature columns in each row (adjust based on your actual column names)
#         for feature_name, feature_value in row.items():
#             if isinstance(feature_value, str):  # Ensure feature is a string
#                 # For each vendor, calculate the fuzzy confidence score
#                 for vendor in vendors:
#                     vendor_scores[vendor] += calculate_confidence(vendor, feature_value)

#     # Find the vendor with the highest score
#     best_vendor = max(vendor_scores, key=vendor_scores.get)

#     return best_vendor

# # Example usage
# if __name__ == "__main__":
#     enriched_data_path = 'data/enriched_dataset.csv'  # Path to your enriched dataset
#     best_vendor = label_vendor(enriched_data_path)
#     print(f"The identified vendor for the device is: {best_vendor}")


#####################
#TEST EXACT MATCHING#
#####################
import pandas as pd
import re
from collections import Counter
from vendor_catalog import vendors

# Only special cases that need normalization
vendor_normalization = {
    "hewlett packard": "hpe",
    "hp enterprise": "hpe",
    "hewlett-packard": "hpe",
    "tyco electronics": "te connectivity"
}

def normalize_vendor(vendor):
    return vendor_normalization.get(vendor.lower(), vendor.lower())  # Use mapped name if exists, otherwise original

def label_vendor(enriched_data_path):
    enriched_data = pd.read_csv(enriched_data_path, dtype=str).fillna("")

    irrelevant_phrases = ["google play", "google account", "google.com", "google:"]  # Keeping "Google" in vendors

    device_vendors = {}

    for index, row in enriched_data.iterrows():
        # Assuming the device name is in a column called "device_name"
        device_name = row.get('device_name', enriched_data_path.split("/")[-1])  # Use the 'device_name' column if it exists, otherwise fallback to the filename
        row_text = " ".join(row.astype(str)).lower()

        # Remove irrelevant phrases from the text
        for phrase in irrelevant_phrases:
            row_text = row_text.replace(phrase, "")

        vendor_counts = Counter()

        # Count occurrences and print matches for debugging
        for vendor in vendors:
            normalized_vendor = normalize_vendor(vendor)  # Normalize before checking
            matches = re.findall(rf'\b{re.escape(vendor)}\b', row_text, re.IGNORECASE)
            if matches:
                count = len(matches)
                vendor_counts[normalized_vendor] += count  # Store under normalized name

                # 🔍 Debugging: Print vendor and the number of occurrences
                print(f"[DEBUG] Device: {device_name}, Vendor: {normalized_vendor}, Occurrences: {count}")

        print(f"\n[DEBUG] Final counts for {device_name}: {dict(vendor_counts)}")

        if vendor_counts:
            # Get the maximum occurrence count
            max_count = max(vendor_counts.values())
            # Find all vendors with the maximum count
            max_vendors = [vendor for vendor, count in vendor_counts.items() if count == max_count]

            # If "google" is one of the max vendors, remove it from the list
            if "google" in max_vendors:
                max_vendors.remove("google")

            # If there are still vendors left after removing Google, choose the one with the highest count
            if max_vendors:
                most_likely_vendor = max_vendors[0]  # This assumes that all remaining vendors have the same count
                device_vendors[device_name] = (most_likely_vendor, max_count)
            else:
                # If only "google" remains in the tie, return None (or choose another tie-breaking logic)
                device_vendors[device_name] = (None, 0)
        else:
            device_vendors[device_name] = (None, 0)

    return device_vendors

# Example usage
results = label_vendor("data/enriched_dataset.csv")

for device, (vendor, count) in results.items():
    print(f"Device: {device} -> Identified Vendor: {vendor} (Occurrences: {count})")
