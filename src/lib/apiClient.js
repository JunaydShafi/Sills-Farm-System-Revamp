// Small fetch wrapper for pages that call the app's own API routes.
// Always resolves to { ok, status, data } with a readable data.error on failure.
export async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      return {
        ok: false,
        status: 401,
        data: { error: "Your session has expired. Please log in again." },
      };
    }

    return { ok: response.ok, status: response.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: "Can't reach the server. Check your connection and try again." },
    };
  }
}
