# bots/urls.py
from django.urls import path
from .views import (
    BotCreateAPIView,
    BotListAPIView,
    BotUpdateAPIView,
    BotDeleteAPIView,
)

urlpatterns = [
    path("bots/", BotListAPIView.as_view(), name="bot-list"),
    path("bots/", BotCreateAPIView.as_view(), name="bot-create"),
    path("bots/<int:bot_id>/", BotUpdateAPIView.as_view(), name="bot-update"),
    path("bots/<int:bot_id>/", BotDeleteAPIView.as_view(), name="bot-delete"),
]
