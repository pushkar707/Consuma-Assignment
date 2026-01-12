import hmac
import hashlib
import json

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from bots.models import Bot
from github_bot.settings import GITHUB_WEBHOOK_SECRET
from webhooks.github_api import comment_on_pr, get_pr_changes_from_webhook, make_review


@api_view(["POST"])
def github_webhook(request):
    signature = request.headers.get("X-Hub-Signature-256")
    payload = request.body

    expected = (
        "sha256="
        + hmac.new(
            GITHUB_WEBHOOK_SECRET.encode(),
            payload,
            hashlib.sha256,
        ).hexdigest()
    )

    if not hmac.compare_digest(expected, signature or ""):
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    event = request.headers.get("X-GitHub-Event")
    data = json.loads(payload)

    if event == "pull_request" and data["action"] == "opened":
        changes = get_pr_changes_from_webhook(data)
        repo_name = data["repository"]["name"]
        eligible_bots = Bot.objects.filter(
            is_active=True,
            deleted_at__isnull=True,
            repositories__contains=[repo_name],
        )

        for bot in eligible_bots:
            output = make_review(
                changes=changes, name=bot.name, prompt_template=bot.review_prompt
            )
            comment_on_pr(data=data, output=output)

    return Response(status=status.HTTP_200_OK)
