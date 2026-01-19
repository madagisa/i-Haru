// Schedules API
// GET /api/schedules - Get schedules (with optional date filter)
// POST /api/schedules - Create schedule
import {
    generateId,
    getUserFromRequest,
    parseBody,
    successResponse,
    errorResponse
} from '../utils.js';

// GET - Get schedules
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
            return successResponse({ schedules: [] });
        }

        // Get URL params
        const url = new URL(request.url);
        const date = url.searchParams.get('date');
        const childId = url.searchParams.get('childId');

        let query = 'SELECT * FROM schedules WHERE family_id = ?';
        const params = [user.family_id];

        // Child users can only see their own schedules
        if (user.role === 'child') {
            query += ' AND (child_id = ? OR child_id IS NULL)';
            params.push(tokenData.userId);
        } else if (childId) {
            query += ' AND (child_id = ? OR child_id IS NULL)';
            params.push(childId);
        }

        if (date) {
            query += ' AND start_date = ?';
            params.push(date);
        }

        query += ' ORDER BY start_date, start_time';

        const stmt = env.DB.prepare(query);
        const result = await stmt.bind(...params).all();

        // Get recurrences for each schedule
        const schedules = await Promise.all((result.results || []).map(async (schedule) => {
            const recurrence = await env.DB.prepare(
                'SELECT * FROM recurrences WHERE schedule_id = ?'
            ).bind(schedule.id).first();

            return {
                id: schedule.id,
                familyId: schedule.family_id,
                childId: schedule.child_id,
                title: schedule.title,
                description: schedule.description,
                category: schedule.category,
                startDate: schedule.start_date,
                startTime: schedule.start_time,
                endTime: schedule.end_time,
                isAllDay: schedule.is_all_day,
                color: schedule.color,
                createdBy: schedule.created_by,
                recurrence: recurrence ? {
                    frequency: recurrence.frequency,
                    daysOfWeek: recurrence.days_of_week ? JSON.parse(recurrence.days_of_week) : [],
                    endDate: recurrence.end_date
                } : null
            };
        }));

        return successResponse({ schedules });
    } catch (error) {
        console.error('Get schedules error:', error);
        return errorResponse('일정 조회 중 오류가 발생했습니다.', 500);
    }
}

// POST - Create schedule
export async function onRequestPost(context) {
    const { env, request } = context;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    const body = await parseBody(request);
    const { title, description, category, childId, startDate, startTime, endTime, isAllDay, color, recurrence } = body;

    if (!title || !startDate) {
        return errorResponse('제목과 날짜가 필요합니다.');
    }

    try {
        const user = await env.DB.prepare(
            'SELECT family_id FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        if (!user || !user.family_id) {
            return errorResponse('가족이 없습니다.', 400);
        }

        const scheduleId = generateId('schedule');

        await env.DB.prepare(
            `INSERT INTO schedules (id, family_id, child_id, title, description, category, start_date, start_time, end_time, is_all_day, color, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            scheduleId,
            user.family_id,
            childId || null,
            title,
            description || null,
            category || 'general',
            startDate,
            startTime || null,
            endTime || null,
            isAllDay ? 1 : 0,
            color || null,
            tokenData.userId
        ).run();

        // Add recurrence if provided
        if (recurrence && recurrence.frequency && recurrence.daysOfWeek?.length > 0) {
            const recurrenceId = generateId('recurrence');
            await env.DB.prepare(
                `INSERT INTO recurrences (id, schedule_id, frequency, days_of_week, end_date)
         VALUES (?, ?, ?, ?, ?)`
            ).bind(
                recurrenceId,
                scheduleId,
                recurrence.frequency,
                JSON.stringify(recurrence.daysOfWeek),
                recurrence.endDate || null
            ).run();
        }

        return successResponse({
            schedule: {
                id: scheduleId,
                title,
                startDate,
                recurrence
            }
        }, '일정이 등록되었습니다.');
    } catch (error) {
        console.error('Create schedule error:', error);
        return errorResponse('일정 등록 중 오류가 발생했습니다.', 500);
    }
}
