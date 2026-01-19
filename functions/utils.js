// API Utilities and Types

// Generate unique ID
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

// Generate invite code for family
export function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'HARU';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Hash password (simple hash for demo - use bcrypt in production)
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'iharu_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
export async function verifyPassword(password, hash) {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

// Generate JWT token
export async function generateToken(payload, secret = 'iharu_jwt_secret_2026') {
    const header = { alg: 'HS256', typ: 'JWT' };

    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(`${base64Header}.${base64Payload}`)
    );

    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return `${base64Header}.${base64Payload}.${base64Signature}`;
}

// Verify JWT token
export async function verifyToken(token, secret = 'iharu_jwt_secret_2026') {
    try {
        const [header, payload, signature] = token.split('.');

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

        const valid = await crypto.subtle.verify(
            'HMAC',
            key,
            signatureBytes,
            encoder.encode(`${header}.${payload}`)
        );

        if (!valid) return null;

        const decoded = JSON.parse(atob(payload));

        if (decoded.exp < Date.now()) return null;

        return decoded;
    } catch {
        return null;
    }
}

// JSON response helper
export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}

// Error response helper
export function errorResponse(message, status = 400) {
    return jsonResponse({ error: message, success: false }, status);
}

// Success response helper
export function successResponse(data = {}, message = 'Success') {
    return jsonResponse({ success: true, message, ...data });
}

// Parse request body
export async function parseBody(request) {
    try {
        return await request.json();
    } catch {
        return {};
    }
}

// Get user from token
export async function getUserFromRequest(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    return verifyToken(token);
}

// Child colors
export const CHILD_COLORS = ['#4ECDC4', '#A18CD1', '#FFB347', '#87CEEB', '#FF6B6B'];

export function getNextChildColor(index) {
    return CHILD_COLORS[index % CHILD_COLORS.length];
}
