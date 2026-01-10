# bots/urls.py
from django.urls import path
from .views import (
    BotListAPIView,
    BotDetailAPIView,
)

urlpatterns = [
    path("/", BotListAPIView.as_view(), name="bot-list"),
    path("/<int:bot_id>/", BotDetailAPIView.as_view(), name="bot-detail"),
]
