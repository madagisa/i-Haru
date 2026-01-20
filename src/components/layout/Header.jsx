import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useFamilyStore } from '../../store/familyStore'
import { useMessageStore } from '../../store/messageStore'
import { Bell, ChevronDown, X } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import './Header.css'

function Header() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { children, selectedChildId, setSelectedChild } = useFamilyStore()
    const { messages, getUnreadCount, markAllAsRead } = useMessageStore()

    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    const isParent = user?.role === 'parent'
    const unreadCount = getUnreadCount(user?.id)

    const handleChildFilter = (e) => {
        const value = e.target.value
        setSelectedChild(value === 'all' ? null : value)
    }

    const toggleNotification = () => {
        setIsNotificationOpen(!isNotificationOpen)
        if (!isNotificationOpen && unreadCount > 0) {
            markAllAsRead(user?.id)
        }
    }

    const recentMessages = messages.slice(0, 5)

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <h1 className="header-logo">
                        <span className="header-logo-icon">📅</span>
                        <span className="header-logo-text">i-Haru</span>
                    </h1>
                </div>

                <div className="header-center">
                    {isParent && children.length > 0 && (
                        <div className="child-filter">
                            <select
                                className="child-filter-select"
                                value={selectedChildId || 'all'}
                                onChange={handleChildFilter}
                            >
                                <option value="all">전체 자녀</option>
                                {children.map(child => (
                                    <option key={child.id} value={child.id}>
                                        {child.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="child-filter-icon" size={16} />
                        </div>
                    )}
                </div>

                <div className="header-right">
                    <button
                        className="header-notification"
                        onClick={toggleNotification}
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <span>알림</span>
                                <button
                                    className="notification-close"
                                    onClick={() => setIsNotificationOpen(false)}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="notification-list">
                                {recentMessages.length === 0 ? (
                                    <div className="notification-empty">
                                        새로운 알림이 없습니다
                                    </div>
                                ) : (
                                    recentMessages.map(msg => (
                                        <div key={msg.id} className="notification-item">
                                            <div className="notification-item-avatar">
                                                {msg.fromUserName?.charAt(0) || '?'}
                                            </div>
                                            <div className="notification-item-content">
                                                <span className="notification-item-sender">
                                                    {msg.fromUserName}
                                                </span>
                                                <p className="notification-item-text">
                                                    {msg.content}
                                                </p>
                                                <span className="notification-item-time">
                                                    {format(new Date(msg.createdAt), 'M/d a h:mm', { locale: ko })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
