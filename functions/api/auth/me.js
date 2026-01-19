// GET /api/auth/me - Get current user info
import {
    getUserFromRequest,
    successResponse,
    errorResponse
} from '../../utils.js';

export async function onRequestGet(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);

    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    try {
        const user = await env.DB.prepare(
            'SELECT id, email, name, role, family_id, color FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        if (!user) {
            return errorResponse('사용자를 찾을 수 없습니다.', 404);
        }

        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            familyId: user.family_id,
            color: user.color
        };

        return successResponse({ user: userData });
    } catch (error) {
        console.error('Get user error:', error);
        return errorResponse('사용자 정보 조회 중 오류가 발생했습니다.', 500);
    }
}
