import boto3
import hashlib
import os
import jwt

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb', region_name="eu-north-1")
table = dynamodb.Table("Users")

def hash_password(password, salt=None):
    """Hashes a password with a salt (generates salt if not provided)."""
    if not salt:
        salt = os.urandom(16).hex()  # Generate a random salt
    hashed_password = hashlib.sha256((salt + password).encode()).hexdigest()
    return hashed_password, salt

def create_user(username, password, email):
    """Creates a new user and stores it in DynamoDB."""
    hashed_password, salt = hash_password(password)
    
    # Insert into DynamoDB aws
    table.put_item(
        Item={
            "username": username,
            "email": email,
            "password_hash": hashed_password,
            "salt": salt
        }
    )
    return {"message": "User created successfully"}

def get_user_id_from_token(token):
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload.get("user_id")
    except Exception as e:
        print("Failed to decode token:", e)
        return None