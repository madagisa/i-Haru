import { useNavigate } from 'react-router-dom'
import {
    ChevronLeft,
    Smartphone,
    UserPlus,
    Users,
    Calendar,
    Package,
    Lightbulb,
    Share,
    MoreVertical
} from 'lucide-react'
import './HelpPage.css'

function HelpPage() {
    const navigate = useNavigate()

    return (
        <div className="help-page">
            <header className="help-header">
                <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <h2 className="help-title">사용 가이드</h2>
            </header>

            <div className="help-intro">
                <strong>👋 반가워요, i-Haru입니다!</strong>
                <p>
                    앱 설치 없이 웹주소만으로 편리하게.<br />
                    아래 가이드를 따라 100% 활용해보세요.
                </p>
            </div>

            {/* Section 1: Add to Home Screen */}
            <section className="help-section">
                <h3 className="help-section-title">
                    <Smartphone size={22} className="text-primary" />
                    홈 화면에 추가하기
                </h3>

                <div className="help-card">
                    <h4>🍎 아이폰 (Safari)</h4>
                    <ul className="help-steps">
                        <li className="help-step">
                            <span className="step-number">1</span>
                            <div className="step-content">
                                Safari 브라우저 하단 가운데 <strong>공유 버튼 <Share size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></strong>을 누릅니다.
                            </div>
                        </li>
                        <li className="help-step">
                            <span className="step-number">2</span>
                            <div className="step-content">
                                메뉴를 아래로 내려 <strong>'홈 화면에 추가'</strong>를 선택합니다.
                            </div>
                        </li>
                        <li className="help-step">
                            <span className="step-number">3</span>
                            <div className="step-content">
                                오른쪽 상단 <strong>'추가'</strong>를 누르면 바탕화면에 아이콘이 생깁니다.
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="help-card">
                    <h4>🤖 갤럭시 (Chrome)</h4>
                    <ul className="help-steps">
                        <li className="help-step">
                            <span className="step-number">1</span>
                            <div className="step-content">
                                Chrome 브라우저 우측 상단 <strong>점 3개 메뉴 <MoreVertical size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></strong>를 누릅니다.
                            </div>
                        </li>
                        <li className="help-step">
                            <span className="step-number">2</span>
                            <div className="step-content">
                                <strong>'홈 화면에 추가'</strong> 또는 <strong>'앱 설치'</strong>를 선택합니다.
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 2: Signup & Family */}
            <section className="help-section">
                <h3 className="help-section-title">
                    <UserPlus size={22} className="text-active" />
                    회원가입 및 가족
                </h3>

                <div className="help-card">
                    <h4>👨‍👩‍👧‍👦 부모님 (가족 대표)</h4>
                    <ul className="help-steps">
                        <li className="help-step">
                            <span className="step-number">1</span>
                            <div className="step-content">
                                로그인 화면에서 <strong>'회원가입'</strong>을 누르고 <strong>[부모]</strong> 역할을 선택합니다.
                            </div>
                        </li>
                        <li className="help-step">
                            <span className="step-number">2</span>
                            <div className="step-content">
                                가입이 완료되면 <strong>'가족 초대 코드'</strong>가 발급됩니다. (예: HARU...)
                            </div>
                        </li>
                        <li className="help-step">
                            <span className="step-number">3</span>
                            <div className="step-content">
                                이 코드를 <strong>배우자</strong>에게 공유해주세요.
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="help-card">
                    <h4>👶 자녀</h4>
                    <ul className="help-steps">
                        <li className="help-step">
                            <span className="step-number">1</span>
                            <div className="step-content">
                                <strong>부모님이 먼저:</strong> 앱 설정의 [가족 설정]에서 [자녀 추가]를 눌러 프로필을 만들어주세요.
                            </div>
                        </li>
                        <li className="help-step">
                            <span className="step-number">2</span>
                            <div className="step-content">
                                생성된 프로필 옆의 <strong>'자녀 초대 코드'</strong>(예: CHLD...)를 확인합니다.
                            </div>
                        </li>
                        <li className="help-step">
                            <span className="step-number">3</span>
                            <div className="step-content">
                                <strong>아이 폰에서:</strong> 회원가입 -> [자녀] 선택 -> 자녀 코드를 입력하면 자동 연결됩니다.
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="help-tip">
                    <Lightbulb size={24} className="text-warning" />
                    <div className="tip-content">
                        <strong>코드를 잊어버리셨나요?</strong>
                        <p>우측 상단 메뉴(≡) &gt; <strong>[가족 설정]</strong>에서 언제든 다시 확인할 수 있습니다.</p>
                    </div>
                </div>
            </section>

            {/* Section 3: Schedule */}
            <section className="help-section">
                <h3 className="help-section-title">
                    <Calendar size={22} className="text-secondary" />
                    일정 등록하기
                </h3>
                <div className="help-card">
                    <ul className="help-steps">
                        <li className="help-step">
                            <span className="step-number">1</span>
                            <div className="step-content">
                                하단 메뉴에서 <strong>[캘린더]</strong> 탭을 누릅니다.
                            </div>
                        </li>
                        <li className="help-step">
                            <span className="step-number">2</span>
                            <div className="step-content">
                                오른쪽 아래 <strong>파란색 더하기(+) 버튼</strong>을 누릅니다.
                            </div>
                        </li>
                        <li className="help-step">
                            <span className="step-number">3</span>
                            <div className="step-content">
                                <strong>(중요) 누구의 일정인가요?</strong><br />
                                자녀 목록에서 해당되는 아이를 꼭 선택해주세요.
                            </div>
                        </li>
                        <li className="help-step">
                            <span className="step-number">4</span>
                            <div className="step-content">
                                날짜와 시간을 입력하고 <strong>[저장]</strong>을 누르면 끝!
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            <section className="help-section">
                <h3 className="help-section-title">
                    <Package size={22} className="text-primary" />
                    준비물 챙기기
                </h3>
                <div className="help-card">
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '15px' }}>
                        하단 <strong>[준비물]</strong> 탭에서도 일정과 동일한 방법으로 준비물을 등록할 수 있습니다.<br /><br />
                        학교 준비물, 학원 숙제 등을 입력해두면,<br />
                        <strong>D-Day 알림</strong>으로 미리 알려드립니다! 🔔
                    </p>
                </div>
            </section>

            <div className="contact-section">
                <p>문의: support@i-haru.com</p>
                <p>v1.0.0</p>
            </div>
        </div>
    )
}

export default HelpPage
