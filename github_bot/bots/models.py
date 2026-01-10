from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
import re
from django.contrib.postgres.fields import ArrayField
import requests

from webhooks.github_api import get_installation_token


class Bot(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    review_prompt = models.TextField()
    evaluation_prompt = models.TextField()
    repositories = ArrayField(models.CharField(max_length=128))
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        # TODO: Add validation to check repo names are correct
        # TODO: Add checks that review prompt anf evaluation prompt must have certain variables
        pass
