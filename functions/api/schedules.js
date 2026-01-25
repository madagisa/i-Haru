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

        // Optimized query using LEFT JOIN to fetch schedules and recurrences in one go
        let query = `
            SELECT s.*, 
                   r.frequency as recurrence_frequency, 
                   r.days_of_week as recurrence_days, 
                   r.end_date as recurrence_end_date
            FROM schedules s
            LEFT JOIN recurrences r ON s.id = r.schedule_id
            WHERE s.family_id = ?
        `;
        const params = [user.family_id];

        // Child users can see schedules for their linked profile AND family-wide ones
        if (user.role === 'child') {
            // Find the child profile linked to this user
            const childProfile = await env.DB.prepare(
                'SELECT id FROM child_profiles WHERE linked_user_id = ?'
            ).bind(tokenData.userId).first();

            if (childProfile) {
                // Include both linked profile's schedules and family-wide schedules
                query += ' AND (s.child_id = ? OR s.child_id IS NULL)';
                params.push(childProfile.id);
            } else {
                // No profile linked - just show family-wide schedules
                query += ' AND s.child_id IS NULL';
            }
        } else if (childId) {
            query += ' AND (s.child_id = ? OR s.child_id IS NULL)';
            params.push(childId);
        }

        if (date) {
            query += ' AND s.start_date = ?';
            params.push(date);
        }

        query += ' ORDER BY s.start_date, s.start_time';

        const stmt = env.DB.prepare(query);
        const result = await stmt.bind(...params).all();

        const schedules = (result.results || []).map(row => {
            let recurrence = null;
            if (row.recurrence_frequency) {
                recurrence = {
                    frequency: row.recurrence_frequency,
                    daysOfWeek: row.recurrence_days ? JSON.parse(row.recurrence_days) : [],
                    endDate: row.recurrence_end_date
                };
            }

            return {
                id: row.id,
                familyId: row.family_id,
                childId: row.child_id,
                title: row.title,
                description: row.description,
                category: row.category,
                startDate: row.start_date,
                startTime: row.start_time,
                endTime: row.end_time,
                isAllDay: row.is_all_day,
                color: row.color,
                createdBy: row.created_by,
                recurrence
            };
        });

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
