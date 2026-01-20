import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useFamilyStore } from '../store/familyStore'
import { useScheduleStore } from '../store/scheduleStore'
import { usePrepStore } from '../store/prepStore'
import { useMessageStore } from '../store/messageStore'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
    Clock,
    Package,
    MessageCircle,
    ChevronRight,
    CalendarDays,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import './TodayPage.css'

function TodayPage() {
    const { user } = useAuthStore()
    const { children, selectedChildId, loadFamily } = useFamilyStore()
    const { getTodaySchedules, loadSchedules } = useScheduleStore()
    const { getPendingPreparations, getDday, isUrgent, toggleCompletion, loadPreparations } = usePrepStore()
    const { getRecentMessages } = useMessageStore()

    useEffect(() => {
        if (user?.familyId) {
            loadFamily(user.familyId)
            loadSchedules()
            loadPreparations()
        }
    }, [user?.familyId, loadFamily, loadSchedules, loadPreparations])

    const isParent = user?.role === 'parent'
    const childFilter = isParent ? selectedChildId : user?.id

    // Get today's schedules
    const todaySchedules = getTodaySchedules({
        childId: childFilter,
        includeFamily: true
    })

    // Get pending preparations (urgent ones first)
    const pendingPreps = getPendingPreparations({
        childId: childFilter,
        limit: 5
    })

    // Get recent messages
    const recentMessages = getRecentMessages(user?.id, 3)

    const today = new Date()
    const greeting = getGreeting()

    function getGreeting() {
        const hour = today.getHours()
        if (hour < 12) return '좋은 아침이에요'
        if (hour < 18) return '좋은 오후예요'
        return '좋은 저녁이에요'
    }

    // Get child color for schedule
    const getChildColor = (childId) => {
        const child = children.find(c => c.id === childId)
        return child?.color || '#4ECDC4'
    }

    const getChildName = (childId) => {
        const child = children.find(c => c.id === childId)
        return child?.name || ''
    }

    const getCategoryLabel = (category) => {
        const labels = {
            school: '학교',
            academy: '학원',
            personal: '개인',
            family: '가족',
            exam: '시험',
            general: '일반'
        }
        return labels[category] || category
    }

    return (
        <div className="today-page">
            {/* Hero Section */}
            <section className="today-hero">
                <div className="hero-content">
                    <p className="hero-greeting">{greeting}, {user?.name}님! 👋</p>
                    <h2 className="hero-date">
                        {format(today, 'M월 d일 EEEE', { locale: ko })}
                    </h2>
                </div>
                <div className="hero-summary">
                    <div className="summary-item">
                        <CalendarDays size={18} />
                        <span>일정 {todaySchedules.length}개</span>
                    </div>
                    <div className="summary-item">
                        <Package size={18} />
                        <span>준비물 {pendingPreps.length}개</span>
                    </div>
                </div>
            </section>

            {/* Today's Schedules */}
            <section className="today-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <Clock size={20} />
                        오늘의 일정
                    </h3>
                    <a href="/schedule" className="section-link">
                        전체보기 <ChevronRight size={16} />
                    </a>
                </div>

                {todaySchedules.length === 0 ? (
                    <div className="empty-card">
                        <p>오늘 예정된 일정이 없어요 🎉</p>
                    </div>
                ) : (
                    <div className="schedule-list">
                        {todaySchedules.map(schedule => (
                            <div
                                key={schedule.id}
                                className="schedule-card"
                                style={{ '--schedule-color': schedule.childId ? getChildColor(schedule.childId) : '#00B894' }}
                            >
                                <div className="schedule-time">
                                    {schedule.isAllDay ? (
                                        <span className="all-day-badge">종일</span>
                                    ) : (
                                        <>
                                            <span className="time-start">{schedule.startTime}</span>
                                            {schedule.endTime && <span className="time-end">~ {schedule.endTime}</span>}
                                        </>
                                    )}
                                </div>
                                <div className="schedule-info">
                                    <h4 className="schedule-title">{schedule.title}</h4>
                                    {schedule.description && (
                                        <p className="schedule-desc">{schedule.description}</p>
                                    )}
                                    <div className="schedule-meta">
                                        <span className={`badge badge-${schedule.category}`}>
                                            {getCategoryLabel(schedule.category)}
                                        </span>
                                        {isParent && schedule.childId && (
                                            <span
                                                className="child-tag"
                                                style={{ background: getChildColor(schedule.childId) }}
                                            >
                                                {getChildName(schedule.childId)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Preparations */}
            <section className="today-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <Package size={20} />
                        준비물
                    </h3>
                    <a href="/prep" className="section-link">
                        전체보기 <ChevronRight size={16} />
                    </a>
                </div>

                {pendingPreps.length === 0 ? (
                    <div className="empty-card">
                        <p>준비할 물건이 없어요 ✨</p>
                    </div>
                ) : (
                    <div className="prep-list">
                        {pendingPreps.map(prep => (
                            <div
                                key={prep.id}
                                className={`prep-card ${isUrgent(prep.dueDate) ? 'urgent' : ''}`}
                            >
                                <button
                                    className="prep-check"
                                    onClick={() => toggleCompletion(prep.id)}
                                >
                                    {prep.isCompleted ? (
                                        <CheckCircle2 size={24} className="check-done" />
                                    ) : (
                                        <div className="check-empty" />
                                    )}
                                </button>
                                <div className="prep-info">
                                    <h4 className="prep-title">{prep.title}</h4>
                                    {prep.description && (
                                        <p className="prep-desc">{prep.description}</p>
                                    )}
                                    {isParent && prep.childId && (
                                        <span
                                            className="child-tag small"
                                            style={{ background: getChildColor(prep.childId) }}
                                        >
                                            {getChildName(prep.childId)}
                                        </span>
                                    )}
                                </div>
                                <div className={`prep-dday ${isUrgent(prep.dueDate) ? 'urgent' : ''}`}>
                                    {isUrgent(prep.dueDate) && <AlertCircle size={14} />}
                                    {getDday(prep.dueDate)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Messages */}
            <section className="today-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <MessageCircle size={20} />
                        가족 메시지
                    </h3>
                </div>

                {recentMessages.length === 0 ? (
                    <div className="empty-card">
                        <p>새로운 메시지가 없어요 💬</p>
                    </div>
                ) : (
                    <div className="message-list">
                        {recentMessages.map(msg => (
                            <div key={msg.id} className="message-card">
                                <div className="message-avatar">
                                    {msg.fromUserName.charAt(0)}
                                </div>
                                <div className="message-content">
                                    <div className="message-header">
                                        <span className="message-sender">{msg.fromUserName}</span>
                                        <span className="message-time">
                                            {format(new Date(msg.createdAt), 'a h:mm', { locale: ko })}
                                        </span>
                                    </div>
                                    <p className="message-text">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default TodayPage
