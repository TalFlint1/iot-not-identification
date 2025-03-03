from django.shortcuts import render
from django.http import JsonResponse
from .auth_utils import create_user

def register_user(request):
    """Handle user registration"""
    # Get data from request (this could be from a POST request in real-world scenarios)
    username = request.GET.get('username', 'test_user')
    password = request.GET.get('password', 'securepassword')
    email = request.GET.get('email', 'test@example.com')

    result = create_user(username, password, email)
    return JsonResponse(result)

