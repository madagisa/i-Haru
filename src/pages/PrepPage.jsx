import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useFamilyStore } from '../store/familyStore'
import { usePrepStore } from '../store/prepStore'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
    Plus,
    CheckCircle2,
    Circle,
    AlertCircle,
    Trash2,
    Edit3,
    Package
} from 'lucide-react'
import Modal from '../components/common/Modal'
import ChildSelector from '../components/common/ChildSelector'
import './PrepPage.css'

const CATEGORIES = [
    { value: 'school', label: '학교' },
    { value: 'academy', label: '학원' },
    { value: 'exam', label: '시험/수행평가' },
    { value: 'general', label: '기타' }
]

function PrepPage() {
    const { user } = useAuthStore()
    const { children, selectedChildId, loadFamily } = useFamilyStore()
    const {
        getPreparations,
        addPreparation,
        updatePreparation,
        deletePreparation,
        toggleCompletion,
        getDday,
        isUrgent,
        isOverdue,
        loadPreparations
    } = usePrepStore()

    const [filter, setFilter] = useState('pending') // 'pending' | 'completed' | 'all'
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPrep, setEditingPrep] = useState(null)

    const isParent = user?.role === 'parent'
    // For parents, filter by selected child. For children, no client-side filtering needed (API handles it)
    const childFilter = isParent ? selectedChildId : null

    useEffect(() => {
        if (user?.familyId) {
            loadFamily(user.familyId)
            loadPreparations()
        }
    }, [user?.familyId, loadFamily, loadPreparations])

    const preparations = getPreparations({
        childId: childFilter,
        showCompleted: filter !== 'pending'
    }).filter(prep => {
        if (filter === 'completed') return prep.isCompleted
        if (filter === 'pending') return !prep.isCompleted
        return true
    })

    const pendingCount = getPreparations({ childId: childFilter }).filter(p => !p.isCompleted).length
    const completedCount = getPreparations({ childId: childFilter }).filter(p => p.isCompleted).length

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'school',
        childId: null,
        dueDate: format(new Date(), 'yyyy-MM-dd')
    })

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'school',
            childId: children.length === 1 ? children[0].id : null,
            dueDate: format(new Date(), 'yyyy-MM-dd')
        })
        setEditingPrep(null)
    }

    const openAddModal = () => {
        resetForm()
        setIsModalOpen(true)
    }

    const openEditModal = (prep) => {
        setEditingPrep(prep)
        setFormData({
            title: prep.title,
            description: prep.description || '',
            category: prep.category,
            childId: prep.childId,
            dueDate: prep.dueDate
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const prepData = {
            familyId: user.familyId,
            childId: formData.childId,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            dueDate: formData.dueDate,
            createdBy: user.id
        }

        if (editingPrep) {
            await updatePreparation(editingPrep.id, prepData)
        } else {
            await addPreparation(prepData)
        }

        setIsModalOpen(false)
        resetForm()
    }

    const handleDelete = async () => {
        if (editingPrep && confirm('이 준비물을 삭제하시겠습니까?')) {
            await deletePreparation(editingPrep.id)
            setIsModalOpen(false)
            resetForm()
        }
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
        <div className="prep-page">
            {/* Header */}
            <div className="prep-header">
                <h2 className="prep-title">
                    <Package size={24} />
                    준비물
                </h2>
                <div className="prep-stats">
                    <span className="stat pending">{pendingCount}개 진행중</span>
                    <span className="stat completed">{completedCount}개 완료</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    진행중 ({pendingCount})
                </button>
                <button
                    className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    완료 ({completedCount})
                </button>
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    전체
                </button>
            </div>

            {/* Prep List */}
            {preparations.length === 0 ? (
                <div className="empty-state-container">
                    <div className="empty-state">
                        <Package size={48} className="empty-state-icon" />
                        <p className="empty-state-title">
                            {filter === 'pending' ? '준비할 물건이 없어요' : '완료된 항목이 없어요'}
                        </p>
                        <p className="empty-state-description">
                            버튼을 눌러 준비물을 추가해보세요
                        </p>
                    </div>
                </div>
            ) : (
                <div className="prep-list">
                    {preparations.map(prep => (
                        <div
                            key={prep.id}
                            className={`prep-card ${prep.isCompleted ? 'completed' : ''} ${isUrgent(prep.dueDate) && !prep.isCompleted ? 'urgent' : ''}`}
                        >
                            <button
                                className="prep-check-btn"
                                onClick={() => toggleCompletion(prep.id)}
                            >
                                {prep.isCompleted ? (
                                    <CheckCircle2 size={28} className="check-icon done" />
                                ) : (
                                    <Circle size={28} className="check-icon" />
                                )}
                            </button>

                            <div className="prep-content" onClick={() => openEditModal(prep)}>
                                <div className="prep-main">
                                    <h4 className={`prep-title-text ${prep.isCompleted ? 'strikethrough' : ''}`}>
                                        {prep.title}
                                    </h4>
                                    {prep.description && (
                                        <p className="prep-description">{prep.description}</p>
                                    )}
                                    <div className="prep-meta">
                                        <span className={`prep-category cat-${prep.category}`}>
                                            {CATEGORIES.find(c => c.value === prep.category)?.label}
                                        </span>
                                        {isParent && prep.childId && (
                                            <span
                                                className="child-badge"
                                                style={{ background: getChildColor(prep.childId) }}
                                            >
                                                {getChildName(prep.childId)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="prep-dday-section">
                                    {!prep.isCompleted && (isUrgent(prep.dueDate) || isOverdue(prep.dueDate)) && (
                                        <AlertCircle size={16} className="alert-icon" />
                                    )}
                                    <span className={`dday-badge ${isUrgent(prep.dueDate) && !prep.isCompleted ? 'urgent' : ''} ${isOverdue(prep.dueDate) && !prep.isCompleted ? 'overdue' : ''}`}>
                                        {getDday(prep.dueDate)}
                                    </span>
                                    <span className="due-date">
                                        {format(new Date(prep.dueDate), 'M/d', { locale: ko })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FAB */}
            <button className="fab" onClick={openAddModal}>
                <Plus size={24} />
            </button>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingPrep ? '준비물 수정' : '새 준비물'}
                footer={
                    <div className="modal-actions">
                        {editingPrep && (
                            <button className="btn btn-ghost danger" onClick={handleDelete}>
                                <Trash2 size={18} />
                                삭제
                            </button>
                        )}
                        <button
                            type="submit"
                            form="prep-form"
                            className="btn btn-primary"
                        >
                            {editingPrep ? '수정' : '저장'}
                        </button>
                    </div>
                }
            >
                <form id="prep-form" className="prep-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">제목 *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="예: 미술 준비물, 수학 교재"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">마감일 *</label>
                        <input
                            type="date"
                            className="input"
                            value={formData.dueDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">카테고리</label>
                        <div className="category-buttons">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    className={`cat-btn ${formData.category === cat.value ? 'selected' : ''}`}
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
                        <label className="input-label">상세 내용</label>
                        <textarea
                            className="input textarea"
                            placeholder="준비물에 대한 상세 내용 (선택)"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default PrepPage
