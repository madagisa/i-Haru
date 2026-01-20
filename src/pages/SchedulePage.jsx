import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useFamilyStore } from '../store/familyStore'
import { useScheduleStore } from '../store/scheduleStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X, Repeat } from 'lucide-react'
import Modal from '../components/common/Modal'
import ChildSelector from '../components/common/ChildSelector'
import './SchedulePage.css'

const CATEGORIES = [
    { value: 'school', label: '학교', color: '#74B9FF' },
    { value: 'academy', label: '학원', color: '#A29BFE' },
    { value: 'personal', label: '개인', color: '#FD79A8' },
    { value: 'family', label: '가족', color: '#00B894' }
]

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']

function SchedulePage() {
    const { user } = useAuthStore()
    const { children, selectedChildId, loadFamily } = useFamilyStore()
    const { schedules, getSchedulesForDate, addSchedule, updateSchedule, deleteSchedule, loadSchedules } = useScheduleStore()

    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState(null)

    const isParent = user?.role === 'parent'
    const childFilter = isParent ? selectedChildId : user?.id

    useEffect(() => {
        if (user?.familyId) {
            loadFamily(user.familyId)
            loadSchedules()
        }
    }, [user?.familyId, loadFamily, loadSchedules])

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'personal',
        childId: null,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '',
        endTime: '',
        isAllDay: false,
        hasRecurrence: false,
        recurrence: {
            frequency: 'weekly',
            daysOfWeek: [],
            endDate: ''
        }
    })

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'personal',
            childId: children.length === 1 ? children[0].id : null,
            startDate: format(selectedDate, 'yyyy-MM-dd'),
            startTime: '',
            endTime: '',
            isAllDay: false,
            hasRecurrence: false,
            recurrence: {
                frequency: 'weekly',
                daysOfWeek: [],
                endDate: ''
            }
        })
        setEditingSchedule(null)
    }

    const openAddModal = () => {
        resetForm()
        setFormData(prev => ({
            ...prev,
            startDate: format(selectedDate, 'yyyy-MM-dd')
        }))
        setIsModalOpen(true)
    }

    const openEditModal = (schedule) => {
        setEditingSchedule(schedule)
        setFormData({
            title: schedule.title,
            description: schedule.description || '',
            category: schedule.category,
            childId: schedule.childId,
            startDate: schedule.startDate,
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || '',
            isAllDay: schedule.isAllDay,
            hasRecurrence: !!schedule.recurrence,
            recurrence: schedule.recurrence || {
                frequency: 'weekly',
                daysOfWeek: [],
                endDate: ''
            }
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const scheduleData = {
            familyId: user.familyId,
            childId: formData.childId,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            startDate: formData.startDate,
            startTime: formData.isAllDay ? null : formData.startTime,
            endTime: formData.isAllDay ? null : formData.endTime,
            isAllDay: formData.isAllDay,
            color: CATEGORIES.find(c => c.value === formData.category)?.color,
            createdBy: user.id,
            recurrence: formData.hasRecurrence ? formData.recurrence : null
        }

        if (editingSchedule) {
            await updateSchedule(editingSchedule.id, scheduleData)
        } else {
            await addSchedule(scheduleData)
        }

        setIsModalOpen(false)
        resetForm()
    }

    const handleDelete = async () => {
        if (editingSchedule && confirm('이 일정을 삭제하시겠습니까?')) {
            await deleteSchedule(editingSchedule.id)
            setIsModalOpen(false)
            resetForm()
        }
    }

    const toggleDayOfWeek = (day) => {
        setFormData(prev => {
            const days = prev.recurrence.daysOfWeek.includes(day)
                ? prev.recurrence.daysOfWeek.filter(d => d !== day)
                : [...prev.recurrence.daysOfWeek, day]
            return {
                ...prev,
                recurrence: { ...prev.recurrence, daysOfWeek: days }
            }
        })
    }

    // Calendar generation
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Add padding days for the start of the month
    const startPadding = getDay(monthStart)
    const paddedDays = [...Array(startPadding).fill(null), ...calendarDays]

    // Get schedules for selected date
    const selectedDateSchedules = getSchedulesForDate(selectedDate, {
        childId: childFilter,
        includeFamily: true
    })

    // Check if a date has schedules
    const hasSchedules = (date) => {
        const daySchedules = getSchedulesForDate(date, {
            childId: childFilter,
            includeFamily: true
        })
        return daySchedules.length > 0
    }

    const getChildColor = (childId) => {
        const child = children.find(c => c.id === childId)
        return child?.color || '#4ECDC4'
    }

    const getChildName = (childId) => {
        const child = children.find(c => c.id === childId)
        return child?.name || ''
    }

    return (
        <div className="schedule-page">
            {/* Calendar Header */}
            <div className="calendar-header">
                <button
                    className="btn btn-ghost"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="calendar-title">
                    {format(currentMonth, 'yyyy년 M월', { locale: ko })}
                </h2>
                <button
                    className="btn btn-ghost"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-container">
                <div className="calendar-weekdays">
                    {DAYS_OF_WEEK.map((day, idx) => (
                        <div
                            key={day}
                            className={`weekday ${idx === 0 ? 'sunday' : ''} ${idx === 6 ? 'saturday' : ''}`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="calendar-grid">
                    {paddedDays.map((day, idx) => (
                        <div
                            key={idx}
                            className={`calendar-day ${day ? '' : 'empty'
                                } ${day && isSameDay(day, selectedDate) ? 'selected' : ''
                                } ${day && isSameDay(day, new Date()) ? 'today' : ''
                                } ${day && !isSameMonth(day, currentMonth) ? 'other-month' : ''
                                }`}
                            onClick={() => day && setSelectedDate(day)}
                        >
                            {day && (
                                <>
                                    <span className="day-number">{format(day, 'd')}</span>
                                    {hasSchedules(day) && (
                                        <div className="day-dots">
                                            <span className="day-dot"></span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Date Section */}
            <div className="selected-date-section">
                <div className="selected-date-header">
                    <h3 className="selected-date-title">
                        {format(selectedDate, 'M월 d일 EEEE', { locale: ko })}
                    </h3>
                    <span className="schedule-count">{selectedDateSchedules.length}개 일정</span>
                </div>

                {selectedDateSchedules.length === 0 ? (
                    <div className="empty-schedule">
                        <p>이 날에는 일정이 없어요</p>
                        <button className="btn btn-outline" onClick={openAddModal}>
                            <Plus size={18} />
                            일정 추가
                        </button>
                    </div>
                ) : (
                    <div className="schedule-list">
                        {selectedDateSchedules.map(schedule => (
                            <div
                                key={schedule.id}
                                className="schedule-item"
                                style={{ '--item-color': schedule.childId ? getChildColor(schedule.childId) : '#00B894' }}
                                onClick={() => openEditModal(schedule)}
                            >
                                <div className="schedule-item-time">
                                    {schedule.isAllDay ? '종일' : schedule.startTime}
                                </div>
                                <div className="schedule-item-content">
                                    <div className="schedule-item-title">
                                        {schedule.title}
                                        {schedule.recurrence && <Repeat size={14} className="recurrence-icon" />}
                                    </div>
                                    {isParent && schedule.childId && (
                                        <span
                                            className="child-tag small"
                                            style={{ background: getChildColor(schedule.childId) }}
                                        >
                                            {getChildName(schedule.childId)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button className="fab" onClick={openAddModal}>
                <Plus size={24} />
            </button>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingSchedule ? '일정 수정' : '새 일정'}
                footer={
                    <div className="modal-actions">
                        {editingSchedule && (
                            <button className="btn btn-ghost" onClick={handleDelete}>
                                삭제
                            </button>
                        )}
                        <button
                            type="submit"
                            form="schedule-form"
                            className="btn btn-primary"
                        >
                            {editingSchedule ? '수정' : '저장'}
                        </button>
                    </div>
                }
            >
                <form id="schedule-form" className="schedule-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">제목 *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="일정 제목"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">날짜 *</label>
                        <input
                            type="date"
                            className="input"
                            value={formData.startDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={formData.isAllDay}
                                onChange={(e) => setFormData(prev => ({ ...prev, isAllDay: e.target.checked }))}
                            />
                            <span>종일</span>
                        </label>
                    </div>

                    {!formData.isAllDay && (
                        <div className="form-row time-row">
                            <div className="input-group">
                                <label className="input-label">시작 시간</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">종료 시간</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">카테고리</label>
                        <div className="category-selector">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    className={`category-btn ${formData.category === cat.value ? 'selected' : ''}`}
                                    style={{ '--cat-color': cat.color }}
                                    onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isParent && children.length > 0 && (
                        <ChildSelector
                            value={formData.childId}
                            onChange={(id) => setFormData(prev => ({ ...prev, childId: id }))}
                            includeAll={false}
                        />
                    )}

                    <div className="input-group">
                        <label className="input-label">설명</label>
                        <textarea
                            className="input textarea"
                            placeholder="일정에 대한 메모 (선택)"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    {/* Recurrence */}
                    <div className="recurrence-section">
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={formData.hasRecurrence}
                                onChange={(e) => setFormData(prev => ({ ...prev, hasRecurrence: e.target.checked }))}
                            />
                            <span><Repeat size={16} /> 반복 일정</span>
                        </label>

                        {formData.hasRecurrence && (
                            <div className="recurrence-options">
                                <div className="input-group">
                                    <label className="input-label">반복 요일</label>
                                    <div className="day-of-week-selector">
                                        {DAYS_OF_WEEK.map((day, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={`dow-btn ${formData.recurrence.daysOfWeek.includes(idx) ? 'selected' : ''}`}
                                                onClick={() => toggleDayOfWeek(idx)}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">종료일 (선택)</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.recurrence.endDate}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            recurrence: { ...prev.recurrence, endDate: e.target.value }
                                        }))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default SchedulePage
