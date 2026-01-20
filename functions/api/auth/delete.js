// DELETE /api/auth/delete - Delete user account
import {
    getUserFromRequest,
    successResponse,
    errorResponse
} from '../../utils.js';

export async function onRequestDelete(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    try {
        const userId = tokenData.userId;

        // Start transaction (D1 doesn't support explicit transactions in all modes, but we execute sequentially)
        // 1. Delete messages sent by user
        await env.DB.prepare('DELETE FROM messages WHERE from_user_id = ?').bind(userId).run();

        // 2. Delete preparations created by user
        await env.DB.prepare('DELETE FROM preparations WHERE created_by = ?').bind(userId).run();

        // 3. Delete recurrences for schedules created by user
        // This is tricky because we need schedule IDs first.
        // For simplicity, let's rely on manual cleanup or cascade if we had it.
        // Let's delete recurrences where schedule_id belongs to a schedule created by user.
        await env.DB.prepare(`
            DELETE FROM recurrences 
            WHERE schedule_id IN (SELECT id FROM schedules WHERE created_by = ?)
        `).bind(userId).run();

        // 4. Delete schedules created by user
        await env.DB.prepare('DELETE FROM schedules WHERE created_by = ?').bind(userId).run();

        // 5. Delete the user
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

        return successResponse({ deleted: true }, '회원 탈퇴가 완료되었습니다.');
    } catch (error) {
        console.error('Delete account error:', error);
        return errorResponse('회원 탈퇴 중 오류가 발생했습니다.', 500);
    }
}
