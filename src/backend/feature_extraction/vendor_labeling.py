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
from collections import Counter
from vendor_catalog import vendors
def label_vendor(enriched_data_path, vendor_catalog_path):
    # Load enriched dataset
    enriched_data = pd.read_csv(enriched_data_path, dtype=str).fillna("")
    
    # Initialize counter for vendor occurrences
    vendor_counts = Counter()

    # Iterate over each row in the enriched dataset
    for _, row in enriched_data.iterrows():
        row_text = " ".join(row.astype(str)).lower()  # Convert entire row to lowercase and join as a single string
        
        # Count occurrences of each vendor in the row
        for vendor in vendors:
            if vendor in row_text:
                vendor_counts[vendor] += row_text.count(vendor)
                print("vendor: ", vendor)

    # Find the vendor with the highest count
    if vendor_counts:
        most_likely_vendor = max(vendor_counts, key=vendor_counts.get)
        return most_likely_vendor, vendor_counts[most_likely_vendor]
    else:
        return None, 0

# Example usage
vendor_label, count = label_vendor("data/enriched_dataset.csv", "vendor_catalog.py")
print(f"Identified Vendor: {vendor_label} (Occurrences: {count})")
