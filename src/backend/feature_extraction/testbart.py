from transformers import pipeline

# Load zero-shot classifier
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# The enriched text chunk
sequence = "Know and compare the dimensions and screen sizes of all iPad models, including the most recent iPad Pro M4 and iPad Air M2 of 2024."

# Candidate labels (from your vendor-function map)
candidate_labels = ['Tablet', 'Smartwatch', 'Smart Speaker', 'Smartphone']

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
