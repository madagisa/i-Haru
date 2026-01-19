# i-Haru (아이하루) - 자녀 스케줄 관리 웹앱

부모와 자녀가 함께 사용하는 일정 및 준비물 관리 웹 서비스입니다.

## 🌸 주요 기능

- **오늘 탭**: 오늘의 일정, 준비물, 가족 메시지를 한눈에
- **일정 탭**: 달력으로 일정 등록/수정/삭제 (반복 일정 지원)
- **준비물 탭**: 수행평가, 학원책 등 준비물 관리 (D-day 표시)
- **설정 탭**: 가족 관리, 자녀 추가/삭제

### 사용자별 기능
- **부모**: 모든 자녀의 일정을 한눈에 확인, 자녀별 필터링
- **자녀**: 본인의 일정과 준비물만 확인

## 🛠 기술 스택

- **Frontend**: React 18 + Vite
- **Styling**: Vanilla CSS (Custom Design System)
- **상태관리**: Zustand
- **라우팅**: React Router v6
- **날짜**: date-fns
- **아이콘**: Lucide React
- **배포**: Cloudflare Pages

## 🚀 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

## 📱 데모 계정

로그인 테스트용 데모 계정:

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 부모 | parent@demo.com | demo1234 |
| 자녀 (지윤) | child1@demo.com | demo1234 |
| 자녀 (민준) | child2@demo.com | demo1234 |

## 🔗 배포

### Cloudflare Pages 설정

1. GitHub 저장소 연결
2. 빌드 설정:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. 환경 변수: (추후 D1 연동 시 추가)

## 📅 향후 계획

- [ ] Cloudflare D1 데이터베이스 연동
- [ ] 푸시 알림 기능
- [ ] OAuth 로그인 (Google, Kakao)
- [ ] 다크모드

## 📄 라이선스

MIT License

---

Made with 💖 by i-Haru Team
