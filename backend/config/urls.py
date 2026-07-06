from django.http import JsonResponse
from django.urls import path, include


def health(request):
    return JsonResponse({"status": "ok", "service": "trip-eld-planner-api"})


urlpatterns = [
    path("api/health/", health),
    path("api/", include("trips.urls")),
]
