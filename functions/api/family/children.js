// Children management API
// POST /api/family/children - Add child to family
// DELETE /api/family/children - Remove child from family
import {
    generateId,
    getUserFromRequest,
    parseBody,
    successResponse,
    errorResponse,
    getNextChildColor
} from '../../utils.js';

// POST - Add child to family
export async function onRequestPost(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    // Verify user is parent
    const user = await env.DB.prepare(
        'SELECT role, family_id FROM users WHERE id = ?'
    ).bind(tokenData.userId).first();

    if (!user || user.role !== 'parent') {
        return errorResponse('부모 계정만 자녀를 추가할 수 있습니다.', 403);
    }

    const body = await parseBody(request);
    const { name, color } = body;

    if (!name) {
        return errorResponse('자녀 이름이 필요합니다.');
    }

    try {
        // Count existing children for color
        const childCountResult = await env.DB.prepare(
            `SELECT COUNT(*) as count FROM users WHERE family_id = ? AND role = 'child'`
        ).bind(user.family_id).first();
        const childCount = childCountResult?.count || 0;

        const childId = generateId('user');
        const childColor = color || getNextChildColor(childCount);

        // Create child user (without login credentials)
        await env.DB.prepare(
            `INSERT INTO users (id, name, role, family_id, color, email, password_hash) 
       VALUES (?, ?, 'child', ?, ?, ?, '')`
        ).bind(childId, name, user.family_id, childColor, `child_${childId}@family`).run();

        return successResponse({
            child: {
                id: childId,
                name,
                role: 'child',
                color: childColor
            }
        }, '자녀가 추가되었습니다.');
    } catch (error) {
        console.error('Add child error:', error);
        return errorResponse('자녀 추가 중 오류가 발생했습니다.', 500);
    }
}

// DELETE - Remove child from family
export async function onRequestDelete(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    // Verify user is parent
    const user = await env.DB.prepare(
        'SELECT role, family_id FROM users WHERE id = ?'
    ).bind(tokenData.userId).first();

    if (!user || user.role !== 'parent') {
        return errorResponse('부모 계정만 자녀를 삭제할 수 있습니다.', 403);
    }

    const body = await parseBody(request);
    const { childId } = body;

    if (!childId) {
        return errorResponse('자녀 ID가 필요합니다.');
    }

    try {
        // Verify child belongs to this family
        const child = await env.DB.prepare(
            `SELECT id FROM users WHERE id = ? AND family_id = ? AND role = 'child'`
        ).bind(childId, user.family_id).first();

        if (!child) {
            return errorResponse('자녀를 찾을 수 없습니다.', 404);
        }

        // Delete child's schedules and preparations first
        await env.DB.prepare('DELETE FROM schedules WHERE child_id = ?').bind(childId).run();
        await env.DB.prepare('DELETE FROM preparations WHERE child_id = ?').bind(childId).run();

        // Delete child
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(childId).run();

        return successResponse({}, '자녀가 삭제되었습니다.');
    } catch (error) {
        console.error('Delete child error:', error);
        return errorResponse('자녀 삭제 중 오류가 발생했습니다.', 500);
    }
}
