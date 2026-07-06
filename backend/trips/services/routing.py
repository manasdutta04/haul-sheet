"""Free routing using the public OSRM demo server (no API key required)."""
import requests

OSRM_URL = "https://router.project-osrm.org/route/v1/driving"
METERS_PER_MILE = 1609.344


class RoutingError(Exception):
    pass


def get_route(waypoints: list[dict]):
    """
    waypoints: list of {'lat': float, 'lon': float}, in visit order.

    Returns:
        {
          'geometry': [[lat, lon], ...],      # full route polyline, for the map
          'legs': [ { 'distance_miles': float, 'duration_hours': float }, ... ]
        }
    One leg per consecutive pair of waypoints (so 3 waypoints -> 2 legs).
    """
    coord_str = ";".join(f"{wp['lon']},{wp['lat']}" for wp in waypoints)
    resp = requests.get(
        f"{OSRM_URL}/{coord_str}",
        params={"overview": "full", "geometries": "geojson", "steps": "false"},
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()

    if data.get("code") != "Ok" or not data.get("routes"):
        raise RoutingError(f"Routing failed: {data.get('message', data.get('code'))}")

    route = data["routes"][0]
    geometry = [[lat, lon] for lon, lat in route["geometry"]["coordinates"]]

    legs = [
        {
            "distance_miles": leg["distance"] / METERS_PER_MILE,
            "duration_hours": leg["duration"] / 3600.0,
        }
        for leg in route["legs"]
    ]

    return {"geometry": geometry, "legs": legs, "total_distance_miles": route["distance"] / METERS_PER_MILE}


def interpolate_point(geometry: list[list[float]], fraction: float):
    """Rough point along the route polyline at `fraction` (0..1) of its point count."""
    if not geometry:
        return None
    fraction = max(0.0, min(1.0, fraction))
    idx = int(round(fraction * (len(geometry) - 1)))
    return geometry[idx]
