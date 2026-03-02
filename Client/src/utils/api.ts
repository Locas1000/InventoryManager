// src/utils/api.ts

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    // 1. Grab the token from local storage
    const token = localStorage.getItem('token');

    // 2. Set up the headers
    const headers = new Headers(options.headers || {});

    // 3. If we have a token, attach it using the Bearer scheme
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // 4. Ensure we are sending and receiving JSON by default
    if (!headers.has('Content-Type') && options.method !== 'GET') {
        headers.set('Content-Type', 'application/json');
    }

    // 5. Execute the fetch
    const response = await fetch(url, {
        ...options,
        headers,
    });

    // 6. Optional: Globally handle 401 Unauthorized (e.g., token expired)
    if (response.status === 401) {
        console.warn("Unauthorized! Clearing token and redirecting to login...");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Force a redirect to login
    }

    return response;
};