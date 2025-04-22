from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import uuid
import traceback
from .function_labeling import run_function_labeling_from_csv
from .extract_features import extract_and_enrich
from user_management.auth_utils import get_user_id_from_token
from utils.s3_utils import upload_result_to_s3, upload_input_to_s3
from utils.history_utils import add_history_item
from utils.history_utils import get_user_history_from_db
from datetime import datetime, timezone
from decimal import Decimal
import boto3
import json

s3 = boto3.client('s3', region_name=os.getenv('AWS_REGION'))

@csrf_exempt
def analyze_device(request):
    if request.method == 'POST':
        # 1. Extract token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)

        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        print("User ID:", user_id)  # For debugging purposes, you can remove this later

        # 2. Get the uploaded file
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return JsonResponse({'error': 'No file provided'}, status=400)

        try:
            # 3. Define data folder path (inside feature_extraction)
            data_folder = os.path.join("feature_extraction", "data")
            os.makedirs(data_folder, exist_ok=True)

            # 4. Generate temp file paths
            unique_id = uuid.uuid4().hex
            input_json_path = os.path.join(data_folder, f"temp_input_{unique_id}.json")
            output_csv_path = os.path.join(data_folder, f"enriched_dataset_{unique_id}.csv")

            # 5. Save uploaded file
            with open(input_json_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            # 6. Run extraction + enrichment
            extract_and_enrich(input_json_path, output_csv_path)

            # 7. Run function labeling
            result = run_function_labeling_from_csv(output_csv_path)

            # 8. Upload result to S3 and Save S3 info to user history
            s3_info = upload_result_to_s3(result, user_id)
            
            confidence = result.get('confidence', '')
            if isinstance(confidence, float):
                confidence = Decimal(str(confidence))

            history_item = {
                'device': result.get('device', ''),
                'confidence': confidence,
                'justification': result.get('justification', ''),
                's3_path': s3_info.get('s3_key', ''),
                'date': datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
            }
            add_history_item(user_id, history_item)


            # 9. Optional cleanup (only JSON, keeping CSV)
            os.remove(input_json_path)

            return JsonResponse(result)

        except Exception as e:
            print("[ERROR]", str(e))
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def analyze_enriched_csv(request):
    if request.method == 'POST':
        # 1. Extract token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)

        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        print("User ID:", user_id)  # For debugging purposes

        # 2. Get the uploaded CSV file
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return JsonResponse({'error': 'No file provided'}, status=400)

        try:
            # 3. Define data folder path
            data_folder = os.path.join("feature_extraction", "data")
            os.makedirs(data_folder, exist_ok=True)

            # 4. Generate temp file path for the CSV
            unique_id = uuid.uuid4().hex
            input_csv_path = os.path.join(data_folder, f"temp_enriched_{unique_id}.csv")

            # 5. Save uploaded file
            with open(input_csv_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            # 6. Upload the input file to S3
            input_s3_info = upload_input_to_s3(input_csv_path, user_id)

            # 7. Run function labeling directly (no extraction+enrichment)
            result = run_function_labeling_from_csv(input_csv_path)

            # 8. Upload result to S3 and Save S3 info to user history
            result_s3_info = upload_result_to_s3(result, user_id)

            confidence = result.get('confidence', '')
            if isinstance(confidence, float):
                confidence = Decimal(str(confidence))
            
            # 8.5 Build full history item  <-- updated to include both input and result paths
            history_item = {
                'device': result.get('device', ''),
                'confidence': confidence,
                'justification': result.get('justification', ''),
                'input_s3_path': input_s3_info.get('s3_key', ''),  # Include input file S3 path
                'result_s3_path': result_s3_info.get('s3_key', ''),  # Include result file S3 path
                'date': datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
            }
            add_history_item(user_id, history_item)

            # 9. Optional cleanup
            os.remove(input_csv_path)

            return JsonResponse(result)

        except Exception as e:
            print("[ERROR]", str(e))
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def get_user_history(request):
    if request.method == 'GET':
        print("Authorization header:", request.headers.get('Authorization'))
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        print("this is token: ", token)
        user_id = get_user_id_from_token(token)
        print("this is user_id:", user_id)

        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        # Get history from DynamoDB
        history = get_user_history_from_db(user_id)
        return JsonResponse({'history': history})

    return JsonResponse({'error': 'Invalid request method'}, status=400)
    
@csrf_exempt
def reidentify_device(request):
    if request.method == 'POST':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)

        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        try:
            body = json.loads(request.body)
            input_s3_path = body.get('input_s3_path')

            if not input_s3_path:
                return JsonResponse({'error': 'Missing input_s3_path'}, status=400)
            
            # Clean leading slash if exists
            if input_s3_path.startswith('/'):
                input_s3_path = input_s3_path[1:]

            # Download the file from S3
            bucket_name = os.getenv('S3_BUCKET_NAME')
            local_filename = '/tmp/temp_input.json'

            s3.download_file(bucket_name, input_s3_path, local_filename)

            enriched_csv_path = extract_and_enrich(local_filename)
            result = run_function_labeling_from_csv(enriched_csv_path)

            # Clean up
            if os.path.exists(local_filename):
                os.remove(local_filename)

            return JsonResponse(result, status=200)

        except Exception as e:
            print("Error during reidentification:", e)
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def cheap_reidentify_device(request):
    if request.method == 'POST':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)

        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        # Define the path to save the file under your 'data' folder
        data_folder = os.path.join("feature_extraction", "data")
        os.makedirs(data_folder, exist_ok=True)

        # Dynamically generate a unique filename using UUID
        local_filename = os.path.join(data_folder, f'temp_input_{uuid.uuid4().hex}.csv')
        try:
            body = json.loads(request.body)
            input_s3_path = body.get('input_s3_path')

            if not input_s3_path:
                return JsonResponse({'error': 'Missing input_s3_path'}, status=400)
            
            # Clean leading slash if exists
            if input_s3_path.startswith('/'):
                input_s3_path = input_s3_path[1:]

            # Download the file from S3
            bucket_name = os.getenv('S3_BUCKET_NAME')
            s3.download_file(bucket_name, input_s3_path, local_filename)

            # --- HERE'S THE DIFFERENCE ---
            result = run_function_labeling_from_csv(local_filename)
            # instead of enriching, we just run the function labeling directly

            return JsonResponse(result, status=200)

        except Exception as e:
            print("Error during cheap reidentification:", e)
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)

        finally:
            # Always clean up the temporary file
            if os.path.exists(local_filename):
                os.remove(local_filename)

    return JsonResponse({'error': 'Invalid request method'}, status=400)
