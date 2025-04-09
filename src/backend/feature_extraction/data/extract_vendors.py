import json

# Load your dataset
with open('dataset.json', 'r') as f:
    data = json.load(f)

# Extract the top-level keys (e.g., "Roku4_yourthings.csv")
device_names = list(data.keys())

# Print the results
print("Extracted device entries:")
for name in device_names:
    print(name)

# Optionally: Save to a file for reviewing
# with open("device_names.txt", "w") as out_file:
#     for name in device_names:
#         out_file.write(f"{name}\n")

print(f"\nTotal: {len(device_names)} devices extracted and saved to 'device_names.txt'")
