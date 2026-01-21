import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useFamilyStore } from '../store/familyStore'
import {
    User,
    Users,
    Copy,
    Check,
    Plus,
    Trash2,
    LogOut,
    ChevronRight,
    Moon,
    Sun,
    Bell,
    HelpCircle,
    MessageCircle,
    Send,
    X
} from 'lucide-react'
import Modal from '../components/common/Modal'
import './SettingsPage.css'

const CHILD_COLORS = ['#4ECDC4', '#A18CD1', '#FFB347', '#87CEEB', '#FF6B6B']

function SettingsPage() {
    const navigate = useNavigate()
    const { user, logout, updateProfile } = useAuthStore()
    const { family, children, members, addChild, removeChild, loadFamily } = useFamilyStore()

    const [copied, setCopied] = useState(false)
    const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false)
    const [newChildName, setNewChildName] = useState('')
    const [selectedColor, setSelectedColor] = useState(CHILD_COLORS[0])

    // Modal states
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
    const [isDarkModeModalOpen, setIsDarkModeModalOpen] = useState(false)
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

    // Settings states
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('iharu-notifications')
        return saved ? JSON.parse(saved) : { schedule: true, prep: true, message: true }
    })
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('iharu-theme') || 'auto'
    })

    const isParent = user?.role === 'parent'

    useEffect(() => {
        if (user?.familyId) {
            loadFamily(user.familyId)
        }
    }, [user?.familyId, loadFamily])

    // Apply dark mode
    useEffect(() => {
        const root = document.documentElement
        if (darkMode === 'dark') {
            root.setAttribute('data-theme', 'dark')
        } else if (darkMode === 'light') {
            root.setAttribute('data-theme', 'light')
        } else {
            // Auto - use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
        }
        localStorage.setItem('iharu-theme', darkMode)
    }, [darkMode])

    // Save notification settings
    useEffect(() => {
        localStorage.setItem('iharu-notifications', JSON.stringify(notifications))
    }, [notifications])

    const handleCopyInviteCode = async () => {
        const code = family?.parentInviteCode || family?.inviteCode
        if (code) {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleAddChild = async (e) => {
        e.preventDefault()
        if (!newChildName.trim()) return

        await addChild({
            name: newChildName,
            color: selectedColor
        })

        setNewChildName('')
        setSelectedColor(CHILD_COLORS[children.length % CHILD_COLORS.length])
        setIsAddChildModalOpen(false)
    }

    const handleRemoveChild = async (childId, childName) => {
        if (confirm(`${childName}님을 가족에서 삭제하시겠습니까?`)) {
            await removeChild(childId)
        }
    }

    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            logout()
            navigate('/login')
        }
    }

    const handleDeleteAccount = async () => {
        const confirmMessage = "정말로 탈퇴하시겠습니까?\n모든 데이터(가족, 일정, 준비물, 메시지)가 영구적으로 삭제됩니다.";
        if (confirm(confirmMessage)) {
            // Assuming deleteAccount is available from useAuthStore, but line 31 destructuring doesn't include it.
            // Checking previous edits, deleteAccount IS in authStore. need to add it to destructuring.
            const { deleteAccount } = useAuthStore.getState();
            // Or better, update line 31. But since I'm rewriting the whole file, I will update line 31.

            const result = await deleteAccount();
            if (result.success) {
                alert('탈퇴가 완료되었습니다.');
                navigate('/login');
            } else {
                alert('탈퇴 실패: ' + result.error);
            }
        }
    }

    const getDarkModeLabel = () => {
        switch (darkMode) {
            case 'dark': return '다크'
            case 'light': return '라이트'
            default: return '자동'
        }
    }

    return (
        <div className="settings-page">
            {/* Profile Section */}
            <section className="settings-section">
                <h3 className="section-title">내 정보</h3>
                <div className="profile-card">
                    <div
                        className="profile-avatar"
                        style={{ background: `linear-gradient(135deg, ${user?.color || '#FF6B6B'}, ${user?.color || '#FF6B6B'}dd)` }}
                    >
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="profile-info">
                        <h4 className="profile-name">{user?.name}</h4>
                        <p className="profile-email">{user?.email}</p>
                        <span className={`role-badge ${user?.role}`}>
                            {user?.role === 'parent' ? '부모' : '자녀'}
                        </span>
                    </div>
                </div>
            </section>

            {/* Family Section */}
            <section className="settings-section">
                <h3 className="section-title">가족</h3>

                {family && (
                    <div className="family-card">
                        <div className="family-header">
                            <div className="family-icon">
                                <Users size={24} />
                            </div>
                            <div className="family-info">
                                <h4 className="family-name">{family.name || '우리 가족'}</h4>
                                <p className="family-members">{children.length + 1}명의 구성원</p>
                            </div>
                        </div>

                        {/* Parent Invite Code (Parents only) */}
                        {isParent && (
                            <div className="invite-section">
                                <p className="invite-label">부모 초대 코드</p>
                                <div className="invite-code-container">
                                    <code className="invite-code">{family.parentInviteCode || family.inviteCode}</code>
                                    <button
                                        className="copy-btn"
                                        onClick={handleCopyInviteCode}
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                                <p className="invite-hint">배우자(다른 부모)에게 이 코드를 공유하세요</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Family Members */}
                <div className="members-section">
                    <div className="members-header">
                        <h4>가족 구성원</h4>
                        {isParent && (
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() => setIsAddChildModalOpen(true)}
                            >
                                <Plus size={16} />
                                자녀 추가
                            </button>
                        )}
                    </div>

                    <div className="members-list">
                        {/* Current user */}
                        <div className="member-item">
                            <div
                                className="member-avatar"
                                style={{ background: user?.color || '#FF6B6B' }}
                            >
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="member-info">
                                <span className="member-name">{user?.name}</span>
                                <span className="member-role">
                                    {user?.role === 'parent' ? '부모' : '자녀'} (나)
                                </span>
                            </div>
                        </div>

                        {/* Children */}
                        {children.map(child => (
                            <div key={child.id} className="member-item member-item-child">
                                <div
                                    className="member-avatar"
                                    style={{ background: child.color }}
                                >
                                    {child.name.charAt(0)}
                                </div>
                                <div className="member-info">
                                    <span className="member-name">{child.name}</span>
                                    <span className="member-role">
                                        {child.isLinked ? '자녀 (연결됨)' : '자녀 (미연결)'}
                                    </span>
                                    {isParent && child.inviteCode && !child.isLinked && (
                                        <div className="child-invite-row">
                                            <span className="child-invite-code">초대코드: {child.inviteCode}</span>
                                            <button
                                                className="copy-btn-small"
                                                onClick={async () => {
                                                    await navigator.clipboard.writeText(child.inviteCode)
                                                    alert(`${child.name} 초대코드가 복사되었습니다!`)
                                                }}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {isParent && (
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemoveChild(child.id, child.name)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App Settings Section */}
            <section className="settings-section">
                <h3 className="section-title">앱 설정</h3>
                <div className="settings-list">
                    <button className="settings-item" onClick={() => setIsNotificationModalOpen(true)}>
                        <div className="settings-item-icon">
                            <Bell size={20} />
                        </div>
                        <span className="settings-item-label">알림 설정</span>
                        <ChevronRight size={20} className="settings-item-arrow" />
                    </button>

                    <button className="settings-item" onClick={() => setIsDarkModeModalOpen(true)}>
                        <div className="settings-item-icon">
                            <Moon size={20} />
                        </div>
                        <span className="settings-item-label">다크 모드</span>
                        <span className="settings-item-value">{getDarkModeLabel()}</span>
                        <ChevronRight size={20} className="settings-item-arrow" />
                    </button>

                    <button className="settings-item" onClick={() => setIsHelpModalOpen(true)}>
                        <div className="settings-item-icon">
                            <HelpCircle size={20} />
                        </div>
                        <span className="settings-item-label">도움말</span>
                        <ChevronRight size={20} className="settings-item-arrow" />
                    </button>
                </div>
            </section>

            {/* Account Actions */}
            <section className="settings-section">
                <div className="account-actions">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        로그아웃
                    </button>

                    <button className="delete-account-btn" onClick={handleDeleteAccount}>
                        회원 탈퇴
                    </button>
                </div>
            </section>

            <footer className="settings-footer">
                <p>i-Haru v1.0.0</p>
                <p>© 2026 i-Haru. All rights reserved.</p>
            </footer>

            {/* Add Child Modal */}
            <Modal
                isOpen={isAddChildModalOpen}
                onClose={() => setIsAddChildModalOpen(false)}
                title="자녀 추가"
                footer={
                    <div className="modal-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setIsAddChildModalOpen(false)}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            form="add-child-form"
                            className="btn btn-primary"
                        >
                            추가
                        </button>
                    </div>
                }
            >
                <form id="add-child-form" className="add-child-form" onSubmit={handleAddChild}>
                    <div className="input-group">
                        <label className="input-label">자녀 이름</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="이름을 입력하세요"
                            value={newChildName}
                            onChange={(e) => setNewChildName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">색상</label>
                        <div className="color-selector">
                            {CHILD_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                                    style={{ background: color }}
                                    onClick={() => setSelectedColor(color)}
                                >
                                    {selectedColor === color && <Check size={16} color="white" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Notification Settings Modal */}
            <Modal
                isOpen={isNotificationModalOpen}
                onClose={() => setIsNotificationModalOpen(false)}
                title="알림 설정"
            >
                <div className="notification-settings">
                    <div className="notification-item">
                        <div className="notification-info">
                            <Bell size={20} />
                            <span>일정 알림</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={notifications.schedule}
                                onChange={(e) => setNotifications(prev => ({ ...prev, schedule: e.target.checked }))}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                    <div className="notification-item">
                        <div className="notification-info">
                            <Bell size={20} />
                            <span>준비물 알림</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={notifications.prep}
                                onChange={(e) => setNotifications(prev => ({ ...prev, prep: e.target.checked }))}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                    <div className="notification-item">
                        <div className="notification-info">
                            <MessageCircle size={20} />
                            <span>메시지 알림</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={notifications.message}
                                onChange={(e) => setNotifications(prev => ({ ...prev, message: e.target.checked }))}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                    <p className="notification-hint">
                        알림은 브라우저 알림 권한이 필요합니다.
                    </p>
                </div>
            </Modal>

            {/* Dark Mode Modal */}
            <Modal
                isOpen={isDarkModeModalOpen}
                onClose={() => setIsDarkModeModalOpen(false)}
                title="다크 모드"
            >
                <div className="theme-options">
                    <button
                        className={`theme-option ${darkMode === 'light' ? 'selected' : ''}`}
                        onClick={() => { setDarkMode('light'); setIsDarkModeModalOpen(false); }}
                    >
                        <Sun size={24} />
                        <span>라이트</span>
                    </button>
                    <button
                        className={`theme-option ${darkMode === 'dark' ? 'selected' : ''}`}
                        onClick={() => { setDarkMode('dark'); setIsDarkModeModalOpen(false); }}
                    >
                        <Moon size={24} />
                        <span>다크</span>
                    </button>
                    <button
                        className={`theme-option ${darkMode === 'auto' ? 'selected' : ''}`}
                        onClick={() => { setDarkMode('auto'); setIsDarkModeModalOpen(false); }}
                    >
                        <div className="auto-icon">
                            <Sun size={16} />
                            <Moon size={16} />
                        </div>
                        <span>자동</span>
                    </button>
                </div>
            </Modal>

            {/* Help Modal */}
            <Modal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                title="도움말"
            >
                <div className="help-content">
                    <div className="help-section">
                        <h4>📅 일정 관리</h4>
                        <p>캘린더에서 날짜를 선택하고 + 버튼을 눌러 일정을 추가할 수 있습니다. 반복 일정도 설정할 수 있어요.</p>
                    </div>
                    <div className="help-section">
                        <h4>📦 준비물 관리</h4>
                        <p>준비물 탭에서 필요한 물건을 등록하고, 완료 시 체크할 수 있습니다. D-Day가 다가오면 알림을 받아요.</p>
                    </div>
                    <div className="help-section">
                        <h4>👨‍👩‍👧 가족 초대</h4>
                        <p>설정에서 초대 코드를 복사하여 가족에게 공유하세요. 자녀가 회원가입 후 코드를 입력하면 가족에 참여합니다.</p>
                    </div>
                    <div className="help-section">
                        <h4>💬 가족 메시지</h4>
                        <p>설정에서 가족에게 간단한 메시지를 보낼 수 있습니다. 오늘 페이지에서 최근 메시지를 확인하세요.</p>
                    </div>
                    <div className="help-section">
                        <h4>🌙 다크 모드</h4>
                        <p>설정에서 라이트/다크/자동 모드를 선택할 수 있습니다. 자동 모드는 시스템 설정을 따릅니다.</p>
                    </div>
                    <div className="help-contact">
                        <p>문의: support@i-haru.com</p>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default SettingsPage
