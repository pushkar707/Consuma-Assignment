# webhooks/github_api.py
import requests
from .github_auth import generate_jwt


def get_installation_token(installation_id):
    # TODO: Add singleton class to manage token creation instead of generating new token for every request
    jwt_token = generate_jwt()

    url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"

    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Accept": "application/vnd.github+json",
    }

    res = requests.post(url, headers=headers)
    return res.json()["token"]

def make_review(changes: str, name: str, prompt_template: str):
    # Code to run the prompt through ML model
    # Mocking the model output as a single comment instead of proper review due to lack of time
    sections = []

    for change in changes:
        section = [
            f"File: {change['filename']}",
            f"Status: {change['status']}",
            f"Additions: {change['additions']}, Deletions: {change['deletions']}",
        ]

        if change.get("patch"):
            section.append("Changes:")
            section.append(change["patch"])
        else:
            section.append("Changes: (diff not available)")

        sections.append("\n".join(section))

    string_changes = "\n\n---\n\n".join(sections)

    prompt_template.replace('{/changes}/', string_changes)
    additions = sum(file["additions"] for file in changes)
    deletions = sum(file["deletions"] for file in changes)
    output = f"Total {additions} addition and {deletions} deletions reviewed by: {name}"
    return output


def comment_on_pr(data, output: str):
    token = get_installation_token(data["installation"]["id"])
    pr = data["pull_request"]

    url = pr["_links"]["comments"]["href"]
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
    }

    requests.post(url, json={"body": output}, headers=headers)


def get_pr_changes_from_webhook(data):
    """
    Returns a list of changed files with diffs.
    Input: GitHub webhook payload (dict)
    """

    installation_id = data["installation"]["id"]
    pr_api_url = data["pull_request"]["url"]

    token = get_installation_token(installation_id)

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
    }

    files_url = f"{pr_api_url}/files"

    changes = []
    page = 1

    while True:
        response = requests.get(
            files_url,
            headers=headers,
            params={"per_page": 100, "page": page},
        )
        response.raise_for_status()

        files = response.json()
        if not files:
            break

        for file in files:
            changes.append(
                {
                    "filename": file["filename"],
                    "status": file["status"],
                    "additions": file["additions"],
                    "deletions": file["deletions"],
                    "patch": file.get("patch"),  # may be None
                }
            )

        page += 1

    return changes
