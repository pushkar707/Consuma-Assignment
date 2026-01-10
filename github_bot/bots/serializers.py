from rest_framework import serializers
from .models import Bot


class BotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bot
        fields = [
            "id",
            "name",
            "description",
            "review_prompt",
            "evaluation_prompt",
            "repositories",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def create(self, validated_data):
        bot = Bot(**validated_data)
        bot.full_clean()
        bot.save()
        return bot

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_clean()
        instance.save()
        return instance
