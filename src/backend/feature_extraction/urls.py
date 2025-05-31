# feature_extraction/urls.py

from django.urls import path
from .views import analyze_device, get_user_history, analyze_enriched_csv, cheap_reidentify_device, reidentify_device, dashboard_summary, recent_identifications

urlpatterns = [
    path('analyze/', analyze_device, name='analyze_device'),
    path('history/', get_user_history, name='get_user_history'),
    path('analyze_enriched_csv/', analyze_enriched_csv, name='analyze_enriched_csv'),
    path('reidentify/', reidentify_device, name='reidentify_device'),
    path('cheap_reidentify/', cheap_reidentify_device, name='cheap_reidentify_device'),
    path('dashboard-summary/', dashboard_summary, name='dashboard-summary'),
    path('recent-identifications/', recent_identifications, name='recent-identifications'),
]
