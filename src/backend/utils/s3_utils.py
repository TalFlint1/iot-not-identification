import boto3
import json
from datetime import datetime, timezone
import os

s3 = boto3.client('s3', region_name=os.getenv('AWS_REGION'))

# Upload result to S3 (result files go under the 'result' folder)
def upload_result_to_s3(result_data, user_id):
    bucket_name = os.getenv('S3_BUCKET_NAME')
    region = os.getenv('AWS_REGION')
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H-%M-%SZ')
    result_key = f"{user_id}/result/result_{timestamp}.json"  # Result file goes under 'result' folder

    s3.put_object(
        Bucket=bucket_name,
        Key=result_key,
        Body=json.dumps(result_data),
        ContentType='application/json'
    )

    return {
        "timestamp": timestamp,
        "s3_key": result_key,
        "s3_url": f"https://{bucket_name}.s3.{region}.amazonaws.com/{result_key}"
    }

def upload_input_to_s3(file_path, user_id):
    bucket_name = os.getenv('S3_BUCKET_NAME')
    region = os.getenv('AWS_REGION')
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H-%M-%SZ')
    key = f"{user_id}/input/input_{timestamp}.csv"

    # Open the file and read its content
    with open(file_path, 'rb') as f:
        file_content = f.read()

    s3.put_object(
        Bucket=bucket_name,
        Key=key,
        Body=file_content,
        ContentType='text/csv'
    )

    return {
        "timestamp": timestamp,
        "s3_key": key,
        "s3_url": f"https://{bucket_name}.s3.{region}.amazonaws.com/{key}"
    }