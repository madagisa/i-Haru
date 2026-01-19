// POST /api/auth/signup - Register new user
import {
    generateId,
    generateInviteCode,
    hashPassword,
    generateToken,
    parseBody,
    successResponse,
    errorResponse,
    getNextChildColor
} from '../../utils.js';

export async function onRequestPost(context) {
    const { env } = context;
    const body = await parseBody(context.request);

    const { email, password, name, role } = body;

    // Validation
    if (!email || !password || !name || !role) {
        return errorResponse('이메일, 비밀번호, 이름, 역할이 필요합니다.');
    }

    if (!['parent', 'child'].includes(role)) {
        return errorResponse('역할은 parent 또는 child 이어야 합니다.');
    }

    if (password.length < 6) {
        return errorResponse('비밀번호는 6자 이상이어야 합니다.');
    }

    try {
        // Check if email already exists
        const existing = await env.DB.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind(email).first();

        if (existing) {
            return errorResponse('이미 가입된 이메일입니다.');
        }

        const userId = generateId('user');
        const passwordHash = await hashPassword(password);
        const color = role === 'parent' ? '#FF6B6B' : getNextChildColor(0);

        let familyId = null;

        // If parent, create a new family
        if (role === 'parent') {
            familyId = generateId('family');
            const inviteCode = generateInviteCode();

            await env.DB.prepare(
                `INSERT INTO families (id, name, invite_code, created_by) VALUES (?, ?, ?, ?)`
            ).bind(familyId, `${name}의 가족`, inviteCode, userId).run();
        }

        // Create user
        await env.DB.prepare(
            `INSERT INTO users (id, email, password_hash, name, role, family_id, color) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(userId, email, passwordHash, name, role, familyId, color).run();

        // Generate token
        const token = await generateToken({ userId, email, role });

        // Get user data
        const user = {
            id: userId,
            email,
            name,
            role,
            familyId,
            color
        };

        return successResponse({ user, token }, '회원가입이 완료되었습니다.');
    } catch (error) {
        console.error('Signup error:', error);
        return errorResponse('회원가입 중 오류가 발생했습니다.', 500);
    }
}
