from transformers import pipeline

# Load zero-shot classifier
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# The enriched text chunk
sequence = "Problems start when I'm trying to commission the plugs into my network - it seems like the plugs does not get in contact with Internet over my network."

# Candidate labels (from your vendor-function map)
candidate_labels = ['Plug', 'Camera', 'Motion Sensor', 'Hub']

# New hypothesis template
hypothesis_template = "This is a {} type of device."

# Run the classifier
result = classifier(
    sequence,
    candidate_labels,
    hypothesis_template=hypothesis_template,
    multi_label=False  # Set to True if you want independent probabilities
)

# Print results
for label, score in zip(result['labels'], result['scores']):
    print(f"{label}: {score:.4f}")
