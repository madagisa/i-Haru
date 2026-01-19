// Schedule by ID API
// PUT /api/schedules/[id] - Update schedule
// DELETE /api/schedules/[id] - Delete schedule
import {
    getUserFromRequest,
    parseBody,
    successResponse,
    errorResponse
} from '../../utils.js';

// PUT - Update schedule
export async function onRequestPut(context) {
    const { env, request, params } = context;
    const scheduleId = params.id;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    const body = await parseBody(request);
    const { title, description, category, childId, startDate, startTime, endTime, isAllDay, color, recurrence } = body;

    try {
        const user = await env.DB.prepare(
            'SELECT family_id FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        // Verify schedule belongs to user's family
        const schedule = await env.DB.prepare(
            'SELECT id FROM schedules WHERE id = ? AND family_id = ?'
        ).bind(scheduleId, user.family_id).first();

        if (!schedule) {
            return errorResponse('일정을 찾을 수 없습니다.', 404);
        }

        // Update schedule
        await env.DB.prepare(
            `UPDATE schedules SET 
        title = ?, description = ?, category = ?, child_id = ?,
        start_date = ?, start_time = ?, end_time = ?, is_all_day = ?, color = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
        ).bind(
            title,
            description || null,
            category || 'general',
            childId || null,
            startDate,
            startTime || null,
            endTime || null,
            isAllDay ? 1 : 0,
            color || null,
            scheduleId
        ).run();

        // Update recurrence - delete old and create new
        await env.DB.prepare('DELETE FROM recurrences WHERE schedule_id = ?').bind(scheduleId).run();

        if (recurrence && recurrence.frequency && recurrence.daysOfWeek?.length > 0) {
            await env.DB.prepare(
                `INSERT INTO recurrences (id, schedule_id, frequency, days_of_week, end_date)
         VALUES (?, ?, ?, ?, ?)`
            ).bind(
                `recurrence_${Date.now()}`,
                scheduleId,
                recurrence.frequency,
                JSON.stringify(recurrence.daysOfWeek),
                recurrence.endDate || null
            ).run();
        }

        return successResponse({}, '일정이 수정되었습니다.');
    } catch (error) {
        console.error('Update schedule error:', error);
        return errorResponse('일정 수정 중 오류가 발생했습니다.', 500);
    }
}

// DELETE - Delete schedule
export async function onRequestDelete(context) {
    const { env, request, params } = context;
    const scheduleId = params.id;

    const tokenData = await getUserFromRequest(request);
    if (!tokenData) {
        return errorResponse('인증이 필요합니다.', 401);
    }

    try {
        const user = await env.DB.prepare(
            'SELECT family_id FROM users WHERE id = ?'
        ).bind(tokenData.userId).first();

        // Verify schedule belongs to user's family
        const schedule = await env.DB.prepare(
            'SELECT id FROM schedules WHERE id = ? AND family_id = ?'
        ).bind(scheduleId, user.family_id).first();

        if (!schedule) {
            return errorResponse('일정을 찾을 수 없습니다.', 404);
        }

        // Delete recurrence first (foreign key)
        await env.DB.prepare('DELETE FROM recurrences WHERE schedule_id = ?').bind(scheduleId).run();

        // Delete schedule
        await env.DB.prepare('DELETE FROM schedules WHERE id = ?').bind(scheduleId).run();

        return successResponse({}, '일정이 삭제되었습니다.');
    } catch (error) {
        console.error('Delete schedule error:', error);
        return errorResponse('일정 삭제 중 오류가 발생했습니다.', 500);
    }
}
