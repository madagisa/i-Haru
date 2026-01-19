// POST /api/auth/login - User login
import {
    verifyPassword,
    generateToken,
    parseBody,
    successResponse,
    errorResponse
} from '../../utils.js';

export async function onRequestPost(context) {
    const { env } = context;
    const body = await parseBody(context.request);

    const { email, password } = body;

    if (!email || !password) {
        return errorResponse('이메일과 비밀번호가 필요합니다.');
    }

    try {
        // Find user
        const user = await env.DB.prepare(
            'SELECT * FROM users WHERE email = ?'
        ).bind(email).first();

        if (!user) {
            return errorResponse('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // Verify password
        const valid = await verifyPassword(password, user.password_hash);

        if (!valid) {
            return errorResponse('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // Generate token
        const token = await generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Return user data (without password)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            familyId: user.family_id,
            color: user.color
        };

        return successResponse({ user: userData, token }, '로그인 성공');
    } catch (error) {
        console.error('Login error:', error);
        return errorResponse('로그인 중 오류가 발생했습니다.', 500);
    }
}
