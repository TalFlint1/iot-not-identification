import boto3
import json
from datetime import datetime, timezone
import os

s3 = boto3.client('s3', region_name=os.getenv('AWS_REGION'))

def upload_result_to_s3(result_data, user_id):
    bucket_name = os.getenv('S3_BUCKET_NAME')
    region = os.getenv('AWS_REGION')
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H-%M-%SZ')
    key = f"{user_id}/result_{timestamp}.json"

    s3.put_object(
        Bucket=bucket_name,
        Key=key,
        Body=json.dumps(result_data),
        ContentType='application/json'
    )

    return {
        "timestamp": timestamp,
        "s3_key": key,
        "s3_url": f"https://{bucket_name}.s3.{region}.amazonaws.com/{key}"
    }