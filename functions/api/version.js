// Version API
// GET /api/version - Returns the current app version/timestamp

const APP_VERSION = '2026-01-25-1045'; // Update this string to trigger client refresh

export function onRequestGet() {
    return new Response(JSON.stringify({ version: APP_VERSION }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
