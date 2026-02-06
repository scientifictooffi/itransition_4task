const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || "Request failed";
    const redirect = data?.redirect;
    const error = new Error(message);
    error.status = response.status;
    error.redirect = redirect;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body || {}),
    }),
};
