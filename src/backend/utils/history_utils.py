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

def get_recent_identifications(user_id, count=3):
    user = table.get_item(Key={'username': user_id}).get('Item')
    if not user or 'history' not in user:
        return []

    history = user['history']
    # Sort descending by timestamp
    sorted_history = sorted(history, key=lambda x: x.get('date', ''), reverse=True)
    recent_entries = sorted_history[:count]

    def split_device_label(device_label):
        parts = device_label.strip().split()
        vendor = parts[0] if len(parts) >= 1 else ''
        function = " ".join(parts[1:]) if len(parts) >= 2 else ''
        return vendor, function

    formatted_entries = []
    for entry in recent_entries:
        vendor, function = split_device_label(entry.get('device', ''))
        formatted_entries.append({
            'timestamp': entry.get('date', ''),
            'vendor': vendor,
            'function': function,
            'confidence': round(float(entry.get('confidence', 0.0)), 2)
        })

    return formatted_entries
