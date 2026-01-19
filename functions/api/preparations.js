// Preparations API
// GET /api/preparations - Get preparations
// POST /api/preparations - Create preparation
import {
    generateId,
    getUserFromRequest,
    parseBody,
    successResponse,
    errorResponse
} from '../utils.js';

// GET - Get preparations
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
            return successResponse({ preparations: [] });
        }

        const url = new URL(request.url);
        const childId = url.searchParams.get('childId');
        const showCompleted = url.searchParams.get('showCompleted') !== 'false';

        let query = 'SELECT * FROM preparations WHERE family_id = ?';
        const params = [user.family_id];

        // Child users can only see their own preparations
        if (user.role === 'child') {
            query += ' AND child_id = ?';
            params.push(tokenData.userId);
        } else if (childId) {
            query += ' AND child_id = ?';
            params.push(childId);
        }

        if (!showCompleted) {
            query += ' AND is_completed = 0';
        }

        query += ' ORDER BY due_date ASC';

        const stmt = env.DB.prepare(query);
        const result = await stmt.bind(...params).all();

        const preparations = (result.results || []).map(prep => ({
            id: prep.id,
            familyId: prep.family_id,
            childId: prep.child_id,
            title: prep.title,
            description: prep.description,
            category: prep.category,
            dueDate: prep.due_date,
            isCompleted: !!prep.is_completed,
            createdBy: prep.created_by
        }));

        return successResponse({ preparations });
    } catch (error) {
        console.error('Get preparations error:', error);
        return errorResponse('준비물 조회 중 오류가 발생했습니다.', 500);
    }
}

// POST - Create preparation
export async function onRequestPost(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    const body = await parseBody(request);
    const { title, description, category, childId, dueDate } = body;

    if (!title || !dueDate) {
        return errorResponse('제목과 마감일이 필요합니다.');
    }

    try {
        const user = await env.DB.prepare(
            'SELECT family_id FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        if (!user || !user.family_id) {
            return errorResponse('가족이 없습니다.', 400);
        }

        const prepId = generateId('prep');

        await env.DB.prepare(
            `INSERT INTO preparations (id, family_id, child_id, title, description, category, due_date, is_completed, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`
        ).bind(
            prepId,
            user.family_id,
            childId || null,
            title,
            description || null,
            category || 'general',
            dueDate,
            tokenData.userId
        ).run();

        return successResponse({
            preparation: { id: prepId, title, dueDate }
        }, '준비물이 등록되었습니다.');
    } catch (error) {
        console.error('Create preparation error:', error);
        return errorResponse('준비물 등록 중 오류가 발생했습니다.', 500);
    }
}
