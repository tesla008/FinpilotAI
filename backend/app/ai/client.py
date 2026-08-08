import json
import re

import anthropic

from app.ai.prompt import SYSTEM_PROMPT, build_user_message
from app.core.config import get_settings

settings = get_settings()

_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


class ClaudeUnavailableError(Exception):
    """Raised for anything that means we couldn't get a usable response —
    missing API key, network/API error, or unparseable output. Callers treat
    this as "degrade gracefully", never as a reason to break the dashboard."""


def _extract_json(text: str) -> dict:
    cleaned = _FENCE_RE.sub("", text.strip())
    return json.loads(cleaned)


def call_claude(summary: dict) -> dict:
    if not settings.anthropic_api_key:
        raise ClaudeUnavailableError("ANTHROPIC_API_KEY is not configured.")

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": build_user_message(summary)}],
        )
        text = "".join(block.text for block in response.content if block.type == "text")
        return _extract_json(text)
    except (anthropic.APIError, json.JSONDecodeError) as exc:
        raise ClaudeUnavailableError(str(exc)) from exc
