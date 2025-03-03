import boto3
import hashlib
import os

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
    
    # Insert into DynamoDB
    table.put_item(
        Item={
            "username": username,
            "email": email,
            "password_hash": hashed_password,
            "salt": salt
        }
    )
    return {"message": "User created successfully"}
