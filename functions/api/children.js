// Children (Child Profiles) API
// GET /api/children - Get child profiles for family
// POST /api/children - Add a new child profile
import {
    generateId,
    generateChildInviteCode,
    getUserFromRequest,
    parseBody,
    successResponse,
    errorResponse,
    getNextChildColor
} from '../utils.js';

// GET - Get child profiles for family
export async function onRequestGet(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    try {
        const user = await env.DB.prepare(
            'SELECT family_id, role FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        if (!user || !user.family_id) {
            return successResponse({ children: [] });
        }

        // Get child profiles with linked user info
        const result = await env.DB.prepare(`
            SELECT 
                cp.id,
                cp.name,
                cp.color,
                cp.invite_code,
                cp.linked_user_id,
                u.name as linked_user_name,
                u.email as linked_user_email
            FROM child_profiles cp
            LEFT JOIN users u ON cp.linked_user_id = u.id
            WHERE cp.family_id = ?
            ORDER BY cp.created_at ASC
        `).bind(user.family_id).all();

        const children = (result.results || []).map(child => ({
            id: child.id,
            name: child.name,
            color: child.color,
            inviteCode: child.invite_code,
            linkedUserId: child.linked_user_id,
            linkedUserName: child.linked_user_name,
            isLinked: !!child.linked_user_id
        }));

        return successResponse({ children });
    } catch (error) {
        console.error('Get children error:', error);
        return errorResponse('자녀 목록 조회 중 오류가 발생했습니다.', 500);
    }
}

// POST - Add a new child profile
export async function onRequestPost(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    const body = await parseBody(request);
    const { name, color } = body;

    if (!name) {
        return errorResponse('자녀 이름이 필요합니다.');
    }

    try {
        const user = await env.DB.prepare(
            'SELECT family_id, role FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        if (!user || !user.family_id) {
            return errorResponse('가족이 없습니다.', 400);
        }

        if (user.role !== 'parent') {
            return errorResponse('부모만 자녀를 추가할 수 있습니다.', 403);
        }

        // Count existing children for color
        const countResult = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM child_profiles WHERE family_id = ?'
        ).bind(user.family_id).first();
        const childCount = countResult?.count || 0;

        const childId = generateId('child');
        const inviteCode = generateChildInviteCode();
        const childColor = color || getNextChildColor(childCount);

        await env.DB.prepare(`
            INSERT INTO child_profiles (id, family_id, name, color, invite_code, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(childId, user.family_id, name, childColor, inviteCode, tokenData.userId).run();

        return successResponse({
            child: {
                id: childId,
                name,
                color: childColor,
                inviteCode,
                isLinked: false
            }
        }, '자녀가 추가되었습니다.');
    } catch (error) {
        console.error('Add child error:', error);
        return errorResponse('자녀 추가 중 오류가 발생했습니다.', 500);
    }
}
