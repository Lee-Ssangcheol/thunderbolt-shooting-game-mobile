# GitHub Pages 배포 가이드

## 📋 사전 준비

1. **GitHub 계정 생성** (이미 있다면 생략)
2. **Git 설치** (로컬에서 작업하려는 경우)

## 🚀 GitHub Pages 배포 단계

### 1단계: GitHub 저장소 생성

1. GitHub.com에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 설정:
   - **Repository name**: `thunderbolt-shooting-game`
   - **Description**: `모바일과 데스크탑에서 플레이 가능한 슈팅 게임`
   - **Public** 선택
   - **Add a README file** 체크 해제
   - **Add .gitignore** 체크 해제
   - **Choose a license** 선택 (MIT License 권장)
4. "Create repository" 클릭

### 2단계: 파일 업로드

#### 방법 1: 웹 인터페이스 사용 (권장)
1. 생성된 저장소 페이지에서 "uploading an existing file" 클릭
2. 모든 게임 파일을 드래그 앤 드롭:
   - `index.html`
   - `game.js`
   - `style.css`
   - `sounds.js`
   - `images/` 폴더
   - `sounds/` 폴더
   - `README.md`
3. "Commit changes" 클릭

#### 방법 2: Git 명령어 사용
```bash
# 저장소 클론
git clone https://github.com/your-username/thunderbolt-shooting-game.git
cd thunderbolt-shooting-game

# 파일 복사
# (모든 게임 파일을 이 폴더에 복사)

# 변경사항 커밋
git add .
git commit -m "Initial commit: Add mobile-compatible shooting game"
git push origin main
```

### 3단계: GitHub Pages 활성화

1. 저장소 페이지에서 **Settings** 탭 클릭
2. 좌측 메뉴에서 **Pages** 클릭
3. **Source** 섹션에서:
   - "Deploy from a branch" 선택
   - **Branch**: `main` 선택
   - **Folder**: `/ (root)` 선택
4. **Save** 클릭

### 4단계: 배포 확인

1. 몇 분 후 **Pages** 페이지에서 녹색 체크 표시 확인
2. 제공된 URL로 접속하여 게임이 정상 작동하는지 확인
   - 예: `https://your-username.github.io/thunderbolt-shooting-game/`

## 📱 모바일 테스트

### 로컬 테스트
1. 브라우저 개발자 도구 열기 (F12)
2. 모바일 시뮬레이션 모드 활성화
3. 다양한 디바이스 크기로 테스트

### 실제 모바일 테스트
1. 배포된 URL을 모바일 브라우저에서 접속
2. 터치 컨트롤이 정상 작동하는지 확인
3. 화면 크기에 맞게 UI가 조정되는지 확인

## 🔧 문제 해결

### 게임이 로드되지 않는 경우
1. 브라우저 콘솔에서 오류 메시지 확인
2. 파일 경로가 올바른지 확인
3. 모든 파일이 업로드되었는지 확인

### 터치 컨트롤이 작동하지 않는 경우
1. 모바일 디바이스인지 확인
2. 브라우저가 터치 이벤트를 지원하는지 확인
3. `touch-action: none` CSS 속성이 적용되었는지 확인

### 사운드가 재생되지 않는 경우
1. 브라우저의 자동 재생 정책 확인
2. 사용자가 게임과 상호작용한 후 사운드가 재생되는지 확인

## 📈 성능 최적화

### 이미지 최적화
```bash
# 이미지 압축 도구 사용
npm install -g imagemin-cli
imagemin images/* --out-dir=images/optimized
```

### 코드 최적화
```bash
# JavaScript 압축
npm install -g uglify-js
uglifyjs game.js -o game.min.js
```

## 🔄 업데이트 배포

코드를 수정한 후:
1. 변경사항을 GitHub에 푸시
2. GitHub Pages가 자동으로 재배포됨
3. 몇 분 후 변경사항이 반영됨

## 📊 분석 도구 추가

### Google Analytics 추가
`index.html`의 `<head>` 섹션에 추가:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎯 추가 개선 사항

1. **PWA 지원**: 오프라인 플레이 가능
2. **소셜 공유**: 점수 공유 기능
3. **리더보드**: 온라인 점수 비교
4. **다국어 지원**: 한국어/영어 지원

## 📞 지원

배포 과정에서 문제가 발생하면:
1. GitHub Issues에서 검색
2. 새로운 Issue 생성
3. 상세한 오류 메시지와 함께 문의 