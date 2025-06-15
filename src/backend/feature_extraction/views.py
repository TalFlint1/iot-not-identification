from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import uuid
import traceback
from .function_labeling import run_function_labeling_from_csv
from .extract_features import extract_and_enrich
from user_management.auth_utils import get_user_id_from_token
from utils.s3_utils import upload_result_to_s3, upload_input_to_s3, upload_raw_json_to_s3
from utils.history_utils import add_history_item, get_user_history_from_db, get_dashboard_summary_from_dynamodb, get_recent_identifications, get_low_confidence_alerts
from utils.history_utils import get_monthly_device_counts, get_top_vendor, get_top_functions, delete_history_item, get_user_info, save_support_message, clear_user_history
from datetime import datetime, timezone
from decimal import Decimal
import boto3
import json
from utils.s3_utils import count_identified_devices
import ast
import pandas as pd
from io import StringIO

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

        # 2. Get the uploaded JSON file
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return JsonResponse({'error': 'No file provided'}, status=400)

        try:
            # 3. Define data folder path
            data_folder = os.path.join("feature_extraction", "data")
            os.makedirs(data_folder, exist_ok=True)

            # 4. Generate temp file paths
            unique_id = uuid.uuid4().hex
            input_json_path = os.path.join(data_folder, f"temp_input_{unique_id}.json")
            enriched_csv_path = os.path.join(data_folder, f"enriched_dataset_{unique_id}.csv")

            # 5. Save uploaded file
            with open(input_json_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
            raw_s3_info = upload_raw_json_to_s3(input_json_path, user_id)

            # 6. Run extraction + enrichment
            extract_and_enrich(input_json_path, enriched_csv_path)

            # 7. Upload enriched input file to S3
            input_s3_info = upload_input_to_s3(enriched_csv_path, user_id)

            # 8. Run function labeling
            result = run_function_labeling_from_csv(enriched_csv_path)

            # 9. Upload result to S3
            result_s3_info = upload_result_to_s3(result, user_id)

            # 10. Format confidence if needed
            confidence = result.get('confidence', '')
            if isinstance(confidence, float):
                confidence = Decimal(str(confidence))

            # 11. Save history item
            history_item = {
                'device': result.get('device', ''),
                'confidence': confidence,
                'justification': result.get('justification', ''),
                'input_s3_path': input_s3_info.get('s3_key', ''),
                'result_s3_path': result_s3_info.get('s3_key', ''),
                'raw_input_s3_path': raw_s3_info.get('s3_key', ''),
                'date': datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
            }
            add_history_item(user_id, history_item)

            # 12. cleanup
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
            
            # 8.5 Build full history item
            history_item = {
                'device': result.get('device', ''),
                'confidence': confidence,
                'justification': result.get('justification', ''),
                'input_s3_path': input_s3_info.get('s3_key', ''),
                'result_s3_path': result_s3_info.get('s3_key', ''),
                'date': datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
            }
            add_history_item(user_id, history_item)

            # 9. cleanup
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
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)

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

        # Create temp directory
        data_folder = os.path.join("feature_extraction", "data")
        os.makedirs(data_folder, exist_ok=True)

        local_json_path = os.path.join(data_folder, f'temp_input_{uuid.uuid4().hex}.json')

        try:
            body = json.loads(request.body)
            raw_input_s3_path = body.get('raw_input_s3_path')

            if not raw_input_s3_path:
                return JsonResponse({'error': 'Missing raw_input_s3_path'}, status=400)

            if raw_input_s3_path.startswith('/'):
                raw_input_s3_path = raw_input_s3_path[1:]

            bucket_name = os.getenv('S3_BUCKET_NAME')
            s3.download_file(bucket_name, raw_input_s3_path, local_json_path)

            enriched_csv_path = os.path.join(data_folder, f'temp_enriched_{uuid.uuid4().hex}.csv')
            extract_and_enrich(local_json_path, enriched_csv_path)
            enriched_s3_info = upload_input_to_s3(enriched_csv_path, user_id)

            result = run_function_labeling_from_csv(enriched_csv_path)
            result_s3_info = upload_result_to_s3(result, user_id)

            confidence = result.get('confidence', '')
            if isinstance(confidence, float):
                confidence = Decimal(str(confidence))

            history_item = {
                'device': result.get('device', ''),
                'confidence': confidence,
                'justification': result.get('justification', ''),
                'input_s3_path': enriched_s3_info.get('s3_key', ''),
                'result_s3_path': result_s3_info.get('s3_key', ''),
                'raw_input_s3_path': raw_input_s3_path,
                'date': datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
                'reidentify': True
            }
            add_history_item(user_id, history_item)

            return JsonResponse(result, status=200)

        except Exception as e:
            print("Error during reidentification:", e)
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)

        finally:
            if os.path.exists(local_json_path):
                os.remove(local_json_path)
            if os.path.exists(enriched_csv_path):
                os.remove(enriched_csv_path)

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

        # 1. The path to save the file under 'data' folder
        data_folder = os.path.join("feature_extraction", "data")
        os.makedirs(data_folder, exist_ok=True)

        # 2. Dynamically generate a unique filename using UUID
        local_filename = os.path.join(data_folder, f'temp_input_{uuid.uuid4().hex}.csv')

        try:
            # 3. Parse the request body
            body = json.loads(request.body)
            input_s3_path = body.get('input_s3_path')

            if not input_s3_path:
                return JsonResponse({'error': 'Missing input_s3_path'}, status=400)
            
            # 4. Clean leading slash if exists
            if input_s3_path.startswith('/'):
                input_s3_path = input_s3_path[1:]

            # 5. Download the file from S3
            bucket_name = os.getenv('S3_BUCKET_NAME')
            s3.download_file(bucket_name, input_s3_path, local_filename)

            # 6. Run function labeling directly (no extraction+enrichment)
            result = run_function_labeling_from_csv(local_filename)

            # 7. Upload the result to S3
            result_s3_info = upload_result_to_s3(result, user_id)

            # 8. Save the result in user history
            confidence = result.get('confidence', '')
            if isinstance(confidence, float):
                confidence = Decimal(str(confidence))

            history_item = {
                'device': result.get('device', ''),
                'confidence': confidence,
                'justification': result.get('justification', ''),
                'input_s3_path': input_s3_path,
                'result_s3_path': result_s3_info.get('s3_key', ''),
                'date': datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
                'reidentify': True
            }
            add_history_item(user_id, history_item)

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


