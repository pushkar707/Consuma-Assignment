import hmac
import hashlib
import json

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from github_bot.settings import GITHUB_WEBHOOK_SECRET
from webhooks.github_api import comment_on_pr

@api_view(["POST"])
def github_webhook(request):
    signature = request.headers.get("X-Hub-Signature-256")
    payload = request.body
    print("Event recieved")

    expected = "sha256=" + hmac.new(
        GITHUB_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature or ""):
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    event = request.headers.get("X-GitHub-Event")
    data = json.loads(payload)

    if event == "pull_request" and data["action"] == "opened":
        print("PR opened:", data["pull_request"]["title"])
        comment_on_pr(data) 

    return Response(status=status.HTTP_200_OK)