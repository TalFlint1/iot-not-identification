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
import csv
from vendor_catalog import vendors  # Assuming vendors are imported from the vendor_catalog.py file

# Function to match the vendor using exact string matching
def match_vendor_exact(feature, vendors):
    for vendor in vendors:
        if vendor in feature:  # Exact string match
            return vendor
    return None  # Return None if no exact match is found

# Load enriched dataset
def load_enriched_data(file_path):
    enriched_data = []
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)  # Skip header row
        for row in reader:
            enriched_data.append(row)  # Assuming each row is a list of feature values
    return enriched_data

# Perform vendor labeling and count the occurrences of each vendor
def label_vendor_with_exact_match_and_count(enriched_data, vendors):
    vendor_count = {vendor: 0 for vendor in vendors}  # Initialize a count for each vendor
    labeled_data = []

    for row in enriched_data:
        feature_values = row  # Assuming each row contains multiple feature values
        vendor = None
        for feature in feature_values:
            matched_vendor = match_vendor_exact(feature, vendors)
            if matched_vendor:
                vendor_count[matched_vendor] += 1  # Increment the count for this vendor
                vendor = matched_vendor  # Label the row with this vendor
                break  # If a match is found, stop checking other features
        
        labeled_data.append((row, vendor))  # Store the row along with the matched vendor

    return labeled_data, vendor_count

# Path to the enriched dataset
enriched_data_path = 'data/enriched_dataset.csv'

# Load the enriched dataset
enriched_data = load_enriched_data(enriched_data_path)

# Perform the vendor labeling and count occurrences
labeled_data, vendor_count = label_vendor_with_exact_match_and_count(enriched_data, vendors)

# Print the results
for row, vendor in labeled_data:
    print(f"Features: {row} => Vendor: {vendor}")

# Print the vendor counts (how many times each vendor appeared)
print("\nVendor Occurrences Count:")
for vendor, count in vendor_count.items():
    print(f"{vendor}: {count}")