@csrf_exempt
def dashboard_summary(request):
    if request.method == 'GET':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        device_count = count_identified_devices(user_id)  # from S3
        device_stats = get_dashboard_summary_from_dynamodb(user_id)  # from DynamoDB

        return JsonResponse({
            'devices_identified': device_count,
            'average_confidence': device_stats['average_confidence']
        })

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def recent_identifications(request):
    if request.method == 'GET':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        recent_data = get_recent_identifications(user_id)

        return JsonResponse({'recent_identifications': recent_data})

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def confidence_alerts(request):
    if request.method == 'GET':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        alerts = get_low_confidence_alerts(user_id)

        return JsonResponse({'confidence_alerts': alerts})

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def devices_over_time(request):
    if request.method == 'GET':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        data = get_monthly_device_counts(user_id)
        return JsonResponse({'data': data})

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def top_vendor_view(request):
    if request.method == 'GET':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        vendor_list = get_top_vendor(user_id, top_n=1)
        if not vendor_list:
            return JsonResponse({'vendor': ''})

        return JsonResponse({'vendor': vendor_list[0]["vendor"]})

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def top_vendors_chart_view(request):
    if request.method == 'GET':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        top_vendors = get_top_vendor(user_id, top_n=4)
        if not top_vendors:
            return JsonResponse({'vendor': ''})

        return JsonResponse({'vendor': top_vendors})

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def top_functions_chart_view(request):
    if request.method == 'GET':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        top_functions = get_top_functions(user_id, top_n=4)
        if not top_functions:
            return JsonResponse({'function': []})

        return JsonResponse({'function': top_functions})

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def serpapi_usage(request):
    if request.method == 'GET':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)

        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        try:
            bucket_name = os.getenv('S3_BUCKET_NAME')
            s3 = boto3.client('s3', region_name=os.getenv('AWS_REGION'))

            prefix = f"{user_id}/input/"
            response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)

            if 'Contents' not in response:
                return JsonResponse({'serpapi_queries': 0, 'serpapi_queries_this_month': 0})

            total_queries = 0
            total_queries_this_month = 0

            now = datetime.utcnow()
            current_year = now.year
            current_month = now.month

            for obj in response['Contents']:
                key = obj['Key']
                if not key.endswith('.csv'):
                    continue

                # Try to extract the timestamp from filename
                try:
                    filename = os.path.basename(key)
                    timestamp_str = filename.replace("input_", "").replace(".csv", "")
                    file_date = datetime.strptime(timestamp_str, "%Y-%m-%dT%H-%M-%SZ")
                except Exception:
                    file_date = None  # If can't parse date, skip from "this month"

                file_obj = s3.get_object(Bucket=bucket_name, Key=key)
                file_content = file_obj['Body'].read().decode('utf-8')
                df = pd.read_csv(StringIO(file_content))

                search_fields = [
                    'dns_queries',
                    'reverse_dns',
                    'dhcp_hostnames',
                    'tls_cert_domains',
                    'tls_server_names',
                    'user_agents',
                ]

                file_query_count = 0
                for _, row in df.iterrows():
                    for field in search_fields:
                        if pd.notna(row.get(field)) and row[field].strip() != '':
                            try:
                                values = ast.literal_eval(row[field])
                                file_query_count += len(values)
                            except Exception:
                                pass

                total_queries += file_query_count

                if file_date and file_date.year == current_year and file_date.month == current_month:
                    total_queries_this_month += file_query_count

            return JsonResponse({
                'serpapi_queries': total_queries,
                'serpapi_queries_this_month': total_queries_this_month
            })

        except Exception as e:
            print("Error in serpapi_usage_summary:", e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def delete_history_entry(request):
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
                return JsonResponse({'error': 'Missing input_s3_path in request'}, status=400)

            success, result = delete_history_item(user_id, input_s3_path)

            if not success:
                return JsonResponse({'error': result}, status=404)

            # Delete files from S3
            bucket_name = os.getenv('S3_BUCKET_NAME')
            s3.delete_object(Bucket=bucket_name, Key=result['input_s3_path'])
            s3.delete_object(Bucket=bucket_name, Key=result['result_s3_path'])

            return JsonResponse({'message': 'History item deleted successfully'})

        except Exception as e:
            print("Error deleting history item:", e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def get_raw_json(request):
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
            s3_key = body.get('s3_key')
            if not s3_key:
                return JsonResponse({'error': 'Missing s3_key parameter'}, status=400)

            bucket_name = os.getenv('S3_BUCKET_NAME')
            s3_object = s3.get_object(Bucket=bucket_name, Key=s3_key)
            json_data = s3_object['Body'].read().decode('utf-8')
            parsed = json.loads(json_data)
            return JsonResponse({'raw_json': parsed})

        except Exception as e:
            print("Error fetching raw JSON from S3:", e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def get_user_info_view(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=400)

    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

    token = auth_header.split(' ')[1]
    user_id = get_user_id_from_token(token)

    if not user_id:
        return JsonResponse({'error': 'Invalid or expired token'}, status=401)

    try:
        user_info = get_user_info(user_id)
        if not user_info:
            return JsonResponse({'error': 'User not found'}, status=404)
        return JsonResponse(user_info)

    except Exception as e:
        print("Error fetching user info:", e)
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def download_user_history(request):
    if request.method == 'GET':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        try:
            history = get_user_history_from_db(user_id)
            return JsonResponse({'history': history})
        except Exception as e:
            print("Error downloading user history:", e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def contact_support(request):
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
            name = body.get('name')
            email = body.get('email')
            message = body.get('message')

            if not all([name, email, message]):
                return JsonResponse({'error': 'Missing one or more required fields'}, status=400)

            success, result = save_support_message(user_id, name, email, message)
            if not success:
                return JsonResponse({'error': result}, status=500)

            return JsonResponse({'message': 'Support message sent successfully'})
        except Exception as e:
            print("Error saving support message:", e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def clear_history(request):
    if request.method == 'POST':
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        try:
            success, message, s3_keys = clear_user_history(user_id)

            if not success:
                return JsonResponse({'error': message}, status=404)

            # Delete all related S3 files
            bucket_name = os.getenv('S3_BUCKET_NAME')
            for key in s3_keys:
                try:
                    s3.delete_object(Bucket=bucket_name, Key=key)
                except Exception as e:
                    print(f"Failed to delete {key} from S3:", e)

            return JsonResponse({'message': message})

        except Exception as e:
            print("Error clearing history:", e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)
