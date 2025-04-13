from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import uuid
import traceback
from .function_labeling import run_function_labeling_from_csv  # adjust if needed

@csrf_exempt
def analyze_device(request):
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return JsonResponse({'error': 'No file provided'}, status=400)

        try:
            # Save uploaded file temporarily
            temp_filename = f"/tmp/{uuid.uuid4().hex}.csv"  # <== make sure it ends in .csv
            with open(temp_filename, 'wb+') as dest:
                for chunk in uploaded_file.chunks():
                    dest.write(chunk)

            print(f"[DEBUG] File saved to {temp_filename}")

            # Run your function labeling pipeline
            result = run_function_labeling_from_csv(temp_filename)

            # Clean up
            os.remove(temp_filename)

            return JsonResponse(result)

        except Exception as e:
            print("[ERROR]", str(e))
            traceback.print_exc()  # <== This will show the exact traceback in the terminal
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

