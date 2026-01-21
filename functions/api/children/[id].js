// Children by ID API
// GET /api/children/[id] - Get child profile by ID
// DELETE /api/children/[id] - Remove child profile
import {
    getUserFromRequest,
    successResponse,
    errorResponse
} from '../../utils.js';

// GET - Get child profile by ID
export async function onRequestGet(context) {
    const { env, request, params } = context;
    const childId = params.id;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    try {
        const child = await env.DB.prepare(`
            SELECT 
                cp.*,
                u.name as linked_user_name,
                u.email as linked_user_email
            FROM child_profiles cp
            LEFT JOIN users u ON cp.linked_user_id = u.id
            WHERE cp.id = ?
        `).bind(childId).first();

        if (!child) {
            return errorResponse('자녀를 찾을 수 없습니다.', 404);
        }

        return successResponse({
            child: {
                id: child.id,
                name: child.name,
                color: child.color,
                inviteCode: child.invite_code,
                linkedUserId: child.linked_user_id,
                linkedUserName: child.linked_user_name,
                isLinked: !!child.linked_user_id
            }
        });
    } catch (error) {
        console.error('Get child error:', error);
        return errorResponse('자녀 조회 중 오류가 발생했습니다.', 500);
    }
}

// DELETE - Remove child profile
export async function onRequestDelete(context) {
    const { env, request, params } = context;
    const childId = params.id;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    try {
        const user = await env.DB.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        if (user?.role !== 'parent') {
            return errorResponse('부모만 자녀를 삭제할 수 있습니다.', 403);
        }

        // Delete child profile
        await env.DB.prepare(
            'DELETE FROM child_profiles WHERE id = ?'
        ).bind(childId).run();

        return successResponse({}, '자녀가 삭제되었습니다.');
    } catch (error) {
        console.error('Delete child error:', error);
        return errorResponse('자녀 삭제 중 오류가 발생했습니다.', 500);
    }
}
