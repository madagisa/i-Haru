import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import './AuthPages.css'

function SignupPage() {
    const navigate = useNavigate()
    const { signup, isLoading, error, clearError } = useAuthStore()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'parent',
        createNewFamily: true  // 부모: 새 가족 만들기(true) or 기존 가족 참여(false)
    })
    const [showPassword, setShowPassword] = useState(false)
    const [validationError, setValidationError] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setValidationError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        clearError()
        setValidationError('')

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setValidationError('비밀번호가 일치하지 않습니다.')
            return
        }

        if (formData.password.length < 6) {
            setValidationError('비밀번호는 6자 이상이어야 합니다.')
            return
        }

        const result = await signup(formData)
        if (result.success) {
            // 자녀 또는 기존 가족 참여를 선택한 부모는 초대코드 입력 페이지로 이동
            if (formData.role === 'child' || !formData.createNewFamily) {
                navigate('/join-family')
            } else {
                navigate('/')
            }
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="auth-logo-icon">📅</span>
                        <h1 className="auth-logo-text">i-Haru</h1>
                    </div>
                    <p className="auth-subtitle">가족과 함께하는 일정 관리</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {(error || validationError) && (
                        <div className="auth-error">
                            {error || validationError}
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label" htmlFor="name">이름</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="input"
                            placeholder="이름을 입력하세요"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="email">이메일</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="input"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="password">비밀번호</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="6자 이상 입력하세요"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="confirmPassword">비밀번호 확인</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="input"
                            placeholder="비밀번호를 다시 입력하세요"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">가입 유형</label>
                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'parent' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, role: 'parent' }))}
                            >
                                👨‍👩‍👧 부모
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'child' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, role: 'child' }))}
                            >
                                👧 자녀
                            </button>
                        </div>
                    </div>

                    {/* 부모 선택 시 가족 옵션 표시 */}
                    {formData.role === 'parent' && (
                        <div className="input-group">
                            <label className="input-label">가족 설정</label>
                            <div className="role-selector">
                                <button
                                    type="button"
                                    className={`role-btn ${formData.createNewFamily ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, createNewFamily: true }))}
                                >
                                    🏠 새 가족 만들기
                                </button>
                                <button
                                    type="button"
                                    className={`role-btn ${!formData.createNewFamily ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, createNewFamily: false }))}
                                >
                                    👨‍👩‍👧‍👦 기존 가족 참여
                                </button>
                            </div>
                            {!formData.createNewFamily && (
                                <p className="input-hint" style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                                    가입 후 초대 코드를 입력하여 가족에 참여할 수 있어요
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner" />
                        ) : (
                            <>
                                <UserPlus size={20} />
                                회원가입
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>이미 계정이 있으신가요?</p>
                    <Link to="/login" className="auth-link">로그인</Link>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
