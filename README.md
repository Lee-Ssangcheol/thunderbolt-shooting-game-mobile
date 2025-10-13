# 썬더볼트 슈팅게임

모바일과 PC 웹 브라우저에서 모두 플레이 가능한 슈팅 게임입니다.

## 🎮 게임 특징

- **크로스 플랫폼 지원**: PC 웹 브라우저와 모바일 브라우저 모두 지원
- **터치 컨트롤**: 모바일에서 직관적인 터치 조작
- **다양한 적**: 비행기, 헬리콥터, 보스 등 다양한 적 타입
- **파워업 시스템**: 확산탄, 특수무기 등 다양한 무기
- **보스 전투**: 강력한 보스와의 전투
- **점수 시스템**: 최고점수 기록 및 저장
- **모바일 최적화**: 터치 드래그, 연속 발사, 전체화면 모드

## 🎯 조작법

### PC 웹 브라우저
- **방향키**: 플레이어 이동
- **스페이스바**: 발사
- **B키**: 특수무기 발사
- **P키**: 일시정지
- **F5**: 게임 재시작

### 모바일 웹 브라우저
- **방향 버튼**: 플레이어 이동
- **발사 버튼**: 총알 발사
- **특수무기 버튼**: 특수무기 발사
- **일시정지 버튼**: 게임 일시정지
- **리셋 버튼**: 최고점수 리셋
- **터치 드래그**: 플레이어 이동 및 연속 발사

## 🚀 바로 플레이하기

### 웹 브라우저에서
```
https://lee-ssangcheol.github.io/thunderbolt-shooting-game/
```

### 모바일 웹 브라우저에서
- 위 URL을 모바일 브라우저에서 접속
- 터치 컨트롤 지원
- 반응형 디자인 적용

## 🛠️ 로컬 개발 환경

### 저장소 클론
```bash
git clone https://github.com/Lee-Ssangcheol/thunderbolt-shooting-game.git
cd thunderbolt-shooting-game
```

### 웹 서버 실행
```bash
# Python 3
python -m http.server 8000

# 또는 Node.js
npx http-server

# 또는 Live Server (VS Code 확장)
```

### 브라우저에서 접속
```
http://localhost:8000
```

## 📱 모바일 최적화

- **반응형 디자인**: 다양한 화면 크기에 대응
- **터치 최적화**: 터치 이벤트 최적화
- **성능 최적화**: 모바일 디바이스 성능 고려
- **UI/UX**: 모바일에 적합한 인터페이스
- **전체화면 모드**: 모바일에서 최적의 게임 경험

## 🛠️ 기술 스택

- **HTML5**: 게임 구조
- **CSS3**: 스타일링 및 반응형 디자인
- **JavaScript**: 게임 로직 및 터치 이벤트 처리
- **Canvas API**: 게임 렌더링
- **IndexedDB**: 로컬 점수 저장

## 📁 파일 구조

```
thunderbolt-shooting-game/
├── index.html          # 메인 HTML 파일
├── game.js             # 게임 로직 (5,583줄)
├── style.css           # 스타일시트
├── .gitignore          # Git 무시 파일 설정
├── DEPLOYMENT.md       # 배포 가이드
├── README.md           # 프로젝트 설명
├── images/             # 게임 이미지
│   ├── player.png      # 플레이어 비행기
│   ├── enemyplane.png  # 적 비행기
│   └── enemyplane2.png # 적 비행기 2
└── sounds/             # 게임 사운드
    ├── shoot.mp3       # 발사음
    ├── explosion.mp3   # 폭발음
    ├── collision.mp3   # 충돌음
    ├── levelup.mp3     # 레벨업음
    └── ...             # 기타 효과음
```

## 🎨 커스터마이징

### 게임 설정 변경
`game.js` 파일에서 다음 설정을 조정할 수 있습니다:

- 보스 출현 빈도: `BOSS_SETTINGS.SPAWN_INTERVAL`
- 플레이어 속도: `player.speed`
- 적 생성 빈도: `difficultySettings`
- 효과음 볼륨: 각 Audio 객체의 `volume` 속성

### 스타일 변경
`style.css` 파일에서 UI 스타일을 수정할 수 있습니다.

## 📊 프로젝트 통계

- **총 파일 수**: 18개
- **코드 라인 수**: 5,583줄
- **이미지 파일**: 3개
- **사운드 파일**: 7개
- **지원 플랫폼**: PC 웹 브라우저, 모바일 웹 브라우저
- **GitHub Stars**: 0
- **GitHub Forks**: 0

## 🔄 최근 업데이트

### v1.0.0 (2025-01-27)
- ✅ GitHub Pages 배포 완료
- ✅ 모바일 최적화 완료
- ✅ 효과음 시스템 통합
- ✅ .gitignore 파일 최적화
- ✅ 불필요한 파일 정리

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

LSC 라이센스스
