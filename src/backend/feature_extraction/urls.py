# feature_extraction/urls.py

from django.urls import path
from .views import analyze_device, get_user_history, analyze_enriched_csv

urlpatterns = [
    path('analyze/', analyze_device, name='analyze_device'),
    path('history/', get_user_history, name='get_user_history'),
    path('analyze_enriched_csv/', analyze_enriched_csv, name='analyze_enriched_csv'),
]
