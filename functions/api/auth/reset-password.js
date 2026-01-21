// POST /api/auth/reset-password - Reset password with token
import {
    hashPassword,
    parseBody,
    successResponse,
    errorResponse
} from '../../utils.js';

export async function onRequestPost(context) {
    const { env, request } = context;
    const body = await parseBody(request);
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
        return errorResponse('이메일, 인증코드, 새 비밀번호가 필요합니다.');
    }

    if (newPassword.length < 6) {
        return errorResponse('비밀번호는 6자 이상이어야 합니다.');
    }

    try {
        // Find user
        const user = await env.DB.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind(email.toLowerCase()).first();

        if (!user) {
            return errorResponse('유효하지 않은 요청입니다.');
        }

        // Find valid token
        const resetToken = await env.DB.prepare(
            'SELECT * FROM password_reset_tokens WHERE user_id = ? AND token = ? AND used = 0'
        ).bind(user.id, token).first();

        if (!resetToken) {
            return errorResponse('유효하지 않은 인증 코드입니다.');
        }

        // Check if expired
        if (new Date(resetToken.expires_at) < new Date()) {
            return errorResponse('인증 코드가 만료되었습니다. 다시 요청해주세요.');
        }

        // Update password
        const passwordHash = await hashPassword(newPassword);
        await env.DB.prepare(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(passwordHash, user.id).run();

        // Mark token as used
        await env.DB.prepare(
            'UPDATE password_reset_tokens SET used = 1 WHERE id = ?'
        ).bind(resetToken.id).run();

        return successResponse({}, '비밀번호가 성공적으로 변경되었습니다.');
    } catch (error) {
        console.error('Reset password error:', error);
        return errorResponse('비밀번호 재설정 중 오류가 발생했습니다.', 500);
    }
}
