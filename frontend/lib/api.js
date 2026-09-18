const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api")
    .replace(/\/$/, "");

async function request(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type":
        "application/json",
        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      data?.error ||
      "Something went wrong.";

    const error = new Error(message);
    error.status = response.status;
    error.code = data?.error?.code;
    error.details =
      data?.error?.details;

    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint) =>
    request(endpoint, {
      method: "GET",
    }),

  post: (endpoint, body) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(
        body || {}
      ),
    }),

  patch: (endpoint, body) =>
    request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(
        body || {}
      ),
    }),

  delete: (endpoint) =>
    request(endpoint, {
      method: "DELETE",
    }),
};

export default api;