# feature_extraction/urls.py

from django.urls import path
from .views import analyze_device, get_user_history, analyze_enriched_csv, cheap_reidentify_device, reidentify_device, dashboard_summary, recent_identifications, confidence_alerts
from .views import devices_over_time, top_vendor_view, top_vendors_chart_view, top_functions_chart_view, serpapi_usage, delete_history_entry, get_raw_json, get_user_info_view
from .views import download_user_history
urlpatterns = [
    path('analyze/', analyze_device, name='analyze_device'),
    path('history/', get_user_history, name='get_user_history'),
    path('analyze_enriched_csv/', analyze_enriched_csv, name='analyze_enriched_csv'),
    path('reidentify/', reidentify_device, name='reidentify_device'),
    path('cheap_reidentify/', cheap_reidentify_device, name='cheap_reidentify_device'),
    path('dashboard-summary/', dashboard_summary, name='dashboard-summary'),
    path('recent-identifications/', recent_identifications, name='recent-identifications'),
    path('confidence-alerts/', confidence_alerts, name='confidence-alerts'),
    path('monthly-devices/', devices_over_time, name='monthly-devices'),
    path('top-vendor/', top_vendor_view, name='top-vendor'),
    path('top-vendors-chart/', top_vendors_chart_view, name='top-vendors-char'),
    path('top-functions/', top_functions_chart_view, name='top-functions'),
    path('serpapi-usage/', serpapi_usage, name='serpapi_usage'),
    path('delete-identification/', delete_history_entry, name='delete_history_entry'),
    path('raw-json/', get_raw_json, name='get_raw_json'),
    path('user-info/', get_user_info_view, name='get_user_info_view'),
    path('download-history/', download_user_history, name='download_user_history'),
]
