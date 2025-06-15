"""
URL configuration for iot_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from feature_extraction.views import analyze_device, get_user_history, analyze_enriched_csv, reidentify_device, cheap_reidentify_device, dashboard_summary, recent_identifications, confidence_alerts
from feature_extraction.views import devices_over_time, top_vendor_view, top_vendors_chart_view, top_functions_chart_view, serpapi_usage, delete_history_entry, get_raw_json, get_user_info_view
from feature_extraction.views import download_user_history

def home(request):
    return HttpResponse("Welcome to the IoT project!")

urlpatterns = [
    path('admin/', admin.site.urls),  # Django admin panel
    path('user/', include('user_management.urls')),  # Include user_management URLs
    path('feature_extraction/', include('feature_extraction.urls')),
    path('analyze_device/', analyze_device),
    path('history/', get_user_history),
    path('analyze_enriched_csv/', analyze_enriched_csv),
    path('reidentify/', reidentify_device),
    path('cheap_reidentify/', cheap_reidentify_device),
    path('dashboard-summary/', dashboard_summary),
    path('recent-identifications/', recent_identifications),
    path('confidence-alerts/', confidence_alerts),
    path('monthly-devices/', devices_over_time),
    path('top-vendor/', top_vendor_view),
    path('top-vendors-chart/', top_vendors_chart_view),
    path('top-functions/', top_functions_chart_view),
    path('serpapi-usage/', serpapi_usage),
    path('delete-identification/', delete_history_entry),
    path('raw-json/', get_raw_json),
    path('user-info/', get_user_info_view),
    path('download-history/', download_user_history),
    path('', home),
]
