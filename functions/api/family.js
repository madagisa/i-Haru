// Family API endpoints
// GET /api/family - Get family info and members
// POST /api/family - Join family with invite code (parent or child)
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

        // Get family members (parents)
        const membersResult = await env.DB.prepare(
            'SELECT id, name, role, color FROM users WHERE family_id = ?'
        ).bind(user.family_id).all();

        // Get child profiles
        const childrenResult = await env.DB.prepare(`
            SELECT 
                cp.id,
                cp.name,
                cp.color,
                cp.invite_code,
                cp.linked_user_id
            FROM child_profiles cp
            WHERE cp.family_id = ?
            ORDER BY cp.created_at ASC
        `).bind(user.family_id).all();

        const members = membersResult.results || [];
        const children = (childrenResult.results || []).map(child => ({
            id: child.id,
            name: child.name,
            color: child.color,
            inviteCode: child.invite_code,
            linkedUserId: child.linked_user_id,
            isLinked: !!child.linked_user_id
        }));

        return successResponse({
            family: {
                id: family.id,
                name: family.name,
                parentInviteCode: family.invite_code  // Renamed for clarity
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

    const code = inviteCode.toUpperCase();

    try {
        // Get current user info
        const user = await env.DB.prepare(
            'SELECT id, role, family_id FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        if (!user) {
            return errorResponse('사용자를 찾을 수 없습니다.', 404);
        }

        // Check if already in a family
        if (user.family_id) {
            return errorResponse('이미 가족에 참여되어 있습니다.');
        }

        // Check code type
        if (code.startsWith('PRNT') || code.startsWith('HARU')) {
            // Parent invite code - join as parent/member
            const family = await env.DB.prepare(
                'SELECT * FROM families WHERE invite_code = ?'
            ).bind(code).first();

            if (!family) {
                return errorResponse('유효하지 않은 초대 코드입니다.');
            }

            // Update user's family
            await env.DB.prepare(
                'UPDATE users SET family_id = ? WHERE id = ?'
            ).bind(family.id, tokenData.userId).run();

            // Get updated members
            const membersResult = await env.DB.prepare(
                'SELECT id, name, role, color FROM users WHERE family_id = ?'
            ).bind(family.id).all();

            return successResponse({
                family: {
                    id: family.id,
                    name: family.name,
                    parentInviteCode: family.invite_code
                },
                members: membersResult.results || []
            }, '가족에 참여했습니다.');

        } else if (code.startsWith('CHLD')) {
            // Child invite code - link to child profile
            if (user.role !== 'child') {
                return errorResponse('자녀 초대 코드는 자녀 계정만 사용할 수 있습니다.');
            }

            const childProfile = await env.DB.prepare(
                'SELECT * FROM child_profiles WHERE invite_code = ?'
            ).bind(code).first();

            if (!childProfile) {
                return errorResponse('유효하지 않은 초대 코드입니다.');
            }

            if (childProfile.linked_user_id) {
                return errorResponse('이미 다른 사용자가 연결된 초대 코드입니다.');
            }

            // Link child profile to user and update user's family
            await env.DB.prepare(
                'UPDATE child_profiles SET linked_user_id = ? WHERE id = ?'
            ).bind(tokenData.userId, childProfile.id).run();

            await env.DB.prepare(
                'UPDATE users SET family_id = ?, color = ? WHERE id = ?'
            ).bind(childProfile.family_id, childProfile.color, tokenData.userId).run();

            // Get family info
            const family = await env.DB.prepare(
                'SELECT * FROM families WHERE id = ?'
            ).bind(childProfile.family_id).first();

            return successResponse({
                family: {
                    id: family.id,
                    name: family.name
                },
                childProfile: {
                    id: childProfile.id,
                    name: childProfile.name,
                    color: childProfile.color
                }
            }, '가족에 참여했습니다.');
        } else {
            return errorResponse('유효하지 않은 초대 코드 형식입니다.');
        }
    } catch (error) {
        console.error('Join family error:', error);
        return errorResponse('가족 참여 중 오류가 발생했습니다.', 500);
    }
}
