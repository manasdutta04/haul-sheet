"""Free geocoding using OpenStreetMap's Nominatim API (no API key required)."""
import hashlib
import requests
from django.core.cache import cache

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "trip-eld-planner/1.0 (assessment project)"


class GeocodeError(Exception):
    pass


def geocode(place: str):
    """Return {'lat': float, 'lon': float, 'display_name': str} for a free-text place name."""
    normalized_place = place.strip().lower()
    cache_key = f"geocode:{hashlib.sha1(normalized_place.encode('utf-8')).hexdigest()}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    resp = requests.get(
        NOMINATIM_URL,
        params={"q": place, "format": "json", "limit": 1},
        headers={"User-Agent": USER_AGENT},
        timeout=10,
    )
    resp.raise_for_status()
    results = resp.json()
    if not results:
        raise GeocodeError(f"Could not find a location for '{place}'")

    result = {
        "lat": float(results[0]["lat"]),
        "lon": float(results[0]["lon"]),
        "display_name": results[0]["display_name"],
    }
    cache.set(cache_key, result, timeout=60 * 60 * 24)
    return result
