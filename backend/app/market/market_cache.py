"""Thread-safe in-memory TTL cache for market data to conserve free API quotas."""

import threading
import time
from typing import Any


class MarketDataCache:
    """Thread-safe key-value cache with per-item TTL expiration."""

    def __init__(self, default_ttl: int = 300):
        self.default_ttl = default_ttl
        self._cache: dict[str, tuple[Any, float]] = {}
        self._lock = threading.RLock()
        self._hits = 0
        self._misses = 0

    def get(self, key: str) -> Any | None:
        """Retrieve item if present and not expired."""
        with self._lock:
            if key not in self._cache:
                self._misses += 1
                return None

            value, expiry = self._cache[key]
            if time.time() > expiry:
                del self._cache[key]
                self._misses += 1
                return None

            self._hits += 1
            return value

    def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        """Store item with explicit or default TTL in seconds."""
        expiry = time.time() + (ttl if ttl is not None else self.default_ttl)
        with self._lock:
            self._cache[key] = (value, expiry)

    def delete(self, key: str) -> bool:
        """Remove specific key from cache."""
        with self._lock:
            return self._cache.pop(key, None) is not None

    def clear(self) -> None:
        """Flush entire cache."""
        with self._lock:
            self._cache.clear()

    def stats(self) -> dict[str, int]:
        """Return cache performance statistics."""
        with self._lock:
            # Clean expired items on stats query
            now = time.time()
            active_keys = [k for k, (_, exp) in self._cache.items() if exp > now]
            return {
                "active_items": len(active_keys),
                "total_entries": len(self._cache),
                "hits": self._hits,
                "misses": self._misses,
            }


# Global singleton instance
_market_cache: MarketDataCache | None = None
_cache_init_lock = threading.Lock()


def get_market_cache(default_ttl: int = 300) -> MarketDataCache:
    """Return application-wide market data cache singleton."""
    global _market_cache
    if _market_cache is None:
        with _cache_init_lock:
            if _market_cache is None:
                _market_cache = MarketDataCache(default_ttl=default_ttl)
    return _market_cache
