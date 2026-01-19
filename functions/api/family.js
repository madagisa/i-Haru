// Family API endpoints
// GET /api/family - Get family info and members
// POST /api/family/join - Join family with invite code
import {
    getUserFromRequest,
    parseBody,
    successResponse,
    errorResponse,
    getNextChildColor
} from '../utils.js';

// GET - Get family info and members
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

        // Get family info
        const family = await env.DB.prepare(
            'SELECT * FROM families WHERE id = ?'
        ).bind(user.family_id).first();

        if (!family) {
            return errorResponse('가족을 찾을 수 없습니다.', 404);
        }

        // Get family members
        const membersResult = await env.DB.prepare(
            'SELECT id, name, role, color FROM users WHERE family_id = ?'
        ).bind(user.family_id).all();

        const members = membersResult.results || [];
        const children = members.filter(m => m.role === 'child');

        return successResponse({
            family: {
                id: family.id,
                name: family.name,
                inviteCode: family.invite_code
            },
            members,
            children
        });
    } catch (error) {
        console.error('Get family error:', error);
        return errorResponse('가족 정보 조회 중 오류가 발생했습니다.', 500);
    }
}

// POST - Join family with invite code
export async function onRequestPost(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    const body = await parseBody(request);
    const { inviteCode } = body;

    if (!inviteCode) {
        return errorResponse('초대 코드가 필요합니다.');
    }

    try {
        // Find family by invite code
        const family = await env.DB.prepare(
            'SELECT * FROM families WHERE invite_code = ?'
        ).bind(inviteCode.toUpperCase()).first();

        if (!family) {
            return errorResponse('유효하지 않은 초대 코드입니다.');
        }

        // Count existing children for color assignment
        const childCountResult = await env.DB.prepare(
            `SELECT COUNT(*) as count FROM users WHERE family_id = ? AND role = 'child'`
        ).bind(family.id).first();
        const childCount = childCountResult?.count || 0;

        // Update user's family
        await env.DB.prepare(
            'UPDATE users SET family_id = ?, color = ? WHERE id = ?'
        ).bind(family.id, getNextChildColor(childCount), tokenData.userId).run();

        // Get updated members
        const membersResult = await env.DB.prepare(
            'SELECT id, name, role, color FROM users WHERE family_id = ?'
        ).bind(family.id).all();

        return successResponse({
            family: {
                id: family.id,
                name: family.name,
                inviteCode: family.invite_code
            },
            members: membersResult.results || []
        }, '가족에 참여했습니다.');
    } catch (error) {
        console.error('Join family error:', error);
        return errorResponse('가족 참여 중 오류가 발생했습니다.', 500);
    }
}
