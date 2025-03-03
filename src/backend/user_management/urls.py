from django.urls import path
from . import views
from .views import login_user

urlpatterns = [
    path('register/', views.register_user),  # Route for user registration
    path("login/", login_user, name="login"),
]