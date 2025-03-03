from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user),  # Route for user registration
]