from django.shortcuts import render
from django.http import JsonResponse
from .auth_utils import create_user, table
from django.views.decorators.csrf import csrf_exempt
import json
import boto3
import hashlib
import os
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User

# Register Part
def register_user(request):
    """Handle user registration"""
    # Get data from request (this could be from a POST request in real-world scenarios)
    username = request.GET.get('username', 'test_user')
    password = request.GET.get('password', 'securepassword')
    email = request.GET.get('email', 'test@example.com')

    result = create_user(username, password, email)
    return JsonResponse(result)

# Login Part
# Function to hash password
def hash_password(password, salt):
    """Hashes a password with the provided salt."""
    return hashlib.sha256((salt + password).encode()).hexdigest()

@csrf_exempt  # Temporarily disable CSRF for testing (remove later if using authentication tokens)
def login_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            # Retrieve user from DynamoDB
            response = table.get_item(Key={"username": username})
            user = response.get("Item")

            if not user:
                return JsonResponse({"message": "User not found"}, status=404)

            stored_hash = user["password_hash"]
            salt = user["salt"]

            # Hash input password with stored salt
            input_hash = hash_password(password, salt)

            if input_hash == stored_hash:
                # Manually create a refresh token for the user
                refresh = RefreshToken.for_user(User(username=username))  # Manually create a dummy user
                access_token = refresh.access_token  # Generate access token

                # Return the tokens in the response
                return JsonResponse({
                    "message": "Login successful",
                    "access_token": str(access_token),
                    "refresh_token": str(refresh)
                })
            else:
                return JsonResponse({"message": "Invalid credentials"}, status=401)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Invalid request method"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return JsonResponse({"message": "You have access to this protected resource!"})