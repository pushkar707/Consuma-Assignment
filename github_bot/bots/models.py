from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
import re

import requests

from webhooks.github_api import get_installation_token


class Bot(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    review_prompt = models.TextField()
    evaluation_prompt = models.TextField()
    repositories = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        self._validate_prompts()
        # self._validate_repositories()

    def _list_installation_repositories(installation_id):
        token = get_installation_token(installation_id)

        url = "https://api.github.com/installation/repositories"
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json",
        }

        repos = []
        page = 1

        while True:
            res = requests.get(
                url,
                headers=headers,
                params={"per_page": 100, "page": page},
            )
            res.raise_for_status()

            data = res.json()
            batch = data.get("repositories", [])

            if not batch:
                break

            repos.extend(batch)
            page += 1

        return repos

    def _validate_prompts(self):
        required_variable = r"\{variable_name\}"

        for field in ["review_prompt", "evaluation_prompt"]:
            value = getattr(self, field)

            if not re.search(required_variable, value):
                raise ValidationError(
                    {field: "Must contain `{variable_name}` at least once."}
                )

    def _validate_repositories(self):
        """
        Validate:
        - structure of repositories
        - repository exists in GitHub account
        """
        if not isinstance(self.repositories, list):
            raise ValidationError({"repositories": "Must be a list of repositories."})

        # Fetch accessible repos from GitHub
        accessible_repos = self._get_accessible_repos()

        for repo in self.repositories:
            if "name" not in repo or "file_types" not in repo:
                raise ValidationError(
                    {
                        "repositories": "Each repository must have `name` and `file_types`."
                    }
                )

            if repo["name"] not in accessible_repos:
                raise ValidationError(
                    {
                        "repositories": f"Repository `{repo['name']}` is not accessible by this GitHub App."
                    }
                )

            if not isinstance(repo["file_types"], list):
                raise ValidationError(
                    {
                        "repositories": f"`file_types` must be a list for `{repo['name']}`."
                    }
                )

    def _get_accessible_repos(self):
        """
        Returns a set of repo full_names: {org/repo}
        You should cache this per installation in production.
        """
        # Example: installation_id stored elsewhere (org/account level)
        installation_id = get_installation_token()

        repos = self._list_installation_repositories(installation_id)
        return {repo["full_name"] for repo in repos}

    def delete(self, using=None, keep_parents=False):
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save()

    def __str__(self):
        return self.name


class BotLog(models.Model):
    bot = models.ForeignKey(
        "Bot",
        on_delete=models.CASCADE,
        related_name="logs",
    )

    comments = models.JSONField(default=list)
    evaluation_score = models.FloatField()
    pr_link = models.URLField(max_length=500)

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if not isinstance(self.comments, list):
            raise ValueError("comments must be a list of strings")

        if not all(isinstance(c, str) for c in self.comments):
            raise ValueError("each comment must be a string")
