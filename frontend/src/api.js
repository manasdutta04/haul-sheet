const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function planTrip(payload) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/plan-trip/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(`Unable to reach the trip planner API at ${API_BASE}. Check that the backend is running and VITE_API_BASE_URL is set correctly.`);
  }

  const contentType = res.headers.get("content-type") || "";
  const rawBody = await res.text();

  let data = null;
  if (contentType.includes("application/json")) {
    try {
      data = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      throw new Error("The API returned invalid JSON. Check the backend response.");
    }
  } else if (rawBody.trim().startsWith("<!DOCTYPE") || rawBody.trim().startsWith("<html")) {
    throw new Error(`The frontend received HTML instead of JSON from ${API_BASE}. This usually means VITE_API_BASE_URL points at the wrong server or the backend route is unavailable.`);
  } else if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { error: rawBody };
    }
  }

  if (!res.ok) {
    const message = data?.error || "The trip could not be planned. Check the locations and try again.";
    throw new Error(message);
  }
  return data;
}
