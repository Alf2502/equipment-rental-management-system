/* === API CONFIGURATION ===
    Note: To be use later for backend integration.
    Use: apiRequest("/equipment"); instead of fetch() when integrating to the backend
*/

const API_BASE_URL = "http://localhost:8080/api";

/* === API REQUEST === */
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options, headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    
    return response.json();
}