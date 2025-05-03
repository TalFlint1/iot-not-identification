from django.shortcuts import render
from django.http import JsonResponse
from .auth_utils import create_user, table
from django.views.decorators.csrf import csrf_exempt
import json
import hashlib
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import jwt
import datetime
import uuid
from django.http import JsonResponse
import os
from dotenv import load_dotenv

# Register Part
@csrf_exempt
def register_user(request):
    """Handle user registration (POST only)"""
    if request.method == "POST":
        try:
            print("Raw request body:", request.body.decode('utf-8'))
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
            email = data.get("email")

            result = create_user(username, password, email)
            return JsonResponse(result, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Invalid request method"}, status=400)

# Login Part
# Function to hash password
def hash_password(password, salt):
    """Hashes a password with the provided salt."""
    return hashlib.sha256((salt + password).encode()).hexdigest()

# @csrf_exempt  # Temporarily disable CSRF for testing (remove later if using authentication tokens)
# def login_user(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             username = data.get("username")
#             password = data.get("password")

#             # Retrieve user from DynamoDB
#             response = table.get_item(Key={"username": username})
#             user = response.get("Item")

#             if not user:
#                 return JsonResponse({"message": "User not found"}, status=404)

#             stored_hash = user["password_hash"]
#             salt = user["salt"]

#             # Hash input password with stored salt
#             input_hash = hash_password(password, salt)

#             if input_hash == stored_hash:
#                 refresh = RefreshToken()
#                 access_token = refresh.access_token

#                 # Return the tokens in the response
#                 return JsonResponse({
#                     "message": "Login successful",
#                     "access_token": str(access_token),
#                     "refresh_token": str(refresh)
#                 })
#             else:
#                 return JsonResponse({"message": "Invalid credentials"}, status=401)

#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)

#     return JsonResponse({"message": "Invalid request method"}, status=400)

# @csrf_exempt  # Temporarily disable CSRF for testing (remove later if using authentication tokens) -- worked b4 google
# def login_user(request):
#     if request.method == "POST":
#         try:
#             load_dotenv()  # Load environment variables from .env file

#             JWT_SECRET = os.getenv("JWT_SECRET")
#             data = json.loads(request.body)
#             username = data.get("username")
#             password = data.get("password")

#             # Retrieve user from DynamoDB
#             response = table.get_item(Key={"username": username})
#             user = response.get("Item")

#             if not user:
#                 return JsonResponse({"message": "User not found"}, status=404)

#             stored_hash = user["password_hash"]
#             salt = user["salt"]

#             # Hash input password with stored salt
#             input_hash = hash_password(password, salt)

#             if input_hash == stored_hash:
#                 # User is authenticated, create tokens

#                 # Add user_id to the token payload
#                 payload = {
#                     "user_id": user["username"],  # Assuming user object contains 'user_id'
#                     "token_type": "access",
#                     "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),  # Expiration time
#                     "iat": datetime.datetime.now(datetime.timezone.utc),  # Issued at time
#                     "jti": str(uuid.uuid4())  # Optional: Unique identifier for the token
#                 }

#                 # Create the access token
#                 access_token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

#                 # Create the refresh token (longer expiration)
#                 refresh_payload = {
#                     "user_id": user["username"],
#                     "token_type": "refresh",
#                     "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30),  # Refresh token expiration (30 days)
#                     "iat": datetime.datetime.now(datetime.timezone.utc),
#                     "jti": str(uuid.uuid4())
#                 }

#                 refresh_token = jwt.encode(refresh_payload, JWT_SECRET, algorithm="HS256")

#                 # Return the tokens in the response
#                 return JsonResponse({
#                     "message": "Login successful",
#                     "access_token": access_token,
#                     "refresh_token": refresh_token
#                 })

#             else:
#                 return JsonResponse({"message": "Invalid credentials"}, status=401)

#         except Exception as e:
#             import traceback
#             print("Login error:", str(e))
#             traceback.print_exc()  # 👈 This will print the full stack trace
#             return JsonResponse({"error": str(e)}, status=500)

#     return JsonResponse({"message": "Invalid request method"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return JsonResponse({"message": "You have access to this protected resource!"})


@csrf_exempt  # Temporarily disable CSRF for testing (remove later if using authentication tokens)
def login_user(request):
    if request.method == "POST":
        try:
            load_dotenv()  # Load environment variables from .env file

            JWT_SECRET = os.getenv("JWT_SECRET")
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            # Retrieve user from DynamoDB
            response = table.get_item(Key={"username": username})
            user = response.get("Item")

            if not user:
                return JsonResponse({"message": "User not found"}, status=404)

            # Check if it's a Google login (password is null)
            if password is None:
                # Assuming Google login uses the email to identify the user
                if user["email"] != data.get("email"):
                    return JsonResponse({"message": "Google account mismatch"}, status=401)
                # If email matches, issue tokens
                return issue_tokens(user, JWT_SECRET)

            # Normal login flow (with password)
            stored_hash = user["password_hash"]
            salt = user["salt"]

            # Hash input password with stored salt
            input_hash = hash_password(password, salt)

            if input_hash == stored_hash:
                # User is authenticated, create tokens
                return issue_tokens(user, JWT_SECRET)
            else:
                return JsonResponse({"message": "Invalid credentials"}, status=401)

        except Exception as e:
            import traceback
            print("Login error:", str(e))
            traceback.print_exc()  # 👈 This will print the full stack trace
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Invalid request method"}, status=400)


def issue_tokens(user, JWT_SECRET):
    """Helper function to generate and return JWT tokens"""
    payload = {
        "user_id": user["username"],  # Assuming user object contains 'user_id'
        "token_type": "access",
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),  # Expiration time
        "iat": datetime.datetime.now(datetime.timezone.utc),  # Issued at time
        "jti": str(uuid.uuid4())  # Optional: Unique identifier for the token
    }

    # Create the access token
    access_token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    # Create the refresh token (longer expiration)
    refresh_payload = {
        "user_id": user["username"],
        "token_type": "refresh",
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30),  # Refresh token expiration (30 days)
        "iat": datetime.datetime.now(datetime.timezone.utc),
        "jti": str(uuid.uuid4())
    }

    refresh_token = jwt.encode(refresh_payload, JWT_SECRET, algorithm="HS256")

    # Return the tokens in the response
    return JsonResponse({
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token
    })
