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
                <strong>i-Haru</strong>에 오신 것을 환영합니다!<br />
                앱 설치 없이도 웹주소만으로 간편하게 사용할 수 있습니다.
                아래 가이드를 따라 더 편리하게 이용해보세요.
            </div>

            {/* Section 1: Add to Home Screen */}
            <section className="help-section">
                <h3 className="help-section-title">
                    <Smartphone size={24} className="text-primary" />
                    앱처럼 홈 화면에 추가하기
                </h3>

                <div className="help-subsection">
                    <h4>🍎 아이폰 (Safari)</h4>
                    <ul className="help-steps">
                        <li className="help-step">
                            <span className="step-number">1</span>
                            Safari 브라우저로 i-Haru에 접속합니다.
                        </li>
                        <li className="help-step">
                            <span className="step-number">2</span>
                            하단 가운데 <strong>공유 버튼 <Share size={14} style={{ display: 'inline' }} /></strong>을 누릅니다.
                        </li>
                        <li className="help-step">
                            <span className="step-number">3</span>
                            메뉴를 아래로 내려 <strong>'홈 화면에 추가'</strong>를 선택합니다.
                        </li>
                        <li className="help-step">
                            <span className="step-number">4</span>
                            오른쪽 상단 <strong>'추가'</strong>를 누르면 바탕화면에 아이콘이 생깁니다.
                        </li>
                    </ul>
                </div>

                <div className="help-subsection">
                    <h4>🤖 갤럭시 (Chrome / Samsung)</h4>
                    <ul className="help-steps">
                        <li className="help-step">
                            <span className="step-number">1</span>
                            Chrome 브라우저로 접속합니다.
                        </li>
                        <li className="help-step">
                            <span className="step-number">2</span>
                            오른쪽 상단 <strong>점 3개 메뉴 <MoreVertical size={14} style={{ display: 'inline' }} /></strong>를 누릅니다.
                        </li>
                        <li className="help-step">
                            <span className="step-number">3</span>
                            <strong>'홈 화면에 추가'</strong> 또는 <strong>'앱 설치'</strong>를 선택합니다.
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 2: Signup & Family */}
            <section className="help-section">
                <h3 className="help-section-title">
                    <UserPlus size={24} className="text-active" />
                    회원가입 및 가족 만들기
                </h3>

                <div className="help-subsection">
                    <h4>부모님 (가족 대표)</h4>
                    <ul className="help-steps">
                        <li className="help-step">
                            <span className="step-number">1</span>
                            로그인 화면에서 '회원가입' -> <strong>[부모]</strong> 선택
                        </li>
                        <li className="help-step">
                            <span className="step-number">2</span>
                            가입 완료 후 <strong>'가족 초대 코드'</strong>가 발급됩니다. (예: HARU...)
                        </li>
                        <li className="help-step">
                            <span className="step-number">3</span>
                            이 코드는 <strong>배우자</strong>에게만 공유해주세요.
                        </li>
                    </ul>
                </div>

                <div className="help-subsection">
                    <h4>자녀</h4>
                    <ul className="help-steps">
                        <li className="help-step">
                            <span className="step-number">1</span>
                            <strong>부모님이 먼저:</strong> [가족 설정] -> [자녀 추가]에서 자녀 프로필 생성
                        </li>
                        <li className="help-step">
                            <span className="step-number">2</span>
                            생성된 프로필 옆의 <strong>'자녀 초대 코드'</strong>(예: CHLD...) 확인
                        </li>
                        <li className="help-step">
                            <span className="step-number">3</span>
                            <strong>아이 기기에서:</strong> 회원가입 -> [자녀] 선택 -> 자녀 초대 코드 입력
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
                    <Calendar size={24} className="text-secondary" />
                    일정 등록하기
                </h3>
                <ul className="help-steps">
                    <li className="help-step">
                        <span className="step-number">1</span>
                        하단 메뉴에서 <strong>[캘린더]</strong> 탭을 누릅니다.
                    </li>
                    <li className="help-step">
                        <span className="step-number">2</span>
                        오른쪽 아래 <strong>파란색 더하기(+) 버튼</strong>을 누릅니다.
                    </li>
                    <li className="help-step">
                        <span className="step-number">3</span>
                        <strong>(중요) 누구의 일정인가요?</strong><br />
                        자녀 목록에서 해당되는 아이를 꼭 선택해주세요.
                    </li>
                    <li className="help-step">
                        <span className="step-number">4</span>
                        날짜와 시간을 입력하고 <strong>[저장]</strong>을 누르면 끝!
                    </li>
                </ul>
            </section>

            <section className="help-section">
                <h3 className="help-section-title">
                    <Package size={24} className="text-primary" />
                    준비물 챙기기
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    하단 <strong>[준비물]</strong> 탭에서도 일정과 동일한 방법으로 준비물을 등록할 수 있습니다.<br />
                    학교 준비물, 학원 숙제 등을 꼼꼼하게 챙겨보세요!
                </p>
            </section>

            <div className="contact-section">
                <p>문의: support@i-haru.com</p>
                <p>v1.0.0</p>
            </div>
        </div>
    )
}

export default HelpPage
