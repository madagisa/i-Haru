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
    Bell,
    HelpCircle
} from 'lucide-react'
import Modal from '../components/common/Modal'
import './SettingsPage.css'

const CHILD_COLORS = ['#4ECDC4', '#A18CD1', '#FFB347', '#87CEEB', '#FF6B6B']

function SettingsPage() {
    const navigate = useNavigate()
    const { user, logout, updateProfile } = useAuthStore()
    const { family, children, addChild, removeChild, loadFamily } = useFamilyStore()

    const [copied, setCopied] = useState(false)
    const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false)
    const [newChildName, setNewChildName] = useState('')
    const [selectedColor, setSelectedColor] = useState(CHILD_COLORS[0])

    const isParent = user?.role === 'parent'

    useEffect(() => {
        if (user?.familyId) {
            loadFamily(user.familyId)
        }
    }, [user?.familyId, loadFamily])

    const handleCopyInviteCode = async () => {
        if (family?.inviteCode) {
            await navigator.clipboard.writeText(family.inviteCode)
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

                        {/* Invite Code (Parents only) */}
                        {isParent && (
                            <div className="invite-section">
                                <p className="invite-label">초대 코드</p>
                                <div className="invite-code-container">
                                    <code className="invite-code">{family.inviteCode}</code>
                                    <button
                                        className="copy-btn"
                                        onClick={handleCopyInviteCode}
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                                <p className="invite-hint">자녀에게 이 코드를 공유해서 가족에 초대하세요</p>
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
                            <div key={child.id} className="member-item">
                                <div
                                    className="member-avatar"
                                    style={{ background: child.color }}
                                >
                                    {child.name.charAt(0)}
                                </div>
                                <div className="member-info">
                                    <span className="member-name">{child.name}</span>
                                    <span className="member-role">자녀</span>
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
                    <button className="settings-item">
                        <div className="settings-item-icon">
                            <Bell size={20} />
                        </div>
                        <span className="settings-item-label">알림 설정</span>
                        <ChevronRight size={20} className="settings-item-arrow" />
                    </button>

                    <button className="settings-item">
                        <div className="settings-item-icon">
                            <Moon size={20} />
                        </div>
                        <span className="settings-item-label">다크 모드</span>
                        <span className="settings-item-value">자동</span>
                        <ChevronRight size={20} className="settings-item-arrow" />
                    </button>

                    <button className="settings-item">
                        <div className="settings-item-icon">
                            <HelpCircle size={20} />
                        </div>
                        <span className="settings-item-label">도움말</span>
                        <ChevronRight size={20} className="settings-item-arrow" />
                    </button>
                </div>
            </section>

            {/* Logout */}
            <section className="settings-section">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    로그아웃
                </button>
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
        </div>
    )
}

export default SettingsPage
