import pandas as pd
import re
from collections import Counter
from .vendor_catalog import vendors
import io

# Only special cases that need normalization
vendor_normalization = {
    #"smartthings": "samsung",
    "dlink": "d-link",
    "cypress semiconductor": "infineon",
    "nest": "google",
    "wemo": "belkin"
}

def normalize_vendor(vendor):
    return vendor_normalization.get(vendor.lower(), vendor.lower())  # Use mapped name if exists, otherwise original

# def label_vendor(enriched_data_path):
#     enriched_data = pd.read_csv(enriched_data_path, dtype=str).fillna("")

#     irrelevant_phrases = ["google play", "google account", "google.com", "google:"]  # Keeping "Google" in vendors

#     device_vendors = {}

#     for index, row in enriched_data.iterrows():
#         # Assuming the device name is in a column called "device_name"
#         device_name = row.get('device_name', enriched_data_path.split("/")[-1])  # Use the 'device_name' column if it exists, otherwise fallback to the filename
#         row_text = " ".join(row.astype(str)).lower()

#         # Remove irrelevant phrases from the text
#         for phrase in irrelevant_phrases:
#             row_text = row_text.replace(phrase, "")

#         vendor_counts = Counter()

#         # Count occurrences and print matches for debugging
#         for vendor in vendors:
#             normalized_vendor = normalize_vendor(vendor)  # Normalize before checking
#             matches = re.findall(rf'\b{re.escape(vendor)}\b', row_text, re.IGNORECASE)
#             if matches:
#                 count = len(matches)
#                 vendor_counts[normalized_vendor] += count  # Store under normalized name

#                 # 🔍 Debugging: Print vendor and the number of occurrences
#                 print(f"[DEBUG] Device: {device_name}, Vendor: {normalized_vendor}, Occurrences: {count}")

#         print(f"\n[DEBUG] Final counts for {device_name}: {dict(vendor_counts)}")

#         if vendor_counts:
#             # Get the maximum occurrence count
#             max_count = max(vendor_counts.values())
#             # Find all vendors with the maximum count
#             max_vendors = [vendor for vendor, count in vendor_counts.items() if count == max_count]

#             # If "google" is one of the max vendors, check if it's the only one
#             if "google" in max_vendors:
#                 if len(max_vendors) > 1:
#                     max_vendors.remove("google")

#             # If there are still vendors left after removing Google, choose the one with the highest count
#             if max_vendors:
#                 most_likely_vendor = max_vendors[0]  # This assumes that all remaining vendors have the same count
#                 device_vendors[device_name] = (most_likely_vendor, max_count)
#             else:
#                 # If only "google" remains in the tie, return None (or choose another tie-breaking logic)
#                 device_vendors[device_name] = (None, 0)
#         else:
#             device_vendors[device_name] = (None, 0)

#     return device_vendors

def label_vendor(csv_input):
    is_file_path = isinstance(csv_input, str)
    if isinstance(csv_input, str):
        csv_data = csv_input
    elif hasattr(csv_input, 'read'):  # It's a file-like object
        csv_data = csv_input
    else:
        raise TypeError("Invalid input: expected a file path, string, or file-like object.")
    if hasattr(csv_data, 'seek'):
        csv_data.seek(0)
    enriched_data = pd.read_csv(csv_data, dtype=str).fillna("")

    irrelevant_phrases = ["google play", "google account", "google.com", "google:", "google translate", "google maps", "google scholar", "google gemini"]
    device_vendors = {}

    for index, row in enriched_data.iterrows():
        device_name = row.get('device_name', csv_input.split("/")[-1] if is_file_path else f"row_{index}")
        row_text = " ".join(row.astype(str)).lower()

        for phrase in irrelevant_phrases:
            row_text = row_text.replace(phrase, "")

        vendor_counts = Counter()

        for vendor in vendors:
            normalized_vendor = normalize_vendor(vendor)
            matches = re.findall(rf'\b{re.escape(vendor)}\b', row_text, re.IGNORECASE)
            if matches:
                vendor_counts[normalized_vendor] += len(matches)
                print(f"[DEBUG] Device: {device_name}, Vendor: {normalized_vendor}, Occurrences: {len(matches)}")

        print(f"\n[DEBUG] Final counts for {device_name}: {dict(vendor_counts)}")

        if vendor_counts:
            max_count = max(vendor_counts.values())
            max_vendors = [v for v, c in vendor_counts.items() if c == max_count]

            if "google" in max_vendors and len(max_vendors) > 1:
                max_vendors.remove("google")

            if max_vendors:
                device_vendors[device_name] = (max_vendors[0], max_count)
            else:
                device_vendors[device_name] = (None, 0)
        else:
            device_vendors[device_name] = (None, 0)

    return device_vendors

def main():
    # Example usage
    results = label_vendor("feature_extraction/data/enriched_dataset2.csv")

    for device, (vendor, count) in results.items():
        print(f"Device: {device} -> Identified Vendor: {vendor} (Occurrences: {count})")

if __name__ == "__main__":
    main()
