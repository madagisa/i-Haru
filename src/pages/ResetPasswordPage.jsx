import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/client'
import { Eye, EyeOff, KeyRound, ArrowLeft, Check } from 'lucide-react'
import './AuthPages.css'

function ResetPasswordPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [email, setEmail] = useState(searchParams.get('email') || '')
    const [token, setToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.')
            return
        }

        if (newPassword.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.')
            return
        }

        setIsLoading(true)

        try {
            await authApi.resetPassword(email, token, newPassword)
            setSuccess(true)
        } catch (err) {
            setError(err.message || '비밀번호 재설정 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <span className="auth-logo-icon">✅</span>
                            <h1 className="auth-logo-text">변경 완료</h1>
                        </div>
                        <p className="auth-subtitle">
                            비밀번호가 성공적으로 변경되었습니다.
                        </p>
                    </div>

                    <div className="auth-form" style={{ textAlign: 'center' }}>
                        <Link
                            to="/login"
                            className="btn btn-primary btn-lg btn-full"
                        >
                            로그인하기
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="auth-logo-icon">🔐</span>
                        <h1 className="auth-logo-text">비밀번호 재설정</h1>
                    </div>
                    <p className="auth-subtitle">이메일로 받은 인증 코드와 새 비밀번호를 입력하세요</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label" htmlFor="email">이메일</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="token">인증 코드 (6자리)</label>
                        <input
                            id="token"
                            type="text"
                            className="input"
                            placeholder="123456"
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').substring(0, 6))}
                            maxLength={6}
                            style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: 700 }}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="newPassword">새 비밀번호</label>
                        <div className="password-input-wrapper">
                            <input
                                id="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="6자 이상 입력하세요"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
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
                            type="password"
                            className="input"
                            placeholder="비밀번호를 다시 입력하세요"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
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
                                <KeyRound size={20} />
                                비밀번호 변경
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/forgot-password" className="auth-link">
                        <ArrowLeft size={16} /> 이메일 다시 입력
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordPage
