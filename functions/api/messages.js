// Messages API endpoints
// GET /api/messages - Get family messages
// POST /api/messages - Send a message
import {
    getUserFromRequest,
    parseBody,
    successResponse,
    errorResponse,
    generateId
} from '../utils.js';

// GET - Get messages for the user's family
export async function onRequestGet(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    try {
        // Get user's family
        const user = await env.DB.prepare(
            'SELECT family_id FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        if (!user || !user.family_id) {
            return errorResponse('가족이 없습니다.', 404);
        }

        // Get messages for the family
        const messagesResult = await env.DB.prepare(`
            SELECT m.*, u.name as from_user_name 
            FROM messages m
            LEFT JOIN users u ON m.from_user_id = u.id
            WHERE m.family_id = ?
            ORDER BY m.created_at DESC
            LIMIT 50
        `).bind(user.family_id).all();

        const messages = (messagesResult.results || []).map(m => ({
            id: m.id,
            familyId: m.family_id,
            fromUserId: m.from_user_id,
            fromUserName: m.from_user_name,
            toUserId: m.to_user_id,
            content: m.content,
            isRead: Boolean(m.is_read),
            createdAt: m.created_at
        }));

        return successResponse({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        return errorResponse('메시지 조회 중 오류가 발생했습니다.', 500);
    }
}

// POST - Send a new message
export async function onRequestPost(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    const body = await parseBody(request);
    const { content, toUserId } = body;

    if (!content || content.trim() === '') {
        return errorResponse('메시지 내용이 필요합니다.');
    }

    try {
        // Get user info
        const user = await env.DB.prepare(
            'SELECT id, name, family_id FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        if (!user || !user.family_id) {
            return errorResponse('가족이 없습니다.', 404);
        }

        const messageId = generateId();

        await env.DB.prepare(`
            INSERT INTO messages (id, family_id, from_user_id, to_user_id, content, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
        `).bind(
            messageId,
            user.family_id,
            user.id,
            toUserId || null,
            content.trim()
        ).run();

        const message = {
            id: messageId,
            familyId: user.family_id,
            fromUserId: user.id,
            fromUserName: user.name,
            toUserId: toUserId || null,
            content: content.trim(),
            isRead: false,
            createdAt: new Date().toISOString()
        };

        return successResponse({ message }, '메시지를 보냈습니다.');
    } catch (error) {
        console.error('Send message error:', error);
        return errorResponse('메시지 전송 중 오류가 발생했습니다.', 500);
    }
}

// DELETE - Delete a message
export async function onRequestDelete(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    const body = await parseBody(request);
    const { messageId } = body;

    if (!messageId) {
        return errorResponse('삭제할 메시지 ID가 필요합니다.');
    }

    try {
        // Verify message ownership
        const message = await env.DB.prepare(
            'SELECT from_user_id, family_id FROM messages WHERE id = ?'
        ).bind(messageId).first();

        if (!message) {
            return errorResponse('메시지를 찾을 수 없습니다.', 404);
        }

        // Check if user is the sender (allowing only sender to delete for now)
        if (message.from_user_id !== tokenData.userId) {
            return errorResponse('자신이 보낸 메시지만 삭제할 수 있습니다.', 403);
        }

        await env.DB.prepare(
            'DELETE FROM messages WHERE id = ?'
        ).bind(messageId).run();

        return successResponse({ deletedId: messageId }, '메시지가 삭제되었습니다.');
    } catch (error) {
        console.error('Delete message error:', error);
        return errorResponse('메시지 삭제 중 오류가 발생했습니다.', 500);
    }
}
