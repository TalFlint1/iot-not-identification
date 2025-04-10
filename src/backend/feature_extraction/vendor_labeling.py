import pandas as pd
import re
from collections import Counter
from vendor_catalog import vendors

# Only special cases that need normalization
vendor_normalization = {
    "hewlett packard": "hpe",
    "hp enterprise": "hpe",
    "hewlett-packard": "hpe",
    "tyco electronics": "te connectivity",
    "smartthings": "samsung",
    "dlink": "d-link",
    "cypress semiconductor": "infineon",
    "nest": "google"
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
results = label_vendor("data/enriched_dataset2.csv")

for device, (vendor, count) in results.items():
    print(f"Device: {device} -> Identified Vendor: {vendor} (Occurrences: {count})")
