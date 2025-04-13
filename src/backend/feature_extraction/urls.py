# feature_extraction/urls.py

from django.urls import path
from .views import analyze_device

urlpatterns = [
    path('analyze/', analyze_device, name='analyze_device'),
]
