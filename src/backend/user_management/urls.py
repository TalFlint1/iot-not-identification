from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.register_user),  # Route for user registration
    path('login/', views.login_user, name='login'),  # Route for user login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT token refresh
    path('protected/', views.protected_view, name='protected'),
]