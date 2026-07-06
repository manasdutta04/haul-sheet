from datetime import datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as http_status

from .serializers import TripRequestSerializer
from .services.geocode import geocode, GeocodeError
from .services.routing import get_route, interpolate_point, RoutingError
from .services.hos_planner import (
    TripSimulator,
    DriveLeg,
    build_daily_logs,
    STATUS_DRIVING,
)

STOP_ICON_BY_LABEL = {
    "Pickup": "pickup",
    "Drop-off": "dropoff",
    "Fuel stop": "fuel",
}


def _stop_kind(event_dict):
    label = event_dict["label"]
    if label in STOP_ICON_BY_LABEL:
        return STOP_ICON_BY_LABEL[label]
    if "restart" in label.lower():
        return "restart"
    if "10-hour" in label or "off-duty rest" in label:
        return "rest"
    if "break" in label.lower():
        return "break"
    return None


class PlanTripView(APIView):
    def post(self, request):
        serializer = TripRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            current = geocode(data["current_location"])
            pickup = geocode(data["pickup_location"])
            dropoff = geocode(data["dropoff_location"])
        except GeocodeError as exc:
            return Response({"error": str(exc)}, status=http_status.HTTP_400_BAD_REQUEST)

        try:
            route = get_route([current, pickup, dropoff])
        except RoutingError as exc:
            return Response({"error": str(exc)}, status=http_status.HTTP_502_BAD_GATEWAY)

        leg1_info, leg2_info = route["legs"]
        leg1 = DriveLeg(leg1_info["distance_miles"], leg1_info["duration_hours"],
                         data["current_location"], data["pickup_location"])
        leg2 = DriveLeg(leg2_info["distance_miles"], leg2_info["duration_hours"],
                         data["pickup_location"], data["dropoff_location"])

        start_dt = data.get("start_datetime") or datetime.now()
        if start_dt.tzinfo is not None:
            start_dt = start_dt.replace(tzinfo=None)

        sim = TripSimulator(start_dt, data["current_cycle_used"])
        events = sim.run(leg1, leg2, data["pickup_location"], data["dropoff_location"])

        # Build stops list with approximate map positions (interpolated along route by cumulative miles).
        stops = []
        cumulative_miles = 0.0
        for ev in events:
            ev_dict = ev.to_dict()
            if ev.status == STATUS_DRIVING:
                cumulative_miles += ev.miles
                continue
            kind = _stop_kind(ev_dict)
            if kind is None:
                continue
            fraction = cumulative_miles / route["total_distance_miles"] if route["total_distance_miles"] else 0
            point = interpolate_point(route["geometry"], fraction)
            stops.append({
                "kind": kind,
                "label": ev.label,
                "location": ev.location,
                "start": ev_dict["start"],
                "end": ev_dict["end"],
                "duration_hours": ev_dict["hours"],
                "lat": point[0] if point else None,
                "lon": point[1] if point else None,
            })

        daily_logs = build_daily_logs(events)

        total_drive_hours = sum(e.hours for e in events if e.status == STATUS_DRIVING)
        total_duration_hours = (events[-1].end - events[0].start).total_seconds() / 3600.0 if events else 0

        return Response({
            "route": {
                "geometry": route["geometry"],
                "total_distance_miles": round(route["total_distance_miles"], 1),
                "markers": {
                    "current": {"lat": current["lat"], "lon": current["lon"], "label": data["current_location"]},
                    "pickup": {"lat": pickup["lat"], "lon": pickup["lon"], "label": data["pickup_location"]},
                    "dropoff": {"lat": dropoff["lat"], "lon": dropoff["lon"], "label": data["dropoff_location"]},
                },
            },
            "summary": {
                "total_distance_miles": round(route["total_distance_miles"], 1),
                "total_driving_hours": round(total_drive_hours, 2),
                "total_trip_duration_hours": round(total_duration_hours, 2),
                "num_days": len(daily_logs),
                "start_datetime": start_dt.isoformat(),
            },
            "stops": stops,
            "daily_logs": daily_logs,
            "events": [e.to_dict() for e in events],
        })
