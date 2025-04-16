import boto3
import os
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION'))
table = dynamodb.Table(os.getenv('DYNAMODB_TABLE_NAME'))

def get_user_history_from_db(user_id):
    user = table.get_item(Key={'user_id': user_id}).get('Item')
    return user.get('history', []) if user else []

def add_history_item(user_id, history_item):
    table.update_item(
        Key={'user_id': user_id},
        UpdateExpression='SET history = list_append(if_not_exists(history, :empty), :new_item)',
        ExpressionAttributeValues={
            ':new_item': [history_item],
            ':empty': []
        }
    )
