import boto3
import os
from boto3.dynamodb.conditions import Key
import calendar
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal

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
            'confidence': round(float(entry.get('confidence', 0.0)), 2),
            'raw_input_s3_path': entry.get('raw_input_s3_path', '')
        })

    return formatted_entries

def get_low_confidence_alerts(user_id, threshold=75.0, count=2):
    user = table.get_item(Key={'username': user_id}).get('Item')
    if not user or 'history' not in user:
        return []

    history = user['history']

    def split_device_label(device_label):
        parts = device_label.strip().split()
        vendor = parts[0] if len(parts) >= 1 else ''
        function = " ".join(parts[1:]) if len(parts) >= 2 else ''
        return vendor, function

    # Filter for low confidence
    low_confidence = [entry for entry in history if float(entry.get('confidence', 100.0)) <= threshold]

    # Sort by lowest confidence
    sorted_low = sorted(low_confidence, key=lambda x: float(x.get('confidence', 100.0)))

    # Take the lowest 'count' entries
    selected = sorted_low[:count]

    formatted_entries = []
    for entry in selected:
        vendor, function = split_device_label(entry.get('device', ''))
        formatted_entries.append({
            'timestamp': entry.get('date', ''),
            'vendor': vendor,
            'function': function,
            'confidence': round(float(entry.get('confidence', 0.0)), 2),
            'raw_input_s3_path': entry.get('raw_input_s3_path', '')
        })

    return formatted_entries

def get_monthly_device_counts(user_id):
    user = table.get_item(Key={'username': user_id}).get('Item')
    if not user or 'history' not in user:
        return []

    history = user['history']
    month_counts = defaultdict(int)

    for entry in history:
        date_str = entry.get('date')
        if not date_str:
            continue

        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M")
            key = dt.strftime("%b %Y")  # e.g. "May 2025"
            month_counts[key] += 1
        except ValueError:
            continue

    # Sort months chronologically
    sorted_data = sorted(month_counts.items(), key=lambda x: datetime.strptime(x[0], "%b %Y"))

    return [{'month': month, 'devices': count} for month, count in sorted_data]

def get_top_vendor(user_id, top_n=1):
    user = table.get_item(Key={"username": user_id}).get("Item")
    if not user or "history" not in user:
        return []

    vendor_counts = defaultdict(int)
    history = user["history"]

    for entry in history:
        device = entry.get("device")
        if not device:
            continue
        vendor = device.split()[0].lower()
        vendor_counts[vendor] += 1

    sorted_vendors = sorted(
        vendor_counts.items(), key=lambda x: x[1], reverse=True
    )[:top_n]

    return [{"vendor": vendor.title(), "count": count} for vendor, count in sorted_vendors]

def get_top_functions(user_id, top_n=4):
    user = table.get_item(Key={"username": user_id}).get("Item")
    if not user or "history" not in user:
        return []

    function_counts = defaultdict(int)
    history = user["history"]

    for entry in history:
        device = entry.get("device")
        if not device:
            continue
        parts = device.split()
        if len(parts) < 2:
            continue  # no function part present
        function = " ".join(parts[1:]).lower()
        function_counts[function] += 1

    sorted_functions = sorted(
        function_counts.items(), key=lambda x: x[1], reverse=True
    )[:top_n]
    print(sorted_functions)

    return [{"function": func.title(), "count": count} for func, count in sorted_functions]

def delete_history_item(user_id, input_s3_path):
    user = table.get_item(Key={'username': user_id}).get('Item')
    if not user or 'history' not in user:
        return False, 'User or history not found'

    history = user['history']
    updated_history = []
    item_to_delete = None

    for item in history:
        if item.get('input_s3_path') == input_s3_path:
            item_to_delete = item
        else:
            updated_history.append(item)

    if not item_to_delete:
        return False, 'Item not found in history'

    # Update DynamoDB
    table.update_item(
        Key={'username': user_id},
        UpdateExpression='SET history = :new_history',
        ExpressionAttributeValues={':new_history': updated_history}
    )

    return True, item_to_delete  # Return the deleted item to handle S3 outside

def get_user_info(user_id):
    user = table.get_item(Key={'username': user_id}).get('Item')
    if not user:
        return None
    return {
        'username': user_id,
        'email': user.get('email', '')
    }

def save_support_message(user_id, name, email, message):
    user = table.get_item(Key={'username': user_id}).get('Item')
    if not user:
        return False, 'User not found'

    existing_messages = user.get('support_messages', [])

    new_message = {
        'name': name,
        'email': email,
        'message': message,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }

    existing_messages.append(new_message)

    table.update_item(
        Key={'username': user_id},
        UpdateExpression='SET support_messages = :msgs',
        ExpressionAttributeValues={':msgs': existing_messages}
    )

    return True, 'Message saved'

def clear_user_history(user_id):
    user = table.get_item(Key={'username': user_id}).get('Item')
    if not user or 'history' not in user:
        return False, 'User or history not found', []

    history_items = user['history']
    s3_paths_to_delete = []
    for item in history_items:
        input_path = item.get('input_s3_path')
        result_path = item.get('result_s3_path')
        raw_path = item.get('raw_input_s3_path')
        if input_path:
            s3_paths_to_delete.append(input_path)
        if result_path:
            s3_paths_to_delete.append(result_path)
        if raw_path:
            s3_paths_to_delete.append(raw_path)

    # Clear the history in DynamoDB
    table.update_item(
        Key={'username': user_id},
        UpdateExpression='REMOVE history'
    )

    return True, 'History cleared successfully', s3_paths_to_delete

def delete_user_account(user_id):
    user = table.get_item(Key={'username': user_id}).get('Item')
    if not user:
        return False, 'User not found'

    # Collect all possible file paths to delete from S3
    s3_paths = []
    if 'history' in user:
        for item in user['history']:
            for key in ['input_s3_path', 'result_s3_path', 'raw_input_s3_path']:
                if item.get(key):
                    s3_paths.append(item[key])

    # Delete the user from DynamoDB
    table.delete_item(Key={'username': user_id})

    return True, s3_paths
