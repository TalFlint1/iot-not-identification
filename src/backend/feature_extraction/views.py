from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import uuid
import traceback
from .function_labeling import run_function_labeling_from_csv
from .extract_features import extract_and_enrich
# @csrf_exempt
# def analyze_device(request):
#     if request.method == 'POST':
#         uploaded_file = request.FILES.get('file')
#         if not uploaded_file:
#             return JsonResponse({'error': 'No file provided'}, status=400)

#         try:
#             # 🔥 Pass the file directly, no need to save it
#             result = run_function_labeling_from_csv(uploaded_file)

#             return JsonResponse(result)

#         except Exception as e:
#             print("[ERROR]", str(e))
#             traceback.print_exc()
#             return JsonResponse({'error': str(e)}, status=500)

#     return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def analyze_device(request):
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return JsonResponse({'error': 'No file provided'}, status=400)

        try:
            # Define data folder path (inside feature_extraction)
            data_folder = os.path.join("feature_extraction", "data")
            os.makedirs(data_folder, exist_ok=True)

            # Generate temp file paths
            unique_id = uuid.uuid4().hex
            input_json_path = os.path.join(data_folder, f"temp_input_{unique_id}.json")
            output_csv_path = os.path.join(data_folder, f"enriched_dataset_{unique_id}.csv")

            # Save uploaded file
            with open(input_json_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            # Run extraction + enrichment
            extract_and_enrich(input_json_path, output_csv_path)

            # Run function labeling
            result = run_function_labeling_from_csv(output_csv_path)

            # Optional cleanup (only JSON, keeping CSV)
            os.remove(input_json_path)

            return JsonResponse(result)

        except Exception as e:
            print("[ERROR]", str(e))
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)
