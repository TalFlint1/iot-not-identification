functions = [
    "Voice Assistant",
    "Smart Lighting",
    "Smart Thermostat",
    "Plug",
    "Security Camera",
    "Health Wearable",
    "Smart Lock",
    "Smart Appliance",
    "Smart Refrigerator",
    "Smart Washing Machine",
    "Smart Meter",
    "Smart Sensor",
    "Connected Vehicle",
    "Smart Home Hub",
    "Smart TV",
    "Smart Speaker",
    "Air Quality Monitor",
    "Smart Blinds",
    "Smart Faucet",
    "Smart Irrigation",
    "Smoke and CO Detector",
    "Smart Health Device",
    "Smart Mirror",
    "Robot Vacuum",
    "Smart Garage Door Opener",
    "Smart Outlet",
    "Smart Kitchen Device",
    "Smart Fan",
    "Smart Pet Device",
    "Smartwatch",
    "Motion Sensor",
    "Baby Monitor",
    "Fitness Band",
    "Chiller Monitor"
]

from transformers import pipeline

# Define your labels
labels = ["clean", "eat", "sleep"]

# Load zero-shot-classification pipeline with RoBERTa
classifier = pipeline("zero-shot-classification", model="roberta-large-mnli")

# Sentence to classify
sentence = "i am going to clean.com"
#Index of /wemo/switchsensor - xbcs.net
# Run classification
result = classifier(sentence, candidate_labels=labels)

# Print results
print(f"Sentence: {sentence}")
for label, score in zip(result["labels"], result["scores"]):
    print(f"{label}: {score:.4f}")

