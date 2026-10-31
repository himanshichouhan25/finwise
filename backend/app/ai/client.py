"""Groq LLM Client with multi-key rotation and automatic fallback."""

import json
import logging
import threading
from dataclasses import dataclass, field
from typing import Any

from groq import APIConnectionError, APIStatusError, Groq, InternalServerError, RateLimitError

from app.core.config import get_settings
from app.core.errors import AIUnavailableError

logger = logging.getLogger("finwise.ai.client")


@dataclass
class AIToolCall:
    """Parsed tool call from the LLM."""

    id: str
    name: str
    arguments: dict[str, Any] = field(default_factory=dict)


@dataclass
class AIResponse:
    """Standardized response from the LLM."""

    content: str | None
    tool_calls: list[AIToolCall] = field(default_factory=list)
    model_used: str = ""
    finish_reason: str = "stop"


class GroqLLMClient:
    """Thread-safe Groq client with multi-key rotation pool and model fallback."""

    def __init__(
        self,
        keys: list[str] | None = None,
        primary_model: str | None = None,
        fallback_model: str | None = None,
        timeout: int | None = None,
    ):
        settings = get_settings()
        self.keys = keys if keys is not None else settings.all_groq_keys
        self.primary_model = primary_model or settings.LLM_MODEL
        self.fallback_model = fallback_model or settings.LLM_FALLBACK_MODEL
        self.timeout = timeout or settings.LLM_TIMEOUT_SECONDS
        self._key_index = 0
        self._lock = threading.Lock()

    @property
    def is_available(self) -> bool:
        """True if at least one Groq API key is configured."""
        return len(self.keys) > 0

    def _get_active_client(self) -> tuple[Groq, str, int]:
        """Return the current active Groq client and key index."""
        with self._lock:
            if not self.keys:
                raise AIUnavailableError("No Groq API key configured. AI Coach is offline.")
            idx = self._key_index % len(self.keys)
            key = self.keys[idx]
            return Groq(api_key=key, timeout=self.timeout), key, idx

    def _rotate_key(self, current_idx: int) -> None:
        """Advance to the next API key in the pool."""
        with self._lock:
            if self._key_index == current_idx:
                self._key_index = (self._key_index + 1) % len(self.keys)
                logger.info(
                    "Rotated Groq API key from index %d to %d (total keys: %d)",
                    current_idx,
                    self._key_index,
                    len(self.keys),
                )

    def complete(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        tool_choice: str = "auto",
        json_mode: bool = False,
        temperature: float = 0.2,
    ) -> AIResponse:
        """Execute chat completion with automatic key failover and model fallback."""
        if not self.keys:
            raise AIUnavailableError(
                "AI financial coach is currently unavailable (no active API key configured). "
                "All deterministic calculators remain fully operational."
            )

        models_to_try = [self.primary_model]
        if self.fallback_model and self.fallback_model not in models_to_try:
            models_to_try.append(self.fallback_model)
        for cand in ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]:
            if cand not in models_to_try:
                models_to_try.append(cand)

        last_error: Exception | None = None

        for model in models_to_try:
            # Try rotating across all available keys for this model
            for _ in range(len(self.keys)):
                client, _, key_idx = self._get_active_client()
                try:
                    kwargs: dict[str, Any] = {
                        "model": model,
                        "messages": messages,
                        "temperature": temperature,
                    }
                    if json_mode:
                        kwargs["response_format"] = {"type": "json_object"}
                    if tools:
                        kwargs["tools"] = tools
                        kwargs["tool_choice"] = tool_choice

                    completion = client.chat.completions.create(**kwargs)
                    choice = completion.choices[0]
                    message = choice.message

                    tool_calls: list[AIToolCall] = []
                    if getattr(message, "tool_calls", None):
                        for tc in message.tool_calls:
                            raw_args = tc.function.arguments or "{}"
                            try:
                                parsed_args = json.loads(raw_args) if isinstance(raw_args, str) else raw_args
                            except json.JSONDecodeError:
                                parsed_args = {}
                            tool_calls.append(
                                AIToolCall(
                                    id=tc.id,
                                    name=tc.function.name,
                                    arguments=parsed_args,
                                )
                            )

                    return AIResponse(
                        content=message.content,
                        tool_calls=tool_calls,
                        model_used=model,
                        finish_reason=choice.finish_reason or "stop",
                    )

                except (RateLimitError, APIStatusError, APIConnectionError, InternalServerError) as e:
                    logger.warning(
                        "Groq call failed on key index %d (model=%s): %s",
                        key_idx,
                        model,
                        str(e),
                    )
                    last_error = e
                    self._rotate_key(key_idx)
                    continue
                except Exception as e:
                    logger.exception("Unexpected error during Groq completion call: %s", str(e))
                    last_error = e
                    break

        error_msg = f"AI Coach temporarily unavailable across all keys and fallback models: {last_error}"
        logger.error(error_msg)
        raise AIUnavailableError(
            message="AI Coach is temporarily overloaded or unavailable. Please try again shortly.",
            fallback_data={"error_type": "llm_exhausted", "detail": str(last_error)},
        )


_llm_client: GroqLLMClient | None = None


def get_llm_client() -> GroqLLMClient:
    """Provide singleton instance of GroqLLMClient."""
    global _llm_client
    if _llm_client is None:
        _llm_client = GroqLLMClient()
    return _llm_client
