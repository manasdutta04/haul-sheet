const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function planTrip(payload) {
  const res = await fetch(`${API_BASE}/api/plan-trip/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.error || "The trip could not be planned. Check the locations and try again.";
    throw new Error(message);
  }
  return data;
}
