import json
from vendor_function_map import vendor_function_map
from vendor_catalog import vendors

# Normalize both to lowercase for accurate comparison
catalog_set = set(v.lower() for v in vendors)
map_set = set(vendor_function_map.keys())

# Find missing vendors (in catalog but not in map)
missing_vendors = catalog_set - map_set

# Add them with empty lists
for vendor in missing_vendors:
    vendor_function_map[vendor] = []

print(f"Added {len(missing_vendors)} vendors with empty lists.")

# Now save the updated dictionary back into vendor_function_map.py
with open("vendor_function_map.py", "w") as f:
    f.write("vendor_function_map = {\n")
    for vendor, functions in sorted(vendor_function_map.items()):
        f.write(f'    "{vendor}": {functions},\n')
    f.write("}\n")
