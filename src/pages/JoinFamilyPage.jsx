import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFamilyStore } from '../store/familyStore'
import { useAuthStore } from '../store/authStore'
import { Users, User } from 'lucide-react'
import './AuthPages.css'

function JoinFamilyPage() {
    const { inviteCode } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { joinFamily, isLoading, error } = useFamilyStore()

    const [code, setCode] = useState(inviteCode || '')
    const [localError, setLocalError] = useState('')

    // 이미 가족이 있으면 홈으로 리다이렉트
    useEffect(() => {
        if (user?.familyId) {
            navigate('/')
        }
    }, [user?.familyId, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLocalError('')

        if (!code.trim()) {
            setLocalError('초대 코드를 입력해주세요.')
            return
        }

        const result = await joinFamily(code.toUpperCase())
        if (result.success) {
            navigate('/')
        }
    }

    const isParent = user?.role === 'parent'
    const codeType = code.toUpperCase().startsWith('PRNT') || code.toUpperCase().startsWith('HARU')
        ? 'parent'
        : code.toUpperCase().startsWith('CHLD')
            ? 'child'
            : null

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="auth-logo-icon">👨‍👩‍👧‍👦</span>
                        <h1 className="auth-logo-text">가족 참여</h1>
                    </div>
                    <p className="auth-subtitle">
                        {isParent
                            ? '부모 초대 코드를 입력하세요'
                            : '자녀 초대 코드를 입력하세요'}
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {(error || localError) && (
                        <div className="auth-error">
                            {error || localError}
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label" htmlFor="code">초대 코드</label>
                        <input
                            id="code"
                            type="text"
                            className="input"
                            placeholder={isParent ? 'PRNT****' : 'CHLD****'}
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={8}
                            style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 700 }}
                        />
                        {codeType && (
                            <p className="input-hint" style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                                {codeType === 'parent' ? '👨‍👩‍👧 부모 초대 코드입니다' : '👧 자녀 초대 코드입니다'}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner" />
                        ) : (
                            <>
                                <Users size={20} />
                                가족 참여하기
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    {isParent ? (
                        <p>부모 초대 코드는 기존 가족의 부모에게 받을 수 있어요</p>
                    ) : (
                        <p>자녀 초대 코드는 부모님에게 받을 수 있어요</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default JoinFamilyPage
