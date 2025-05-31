import boto3
import os
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION'))
table = dynamodb.Table(os.getenv('DYNAMODB_TABLE_NAME'))

def get_user_history_from_db(user_id):
    user = table.get_item(Key={'username': user_id}).get('Item')
    return user.get('history', []) if user else []

def add_history_item(user_id, history_item):
    table.update_item(
        Key={'username': user_id},
        UpdateExpression='SET history = list_append(if_not_exists(history, :empty), :new_item)',
        ExpressionAttributeValues={
            ':new_item': [history_item],
            ':empty': []
        }
    )

def get_dashboard_summary_from_dynamodb(user_id):
    user = table.get_item(Key={'username': user_id}).get('Item')
    if not user or 'history' not in user:
        return {
            'devices_identified': 0,
            'average_confidence': 0.0
        }

    history = user['history']
    devices_identified = len(history)

    if devices_identified == 0:
        average_confidence = 0.0
    else:
        total_confidence = sum(float(entry['confidence']) for entry in history if 'confidence' in entry)
        average_confidence = round(total_confidence / devices_identified, 1)

    return {
        'devices_identified': devices_identified,
        'average_confidence': average_confidence
    }

