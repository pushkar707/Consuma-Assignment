# webhooks/github_api.py
import requests
from .github_auth import generate_jwt


def get_installation_token(installation_id):
    jwt_token = generate_jwt()

    url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"

    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Accept": "application/vnd.github+json",
    }

    res = requests.post(url, headers=headers)
    return res.json()["token"]


def comment_on_pr(data):
    token = get_installation_token(data["installation"]["id"])
    pr = data["pull_request"]

    url = pr["_links"]["comments"]["href"]
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
    }

    requests.post(url, json={"body": "🚀 PR received!"}, headers=headers)
