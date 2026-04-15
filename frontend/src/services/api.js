/**
 * api.js
 * Central API helper that automatically:
 *   1. Attaches JWT token to every request
 *   2. Handles 401 (token expired) by logging out
 *   3. Returns parsed JSON or throws error with message
 *
 * Usage:
 *   import api from "../services/api";
 *
 *   const data = await api.get("/trains/search?from=NDLS&to=MMCT&date=2026-04-16");
 *   const data = await api.post("/trains/book", { trainNo, passengers, ... });
 */

const BASE_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const handleUnauthorized = () => {
  // Token expired or invalid — clear storage and redirect to login
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

const request = async (method, path, body = null) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
  };

  // Attach token if it exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, config);

  // Token expired or invalid
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));

    if (data.code === "TOKEN_EXPIRED" || data.code === "TOKEN_INVALID") {
      handleUnauthorized();
      throw new Error("Session expired. Please log in again.");
    }

    throw new Error(data.message || "Unauthorized");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

const api = {
  get:    (path)         => request("GET",    path),
  post:   (path, body)   => request("POST",   path, body),
  put:    (path, body)   => request("PUT",    path, body),
  delete: (path)         => request("DELETE", path),
};

export default api;