// POST /api/auth/forgot-password - Request password reset
import {
    generateId,
    parseBody,
    successResponse,
    errorResponse
} from '../../utils.js';

export async function onRequestPost(context) {
    const { env, request } = context;
    const body = await parseBody(request);
    const { email } = body;

    if (!email) {
        return errorResponse('이메일을 입력해주세요.');
    }

    try {
        // Find user by email
        const user = await env.DB.prepare(
            'SELECT id, name FROM users WHERE email = ?'
        ).bind(email.toLowerCase()).first();

        // Always return success to prevent email enumeration
        if (!user) {
            return successResponse({}, '이메일이 존재하면 비밀번호 재설정 링크가 발송됩니다.');
        }

        // Generate reset token (6-digit code for simplicity)
        const token = Math.random().toString().substring(2, 8);
        const tokenId = generateId('reset');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

        // Delete any existing tokens for this user
        await env.DB.prepare(
            'DELETE FROM password_reset_tokens WHERE user_id = ?'
        ).bind(user.id).run();

        // Create new token
        await env.DB.prepare(
            'INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
        ).bind(tokenId, user.id, token, expiresAt).run();

        // Send email via Resend
        const RESEND_API_KEY = env.RESEND_API_KEY;

        if (RESEND_API_KEY) {
            const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'i-Haru <onboarding@resend.dev>',
                    to: email,
                    subject: '[i-Haru] 비밀번호 재설정 코드',
                    html: `
                        <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                            <h1 style="color: #FF6B6B; margin-bottom: 24px;">📅 i-Haru</h1>
                            <p style="font-size: 16px; color: #333; margin-bottom: 16px;">
                                안녕하세요, ${user.name}님!
                            </p>
                            <p style="font-size: 16px; color: #333; margin-bottom: 24px;">
                                비밀번호 재설정을 위한 인증 코드입니다:
                            </p>
                            <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #FF6B6B;">
                                    ${token}
                                </span>
                            </div>
                            <p style="font-size: 14px; color: #888; margin-bottom: 8px;">
                                • 이 코드는 30분 후에 만료됩니다.
                            </p>
                            <p style="font-size: 14px; color: #888;">
                                • 본인이 요청하지 않은 경우 이 이메일을 무시하세요.
                            </p>
                        </div>
                    `
                })
            });

            if (!emailResponse.ok) {
                console.error('Failed to send email:', await emailResponse.text());
            }
        } else {
            console.log('RESEND_API_KEY not configured. Reset token:', token);
        }

        return successResponse({}, '이메일이 존재하면 비밀번호 재설정 코드가 발송됩니다.');
    } catch (error) {
        console.error('Forgot password error:', error);
        return errorResponse('비밀번호 재설정 요청 중 오류가 발생했습니다.', 500);
    }
}
