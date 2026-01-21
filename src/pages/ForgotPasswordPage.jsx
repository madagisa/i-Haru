import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/client'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import './AuthPages.css'

function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await authApi.forgotPassword(email)
            setSuccess(true)
        } catch (err) {
            setError(err.message || '요청 처리 중 오류가 발생했습니다.')
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
                            <span className="auth-logo-icon">📧</span>
                            <h1 className="auth-logo-text">이메일 발송 완료</h1>
                        </div>
                        <p className="auth-subtitle">
                            {email}로 비밀번호 재설정 코드를 발송했습니다.
                        </p>
                    </div>

                    <div className="auth-form" style={{ textAlign: 'center' }}>
                        <p style={{ marginBottom: '24px', color: '#666' }}>
                            이메일을 확인하고 인증 코드를 입력해주세요.
                        </p>
                        <Link
                            to={`/reset-password?email=${encodeURIComponent(email)}`}
                            className="btn btn-primary btn-lg btn-full"
                        >
                            인증 코드 입력하기
                        </Link>
                    </div>

                    <div className="auth-footer">
                        <Link to="/login" className="auth-link">
                            <ArrowLeft size={16} /> 로그인으로 돌아가기
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
                        <span className="auth-logo-icon">🔑</span>
                        <h1 className="auth-logo-text">비밀번호 찾기</h1>
                    </div>
                    <p className="auth-subtitle">가입한 이메일로 재설정 코드를 보내드립니다</p>
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
                            name="email"
                            type="email"
                            className="input"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                                <Send size={20} />
                                인증 코드 받기
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login" className="auth-link">
                        <ArrowLeft size={16} /> 로그인으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage
