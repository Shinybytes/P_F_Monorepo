export const fetchWithToken = async (url, options = {}) => {
    const token = localStorage.getItem('token'); // Token aus dem lokalen Speicher abrufen

    // Headers initialisieren, falls noch nicht vorhanden
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
    };

    // Fetch ausführen mit Headern und Optionen
    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Fehlerbehandlung und Response zurückgeben
    if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
};
