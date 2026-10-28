const API_BASE_URL = "/api";

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "API request failed.");
    }

    return result;
}