# bots/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Bot
from .serializers import BotSerializer


class BotListAPIView(APIView):
    def get(self, request):
        bots = Bot.objects.filter(deleted_at__isnull=True)
        serializer = BotSerializer(bots, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BotSerializer(data=request.data)
        if serializer.is_valid():
            bot = serializer.save()
            return Response(
                BotSerializer(bot).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BotDetailAPIView(APIView):
    def put(self, request, bot_id):
        bot = get_object_or_404(Bot, id=bot_id, deleted_at__isnull=True)
        serializer = BotSerializer(bot, data=request.data)
        if serializer.is_valid():
            bot = serializer.save()
            return Response(BotSerializer(bot).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, bot_id):
        bot = get_object_or_404(Bot, id=bot_id, deleted_at__isnull=True)
        serializer = BotSerializer(bot, data=request.data, partial=True)
        if serializer.is_valid():
            bot = serializer.save()
            return Response(BotSerializer(bot).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, bot_id):
        bot = get_object_or_404(Bot, id=bot_id, deleted_at__isnull=True)
        bot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
