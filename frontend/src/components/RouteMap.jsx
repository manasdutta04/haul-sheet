import React, { useMemo } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from "react-leaflet";

const STOP_COLORS = {
  pickup: "#2f9e6e",
  dropoff: "#e15a4d",
  fuel: "#4c8bf5",
  break: "#8b6cf0",
  rest: "#8b6cf0",
  restart: "#f2b705",
};

function boundsFromGeometry(geometry) {
  const lats = geometry.map((p) => p[0]);
  const lons = geometry.map((p) => p[1]);
  return [
    [Math.min(...lats), Math.min(...lons)],
    [Math.max(...lats), Math.max(...lons)],
  ];
}

export default function RouteMap({ route, stops }) {
  const bounds = useMemo(() => boundsFromGeometry(route.geometry), [route]);

  return (
    <div className="map-wrap">
      <MapContainer bounds={bounds} boundsOptions={{ padding: [30, 30] }} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={route.geometry} pathOptions={{ color: "#f2b705", weight: 4, opacity: 0.9 }} />

        {["current", "pickup", "dropoff"].map((key) => {
          const m = route.markers[key];
          if (!m) return null;
          return (
            <CircleMarker
              key={key}
              center={[m.lat, m.lon]}
              radius={7}
              pathOptions={{ color: "#12161c", weight: 2, fillColor: key === "current" ? "#e9ecef" : STOP_COLORS[key] || "#f2b705", fillOpacity: 1 }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {key === "current" ? "Start: " : key === "pickup" ? "Pickup: " : "Drop-off: "}
                {m.label}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {stops
          .filter((s) => s.lat != null && s.lon != null && !["pickup", "dropoff"].includes(s.kind))
          .map((s, i) => (
            <CircleMarker
              key={i}
              center={[s.lat, s.lon]}
              radius={5}
              pathOptions={{ color: "#12161c", weight: 1.5, fillColor: STOP_COLORS[s.kind] || "#8b94a3", fillOpacity: 1 }}
            >
              <Tooltip direction="top" offset={[0, -5]}>
                {s.label} — {s.duration_hours}h
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  );
}
