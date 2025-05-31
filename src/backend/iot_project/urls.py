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
    path('', home),
]
