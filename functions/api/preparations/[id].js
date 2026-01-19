// Preparation by ID API
// PUT /api/preparations/[id] - Update preparation
// DELETE /api/preparations/[id] - Delete preparation
// PATCH /api/preparations/[id] - Toggle completion
import {
    getUserFromRequest,
    parseBody,
    successResponse,
    errorResponse
} from '../../utils.js';

// PUT - Update preparation
export async function onRequestPut(context) {
    const { env, request, params } = context;
    const prepId = params.id;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    const body = await parseBody(request);
    const { title, description, category, childId, dueDate } = body;

    try {
        const user = await env.DB.prepare(
            'SELECT family_id FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        const prep = await env.DB.prepare(
            'SELECT id FROM preparations WHERE id = ? AND family_id = ?'
        ).bind(prepId, user.family_id).first();

        if (!prep) {
            return errorResponse('준비물을 찾을 수 없습니다.', 404);
        }

        await env.DB.prepare(
            `UPDATE preparations SET 
        title = ?, description = ?, category = ?, child_id = ?, due_date = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
        ).bind(
            title,
            description || null,
            category || 'general',
            childId || null,
            dueDate,
            prepId
        ).run();

        return successResponse({}, '준비물이 수정되었습니다.');
    } catch (error) {
        console.error('Update preparation error:', error);
        return errorResponse('준비물 수정 중 오류가 발생했습니다.', 500);
    }
}

// PATCH - Toggle completion status
export async function onRequestPatch(context) {
    const { env, request, params } = context;
    const prepId = params.id;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    try {
        const user = await env.DB.prepare(
            'SELECT family_id FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        const prep = await env.DB.prepare(
            'SELECT id, is_completed FROM preparations WHERE id = ? AND family_id = ?'
        ).bind(prepId, user.family_id).first();

        if (!prep) {
            return errorResponse('준비물을 찾을 수 없습니다.', 404);
        }

        const newStatus = prep.is_completed ? 0 : 1;

        await env.DB.prepare(
            `UPDATE preparations SET is_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(newStatus, prepId).run();

        return successResponse({ isCompleted: !!newStatus }, newStatus ? '완료 처리되었습니다.' : '완료 취소되었습니다.');
    } catch (error) {
        console.error('Toggle preparation error:', error);
        return errorResponse('상태 변경 중 오류가 발생했습니다.', 500);
    }
}

// DELETE - Delete preparation
export async function onRequestDelete(context) {
    const { env, request, params } = context;
    const prepId = params.id;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    try {
        const user = await env.DB.prepare(
            'SELECT family_id FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        const prep = await env.DB.prepare(
            'SELECT id FROM preparations WHERE id = ? AND family_id = ?'
        ).bind(prepId, user.family_id).first();

        if (!prep) {
            return errorResponse('준비물을 찾을 수 없습니다.', 404);
        }

        await env.DB.prepare('DELETE FROM preparations WHERE id = ?').bind(prepId).run();

        return successResponse({}, '준비물이 삭제되었습니다.');
    } catch (error) {
        console.error('Delete preparation error:', error);
        return errorResponse('준비물 삭제 중 오류가 발생했습니다.', 500);
    }
}
