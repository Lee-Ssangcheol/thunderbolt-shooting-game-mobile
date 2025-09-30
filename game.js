// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
canvas.width = 750;
canvas.height = 800;
const ctx = canvas.getContext('2d');

// 오디오 요소 가져오기
const shootSound = document.getElementById('shootSound');
const explosionSound = document.getElementById('explosionSound');
const collisionSound = document.getElementById('collisionSound');

// 동적으로 오디오 요소 생성 및 경로 자동 감지 (경고음 매니저)
let warningSound = null;
const WarningSoundManager = {
    paths: [
        'sounds/warning.mp3',
        './sounds/warning.mp3',
        '../sounds/warning.mp3',
        'assets/sounds/warning.mp3',
        'audio/warning.mp3',
        'warning.mp3'
    ],
    idx: 0,
    ready: false,
    lastPlayMs: 0,
    cooldownMs: 250,
    init() {
        this.ready = false;
        this.idx = 0;
        this._createAudio();
        this._tryCurrentPath();
    },
    _createAudio() {
        if (warningSound) {
            try { warningSound.remove(); } catch (e) {}
        }
        warningSound = document.createElement('audio');
        warningSound.id = 'warningSound';
        warningSound.preload = 'auto';
        document.body.appendChild(warningSound);
        // 공통 핸들러 등록
        warningSound.addEventListener('canplaythrough', () => {
            this.ready = true;
            console.log('경고음 로드 성공:', warningSound.src);
        });
        warningSound.addEventListener('error', (e) => {
            console.warn('경고음 로드 실패:', warningSound.src, e);
            this._nextPath();
        });
    },
    _tryCurrentPath() {
        if (this.idx >= this.paths.length) {
            console.error('모든 경고음 경로 로드 실패');
            return;
        }
        const path = this.paths[this.idx];
        warningSound.src = path;
        try { warningSound.load(); } catch (e) {}
    },
    _nextPath() {
        this.idx += 1;
        this.ready = false;
        this._tryCurrentPath();
    },
    play() {
        const now = Date.now();
        if (now - this.lastPlayMs < this.cooldownMs) return;
        if (!warningSound) {
            this.init();
            return;
        }
        if (isMuted || globalVolume <= 0) return;
        applyGlobalVolume();
        const doPlay = () => {
            try { warningSound.currentTime = 0; } catch (e) {}
            const p = warningSound.play();
            if (p && typeof p.then === 'function') {
                p.then(() => { this.lastPlayMs = Date.now(); }).catch(err => {
                    console.warn('경고음 재생 실패:', err);
                });
            } else {
                this.lastPlayMs = Date.now();
            }
        };
        if (warningSound.readyState >= 2) {
            doPlay();
        } else {
            const onReady = () => {
                warningSound.removeEventListener('canplay', onReady);
                warningSound.removeEventListener('canplaythrough', onReady);
                doPlay();
            };
            warningSound.addEventListener('canplay', onReady, { once: true });
            warningSound.addEventListener('canplaythrough', onReady, { once: true });
            try { warningSound.load(); } catch (e) {}
        }
    }
};

function initializeWarningSound() {
    WarningSoundManager.init();
}

function playWarningSound() {
    WarningSoundManager.play();
}

// 사운드 설정
shootSound.volume = 0.4;  // 발사음 볼륨 증가
explosionSound.volume = 0.6;  // 폭발음 볼륨 조정
collisionSound.volume = 0.5;  // 충돌음 볼륨 조정

// 충돌 사운드 재생 시간 제어를 위한 변수 추가
let lastCollisionTime = 0;
const collisionSoundCooldown = 300;  // 충돌음 쿨다운 시간 증가

// 충돌 사운드 길이 제어
collisionSound.addEventListener('loadedmetadata', () => {
    // 사운드 길이를 0.8초로 제한
    collisionSound.duration = Math.min(collisionSound.duration, 0.8);
});

// 플레이어 우주선
const player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 8
};

// 두 번째 비행기
const secondPlane = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 8
};

// 게임 상태 변수 설정
let bullets = [];          // 총알 배열
let enemies = [];         // 적 배열
let explosions = [];      // 폭발 효과 배열
let gameLevel = 1;        // 게임 레벨
let levelScore = 0;       // 레벨 점수
let levelUpScore = 1000;  // 레벨업에 필요한 점수
let score = 0;           // 현재 점수
let highScore = 0;       // 최고 점수 (초기값 0으로 설정)
let hasSecondPlane = false;  // 두 번째 비행기 보유 여부
let secondPlaneTimer = 0;    // 두 번째 비행기 타이머
let isPaused = false;     // 일시정지 상태
let collisionCount = 0;   // 충돌 횟수
let isGameOver = false;   // 게임 오버 상태
let flashTimer = 0;       // 깜박임 효과 타이머
let flashDuration = 500;  // 깜박임 지속 시간
let lifeWarningTimer = 0; // 목숨 경고 깜빡임 타이머
let lifeWarningDuration = 2000; // 목숨 경고 깜빡임 지속 시간 (2초)
let lastLifeCount = 5;    // 이전 목숨 수 (변화 감지용)
let suppressCollisionSfxUntil = 0; // 경고음 우선 재생을 위한 충돌음 일시 억제
let gameOverStartTime = null;  // 게임 오버 시작 시간
let isSnakePatternActive = false;  // 뱀 패턴 활성화 상태
let snakePatternTimer = 0;  // 뱀 패턴 타이머
let snakePatternDuration = 10000;  // 뱀 패턴 지속 시간 (10초)
let snakeEnemies = [];  // 뱀 패턴의 적군 배열
let snakePatternInterval = 0;  // 뱀 패턴 생성 간격
let snakeGroups = [];  // 뱀 패턴 그룹 배열
let lastSnakeGroupTime = 0;  // 마지막 뱀 그룹 생성 시간
const snakeGroupInterval = 1500;  // 그룹 생성 간격 (1.5초로 단축)
const maxSnakeGroups = 3;  // 최대 동시 그룹 수
let gameVersion = '1.0.0-202506161826';  // 게임 버전

// 게임 상태 변수에 추가
let bossActive = false;
let bossHealth = 0;
let bossPattern = 0;
let specialWeaponCharged = false;
let specialWeaponCharge = 0;
let specialWeaponCount = 0;  // 특수무기 개수
const SPECIAL_WEAPON_MAX_CHARGE = 4000;  // 특수무기 최대 충전량을 4000으로 설정



// 헥스 색상을 RGB로 변환하는 함수
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r: 255, g: 0, b: 0}; // 기본값은 빨간색
}

// 패턴별 총알 모양 렌더링 함수
function renderBossBulletShape(bullet, color) {
    const rgb = hexToRgb(color);
    const size = bullet.width / 2;
    
    // 펄스 효과를 위한 스케일된 크기 계산
    const pulseScale = 1 + Math.sin(bullet.pulsePhase) * 0.5;
    const scaledSize = size * pulseScale;
    
    // 패턴이 없거나 undefined인 경우 기본 패턴 사용
    if (!bullet.pattern) {
        bullet.pattern = 'basic';
    }
    
    // 디버깅을 위한 로그
    if (bullet.pattern && (bullet.pattern.includes('heart') || bullet.pattern.includes('star') || bullet.pattern.includes('flower') || bullet.pattern.includes('butterfly') || bullet.pattern.includes('firework') || bullet.pattern.includes('chaos') || bullet.pattern.includes('ice'))) {
        console.log(`렌더링: 패턴=${bullet.pattern}, 색상=${color}, 크기=${size} (실제 크기: ${bullet.width}x${bullet.height})`);
    }
    
    switch (bullet.pattern) {
        case 'basic':
            // 기본 원형 총알 - 밝은 단색
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'circle_shot':
            // 원형 패턴 - 원형 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
            
        case 'cross_shot':
            // 십자 패턴 - 십자 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.fillRect(-size, -size/3, size*2, size*2/3);
            ctx.fillRect(-size/3, -size, size*2/3, size*2);
            break;
            
        case 'spiral_shot':
            // 나선 패턴 - 나선 모양 총알
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const angle = (i * Math.PI * 2) / 3;
                const x1 = Math.cos(angle) * size;
                const y1 = Math.sin(angle) * size;
                const x2 = Math.cos(angle + Math.PI) * size;
                const y2 = Math.sin(angle + Math.PI) * size;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.stroke();
            break;
            
        case 'wave_shot':
            // 파도 패턴 - 파도 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size/2, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'diamond_shot':
            // 다이아몬드 패턴 - 다이아몬드 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size, 0);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'random_spread':
            // 랜덤 패턴 - 불규칙한 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
            ctx.beginPath();
            ctx.arc(0, 0, size*1.5, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        // 새로운 모양 패턴들
        case 'heart_shot':
            // 하트 모양 총알 (크기 통일)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            // 하트 모양 그리기
            ctx.moveTo(0, scaledSize * 0.3);
            ctx.bezierCurveTo(-scaledSize * 0.5, -scaledSize * 0.2, -scaledSize, scaledSize * 0.1, 0, scaledSize);
            ctx.bezierCurveTo(scaledSize, scaledSize * 0.1, scaledSize * 0.5, -scaledSize * 0.2, 0, scaledSize * 0.3);
            ctx.fill();
            break;
            
        case 'star_shot':
            // 별 모양 총알 (크기 증가)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            // 5각 별 모양 그리기 - 크기 증가
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5;
                const outerRadius = scaledSize * 1.2; // 0.8에서 1.2로 증가
                const innerRadius = scaledSize * 0.5; // 0.3에서 0.5로 증가
                const x1 = Math.cos(angle) * outerRadius;
                const y1 = Math.sin(angle) * outerRadius;
                const x2 = Math.cos(angle + Math.PI/5) * innerRadius;
                const y2 = Math.sin(angle + Math.PI/5) * innerRadius;
                if (i === 0) {
                    ctx.moveTo(x1, y1);
                } else {
                    ctx.lineTo(x1, y1);
                }
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'flower_shot':
            // 꽃 모양 총알 (크기 통일)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            // 중심 원
            ctx.beginPath();
            ctx.arc(0, 0, scaledSize * 0.25, 0, Math.PI * 2);
            ctx.fill();
            // 꽃잎들
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                ctx.beginPath();
                ctx.ellipse(
                    Math.cos(angle) * scaledSize * 0.5, 
                    Math.sin(angle) * scaledSize * 0.5, 
                    scaledSize * 0.3, 
                    scaledSize * 0.15, 
                    angle, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
            }
            break;
            
        case 'butterfly_shot':
            // 나비 모양 총알 (크기 통일)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            // 왼쪽 날개
            ctx.beginPath();
            ctx.ellipse(-scaledSize * 0.25, 0, scaledSize * 0.4, scaledSize * 0.25, -Math.PI/4, 0, Math.PI * 2);
            ctx.fill();
            // 오른쪽 날개
            ctx.beginPath();
            ctx.ellipse(scaledSize * 0.25, 0, scaledSize * 0.4, scaledSize * 0.25, Math.PI/4, 0, Math.PI * 2);
            ctx.fill();
            // 몸통
            ctx.fillRect(-scaledSize * 0.08, -scaledSize * 0.4, scaledSize * 0.16, scaledSize * 0.8);
            break;
            
        case 'ice_shot':
            // 얼음 모양 총알 (크기 통일)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            // 육각형 모양
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const x = Math.cos(angle) * scaledSize * 0.8;
                const y = Math.sin(angle) * scaledSize * 0.8;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
            // 중심에 작은 육각형
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const x = Math.cos(angle) * scaledSize * 0.4;
                const y = Math.sin(angle) * scaledSize * 0.4;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'double_spiral':
            // 더블 나선 패턴 - 이중 원형 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
            ctx.beginPath();
            ctx.arc(0, 0, size*0.6, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'triple_wave':
            // 트리플 파도 패턴 - 삼각형 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size*0.866, size/2);
            ctx.lineTo(-size*0.866, size/2);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'targeted_shot':
            // 추적 패턴 - 화살 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size/2, size/2);
            ctx.lineTo(-size/2, size/2);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'burst_shot':
            // 폭발 패턴 - 별 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5;
                const x = Math.cos(angle) * size;
                const y = Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'spread_circle':
            // 확산 원형 패턴 - 큰 원형 총알 (단색)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'spread_cross':
            // 확산 십자 패턴 - 큰 십자 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.fillRect(-size, -size/4, size*2, size/2);
            ctx.fillRect(-size/4, -size, size/2, size*2);
            break;
            
        case 'spread_spiral':
            // 확산 나선 패턴 - 나선 총알
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI * 2) / 4;
                const x1 = Math.cos(angle) * size;
                const y1 = Math.sin(angle) * size;
                const x2 = Math.cos(angle + Math.PI) * size;
                const y2 = Math.sin(angle + Math.PI) * size;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.stroke();
            break;
            
        case 'spread_wave':
            // 확산 파도 패턴 - 타원형 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size/3, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'spread_diamond':
            // 확산 다이아몬드 패턴 - 다이아몬드 총알 (12x12에 맞는 비율)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.moveTo(0, -size*1.2);
            ctx.lineTo(size*1.2, 0);
            ctx.lineTo(0, size*1.2);
            ctx.lineTo(-size*1.2, 0);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'spread_burst':
            // 확산 폭발 패턴 - 큰 별 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                const x = Math.cos(angle) * size;
                const y = Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'spread_targeted':
            // 확산 추적 패턴 - 화살 모양 총알 (12x12에 맞는 비율)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.moveTo(0, -size*1.2);
            ctx.lineTo(size*0.6, size*0.6);
            ctx.lineTo(-size*0.6, size*0.6);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'spread_random':
            // 확산 랜덤 패턴 - 불규칙한 모양 총알 (12x12에 맞는 비율)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
            ctx.beginPath();
            ctx.arc(0, 0, size*1.5, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'mega_spread':
            // 메가 확산 패턴 - 원형 총알 (단색)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.arc(0, 0, size*1.5, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'chaos_spread':
            // 혼돈 확산 패턴 - 혼돈한 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
            ctx.beginPath();
            ctx.arc(0, 0, size*0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
            ctx.beginPath();
            ctx.arc(0, 0, size*2, 0, Math.PI * 2);
            ctx.fill();
            break;
            
            
            
        case 'flower_shot':
            // 꽃 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const x = Math.cos(angle) * size;
                const y = Math.sin(angle) * size;
                ctx.arc(x, y, size/3, 0, Math.PI * 2);
            }
            ctx.fill();
            break;
            
        case 'butterfly_shot':
            // 나비 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            // 왼쪽 날개
            ctx.ellipse(-size/2, -size/3, size/2, size/3, -Math.PI/4, 0, Math.PI * 2);
            // 오른쪽 날개
            ctx.ellipse(size/2, -size/3, size/2, size/3, Math.PI/4, 0, Math.PI * 2);
            // 몸통
            ctx.fillRect(-size/8, -size/2, size/4, size);
            ctx.fill();
            break;
            
            
        case 'chaos_shot':
            // 혼돈 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            for (let i = 0; i < 7; i++) {
                const angle = (i * Math.PI * 2) / 7;
                const radius = size * (0.5 + Math.random() * 0.5);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'ice_shot':
            // 빙설 모양 총알 - 육각형 모양 (크기 증가)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const x = Math.cos(angle) * scaledSize * 1.0;
                const y = Math.sin(angle) * scaledSize * 1.0;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'gear_shot':
            // 톱니바퀴 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                const outerRadius = scaledSize;
                const innerRadius = scaledSize * 0.6;
                const x1 = Math.cos(angle) * outerRadius;
                const y1 = Math.sin(angle) * outerRadius;
                const x2 = Math.cos(angle + Math.PI / 8) * innerRadius;
                const y2 = Math.sin(angle + Math.PI / 8) * innerRadius;
                if (i === 0) ctx.moveTo(x1, y1);
                else ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'moon_shot':
            // 달 모양 총알 (크기 증가, 테두리 제거)
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.arc(0, 0, scaledSize * 1.0, 0, Math.PI * 2);
            ctx.fill();
            // 초승달 모양을 위해 내부 원 그리기
            ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // 투명한 색으로 내부 원 제거
            ctx.beginPath();
            ctx.arc(scaledSize * 0.3, 0, scaledSize * 0.7, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'dragon_shot':
            // 용 모양 총알 - 몸통, 머리, 꼬리
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            // 몸통
            ctx.ellipse(0, 0, scaledSize * 0.8, scaledSize * 0.4, 0, 0, Math.PI * 2);
            // 머리
            ctx.ellipse(-scaledSize * 0.6, 0, scaledSize * 0.3, scaledSize * 0.3, 0, 0, Math.PI * 2);
            // 꼬리
            ctx.ellipse(scaledSize * 0.6, 0, scaledSize * 0.2, scaledSize * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'lightning_shot':
            // 번개 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.moveTo(0, -scaledSize);
            ctx.lineTo(scaledSize * 0.3, -scaledSize * 0.3);
            ctx.lineTo(-scaledSize * 0.2, 0);
            ctx.lineTo(scaledSize * 0.4, scaledSize * 0.3);
            ctx.lineTo(0, scaledSize);
            ctx.lineTo(-scaledSize * 0.4, scaledSize * 0.3);
            ctx.lineTo(scaledSize * 0.2, 0);
            ctx.lineTo(-scaledSize * 0.3, -scaledSize * 0.3);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'crystal_shot':
            // 수정 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.moveTo(0, -scaledSize);
            ctx.lineTo(scaledSize * 0.6, -scaledSize * 0.3);
            ctx.lineTo(scaledSize * 0.6, scaledSize * 0.3);
            ctx.lineTo(0, scaledSize);
            ctx.lineTo(-scaledSize * 0.6, scaledSize * 0.3);
            ctx.lineTo(-scaledSize * 0.6, -scaledSize * 0.3);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'leaf_shot':
            // 잎 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, scaledSize * 0.6, scaledSize * 0.3, 0, 0, Math.PI * 2);
            ctx.moveTo(0, -scaledSize * 0.3);
            ctx.lineTo(0, scaledSize * 0.3);
            ctx.stroke();
            ctx.fill();
            break;
            
        case 'gear_shot':
            // 톱니바퀴 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                const outerRadius = scaledSize;
                const innerRadius = scaledSize * 0.6;
                const x1 = Math.cos(angle) * outerRadius;
                const y1 = Math.sin(angle) * outerRadius;
                const x2 = Math.cos(angle + Math.PI/8) * innerRadius;
                const y2 = Math.sin(angle + Math.PI/8) * innerRadius;
                if (i === 0) ctx.moveTo(x1, y1);
                else ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'arrow_shot':
            // 화살 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.moveTo(0, -scaledSize);
            ctx.lineTo(scaledSize * 0.3, -scaledSize * 0.3);
            ctx.lineTo(scaledSize * 0.1, -scaledSize * 0.3);
            ctx.lineTo(scaledSize * 0.1, scaledSize * 0.3);
            ctx.lineTo(scaledSize * 0.3, scaledSize * 0.3);
            ctx.lineTo(0, scaledSize);
            ctx.lineTo(-scaledSize * 0.3, scaledSize * 0.3);
            ctx.lineTo(-scaledSize * 0.1, scaledSize * 0.3);
            ctx.lineTo(-scaledSize * 0.1, -scaledSize * 0.3);
            ctx.lineTo(-scaledSize * 0.3, -scaledSize * 0.3);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'shield_shot':
            // 방패 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.moveTo(0, -scaledSize);
            ctx.lineTo(scaledSize * 0.4, -scaledSize * 0.3);
            ctx.lineTo(scaledSize * 0.4, scaledSize * 0.3);
            ctx.lineTo(0, scaledSize);
            ctx.lineTo(-scaledSize * 0.4, scaledSize * 0.3);
            ctx.lineTo(-scaledSize * 0.4, -scaledSize * 0.3);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'crown_shot':
            // 왕관 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-scaledSize * 0.5, scaledSize * 0.3);
            ctx.lineTo(-scaledSize * 0.3, -scaledSize * 0.3);
            ctx.lineTo(-scaledSize * 0.1, -scaledSize * 0.1);
            ctx.lineTo(0, -scaledSize * 0.4);
            ctx.lineTo(scaledSize * 0.1, -scaledSize * 0.1);
            ctx.lineTo(scaledSize * 0.3, -scaledSize * 0.3);
            ctx.lineTo(scaledSize * 0.5, scaledSize * 0.3);
            ctx.lineTo(scaledSize * 0.4, scaledSize * 0.3);
            ctx.lineTo(scaledSize * 0.2, -scaledSize * 0.1);
            ctx.lineTo(0, -scaledSize * 0.2);
            ctx.lineTo(-scaledSize * 0.2, -scaledSize * 0.1);
            ctx.lineTo(-scaledSize * 0.4, scaledSize * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'windmill_spread':
            // 바람개비 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.lineWidth = 3;
            // 중심 원
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 바람개비 날개들
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI * 2) / 4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
                ctx.lineTo(Math.cos(angle + Math.PI/4) * size * 0.7, Math.sin(angle + Math.PI/4) * size * 0.7);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            break;
            
        case 'windmill_shot':
            // 바람개비 모양 총알
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.lineWidth = 3;
            // 중심 원
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 바람개비 날개들
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI * 2) / 4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
                ctx.lineTo(Math.cos(angle + Math.PI/4) * size * 0.7, Math.sin(angle + Math.PI/4) * size * 0.7);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            break;
            
        default:
            // 기본 원형 총알 - 밝은 단색
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}

// 보스 패턴별 색상 정의 (검정색과 대비되는 밝은색)
const BOSS_PATTERN_COLORS = {
    'basic': '#FFFFFF',                    // 흰색
    'circle_shot': '#FFFF00',             // 밝은 노란색
    'cross_shot': '#00FF00',              // 밝은 연녹색
    'spiral_shot': '#7FFFD4',             // 연청녹색
    'wave_shot': '#90EE90',               // 밝은 연녹색
    'diamond_shot': '#FFA500',            // 밝은 오렌지색
    'random_spread': '#00FF00',           // 밝은 연녹색
    'double_spiral': '#7FFFD4',           // 연청녹색
    'triple_wave': '#FFFF00',             // 밝은 노란색
    'targeted_shot': '#FFA500',           // 밝은 오렌지색
    'burst_shot': '#FFFFFF',              // 흰색
    'spread_circle': '#7FFFD4',           // 연청녹색
    'spread_cross': '#FFA500',            // 밝은 오렌지색
    'spread_spiral': '#00FF00',           // 밝은 연녹색
    'spread_wave': '#90EE90',             // 밝은 연녹색
    'spread_diamond': '#7FFFD4',          // 연청녹색
    'spread_burst': '#FFFFFF',            // 흰색
    'spread_targeted': '#FFFF00',         // 밝은 노란색
    'spread_random': '#FFFFFF',           // 흰색
    'mega_spread': '#FFA500',             // 밝은 오렌지색
    'chaos_spread': '#7FFFD4',            // 연청녹색
    // 새로운 모양 패턴 색상 (검정색과 대비되는 밝은색)
    'heart_shot': '#FF69B4',             // 밝은 핫핑크
    'star_shot': '#FFFF00',              // 밝은 노란색
    'flower_shot': '#FFFF00',            // 밝은 노란색
    'butterfly_shot': '#00FF00',         // 밝은 연녹색
    'ice_shot': '#7FFFD4',               // 연청녹색
    'gear_shot': '#FFFFFF',              // 흰색
    'moon_shot': '#FFFFFF',             // 흰색
    'windmill_spread': '#00FF00',       // 밝은 연녹색
    'windmill_shot': '#00FFFF'          // 밝은 청록색
};

// 보스 패턴 상수 추가
const BOSS_PATTERNS = {
    BASIC: 'basic',           // 기본 패턴 추가
    CIRCLE_SHOT: 'circle_shot',
    CROSS_SHOT: 'cross_shot',
    SPIRAL_SHOT: 'spiral_shot',
    WAVE_SHOT: 'wave_shot',
    DIAMOND_SHOT: 'diamond_shot',
    RANDOM_SPREAD: 'random_spread',
    DOUBLE_SPIRAL: 'double_spiral',
    TRIPLE_WAVE: 'triple_wave',
    TARGETED_SHOT: 'targeted_shot',
    BURST_SHOT: 'burst_shot',
    // 새로운 패턴들 추가
    SPREAD_CIRCLE: 'spread_circle',        // 확산 원형 패턴
    SPREAD_CROSS: 'spread_cross',          // 확산 십자 패턴
    SPREAD_SPIRAL: 'spread_spiral',        // 확산 나선 패턴
    SPREAD_WAVE: 'spread_wave',            // 확산 파도 패턴
    SPREAD_DIAMOND: 'spread_diamond',      // 확산 다이아몬드 패턴
    SPREAD_BURST: 'spread_burst',          // 확산 폭발 패턴
    SPREAD_TARGETED: 'spread_targeted',    // 확산 추적 패턴
    SPREAD_RANDOM: 'spread_random',        // 확산 랜덤 패턴
    MEGA_SPREAD: 'mega_spread',            // 메가 확산 패턴
    CHAOS_SPREAD: 'chaos_spread',          // 카오스 확산 패턴
    // 새로운 모양 패턴들
    HEART_SHOT: 'heart_shot',              // 하트 모양 패턴
    STAR_SHOT: 'star_shot',                // 별 모양 패턴
    FLOWER_SHOT: 'flower_shot',            // 꽃 모양 패턴
    BUTTERFLY_SHOT: 'butterfly_shot',      // 나비 모양 패턴
    ICE_SHOT: 'ice_shot',                  // 빙설 모양 패턴
    GEAR_SHOT: 'gear_shot',                // 톱니바퀴 모양 패턴
    MOON_SHOT: 'moon_shot',                 // 달 모양 패턴
    WINDMILL_SPREAD: 'windmill_spread',     // 바람개비 확산 패턴
    WINDMILL_SHOT: 'windmill_shot'          // 바람개비 샷 패턴
};

// 보스 패턴 상수 추가

// 헥스 색상을 RGB로 변환하는 함수
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// 키보드 입력 상태
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false,
    KeyB: false,  // 특수 무기 발사 키를 V에서 B로 변경
    F5: false,
    KeyP: false
};

// 난이도 설정
const difficultySettings = {
    1: { // 초급
        enemySpeed: 2,
        enemySpawnRate: 0.02,
        horizontalSpeedRange: 2,
        patternChance: 0.2,
        maxEnemies: 5,
        bossHealth: 1500,  // 3000 → 1500
        bossSpawnInterval: 60000, // 1분
        powerUpChance: 0.1,
        bombDropChance: 0.1,
        dynamiteDropChance: 0.05
    },
    2: { // 중급
        enemySpeed: 3,
        enemySpawnRate: 0.03,
        horizontalSpeedRange: 3,
        patternChance: 0.4,
        maxEnemies: 8,
        bossHealth: 2000,  // 4000 → 2000
        bossSpawnInterval: 45000, // 45초
        powerUpChance: 0.15,
        bombDropChance: 0.15,
        dynamiteDropChance: 0.1
    },
    3: { // 고급
        enemySpeed: 4,
        enemySpawnRate: 0.04,
        horizontalSpeedRange: 4,
        patternChance: 0.6,
        maxEnemies: 12,
        bossHealth: 2500,  // 5000 → 2500
        bossSpawnInterval: 30000, // 30초
        powerUpChance: 0.2,
        bombDropChance: 0.2,
        dynamiteDropChance: 0.15
    },
    4: { // 전문가
        enemySpeed: 5,
        enemySpawnRate: 0.05,
        horizontalSpeedRange: 5,
        patternChance: 0.8,
        maxEnemies: 15,
        bossHealth: 3000,  // 6000 → 3000
        bossSpawnInterval: 25000, // 25초
        powerUpChance: 0.25,
        bombDropChance: 0.25,
        dynamiteDropChance: 0.2
    },
    5: { // 마스터
        enemySpeed: 6,
        enemySpawnRate: 0.06,
        horizontalSpeedRange: 6,
        patternChance: 1.0,
        maxEnemies: 20,
        bossHealth: 3500,  // 7000 → 3500
        bossSpawnInterval: 20000, // 20초
        powerUpChance: 0.3,
        bombDropChance: 0.3,
        dynamiteDropChance: 0.25
    }
};

// IndexedDB 설정
const dbName = 'ShootingGameDB';
const dbVersion = 1;
const storeName = 'highScores';

// 최고 점수 로드 함수
async function loadHighScore() {
    try {
        console.log('점수 로드 시작...');
        let maxScore = 0;
        
        // localStorage에서 점수 로드 (가장 먼저)
        try {
            const localStorageScore = parseInt(localStorage.getItem('highScore')) || 0;
            const backupScore = parseInt(localStorage.getItem('highScore_backup')) || 0;
            maxScore = Math.max(maxScore, localStorageScore, backupScore);
            console.log('localStorage 점수:', { localStorageScore, backupScore });
        } catch (e) {
            console.warn('localStorage 로드 실패:', e);
        }
        
        // IndexedDB에서 점수 로드
        try {
            const indexedDBScore = await loadScoreFromIndexedDB();
            console.log('IndexedDB 점수:', indexedDBScore);
            maxScore = Math.max(maxScore, indexedDBScore);
        } catch (e) {
            console.warn('IndexedDB 로드 실패:', e);
        }
        
        // sessionStorage에서 점수 로드
        try {
            const sessionScore = parseInt(sessionStorage.getItem('currentHighScore')) || 0;
            maxScore = Math.max(maxScore, sessionScore);
            console.log('sessionStorage 점수:', sessionScore);
        } catch (e) {
            console.warn('sessionStorage 로드 실패:', e);
        }
        
        console.log('최종 선택된 점수:', maxScore);
        
        // 최고 점수가 있으면 모든 저장소에 동기화
        if (maxScore > 0) {
            try {
                // localStorage에 저장
                localStorage.setItem('highScore', maxScore.toString());
                localStorage.setItem('highScore_backup', maxScore.toString());
                localStorage.setItem('highScore_timestamp', Date.now().toString());
                
                // sessionStorage에 저장
                sessionStorage.setItem('currentHighScore', maxScore.toString());
                
                // IndexedDB에 저장
                await saveScoreToIndexedDB(maxScore);
                
                console.log('모든 저장소 동기화 완료');
            } catch (e) {
                console.warn('저장소 동기화 실패:', e);
            }
        }
        
        return maxScore;
    } catch (error) {
        console.error('점수 로드 실패:', error);
        return 0;
    }
}

// IndexedDB 초기화 함수
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = (event) => {
            console.error('IndexedDB 초기화 실패:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log('IndexedDB 초기화 성공');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                const store = db.createObjectStore(storeName, { keyPath: 'id' });
                store.createIndex('score', 'score', { unique: false });
                console.log('점수 저장소 생성 완료');
            }
        };
    });
}

// IndexedDB에 점수 저장
async function saveScoreToIndexedDB(score) {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const scoreData = {
                id: 'currentHighScore',
                score: score,
                timestamp: Date.now()
            };

            const request = store.put(scoreData);

            request.onsuccess = () => {
                console.log('IndexedDB 점수 저장 성공:', score);
                // localStorage에도 동시에 저장
                try {
                    localStorage.setItem('highScore', score.toString());
                    localStorage.setItem('highScore_backup', score.toString());
                    localStorage.setItem('highScore_timestamp', Date.now().toString());
                    console.log('localStorage 동시 저장 성공');
                } catch (e) {
                    console.warn('localStorage 동시 저장 실패:', e);
                }
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('IndexedDB 점수 저장 실패:', event.target.error);
                // IndexedDB 실패 시 localStorage에만 저장
                try {
                    localStorage.setItem('highScore', score.toString());
                    localStorage.setItem('highScore_backup', score.toString());
                    localStorage.setItem('highScore_timestamp', Date.now().toString());
                    console.log('localStorage 대체 저장 성공');
                    resolve(true);
                } catch (e) {
                    console.error('localStorage 대체 저장도 실패:', e);
                    reject(e);
                }
            };

            // 트랜잭션 완료 대기
            transaction.oncomplete = () => {
                console.log('IndexedDB 트랜잭션 완료');
            };

            transaction.onerror = (event) => {
                console.error('IndexedDB 트랜잭션 실패:', event.target.error);
            };
        });
    } catch (error) {
        console.error('IndexedDB 저장 중 오류:', error);
        // IndexedDB 실패 시 localStorage에만 저장
        try {
            localStorage.setItem('highScore', score.toString());
            localStorage.setItem('highScore_backup', score.toString());
            localStorage.setItem('highScore_timestamp', Date.now().toString());
            console.log('localStorage 대체 저장 성공');
            return true;
        } catch (e) {
            console.error('localStorage 대체 저장도 실패:', e);
            return false;
        }
    }
}

// IndexedDB에서 점수 로드
async function loadScoreFromIndexedDB() {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get('currentHighScore');

            request.onsuccess = () => {
                const result = request.result;
                const score = result ? result.score : 0;
                console.log('IndexedDB에서 로드된 점수:', score);
                
                // localStorage와 비교하여 더 높은 점수 사용
                try {
                    const localScore = parseInt(localStorage.getItem('highScore')) || 0;
                    const backupScore = parseInt(localStorage.getItem('highScore_backup')) || 0;
                    const maxScore = Math.max(score, localScore, backupScore);
                    
                    if (maxScore > score) {
                        console.log('localStorage에서 더 높은 점수 발견:', maxScore);
                        // 더 높은 점수를 IndexedDB에 저장
                        saveScoreToIndexedDB(maxScore).catch(console.error);
                    }
                    
                    resolve(maxScore);
                } catch (e) {
                    console.warn('localStorage 비교 중 오류:', e);
                    resolve(score);
                }
            };

            request.onerror = (event) => {
                console.error('IndexedDB 점수 로드 실패:', event.target.error);
                // IndexedDB 실패 시 localStorage에서 로드
                try {
                    const localScore = parseInt(localStorage.getItem('highScore')) || 0;
                    const backupScore = parseInt(localStorage.getItem('highScore_backup')) || 0;
                    const maxScore = Math.max(localScore, backupScore);
                    console.log('localStorage에서 로드된 점수:', maxScore);
                    resolve(maxScore);
                } catch (e) {
                    console.error('localStorage 로드도 실패:', e);
                    reject(e);
                }
            };
        });
    } catch (error) {
        console.error('IndexedDB 로드 중 오류:', error);
        // localStorage에서 로드 시도
        try {
            const localScore = parseInt(localStorage.getItem('highScore')) || 0;
            const backupScore = parseInt(localStorage.getItem('highScore_backup')) || 0;
            const maxScore = Math.max(localScore, backupScore);
            console.log('localStorage에서 로드된 점수:', maxScore);
            return maxScore;
        } catch (e) {
            console.error('localStorage 로드도 실패:', e);
            return 0;
        }
    }
}

// 점수 저장 함수
async function saveHighScoreDirectly(newScore, reason = '') {
    try {
        // 현재 저장된 점수 확인
        const currentStored = parseInt(localStorage.getItem('highScore')) || 0;
        console.log('현재 저장된 점수:', currentStored, '새 점수:', newScore);
        
        // 새 점수가 더 높은 경우에만 저장
        if (newScore > currentStored) {
            // localStorage에 저장 (가장 먼저)
            try {
                localStorage.setItem('highScore', newScore.toString());
                localStorage.setItem('highScore_backup', newScore.toString());
                localStorage.setItem('highScore_timestamp', Date.now().toString());
                console.log('localStorage 저장 성공');
            } catch (e) {
                console.warn('localStorage 저장 실패:', e);
            }
            
            // sessionStorage에 저장
            try {
                sessionStorage.setItem('currentHighScore', newScore.toString());
                console.log('sessionStorage 저장 성공');
            } catch (e) {
                console.warn('sessionStorage 저장 실패:', e);
            }
            
            // IndexedDB에 저장
            try {
                const saved = await saveScoreToIndexedDB(newScore);
                if (!saved) {
                    throw new Error('IndexedDB 저장 실패');
                }
                console.log('IndexedDB 저장 성공');
            } catch (e) {
                console.error('IndexedDB 저장 실패:', e);
            }
            
            console.log(`최고 점수 저장 성공 (${reason}):`, {
                previous: currentStored,
                new: newScore
            });
        }
        return true;
    } catch (error) {
        console.error('점수 저장 실패:', error);
        return false;
    }
}

// 점수 관리 객체 수정
const ScoreManager = {
    async init() {
        try {
            console.log('ScoreManager 초기화 시작');
            // Electron IPC를 통해 점수 로드
            highScore = await window.electron.ipcRenderer.invoke('load-score');
            
            // 현재 점수 초기화
            score = 0;
            levelScore = 0;
            
            console.log('초기화 완료 - 현재 최고 점수:', highScore);
        } catch (error) {
            console.error('초기화 실패:', error);
            highScore = 0;
        }
    },

    async save() {
        try {
            if (score > highScore) {
                highScore = score;
                // Electron IPC를 통해 점수 저장
                const saved = await window.electron.ipcRenderer.invoke('save-score', highScore);
                if (saved) {
                    console.log('점수 저장 성공:', highScore);
                }
            }
        } catch (error) {
            console.error('점수 저장 실패:', error);
        }
    },

    async getHighScore() {
        try {
            // Electron IPC를 통해 점수 로드
            return await window.electron.ipcRenderer.invoke('load-score');
        } catch (error) {
            console.error('최고 점수 로드 실패:', error);
            return 0;
        }
    },

    async reset() {
        try {
            // Electron IPC를 통해 점수 초기화
            await window.electron.ipcRenderer.invoke('reset-score');
            
            score = 0;
            levelScore = 0;
            gameLevel = 1;
            
            highScore = await this.getHighScore();
            console.log('게임 리셋 - 현재 최고 점수:', highScore);
        } catch (error) {
            console.error('게임 리셋 중 오류:', error);
        }
    }
};

// 자동 저장 기능 수정
setInterval(async () => {
    if (score > 0 || highScore > 0) {
        const currentMax = Math.max(score, highScore);
        await saveHighScoreDirectly(currentMax, 'AutoSave');
    }
}, 5000);

// 브라우저 종료 시 점수 저장을 위한 이벤트 핸들러들
function setupExitHandlers() {
    // 페이지 가시성 변경 시
    document.addEventListener('visibilitychange', async () => {
        if (document.hidden) {
            const currentMax = Math.max(score, highScore);
            if (currentMax > 0) {
                await saveHighScoreDirectly(currentMax, 'visibilitychange');
            }
        }
    });

    // 페이지 언로드 시
    window.addEventListener('unload', async (event) => {
        const finalScore = Math.max(score, highScore);
        if (finalScore > 0) {
            // 동기적으로 localStorage에 저장
            try {
                localStorage.setItem('highScore', finalScore.toString());
                localStorage.setItem('highScore_backup', finalScore.toString());
                localStorage.setItem('highScore_timestamp', Date.now().toString());
                console.log('unload 이벤트에서 localStorage 저장 성공');
            } catch (e) {
                console.error('unload 이벤트에서 localStorage 저장 실패:', e);
            }
            
            // IndexedDB 저장 시도
            try {
                await saveScoreToIndexedDB(finalScore);
                console.log('unload 이벤트에서 IndexedDB 저장 성공');
            } catch (e) {
                console.error('unload 이벤트에서 IndexedDB 저장 실패:', e);
            }
        }
    });

    // 페이지 숨김 시
    window.addEventListener('pagehide', async (event) => {
        const finalScore = Math.max(score, highScore);
        if (finalScore > 0) {
            await saveHighScoreDirectly(finalScore, 'pagehide');
        }
    });

    // 페이지 언로드 전
    window.addEventListener('beforeunload', async (event) => {
        const finalScore = Math.max(score, highScore);
        if (finalScore > 0) {
            // 동기적으로 localStorage에 먼저 저장
            try {
                localStorage.setItem('highScore', finalScore.toString());
                localStorage.setItem('highScore_backup', finalScore.toString());
                localStorage.setItem('highScore_timestamp', Date.now().toString());
                console.log('beforeunload 이벤트에서 localStorage 저장 성공');
            } catch (e) {
                console.error('beforeunload 이벤트에서 localStorage 저장 실패:', e);
            }
            
            // IndexedDB 저장 시도
            try {
                await saveScoreToIndexedDB(finalScore);
                console.log('beforeunload 이벤트에서 IndexedDB 저장 성공');
            } catch (e) {
                console.error('beforeunload 이벤트에서 IndexedDB 저장 실패:', e);
            }
            
            // 저장이 완료될 때까지 잠시 대기
            const start = Date.now();
            while (Date.now() - start < 200) {
                // 200ms 동안 대기
            }
        }
    });
}

// 게임 초기화 함수 수정
async function initializeGame() {
    console.log('게임 초기화 시작');
    isGameActive = true;
    isSoundControlActive = false;
    
    try {
        // 종료 이벤트 핸들러 설정
        setupExitHandlers();
        
        // 최고 점수 로드
        highScore = await loadHighScore();
        console.log('초기화된 최고 점수:', highScore);
        
        // === 모든 게임 요소 완전 초기화 ===
        
        // 1. 충돌 및 게임 상태 초기화
        collisionCount = 0;
        maxLives = 5;  // 최대 목숨 초기화
        lastLifeCount = 5;  // 이전 목숨 수 초기화
        hasSecondPlane = false;
        secondPlaneTimer = 0;
        
        // 2. 모든 배열 완전 초기화
        score = 0;
        levelScore = 0;
        bullets = [];           // 총알 배열 초기화
        enemies = [];           // 적 비행기 배열 초기화
        explosions = [];        // 폭발 효과 배열 초기화
        bombs = [];             // 폭탄 배열 초기화
        dynamites = [];         // 다이나마이트 배열 초기화
        powerUps = [];          // 파워업 배열 초기화
        snakeEnemies = [];      // 뱀 패턴 적 배열 초기화
        snakeGroups = [];       // 뱀 패턴 그룹 배열 초기화
        
        // 3. 게임 상태 초기화
        isGameOver = false;
        isPaused = false;
        flashTimer = 0;
        gameOverStartTime = null;
        
        // 4. 뱀 패턴 상태 초기화
        isSnakePatternActive = false;
        snakePatternTimer = 0;
        snakePatternInterval = 0;
        lastSnakeGroupTime = 0;
        
        // 5. 보스 관련 상태 완전 초기화
        bossActive = false;
        bossHealth = 0;
        bossDestroyed = false;
        bossPattern = 0;
        lastBossSpawnTime = Date.now();
        

        
        // 6. 플레이어 초기 위치 설정
        player.x = canvas.width / 2;
        player.y = canvas.height - 80;
        secondPlane.x = canvas.width / 2 - 60;
        secondPlane.y = canvas.height - 80;
        
        // 7. 게임 타이머 초기화
        lastEnemySpawnTime = 0;
        
        // 8. 파워업 상태 초기화
        hasSpreadShot = false;
        hasShield = false;
        damageMultiplier = 1;
        fireRateMultiplier = 1;
        
        // 9. 발사 관련 상태 초기화
        lastFireTime = 0;
        isSpacePressed = false;
        spacePressTime = 0;
        fireDelay = 600;
        continuousFireDelay = 50;
        bulletSpeed = 12;
        baseBulletSize = 4.5;
        isContinuousFire = false;
        canFire = true;
        lastReleaseTime = 0;
        singleShotCooldown = 500;
        minPressDuration = 200;
        minReleaseDuration = 100;
        
        // 10. 특수무기 관련 상태 초기화
        specialWeaponCharged = false;
        specialWeaponCharge = 0;
        specialWeaponCount = 0;
        
        // 11. 키보드 입력 상태 초기화
        Object.keys(keys).forEach(key => {
            keys[key] = false;
        });
        
        // 12. 사운드 관련 상태 초기화
        lastCollisionTime = 0;
        lastExplosionTime = 0;
        suppressCollisionSfxUntil = 0;
        suppressCollisionSfxUntil = 0;
        
        // 13. 패턴 추적 시스템 초기화
        levelBossPatterns.usedPatterns = [];
        levelBossPatterns.currentLevelPattern = null;
        
        console.log('게임 상태 초기화 완료');
        console.log('초기화된 상태:', {
            enemies: enemies.length,
            bullets: bullets.length,
            explosions: explosions.length,
            bombs: bombs.length,
            dynamites: dynamites.length,
            powerUps: powerUps.length,
            snakeGroups: snakeGroups.length,
            bossActive: bossActive,
            isSnakePatternActive: isSnakePatternActive
        });
        
        // 게임 루프 시작
        requestAnimationFrame(gameLoop);
        console.log('게임 루프 시작됨');
        
    } catch (error) {
        console.error('게임 초기화 중 오류:', error);
    }
}

// 게임 재시작 함수 수정
function restartGame() {
    // 게임 상태 초기화
    isGameActive = true;
    isSoundControlActive = false;
    isGameOver = false;
    
    console.log('게임 재시작 - 재시작 전 최고 점수:', highScore);
    
    // 현재 최고 점수 저장
    const currentHighScore = Math.max(score, highScore);
    if (currentHighScore > 0) {
        saveHighScoreDirectly(currentHighScore, 'restartGame');
    }
    
    // === 모든 게임 요소 완전 초기화 ===
    
    // 1. 충돌 및 게임 상태 초기화
    collisionCount = 0;
    maxLives = 5;  // 최대 목숨 초기화
    lastLifeCount = 5;  // 이전 목숨 수 초기화
    hasSecondPlane = false;
    secondPlaneTimer = 0;
    
    // 2. 모든 배열 완전 초기화
    enemies = [];           // 적 비행기 배열 초기화
    bullets = [];           // 총알 배열 초기화
    explosions = [];        // 폭발 효과 배열 초기화
    bombs = [];             // 폭탄 배열 초기화
    dynamites = [];         // 다이나마이트 배열 초기화
    powerUps = [];          // 파워업 배열 초기화
    snakeEnemies = [];      // 뱀 패턴 적 배열 초기화
    snakeGroups = [];       // 뱀 패턴 그룹 배열 초기화
    
    // 3. 플레이어 위치 초기화
    player.x = canvas.width / 2;
    player.y = canvas.height - 80;
    secondPlane.x = canvas.width / 2 - 60;
    secondPlane.y = canvas.height - 80;
    
    // 4. 게임 타이머 및 상태 초기화
    gameOverStartTime = null;
    flashTimer = 0;
    lastEnemySpawnTime = 0;
    lastBossSpawnTime = Date.now();
    
    // 5. 점수 및 레벨 초기화
    score = 0;
    levelScore = 0;
    gameLevel = 1;
    levelUpScore = 1000;
    
    // 6. 특수무기 관련 상태 초기화
    specialWeaponCharged = false;
    specialWeaponCharge = 0;
    specialWeaponCount = 0;
    
    // 7. 보스 관련 상태 완전 초기화
    bossActive = false;
    bossHealth = 0;
    bossDestroyed = false;
    bossPattern = 0;
    
    // 8. 뱀 패턴 상태 초기화
    isSnakePatternActive = false;
    snakePatternTimer = 0;
    snakePatternInterval = 0;
    lastSnakeGroupTime = 0;
    
    // 9. 파워업 상태 초기화
    hasSpreadShot = false;
    hasShield = false;
    damageMultiplier = 1;
    fireRateMultiplier = 1;
    
    // 10. 발사 관련 상태 초기화
    lastFireTime = 0;
    isSpacePressed = false;
    spacePressTime = 0;
    fireDelay = 600;
    continuousFireDelay = 50;
    bulletSpeed = 12;
    baseBulletSize = 4.5;
    isContinuousFire = false;
    canFire = true;
    lastReleaseTime = 0;
    singleShotCooldown = 500;
    minPressDuration = 200;
    minReleaseDuration = 100;
    
    // 11. 키보드 입력 상태 초기화
    Object.keys(keys).forEach(key => {
        keys[key] = false;
    });
    
    // 12. 게임 화면 상태 초기화
    isStartScreen = false;
    isPaused = false;
    
            // 13. 사운드 관련 상태 초기화
        lastCollisionTime = 0;
        lastExplosionTime = 0;
        suppressCollisionSfxUntil = 0;
        
        // 14. 경고음 초기화
        initializeWarningSound();
    
    // 14. 패턴 추적 시스템 초기화
    levelBossPatterns.usedPatterns = [];
    levelBossPatterns.currentLevelPattern = null;
    
    // 15. 캔버스 포커스 설정
    setTimeout(() => {
        document.getElementById('gameCanvas').focus();
    }, 100);
    
    // 패턴 사용 기록 초기화
    resetPatternUsage();
    
    console.log('게임 재시작 완료 - 모든 요소 초기화됨');
    console.log('현재 최고 점수:', highScore);
    console.log('초기화된 상태:', {
        enemies: enemies.length,
        bullets: bullets.length,
        explosions: explosions.length,
        bombs: bombs.length,
        dynamites: dynamites.length,
        powerUps: powerUps.length,
        snakeGroups: snakeGroups.length,
        bossActive: bossActive,
        isSnakePatternActive: isSnakePatternActive
    });
}

// 적 생성 함수 수정
function createEnemy() {
    const currentDifficulty = difficultySettings[Math.min(gameLevel, 5)] || {
        enemySpeed: 6 + (gameLevel - 5) * 0.5,
        enemySpawnRate: 0.06 + (gameLevel - 5) * 0.01,
        horizontalSpeedRange: 6 + (gameLevel - 5) * 0.5,
        patternChance: 1.0,
        maxEnemies: 20 + (gameLevel - 5) * 2,
        bossHealth: 1000 + (gameLevel - 5) * 250,  // 2000 → 1000, 500 → 250
        bossSpawnInterval: Math.max(10000, 20000 - (gameLevel - 5) * 1000),
        powerUpChance: 0.3,
        bombDropChance: 0.3,
        dynamiteDropChance: 0.25
    };
    
    // 뱀 패턴 시작 확률 (난이도에 따라 증가) - 확률 증가
    if (!isSnakePatternActive && Math.random() < currentDifficulty.patternChance * 0.8) {
        startSnakePattern();
    }

    // 패턴 선택 확률 조정
    const patterns = Object.values(ENEMY_PATTERNS);
    const enemyType = Math.random() < currentDifficulty.patternChance ? 
        patterns[Math.floor(Math.random() * patterns.length)] : ENEMY_PATTERNS.NORMAL;
    
    // 적 생성 위치 계산
    const spawnX = Math.random() * (canvas.width - 30);
    const spawnY = -30;
    
    const enemy = {
        x: spawnX,
        y: spawnY,
        width: 30,
        height: 30,
        speed: currentDifficulty.enemySpeed,
        horizontalSpeed: (Math.random() - 0.5) * currentDifficulty.horizontalSpeedRange,
        direction: Math.random() < 0.5 ? -1 : 1,
        type: enemyType,
        verticalDirection: 1,
        verticalSpeed: currentDifficulty.enemySpeed * 1.5,
        patternTimer: 0,
        patternDuration: 2000 - (gameLevel * 200),
        circleAngle: Math.random() * Math.PI * 2,
        circleRadius: 50 + (gameLevel * 10),
        circleCenterX: spawnX,
        circleCenterY: spawnY,
        diagonalDirection: Math.random() < 0.5 ? 1 : -1,
        diveSpeed: currentDifficulty.enemySpeed * 2.5,
        isDiving: false,
        originalY: spawnY,
        spiralAngle: 0,
        spiralRadius: 30,
        waveAngle: 0,
        waveAmplitude: 50,
        waveFrequency: 0.02,
        vFormationOffset: 0,
        vFormationAngle: Math.PI / 4,
        randomDirectionChangeTimer: 0,
        lastUpdateTime: Date.now(),
        canDropBomb: Math.random() < currentDifficulty.bombDropChance,
        canDropDynamite: Math.random() < currentDifficulty.dynamiteDropChance,
        lastBombDrop: 0,
        lastDynamiteDrop: 0,
        bombDropInterval: 2000 + Math.random() * 3000,
        dynamiteDropInterval: 3000 + Math.random() * 4000,
        // 새로운 역동적인 속성들 추가
        bounceHeight: 100 + Math.random() * 50,
        bounceSpeed: 0.05 + Math.random() * 0.05,
        bounceAngle: 0,
        chaseSpeed: currentDifficulty.enemySpeed * 1.2,
        figureEightAngle: 0,
        figureEightRadius: 40 + Math.random() * 20,
        pendulumAngle: Math.random() * Math.PI * 2,
        pendulumSpeed: 0.03 + Math.random() * 0.02,
        pendulumAmplitude: 60 + Math.random() * 40,
        vortexAngle: 0,
        vortexRadius: 30 + Math.random() * 20,
        vortexSpeed: 0.04 + Math.random() * 0.03,
        teleportTimer: 0,
        teleportInterval: 3000 + Math.random() * 2000,
        mirrorOffset: Math.random() * canvas.width,
        accelerateTimer: 0,
        accelerateInterval: 2000 + Math.random() * 3000,
        baseSpeed: currentDifficulty.enemySpeed,
        maxSpeed: currentDifficulty.enemySpeed * 3,
        currentSpeed: currentDifficulty.enemySpeed
    };
    enemies.push(enemy);
    
    // 파워업 아이템 생성 확률 (난이도에 따라 증가)
    if (Math.random() < currentDifficulty.powerUpChance) {
        createPowerUp();
    }
}

// 적 위치 업데이트 함수 수정
function updateEnemyPosition(enemy) {
    const currentTime = Date.now();
    const deltaTime = currentTime - enemy.lastUpdateTime;
    enemy.lastUpdateTime = currentTime;
    
    // 적군이 화면 상단에 머무르지 않도록 기본 하강 속도 추가
    const baseSpeed = enemy.speed || 2;
    
    switch(enemy.type) {
        case ENEMY_PATTERNS.ZIGZAG:
            // 지그재그 패턴 - 더 역동적으로 개선
            enemy.x += Math.sin(enemy.y * 0.12) * enemy.speed * 4; // 더 큰 진폭과 빠른 주기
            enemy.y += baseSpeed * 1.4; // 더 빠른 하강
            // 추가적인 좌우 흔들림
            enemy.x += Math.sin(Date.now() * 0.01) * 2;
            break;
            
        case ENEMY_PATTERNS.CIRCLE:
            // 원형 회전 패턴 - 더 빠르고 역동적으로
            enemy.circleAngle += 0.12; // 더 빠른 회전
            enemy.circleRadius += Math.sin(Date.now() * 0.005) * 0.5; // 반지름 변화
            enemy.x = enemy.circleCenterX + Math.cos(enemy.circleAngle) * enemy.circleRadius;
            enemy.y = enemy.circleCenterY + Math.sin(enemy.circleAngle) * enemy.circleRadius + baseSpeed * 1.8; // 더 빠른 하강
            break;
            
        case ENEMY_PATTERNS.DIAGONAL:
            // 대각선 다이빙 패턴 - 더 급격하게
            if (!enemy.isDiving) {
                enemy.x += enemy.diagonalDirection * enemy.speed * 2; // 더 빠른 좌우 이동
                enemy.y += baseSpeed * 1.0; // 약간 느린 하강으로 다이빙 준비
                if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
                    enemy.isDiving = true;
                    enemy.originalY = enemy.y;
                }
            } else {
                enemy.y += enemy.diveSpeed * 1.5; // 더 빠른 다이빙
                enemy.x += enemy.diagonalDirection * enemy.speed * 0.5; // 다이빙 중에도 약간의 좌우 이동
                if (enemy.y >= enemy.originalY + 300) { // 더 깊은 다이빙
                    enemy.isDiving = false;
                    enemy.diagonalDirection *= -1;
                }
            }
            break;
            
        case ENEMY_PATTERNS.SPIRAL:
            // 나선형 패턴 - 더 복잡하게
            enemy.spiralAngle += 0.12; // 더 빠른 회전
            enemy.spiralRadius += 1.2; // 더 빠른 확장
            enemy.x = enemy.circleCenterX + Math.cos(enemy.spiralAngle) * enemy.spiralRadius;
            enemy.y = enemy.circleCenterY + Math.sin(enemy.spiralAngle) * enemy.spiralRadius + baseSpeed * 1.6;
            // 추가적인 진동 효과
            enemy.x += Math.sin(enemy.spiralAngle * 3) * 3;
            break;
            
        case ENEMY_PATTERNS.WAVE:
            // 파도형 패턴 - 더 큰 진폭으로
            enemy.waveAngle += enemy.waveFrequency * 2; // 더 빠른 파도
            enemy.x += Math.sin(enemy.waveAngle) * enemy.waveAmplitude * 0.2; // 더 큰 진폭
            enemy.y += baseSpeed * 1.3; // 더 빠른 하강
            // 추가적인 상하 움직임
            enemy.y += Math.sin(enemy.waveAngle * 2) * 2;
            break;
            
        case ENEMY_PATTERNS.CROSS:
            // 십자형 패턴 - 더 빠른 방향 전환
            if (currentTime - enemy.patternTimer >= enemy.patternDuration * 0.7) {
                enemy.patternTimer = currentTime;
                enemy.direction *= -1;
            }
            enemy.x += enemy.speed * enemy.direction * 1.4;
            enemy.y += baseSpeed * 1.2;
            break;
            
        case ENEMY_PATTERNS.V_SHAPE:
            // V자형 패턴 - 더 역동적으로
            enemy.vFormationOffset += 0.15;
            enemy.x += Math.cos(enemy.vFormationAngle) * enemy.speed * 1.3;
            enemy.y += baseSpeed * 1.1;
            enemy.vFormationAngle += Math.sin(enemy.vFormationOffset) * 0.03;
            break;
            
        case ENEMY_PATTERNS.RANDOM:
            // 랜덤 패턴 - 더 자주 방향 변경
            if (currentTime - enemy.randomDirectionChangeTimer >= 800) {
                enemy.randomDirectionChangeTimer = currentTime;
                enemy.direction = Math.random() < 0.5 ? -1 : 1;
                enemy.verticalDirection = Math.random() < 0.5 ? -1 : 1;
            }
            enemy.x += enemy.speed * enemy.direction * 1.2;
            enemy.y += baseSpeed * 1.1;
            break;
            
        case ENEMY_PATTERNS.BOUNCE:
            // 튀어오르는 패턴
            enemy.bounceAngle += enemy.bounceSpeed;
            enemy.x += Math.sin(enemy.bounceAngle) * enemy.speed * 2;
            enemy.y += baseSpeed + Math.abs(Math.sin(enemy.bounceAngle)) * 2;
            break;
            
        case ENEMY_PATTERNS.CHASE:
            // 플레이어 추적 패턴
            const targetX = player.x;
            const targetY = player.y;
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.chaseSpeed;
                enemy.y += (dy / distance) * enemy.chaseSpeed;
            }
            break;
            
        case ENEMY_PATTERNS.FIGURE_EIGHT:
            // 8자 패턴
            enemy.figureEightAngle += 0.06;
            const t = enemy.figureEightAngle;
            enemy.x = enemy.circleCenterX + Math.sin(t) * enemy.figureEightRadius;
            enemy.y = enemy.circleCenterY + Math.sin(t) * Math.cos(t) * enemy.figureEightRadius + baseSpeed;
            break;
            
        case ENEMY_PATTERNS.PENDULUM:
            // 진자 패턴
            enemy.pendulumAngle += enemy.pendulumSpeed;
            enemy.x = enemy.circleCenterX + Math.sin(enemy.pendulumAngle) * enemy.pendulumAmplitude;
            enemy.y += baseSpeed * 1.2;
            break;
            
        case ENEMY_PATTERNS.VORTEX:
            // 소용돌이 패턴
            enemy.vortexAngle += enemy.vortexSpeed;
            enemy.vortexRadius += 0.3;
            enemy.x = enemy.circleCenterX + Math.cos(enemy.vortexAngle) * enemy.vortexRadius;
            enemy.y = enemy.circleCenterY + Math.sin(enemy.vortexAngle) * enemy.vortexRadius + baseSpeed;
            break;
            
        case ENEMY_PATTERNS.TELEPORT:
            // 순간이동 패턴
            enemy.y += baseSpeed;
            if (currentTime - enemy.teleportTimer >= enemy.teleportInterval) {
                enemy.teleportTimer = currentTime;
                enemy.x = Math.random() * (canvas.width - enemy.width);
                enemy.y = Math.max(enemy.y - 100, 0); // 위로 순간이동
            }
            break;
            
        case ENEMY_PATTERNS.MIRROR:
            // 거울 패턴 (플레이어 반대 방향)
            const mirrorX = canvas.width - player.x;
            const targetMirrorX = mirrorX + (enemy.mirrorOffset - canvas.width / 2);
            const dxMirror = targetMirrorX - enemy.x;
            enemy.x += dxMirror * 0.02;
            enemy.y += baseSpeed * 1.1;
            break;
            
        case ENEMY_PATTERNS.ACCELERATE:
            // 가속 패턴
            if (currentTime - enemy.accelerateTimer >= enemy.accelerateInterval) {
                enemy.accelerateTimer = currentTime;
                enemy.currentSpeed = Math.min(enemy.currentSpeed * 1.5, enemy.maxSpeed);
            }
            enemy.x += Math.sin(enemy.y * 0.05) * enemy.currentSpeed;
            enemy.y += enemy.currentSpeed;
            break;
            
        default: // NORMAL
            // 기본 패턴도 약간의 랜덤성 추가
            enemy.x += Math.sin(enemy.y * 0.03) * enemy.speed * 0.5;
            enemy.y += baseSpeed;
    }
    
    // 화면 경계 체크 및 반전
    if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
        enemy.direction *= -1;
    }
    if (enemy.y <= 0 || enemy.y >= canvas.height - enemy.height) {
        enemy.verticalDirection *= -1;
    }
    
    // 폭탄 투하 체크
    if (enemy.canDropBomb && currentTime - enemy.lastBombDrop >= enemy.bombDropInterval) {
        createBomb(enemy);
        enemy.lastBombDrop = currentTime;
    }
    
    // 다이나마이트 투하 체크
    if (enemy.canDropDynamite && currentTime - enemy.lastDynamiteDrop >= enemy.dynamiteDropInterval) {
        createDynamite(enemy);
        enemy.lastDynamiteDrop = currentTime;
    }
}

// 패턴 타입 상수 수정
const PATTERN_TYPES = {
    SNAKE: 'snake',      // S자 움직임
    VERTICAL: 'vertical', // 세로 움직임
    DIAGONAL: 'diagonal', // 대각선 움직임
    HORIZONTAL: 'horizontal', // 가로 움직임
    SPIRAL: 'spiral',     // 나선형 움직임
    // 새로운 역동적인 뱀 패턴들 추가
    WAVE: 'wave',         // 파도형 움직임
    ZIGZAG: 'zigzag',     // 지그재그 움직임
    CIRCLE: 'circle',     // 원형 움직임
    VORTEX: 'vortex',     // 소용돌이 움직임
    CHASE: 'chase',       // 플레이어 추적 움직임
    BOUNCE: 'bounce',     // 튀어오르는 움직임
    MIRROR: 'mirror'      // 거울 움직임
};

// 뱀 패턴 시작 함수 수정
function startSnakePattern() {
    isSnakePatternActive = true;
    snakePatternTimer = Date.now();
    
    // 새로운 뱀 그룹 생성
    const newGroup = {
        enemies: [],
        startTime: Date.now(),
        patternInterval: 0,
        isActive: true,
        startX: getRandomStartPosition(),
        startY: -30,
        patternType: getRandomPatternType(),
        direction: Math.random() < 0.5 ? 1 : -1,
        angle: 0,
        speed: 3 + Math.random() * 3, // 더 빠른 속도 (2-5에서 3-6으로)
        amplitude: Math.random() * 100 + 150,
        frequency: Math.random() * 0.5 + 0.75,
        spiralRadius: 50,
        spiralAngle: 0,
        initialEnemiesCreated: false,
        // 새로운 역동적인 속성들 추가
        waveAngle: 0,
        waveAmplitude: 80 + Math.random() * 60,
        waveFrequency: 0.03 + Math.random() * 0.02,
        zigzagAngle: 0,
        zigzagAmplitude: 60 + Math.random() * 40,
        zigzagFrequency: 0.04 + Math.random() * 0.03,
        circleRadius: 40 + Math.random() * 30,
        circleAngle: 0,
        circleSpeed: 0.05 + Math.random() * 0.03,
        vortexRadius: 30 + Math.random() * 20,
        vortexAngle: 0,
        vortexSpeed: 0.06 + Math.random() * 0.04,
        chaseSpeed: 3 + Math.random() * 2,
        bounceHeight: 50 + Math.random() * 30,
        bounceSpeed: 0.08 + Math.random() * 0.05,
        bounceAngle: 0,
        mirrorOffset: Math.random() * canvas.width,
        patternChangeTimer: 0,
        patternChangeInterval: 5000 + Math.random() * 3000, // 패턴 변경 간격
        currentSpeed: 2 + Math.random() * 2,
        maxSpeed: 5 + Math.random() * 3
    };
    
    // 첫 번째 적 생성
    const firstEnemy = {
        x: newGroup.startX,
        y: newGroup.startY,
        width: 30,
        height: 30,
        speed: newGroup.speed,
        type: 'snake',
        targetX: newGroup.startX,
        targetY: newGroup.startY,
        angle: 0,
        isHit: false,
        amplitude: newGroup.amplitude,
        frequency: newGroup.frequency,
        lastChange: Date.now(),
        // 새로운 속성들 추가
        waveAngle: newGroup.waveAngle,
        zigzagAngle: newGroup.zigzagAngle,
        circleAngle: newGroup.circleAngle,
        vortexAngle: newGroup.vortexAngle,
        bounceAngle: newGroup.bounceAngle,
        currentSpeed: newGroup.currentSpeed
    };
    newGroup.enemies.push(firstEnemy);
    snakeGroups.push(newGroup);
}

// 그룹별 시작 위치 계산 함수 추가
function getRandomStartPosition() {
    // 화면을 4등분하여 각 구역별로 다른 시작 위치 설정
    const section = Math.floor(Math.random() * 4);
    const sectionWidth = canvas.width / 4;
    
    switch(section) {
        case 0: // 왼쪽 구역
            return Math.random() * (sectionWidth * 0.5) + 50;
        case 1: // 중앙 왼쪽 구역
            return Math.random() * (sectionWidth * 0.5) + sectionWidth;
        case 2: // 중앙 오른쪽 구역
            return Math.random() * (sectionWidth * 0.5) + sectionWidth * 2;
        case 3: // 오른쪽 구역
            return Math.random() * (sectionWidth * 0.5) + sectionWidth * 3;
    }
}

// 랜덤 패턴 타입 선택 함수 추가
function getRandomPatternType() {
    const types = Object.values(PATTERN_TYPES);
    return types[Math.floor(Math.random() * types.length)];
}

// 충돌 감지 함수 수정
function checkCollision(rect1, rect2) {
    // 충돌 영역을 더 정확하게 계산
    const margin = 2;  // 충돌 마진을 줄임
    return rect1.x + margin < rect2.x + rect2.width - margin &&
           rect1.x + rect1.width - margin > rect2.x + margin &&
           rect1.y + margin < rect2.y + rect2.height - margin &&
           rect1.y + rect1.height - margin > rect2.y + margin;
}

// 충돌 처리 함수 수정
function handleCollision() {
    if (hasShield) {
        hasShield = false;
        return;
    }
    
    const currentTime = Date.now();
    collisionCount++;
    flashTimer = flashDuration;
    
    // 플레이어 충돌 시에는 항상 경고음을 재생하고 UI 경고 상태를 시작
    const currentLifeCount = maxLives - collisionCount;
    playWarningSound();
    suppressCollisionSfxUntil = Date.now() + 300; // 경고음이 묻히지 않도록 단기 억제
    lifeWarningTimer = lifeWarningDuration;
    lastLifeCount = currentLifeCount;
    
    // 플레이어 목숨이 감소하는 모든 충돌 상황에서는 경고음만 재생하고 다른 충돌/폭발음은 재생하지 않음
    lastCollisionTime = currentTime;
    
    if (collisionCount >= maxLives) {  // maxLives 사용
        handleGameOver();
        
        // 폭발 효과
        explosions.push(new Explosion(
            player.x + player.width/2,
            player.y + player.height/2,
            true
        ));
        
        // 주변 폭발 효과
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const distance = 60;
            explosions.push(new Explosion(
                player.x + player.width/2 + Math.cos(angle) * distance,
                player.y + player.height/2 + Math.sin(angle) * distance,
                false
            ));
        }
        
        if (hasSecondPlane) {
            explosions.push(new Explosion(
                secondPlane.x + secondPlane.width/2,
                secondPlane.y + secondPlane.height/2,
                true
            ));
            
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 / 12) * i;
                const distance = 60;
                explosions.push(new Explosion(
                    secondPlane.x + secondPlane.width/2 + Math.cos(angle) * distance,
                    secondPlane.y + secondPlane.height/2 + Math.sin(angle) * distance,
                    false
                ));
            }
        }
        
        // 게임 오버(마지막 목숨 소진) 시에만 충돌음 재생
        try {
            // 경고음 억제 해제 후 충돌음 재생
            suppressCollisionSfxUntil = 0;
            // 경고음이 재생 중이면 정지하여 충돌음을 또렷이
            if (warningSound && !warningSound.paused) {
                try { warningSound.pause(); warningSound.currentTime = 0; } catch (e) {}
            }
            // 충돌음은 충분히 크게 재생 (전역볼륨이 낮아도 최소 0.8 보장)
            const baseVol = isMuted ? 0 : Math.min(1, Math.max(0, globalVolume));
            const finalVol = isMuted ? 0 : Math.max(0.8, baseVol);
            collisionSound.volume = finalVol;
            collisionSound.playbackRate = 1.0;
            collisionSound.currentTime = 0;
            collisionSound.play().catch(error => {
                console.log('오디오 재생 실패:', error);
            });
        } catch (e) {}
    }
}

// 폭발 효과 클래스
class Explosion {
    constructor(x, y, isFinal = false) {
        this.x = x;
        this.y = y;
        this.radius = 1;
        this.maxRadius = isFinal ? 100 : 50; // 최종 폭발은 더 크게
        this.speed = isFinal ? 1 : 1.5;
        this.particles = [];
        this.isFinal = isFinal;
        
        // 파티클 생성
        if (isFinal) {
            for (let i = 0; i < 20; i++) {
                this.particles.push({
                    x: this.x,
                    y: this.y,
                    speed: Math.random() * 8 + 2,
                    angle: (Math.PI * 2 / 20) * i,
                    size: Math.random() * 4 + 2,
                    life: 1
                });
            }
        }

        // 폭발 시 주변 적에게 데미지
        if (isFinal) {
            enemies.forEach(enemy => {
                const dx = enemy.x + enemy.width/2 - this.x;
                const dy = enemy.y + enemy.height/2 - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 폭발 반경 내의 적에게 데미지
                if (distance < this.maxRadius) {
                    if (enemy.isBoss) {
                        enemy.health -= 200; // 보스는 200 데미지
                        bossHealth = enemy.health;
                    } else {
                        // 일반 적은 즉시 파괴
                        explosions.push(new Explosion(
                            enemy.x + enemy.width/2,
                            enemy.y + enemy.height/2
                        ));
                        updateScore(20);
                    }
                }
            });
        }
    }

    update() {
        this.radius += this.speed;
        
        if (this.isFinal) {
            // 파티클 업데이트
            for (let particle of this.particles) {
                particle.x += Math.cos(particle.angle) * particle.speed;
                particle.y += Math.sin(particle.angle) * particle.speed;
                particle.life -= 0.02;
                particle.size *= 0.98;
            }
            
            // 파티클이 모두 사라졌는지 확인
            return this.particles.some(p => p.life > 0);
        }
        
        return this.radius < this.maxRadius;
    }

    draw() {
        if (this.isFinal) {
            // 중심 폭발
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
            gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // 파티클 그리기
            for (let particle of this.particles) {
                if (particle.life > 0) {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, ${Math.floor(200 * particle.life)}, 0, ${particle.life})`;
                    ctx.fill();
                    
                    // 파티클 꼬리 효과
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(
                        particle.x - Math.cos(particle.angle) * (particle.speed * 4),
                        particle.y - Math.sin(particle.angle) * (particle.speed * 4)
                    );
                    ctx.strokeStyle = `rgba(255, ${Math.floor(100 * particle.life)}, 0, ${particle.life * 0.5})`;
                    ctx.lineWidth = particle.size * 0.8;
                    ctx.stroke();
                }
            }
        } else {
            // 일반 폭발 효과
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 200, 0, ${1 - this.radius / this.maxRadius})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 100, 0, ${1 - this.radius / this.maxRadius})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 50, 0, ${1 - this.radius / this.maxRadius})`;
            ctx.fill();
        }
    }
}

// 비행기 그리기 함수
function drawAirplane(x, y, width, height, color, isEnemy = false) {
    ctx.save();
    ctx.translate(x + width/2, y + height/2);
    if (isEnemy) {
        ctx.rotate(Math.PI); // 적 비행기는 180도 회전
    }
    
    // 그림자 효과 제거
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 메인 날개 (가오리 날개 모양)
    ctx.beginPath();
    ctx.moveTo(0, -height/2); // 기수
    ctx.lineTo(width/2, -height/4); // 오른쪽 날개 앞
    ctx.lineTo(width/2, height/4); // 오른쪽 날개 중간
    ctx.lineTo(width/3, height/2); // 오른쪽 날개 뒤
    ctx.lineTo(0, height/3); // 꼬리 시작
    ctx.lineTo(-width/3, height/2); // 왼쪽 날개 뒤
    ctx.lineTo(-width/2, height/4); // 왼쪽 날개 중간
    ctx.lineTo(-width/2, -height/4); // 왼쪽 날개 앞
    ctx.closePath();
    ctx.fillStyle = isEnemy ? 'red' : 'rgb(255, 255, 255)';  // 적은 빨간색, 아군은 순수한 흰색
    ctx.fill();

    // 꼬리
    ctx.beginPath();
    ctx.moveTo(0, height/3);
    ctx.lineTo(width/8, height/2);
    ctx.lineTo(0, height);
    ctx.lineTo(-width/8, height/2);
    ctx.closePath();
    ctx.fillStyle = isEnemy ? 'red' : 'rgb(255, 255, 255)';  // 적은 빨간색, 아군은 순수한 흰색
    ctx.fill();

    // 동체
    ctx.beginPath();
    ctx.moveTo(0, -height/2); // 기수
    ctx.lineTo(width/8, -height/3);
    ctx.lineTo(width/8, height/3);
    ctx.lineTo(0, height/3);
    ctx.lineTo(-width/8, height/3);
    ctx.lineTo(-width/8, -height/3);
    ctx.closePath();
    ctx.fillStyle = isEnemy ? '#900' : 'rgb(255, 255, 255)';  // 적은 어두운 빨간색, 아군은 순수한 흰색
    ctx.fill();

    // 눈
    ctx.beginPath();
    ctx.arc(-width/6, -height/3, width/20, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width/6, -height/3, width/20, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    // 입
    ctx.beginPath();
    ctx.moveTo(-width/12, -height/4);
    ctx.lineTo(width/12, -height/4);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 날개 디테일
    ctx.beginPath();
    ctx.moveTo(-width/2, -height/8);
    ctx.lineTo(-width/2, height/8);
    ctx.strokeStyle = isEnemy ? '#800' : 'rgb(255, 255, 255)';  // 적은 어두운 빨간색, 아군은 순수한 흰색
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width/2, -height/8);
    ctx.lineTo(width/2, height/8);
    ctx.stroke();

    // 날개 앞쪽 디테일
    ctx.beginPath();
    ctx.moveTo(-width/2, -height/4);
    ctx.lineTo(-width/2 + width/8, -height/5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width/2, -height/4);
    ctx.lineTo(width/2 - width/8, -height/5);
    ctx.stroke();

    // 날개 뒤쪽 디테일
    ctx.beginPath();
    ctx.moveTo(-width/3, height/2);
    ctx.lineTo(-width/3 + width/8, height/3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width/3, height/2);
    ctx.lineTo(width/3 - width/8, height/3);
    ctx.stroke();

    // 꼬리 디테일
    ctx.beginPath();
    ctx.moveTo(0, height/3);
    ctx.lineTo(0, height);
    ctx.strokeStyle = isEnemy ? '#800' : 'rgb(255, 255, 255)';  // 적은 어두운 빨간색, 아군은 순수한 흰색
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

// 게임 루프 수정
function gameLoop() {
    if (isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // 화면 전체를 지우고 새로 그리기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isStartScreen) {
        drawStartScreen();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (isGameOver) {
        // 폭발 효과 업데이트 및 그리기
        explosions = explosions.filter(explosion => {
            explosion.draw();
            return explosion.update();
        });

        // 폭발 효과가 모두 사라졌을 때만 게임 오버 화면 표시
        if (explosions.length === 0) {
            // 게임 오버 화면 페이드 인 효과
            const fadeInDuration = 2000;
            const currentTime = Date.now();
            const fadeProgress = Math.min(1, (currentTime - (gameOverStartTime || currentTime)) / fadeInDuration);
            
            if (!gameOverStartTime) {
                gameOverStartTime = currentTime;
                // 게임 오버 시 최고 점수 업데이트
                ScoreManager.save();
            }

            // 배경 페이드 인 - 완전한 검정색으로 변경
            ctx.fillStyle = `rgba(0, 0, 0, ${fadeProgress})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            if (fadeProgress >= 1) {
                // 게임 오버 텍스트에 그라데이션 효과
                const gradient = ctx.createLinearGradient(0, canvas.height/2 - 50, 0, canvas.height/2 + 50);
                gradient.addColorStop(0, '#ff0000');
                gradient.addColorStop(0.5, '#ff4444');
                gradient.addColorStop(1, '#ff0000');
                
                ctx.fillStyle = gradient;
                ctx.font = 'bold 64px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
                
                ctx.font = 'bold 32px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`최종 점수: ${score}`, canvas.width/2, canvas.height/2 + 60);
                ctx.fillText(`충돌 횟수: ${collisionCount}`, canvas.width/2, canvas.height/2 + 100);
                ctx.fillText('스페이스바를 눌러 재시작', canvas.width/2, canvas.height/2 + 160);
            }
        }
        requestAnimationFrame(gameLoop);
        return;
    }

    try {
        // 깜박임 효과 처리
        if (flashTimer > 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            flashTimer -= 16;
        }
        
        // 목숨 경고 깜빡임 효과 처리
        if (lifeWarningTimer > 0) {
            lifeWarningTimer -= 16;
        }

        // 플레이어 이동 처리
        handlePlayerMovement();

        // 총알 발사 처리
        handleBulletFiring();
        
        // 특수 무기 처리
        handleSpecialWeapon();

        // 적 생성 및 이동 처리
        handleEnemies();
        
        // 보스 체크 및 생성
        const currentTime = Date.now();
        if (!bossActive) {  // bossDestroyed 조건 제거
            const timeSinceLastBoss = currentTime - lastBossSpawnTime;
            
            // 레벨 1 이상이고 시간 조건을 만족하면 보스 생성
            if (gameLevel >= 1 && timeSinceLastBoss >= BOSS_SETTINGS.SPAWN_INTERVAL) {
                console.log('보스 생성 조건 만족:', {
                    currentTime,
                    lastBossSpawnTime,
                    timeSinceLastBoss,
                    interval: BOSS_SETTINGS.SPAWN_INTERVAL,
                    gameLevel
                });
                createBoss();
            }
        } else {
            // 보스가 존재하는 경우 보스 패턴 처리
            const boss = enemies.find(enemy => enemy.isBoss);
            if (boss) {
                handleBossPattern(boss);
            } else {
                // 보스가 enemies 배열에서 제거된 경우 상태 초기화
                bossActive = false;
                bossHealth = 0;
                bossDestroyed = false;  // 보스 파괴 상태 초기화
                console.log('보스가 제거되어 상태 초기화');
            }
        }

        // 총알 이동 및 충돌 체크
        handleBullets();


        // 두 번째 비행기 처리
        handleSecondPlane();

        // 레벨업 체크
        checkLevelUp();

        // 폭발 효과 업데이트 및 그리기
        handleExplosions();

        // 폭탄 처리 추가
        handleBombs();

        // 다이나마이트 처리 추가
        handleDynamites();

        // UI 그리기
        drawUI();

        // 다음 프레임 요청
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('게임 루프 실행 중 오류:', error);
        requestAnimationFrame(gameLoop);
    }
}

// 플레이어 이동 처리 함수
function handlePlayerMovement() {
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed * 0.5;
        if (hasSecondPlane) {
            secondPlane.x -= player.speed * 0.5;
        }
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed * 0.5;
        if (hasSecondPlane) {
            secondPlane.x += player.speed * 0.5;
        }
    }
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.speed;
        if (hasSecondPlane) {
            secondPlane.y -= player.speed;
        }
    }
    if (keys.ArrowDown && player.y < canvas.height - player.height) {
        player.y += player.speed;
        if (hasSecondPlane) {
            secondPlane.y += player.speed;
        }
    }
}

// 적 처리 함수 수정
function handleEnemies() {
    const currentTime = Date.now();
    const currentDifficulty = difficultySettings[Math.min(gameLevel, 5)] || {
        enemySpeed: 6 + (gameLevel - 5) * 0.5,
        enemySpawnRate: 0.06 + (gameLevel - 5) * 0.01,
        horizontalSpeedRange: 6 + (gameLevel - 5) * 0.5,
        patternChance: 1.0,
        maxEnemies: 20 + (gameLevel - 5) * 2,
        bossHealth: 1000 + (gameLevel - 5) * 250,  // 2000 → 1000, 500 → 250
        bossSpawnInterval: Math.max(10000, 20000 - (gameLevel - 5) * 1000),
        powerUpChance: 0.3,
        bombDropChance: 0.3,
        dynamiteDropChance: 0.25
    };

    // 뱀 패턴 처리
    if (isSnakePatternActive) {
        handleSnakePattern();
    }

    // 일반 적 생성 - 시간 기반 생성 로직으로 변경
    if (currentTime - lastEnemySpawnTime >= MIN_ENEMY_SPAWN_INTERVAL &&
        Math.random() < currentDifficulty.enemySpawnRate && 
        enemies.length < currentDifficulty.maxEnemies &&
        !isGameOver) {
        createEnemy();
        lastEnemySpawnTime = currentTime;
    }

    // 일반 적 이동 및 충돌 체크
    enemies = enemies.filter(enemy => {
        // 적 비행기 위치 업데이트
        updateEnemyPosition(enemy);
        
        // 새로운 위치에 적 비행기 그리기
        drawAirplane(enemy.x, enemy.y, enemy.width, enemy.height, 'red', true);
        
        // 충돌 체크 및 화면 밖 체크
        return checkEnemyCollisions(enemy);
    });
}

// 뱀 패턴 처리 함수 수정
function handleSnakePattern() {
    const currentTime = Date.now();
    
    // 새로운 그룹 생성 체크
    if (currentTime - lastSnakeGroupTime >= snakeGroupInterval && 
        snakeGroups.length < maxSnakeGroups) {
        lastSnakeGroupTime = currentTime;
        startSnakePattern();
    }
    
    // 각 그룹 처리
    snakeGroups = snakeGroups.filter(group => {
        if (!group.isActive) return false;
        
        // 그룹의 지속 시간 체크
        if (currentTime - group.startTime >= snakePatternDuration) {
            group.isActive = false;
            return false;
        }
        
        // 초기 비행기 생성 (그룹이 시작될 때 한 번만)
        if (!group.initialEnemiesCreated) {
            if (currentTime - group.patternInterval >= 200 && group.enemies.length < 10) { // 더 빠른 적 생성 (300ms → 200ms)
                group.patternInterval = currentTime;
                const lastEnemy = group.enemies[group.enemies.length - 1];
                const newEnemy = {
                    x: lastEnemy.x,
                    y: lastEnemy.y,
                    width: 30,
                    height: 30,
                    speed: group.speed,
                    type: 'snake',
                    targetX: lastEnemy.x,
                    targetY: lastEnemy.y,
                    angle: lastEnemy.angle,
                    isHit: false,
                    amplitude: group.amplitude,
                    frequency: group.frequency
                };
                group.enemies.push(newEnemy);
            }
            
            if (group.enemies.length >= 10) {
                group.initialEnemiesCreated = true;
            }
        }
        
        // 그룹 내 적군 이동
        group.enemies.forEach((enemy, index) => {
            if (index === 0) {
                // 패턴 변경 체크 - 더 자주 변경
                if (currentTime - group.patternChangeTimer >= group.patternChangeInterval * 0.7) { // 더 빠른 패턴 변경
                    group.patternType = getRandomPatternType();
                    group.patternChangeTimer = currentTime;
                    group.currentSpeed = Math.min(group.currentSpeed * 1.3, group.maxSpeed); // 더 빠른 속도 증가
                }
                
                // 첫 번째 적의 이동 패턴
                switch(group.patternType) {
                    case PATTERN_TYPES.SNAKE:
                        // S자 움직임 - 더 역동적으로 개선
                        enemy.angle += 0.08; // 더 빠른 각도 변화
                        const baseX = group.startX;
                        const waveX = Math.sin(enemy.angle * group.frequency * 1.5) * group.amplitude * 1.2; // 더 큰 진폭과 빠른 주기
                        enemy.x = baseX + waveX;
                        enemy.y += enemy.speed * 1.5; // 더 빠른 하강
                        // 추가적인 좌우 흔들림
                        enemy.x += Math.sin(enemy.angle * 2) * 3;
                        break;
                        
                    case PATTERN_TYPES.VERTICAL:
                        // 세로 움직임 - 더 역동적인 흔들림
                        enemy.y += enemy.speed * 1.4; // 더 빠른 하강
                        enemy.x = group.startX + Math.sin(enemy.angle * 1.5) * 80; // 더 큰 진폭과 빠른 주기
                        enemy.angle += 0.05; // 더 빠른 각도 변화
                        // 추가적인 상하 움직임
                        enemy.y += Math.sin(enemy.angle * 3) * 2;
                        break;
                        
                    case PATTERN_TYPES.DIAGONAL:
                        // 대각선 움직임 - 더 급격하게
                        enemy.x += enemy.speed * group.direction * 2; // 더 빠른 좌우 이동
                        enemy.y += enemy.speed * 1.5; // 더 빠른 하강
                        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
                            group.direction *= -1;
                            enemy.y += 40; // 더 큰 점프
                        }
                        // 추가적인 진동 효과
                        enemy.x += Math.sin(Date.now() * 0.01) * 2;
                        break;
                        
                    case PATTERN_TYPES.HORIZONTAL:
                        // 가로 움직임 - 더 역동적으로
                        enemy.x += enemy.speed * group.direction * 1.4;
                        enemy.y = group.startY + Math.sin(enemy.angle) * 60;
                        enemy.angle += 0.04;
                        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
                            group.direction *= -1;
                            group.startY += 40;
                        }
                        break;
                        
                    case PATTERN_TYPES.SPIRAL:
                        // 나선형 움직임 - 더 복잡하게
                        group.spiralAngle += 0.08;
                        group.spiralRadius += 0.8;
                        enemy.x = group.startX + Math.cos(group.spiralAngle) * group.spiralRadius;
                        enemy.y = group.startY + Math.sin(group.spiralAngle) * group.spiralRadius;
                        break;
                        
                    case PATTERN_TYPES.WAVE:
                        // 파도형 움직임
                        group.waveAngle += group.waveFrequency;
                        enemy.x = group.startX + Math.sin(group.waveAngle) * group.waveAmplitude;
                        enemy.y += enemy.speed * 1.1;
                        break;
                        
                    case PATTERN_TYPES.ZIGZAG:
                        // 지그재그 움직임
                        group.zigzagAngle += group.zigzagFrequency;
                        enemy.x = group.startX + Math.sin(group.zigzagAngle) * group.zigzagAmplitude;
                        enemy.y += enemy.speed * 1.4;
                        break;
                        
                    case PATTERN_TYPES.CIRCLE:
                        // 원형 움직임
                        group.circleAngle += group.circleSpeed;
                        enemy.x = group.startX + Math.cos(group.circleAngle) * group.circleRadius;
                        enemy.y = group.startY + Math.sin(group.circleAngle) * group.circleRadius;
                        group.startY += enemy.speed * 0.5;
                        break;
                        
                    case PATTERN_TYPES.VORTEX:
                        // 소용돌이 움직임
                        group.vortexAngle += group.vortexSpeed;
                        group.vortexRadius += 0.5;
                        enemy.x = group.startX + Math.cos(group.vortexAngle) * group.vortexRadius;
                        enemy.y = group.startY + Math.sin(group.vortexAngle) * group.vortexRadius;
                        group.startY += enemy.speed * 0.3;
                        break;
                        
                    case PATTERN_TYPES.CHASE:
                        // 플레이어 추적 움직임
                        const targetX = player.x;
                        const targetY = player.y;
                        const dx = targetX - enemy.x;
                        const dy = targetY - enemy.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance > 0) {
                            enemy.x += (dx / distance) * group.chaseSpeed;
                            enemy.y += (dy / distance) * group.chaseSpeed;
                        }
                        break;
                        
                    case PATTERN_TYPES.BOUNCE:
                        // 튀어오르는 움직임
                        group.bounceAngle += group.bounceSpeed;
                        enemy.x = group.startX + Math.sin(group.bounceAngle) * group.bounceHeight;
                        enemy.y += enemy.speed + Math.abs(Math.sin(group.bounceAngle)) * 3;
                        break;
                        
                    case PATTERN_TYPES.MIRROR:
                        // 거울 움직임 (플레이어 반대 방향)
                        const mirrorX = canvas.width - player.x;
                        const targetMirrorX = mirrorX + (group.mirrorOffset - canvas.width / 2);
                        const dxMirror = targetMirrorX - enemy.x;
                        enemy.x += dxMirror * 0.03;
                        enemy.y += enemy.speed * 1.2;
                        break;
                }
            } else {
                // 뒤따르는 적들의 움직임 - 더 자연스럽게 개선
                const prevEnemy = group.enemies[index - 1];
                const dx = prevEnemy.x - enemy.x;
                const dy = prevEnemy.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const targetDistance = 30 + index * 2; // 거리를 약간씩 늘려서 더 자연스럽게
                if (distance > targetDistance) {
                    const moveX = (dx / distance) * (distance - targetDistance) * 0.8;
                    const moveY = (dy / distance) * (distance - targetDistance) * 0.8;
                    enemy.x += moveX;
                    enemy.y += moveY;
                }
                
                // 뒤따르는 적들도 약간의 랜덤성 추가
                enemy.x += Math.sin(currentTime * 0.001 + index) * 0.5;
            }
            
            if (!enemy.isHit) {
                drawAirplane(enemy.x, enemy.y, enemy.width, enemy.height, 'red', true);
            }
        });
        
        // 충돌 체크
        let collisionOccurred = false;
        group.enemies.forEach((enemy, index) => {
            if (!enemy.isHit && !collisionOccurred) {
                bullets = bullets.filter(bullet => {
                    if (checkCollision(bullet, enemy)) {
                        explosions.push(new Explosion(
                            enemy.x + enemy.width/2,
                            enemy.y + enemy.height/2
                        ));
                        updateScore(20); //뱀 패턴 비행기 한 대당 획득 점수
                        // 뱀패턴 효과음 재생
                        applyGlobalVolume();
                        shootSound.currentTime = 0;
                        shootSound.play().catch(error => {
                            console.log('오디오 재생 실패:', error);
                        });
                        enemy.isHit = true;
                        return false;
                    }
                    return true;
                });
                
                if (!collisionOccurred && (checkCollision(player, enemy) || 
                    (hasSecondPlane && checkCollision(secondPlane, enemy)))) {
                    handleCollision();
                    explosions.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2));
                    enemy.isHit = true;
                    collisionOccurred = true;
                }
            }
        });
        
        // 화면 밖으로 나간 적 제거
        group.enemies = group.enemies.filter(enemy => 
            enemy.y < canvas.height + 100 && 
            enemy.y > -100 && 
            enemy.x > -100 && 
            enemy.x < canvas.width + 100
        );
        
        return group.enemies.length > 0;
    });
    
    if (snakeGroups.length === 0) {
        isSnakePatternActive = false;
    }
}

// 적 충돌 체크 함수 수정
function checkEnemyCollisions(enemy) {
    // 보스가 이미 파괴된 경우 처리하지 않음
    if (enemy.isBoss && bossDestroyed) {
        return false;
    }

    // 총알과 적 충돌 체크
    let isHit = false;
    bullets = bullets.filter(bullet => {
        // 보스 총알은 여기서 처리하지 않음
        if (bullet.isBossBullet) {
            return true;
        }

        if (checkCollision(bullet, enemy)) {
            // 보스인 경우 체력 감소
            if (enemy.isBoss) {
                const currentTime = Date.now();
                
                // 특수 무기인 경우 즉시 파괴
                if (bullet.isSpecial) {
                    console.log('보스가 특수 무기에 맞음');
                    enemy.health = 0;
                    bossHealth = 0;
                    bossDestroyed = true;
                    updateScore(BOSS_SETTINGS.BONUS_SCORE);
                    
                    // 보스 파괴 시 목숨 1개 추가
                    maxLives++; // 최대 목숨 증가
                    
                    // 큰 폭발 효과
                    explosions.push(new Explosion(
                        enemy.x + enemy.width/2,
                        enemy.y + enemy.height/2,
                        true
                    ));
                    
                    // 추가 폭발 효과
                    for (let i = 0; i < 8; i++) {
                        const angle = (Math.PI * 2 / 8) * i;
                        const distance = 50;
                        explosions.push(new Explosion(
                            enemy.x + enemy.width/2 + Math.cos(angle) * distance,
                            enemy.y + enemy.height/2 + Math.sin(angle) * distance,
                            false
                        ));
                    }
                    
                    bossActive = false;
                    return false;
                }
                
                // 일반 총알인 경우
                enemy.hitCount++;
                console.log('보스 총알 맞은 횟수:', enemy.hitCount);
                
                // 피격 시간 추적 시작
                if (!enemy.isBeingHit) {
                    enemy.isBeingHit = true;
                    enemy.lastHitTime = currentTime;
                }
                
                // 보스가 맞았을 때 시각 효과 추가
                explosions.push(new Explosion(
                    bullet.x,
                    bullet.y,
                    false
                ));
                
                // 체력 감소 (각 총알당 100의 데미지)
                enemy.health -= 100;
                bossHealth = enemy.health;
                
                // 보스 피격음 재생
                applyGlobalVolume();
                collisionSound.currentTime = 0;
                collisionSound.play().catch(error => {
                    console.log('오디오 재생 실패:', error);
                });
                
                // 피격 시간이 전체 출현 시간의 50%를 넘으면 파괴
                const totalTime = currentTime - enemy.lastUpdateTime;
                const hitTimeThreshold = BOSS_SETTINGS.SPAWN_INTERVAL * 0.5;
                
                if (enemy.totalHitTime >= hitTimeThreshold) {
                    console.log('보스 파괴됨 - 피격 시간 초과:', {
                        totalHitTime: enemy.totalHitTime,
                        threshold: hitTimeThreshold
                    });
                    enemy.health = 0;
                    bossHealth = 0;
                    bossDestroyed = true;
                    updateScore(BOSS_SETTINGS.BONUS_SCORE);
                    
                    // 보스 파괴 시 목숨 1개 추가 (이미 특수 무기로 파괴된 경우는 제외)
                    if (!bullet.isSpecial) {
                        maxLives++; // 최대 목숨 증가
                    }
                    
                    // 큰 폭발 효과
                    explosions.push(new Explosion(
                        enemy.x + enemy.width/2,
                        enemy.y + enemy.height/2,
                        true
                    ));
                    
                    // 추가 폭발 효과
                    for (let i = 0; i < 8; i++) {
                        const angle = (Math.PI * 2 / 8) * i;
                        const distance = 50;
                        explosions.push(new Explosion(
                            enemy.x + enemy.width/2 + Math.cos(angle) * distance,
                            enemy.y + enemy.height/2 + Math.sin(angle) * distance,
                            false
                        ));
                    }
                    
                    // 보스 파괴 시 폭발음 재생
                    applyGlobalVolume();
                    explosionSound.currentTime = 0;
                    explosionSound.play().catch(error => {
                        console.log('오디오 재생 실패:', error);
                    });
                    
                    bossActive = false;
                    return false;
                }
                
                // 보스가 파괴되지 않은 상태에서는 점수 부여하지 않음
                isHit = true;
                return false;
            } else {
                // 일반 적 처치
                explosions.push(new Explosion(
                    enemy.x + enemy.width/2,
                    enemy.y + enemy.height/2
                ));
                updateScore(20); //적 처치 시 획득 점수
            }
            
            // 적을 맞췄을 때 효과음 재생
            applyGlobalVolume();
            shootSound.currentTime = 0;
            shootSound.play().catch(error => {
                console.log('오디오 재생 실패:', error);
            });
            
            isHit = true;
            return false;
        }
        return true;
    });

    // 보스의 피격 시간 업데이트
    if (enemy.isBoss && enemy.isBeingHit) {
        const currentTime = Date.now();
        const timeSinceLastHit = currentTime - enemy.lastHitTime;
        
        // 1초 이상 피격이 없으면 피격 상태 해제
        if (timeSinceLastHit > 1000) {
            enemy.isBeingHit = false;
        } else {
            // 피격 시간 누적
            enemy.totalHitTime += timeSinceLastHit;
            enemy.lastHitTime = currentTime;
        }
    }

    // 보스가 파괴된 경우 enemies 배열에서 제거
    if (enemy.isBoss && bossDestroyed) {
        return false;
    }

    if (isHit && !enemy.isBoss) {
        return false;
    }

    // 플레이어와 충돌 체크
    if (checkCollision(player, enemy) || (hasSecondPlane && checkCollision(secondPlane, enemy))) {
        handleCollision();
        explosions.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2));
        return false;
    }

    // 화면 밖으로 나간 적 제거
    return enemy.y < canvas.height + 100 && 
           enemy.y > -100 && 
           enemy.x > -100 && 
           enemy.x < canvas.width + 100;
}

// 총알 발사 처리 함수 수정
function handleBulletFiring() {
    const currentTime = Date.now();
    const currentFireDelay = isContinuousFire ? continuousFireDelay : fireDelay;
    const adjustedFireDelay = currentFireDelay / fireRateMultiplier;
    const currentBulletSize = calculateBulletSize();
    
    // 연속 발사 상태 체크
    if (isSpacePressed && currentTime - spacePressTime > minPressDuration) {
        isContinuousFire = true;
    }
    
    // 발사 조건 체크
    if (isSpacePressed && canFire) {
        // 연속 발사일 때는 딜레이만 체크
        if (isContinuousFire) {
            if (currentTime - lastFireTime < adjustedFireDelay) {
                return;
            }
        } else {
            // 단발 발사일 때는 더 엄격한 조건 체크
            if (currentTime - lastFireTime < singleShotCooldown) {
                return;
            }
            // 스페이스바를 누른 시간이 너무 짧으면 발사하지 않음
            const pressDuration = currentTime - spacePressTime;
            if (pressDuration < 50) {
                return;
            }
        }
        
        lastFireTime = currentTime;
        
        // 총알 발사
        // 일반 총알 발사
        const bullet = {
            x: player.x + player.width/2,
            y: player.y,
            width: currentBulletSize,
            height: currentBulletSize * 2,
            speed: bulletSpeed,
            damage: 100 * damageMultiplier
        };
        bullets.push(bullet);
        
        // 두 번째 비행기 발사
        if (hasSecondPlane) {
            const bullet = {
                x: secondPlane.x + secondPlane.width/2,
                y: secondPlane.y,
                width: currentBulletSize,
                height: currentBulletSize * 2,
                speed: bulletSpeed,
                damage: 100 * damageMultiplier
            };
            bullets.push(bullet);
        }
    }
}

// 특수 무기 처리 함수 수정
function handleSpecialWeapon() {
    if (specialWeaponCount > 0 && keys.KeyB) {  // 특수무기 개수가 0보다 클 때 사용 가능
        // 특수 무기 발사 - 더 많은 총알과 강력한 효과
        for (let i = 0; i < 360; i += 5) { // 각도 간격을 10도에서 5도로 감소
            const angle = (i * Math.PI) / 180;
            const bullet = {
                x: player.x + player.width/2,
                y: player.y,
                width: 12,  // 총알 크기 증가
                height: 12, // 총알 크기 증가
                speed: 12,  // 속도 증가
                angle: angle,
                isSpecial: true,
                life: 100,  // 총알 지속 시간 추가
                trail: []   // 꼬리 효과를 위한 배열
            };
            bullets.push(bullet);
        }
        
        // 두 번째 비행기가 있을 경우 추가 발사
        if (hasSecondPlane) {
            for (let i = 0; i < 360; i += 5) {
                const angle = (i * Math.PI) / 180;
                const bullet = {
                    x: secondPlane.x + secondPlane.width/2,
                    y: secondPlane.y,
                    width: 12,
                    height: 12,
                    speed: 12,
                    angle: angle,
                    isSpecial: true,
                    life: 100,
                    trail: []
                };
                bullets.push(bullet);
            }
        }
        
        specialWeaponCount--;  // 특수무기 개수 감소
        specialWeaponCharged = specialWeaponCount > 0;
        
        // 특수 무기 발사 효과음
        applyGlobalVolume();
        shootSound.currentTime = 0;
        shootSound.play().catch(error => {
            console.log('오디오 재생 실패:', error);
        });
        
        // F키 상태 초기화
        keys.KeyB = false;
    }
}

// 폭발 효과 업데이트 및 그리기
function handleExplosions() {
    explosions = explosions.filter(explosion => {
        explosion.draw();
        return explosion.update();
    });
}

// UI 그리기 함수 수정
function drawUI() {
    // 플레이어 비행기 그리기
    drawAirplane(player.x, player.y, player.width, player.height, 'white');
    if (hasSecondPlane) {
        drawAirplane(secondPlane.x, secondPlane.y, secondPlane.width, secondPlane.height, 'white');
    }

    // 점수와 레벨 표시
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`점수: ${score}`, 10, 30);
    ctx.fillText(`레벨: ${gameLevel} (${getDifficultyName(gameLevel)})`, 10, 60);
    ctx.fillText(`다음 레벨까지: ${Math.max(0, levelUpScore - levelScore)}`, 10, 90);
    ctx.fillText(`최고 점수: ${highScore}`, 10, 120);
    ctx.fillText(`최고 점수 리셋: R키`, 10, 150);
    if (!hasSecondPlane) {
        const nextPlaneScore = Math.ceil(score / 4000) * 4000;
        ctx.fillText(`다음 추가 비행기까지: ${nextPlaneScore - score}점`, 10, 180);
    } else {
        const remainingTime = Math.ceil((10000 - (Date.now() - secondPlaneTimer)) / 1000);
        ctx.fillText(`추가 비행기 남은 시간: ${remainingTime}초`, 10, 180);
    }
    ctx.fillText(`일시정지: P키`, 10, 210);
    
    // 남은 목숨 표시
    if (lifeWarningTimer > 0) {
        // 경고 깜빡임 효과 - 흰 배경에 빨간 텍스트
        const blinkSpeed = 200; // 깜빡임 속도 (밀리초)
        const currentTime = Date.now();
        const isVisible = Math.floor(currentTime / blinkSpeed) % 2 === 0;
        
        if (isVisible) {
            // 흰 배경
            ctx.fillStyle = 'white';
            ctx.fillRect(5, 220, 200, 30);
            
            // 빨간 텍스트
            ctx.fillStyle = 'red';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`남은 목숨: ${maxLives - collisionCount}`, 10, 240);
        } else {
            // 일반 표시 (빨간 텍스트)
            ctx.fillStyle = 'red';
            ctx.font = '20px Arial';
            ctx.fillText(`남은 목숨: ${maxLives - collisionCount}`, 10, 240);
        }
    } else {
        // 일반 표시 (빨간 텍스트)
        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.fillText(`남은 목숨: ${maxLives - collisionCount}`, 10, 240);
    }
    
    // 특수 무기 게이지 및 개수 표시
    const chargePercent = Math.floor((specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 100);
    const hasSpecialWeapon = specialWeaponCount > 0;
    const displayCount = hasSpecialWeapon ? specialWeaponCount : 0;
    
    // 깜빡이는 효과를 위한 시간 계산 (특수무기가 있을 때만)
    const blinkSpeed = 500; // 깜빡임 속도 (밀리초)
    const currentTime = Date.now();
    const isRed = hasSpecialWeapon && Math.floor(currentTime / blinkSpeed) % 2 === 0;
    
    // 배경색 설정 (게이지 바) - 원상복구
    if (hasSpecialWeapon) {
        ctx.fillStyle = isRed ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 255, 0.3)';
    } else {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';  // 원래 색상 복구
    }
    ctx.fillRect(10, 270, 200, 20);
    
    // 게이지 바 - 청록색
    if (hasSpecialWeapon) {
        ctx.fillStyle = isRed ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 255, 0.8)';  // 청록색
    } else {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';  // 청록색 게이지
    }
    ctx.fillRect(10, 270, (specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 200, 20);
    
    // 테두리 효과 - 원상복구
    if (hasSpecialWeapon) {
        ctx.strokeStyle = isRed ? 'red' : 'cyan';
    } else {
        ctx.strokeStyle = 'cyan';  // 원래 색상 복구
    }
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 270, 200, 20);
    
    // 게이지 바 위에 텍스트 표시 (충전률과 보유 개수) - 원상복구
    if (hasSpecialWeapon) {
        ctx.fillStyle = isRed ? 'red' : 'cyan';
    } else {
        ctx.fillStyle = 'cyan';  // 원래 색상 복구
    }
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    const displayText = `특수무기: ${chargePercent}%(보유:${displayCount}/5개)`;
    ctx.fillText(displayText, 110, 285);
    
    // 준비 완료 메시지 (특수무기가 있을 때만)
    if (hasSpecialWeapon) {
        // 준비 완료 메시지 배경
        ctx.fillStyle = isRed ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 255, 0.2)';
        ctx.fillRect(10, 300, 300, 30);
        
        // 텍스트 색상 설정
        ctx.fillStyle = isRed ? 'red' : 'cyan';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('특수무기 발사(알파벳 "B"키 클릭)', 15, 320);
    }

    // 제작자 정보 표시
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('제작/저작권자:Lee.SS.C', canvas.width - 20, canvas.height - 20);
    
    // 보스 체력 표시 개선
    if (bossActive) {
        // 체력바 배경
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(canvas.width/2 - 100, 10, 200, 20);
        
        // 체력바
        const healthPercentage = Math.max(0, bossHealth) / BOSS_SETTINGS.HEALTH;
        let healthColor;
        if (healthPercentage > 0.7) healthColor = 'rgba(0, 255, 0, 0.8)';
        else if (healthPercentage > 0.3) healthColor = 'rgba(255, 255, 0, 0.8)';
        else healthColor = 'rgba(255, 0, 0, 0.8)';
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(canvas.width/2 - 100, 10, healthPercentage * 200, 20);
        
        // 체력 수치
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`보스 체력: ${Math.max(0, Math.ceil(bossHealth))}/${BOSS_SETTINGS.HEALTH}`, canvas.width/2, 30);
        
        // 페이즈 표시
        const currentPhase = BOSS_SETTINGS.PHASE_THRESHOLDS.findIndex(
            threshold => bossHealth > threshold.health
        );
        if (currentPhase >= 0) {
            ctx.fillText(`페이즈 ${currentPhase + 1}`, canvas.width/2, 50);
        }
    }
}

// 게임 시작 이벤트 리스너 수정
window.addEventListener('load', async () => {
    console.log('페이지 로드 완료');
    
    try {
        // 버전 정보 로드 - Electron 환경에서는 package.json 접근이 제한적이므로 기본값 사용
        try {
            // Electron 환경에서는 package.json에 직접 접근할 수 없으므로 기본값 사용
            gameVersion = '1.0.0-202506161826'; // package.json의 현재 버전으로 설정
            console.log('버전 정보 로드 성공:', gameVersion);
        } catch (e) {
            console.warn('버전 정보 로드 실패:', e);
            gameVersion = '1.0.0'; // 기본값 설정
        }

        // canvas와 context 확인
        if (!canvas || !ctx) {
            throw new Error('Canvas 또는 Context를 찾을 수 없습니다.');
        }
        console.log('Canvas 초기화 확인됨');
        
        // 시작 화면 초기화
        initStartScreen();
        
        // IndexedDB 초기화 및 최고 점수 로드
        await initDB();
        highScore = await loadHighScore();
        console.log('초기 최고 점수 로드 완료:', highScore);
        
        // 게임 초기화 실행
        await initializeGame();

        const effectVolume = document.getElementById('effectVolume');
        const volumeValue = document.getElementById('volumeValue');
        const muteBtn = document.getElementById('muteBtn');

        // 초기화: 슬라이더, %표시, 버튼
        effectVolume.value = globalVolume;
        volumeValue.textContent = Math.round(globalVolume * 100) + '%';
        muteBtn.textContent = isMuted ? '🔇 전체 음소거' : '🔊 전체 음소거';
        applyGlobalVolume();

        // 슬라이더 조작 시
        effectVolume.addEventListener('input', (e) => {
            globalVolume = parseFloat(e.target.value);
            isMuted = (globalVolume === 0);
            applyGlobalVolume();
            volumeValue.textContent = Math.round(globalVolume * 100) + '%';
            muteBtn.textContent = isMuted ? '🔇 전체 음소거' : '🔊 전체 음소거';
        });

        // 마우스 조작이 끝난 직후(마우스가 어디에 있든) 항상 포커스 이동
        effectVolume.addEventListener('mouseup', () => {
            setTimeout(() => { document.getElementById('gameCanvas').focus(); }, 0);
        });
        effectVolume.addEventListener('change', () => {
            setTimeout(() => { document.getElementById('gameCanvas').focus(); }, 0);
        });
        effectVolume.addEventListener('blur', () => {
            setTimeout(() => { document.getElementById('gameCanvas').focus(); }, 0);
        });
        // 음소거 버튼 클릭 시
        muteBtn.addEventListener('click', () => {
            if (!isMuted) {
                isMuted = true;
                applyGlobalVolume();
                muteBtn.textContent = '🔇 전체 음소거 해제';
                effectVolume.value = 0;
                volumeValue.textContent = '0%';
            } else {
                isMuted = false;
                if (globalVolume === 0) globalVolume = 0.5;
                effectVolume.value = globalVolume;
                applyGlobalVolume();
                muteBtn.textContent = '🔊 전체 음소거';
                volumeValue.textContent = Math.round(globalVolume * 100) + '%';
            }
            setTimeout(() => { document.getElementById('gameCanvas').focus(); }, 0);
        });
    } catch (error) {
        console.error('게임 시작 중 오류:', error);
        // 오류 발생 시 localStorage에서 점수 로드 시도
        try {
            const localScore = parseInt(localStorage.getItem('highScore')) || 0;
            const backupScore = parseInt(localStorage.getItem('highScore_backup')) || 0;
            highScore = Math.max(localScore, backupScore);
            console.log('localStorage에서 로드된 최고 점수:', highScore);
            
            // 게임 초기화 재시도
            await initializeGame();
        } catch (e) {
            console.error('localStorage 로드도 실패:', e);
            highScore = 0;
            await initializeGame();
        }
    }
});

// 난이도 이름 반환 함수
function getDifficultyName(level) {
    const names = ['초급', '중급', '고급', '전문가', '마스터', '그랜드마스터', '레전드', '미스터', '고드'];
    return names[level - 1] || `레벨 ${level}`;
}

// 키 이벤트 리스너 수정
document.addEventListener('keydown', (e) => {
    // 사운드 패널이나 컨트롤에 포커스가 있는 경우에만 키보드 입력 무시
    const activeElement = document.activeElement;
    const isSoundPanelFocused = activeElement && (
        activeElement.id === 'effectVolume' ||
        activeElement.id === 'muteBtn' ||
        activeElement.closest('#soundPanel')
    );

    if (isSoundPanelFocused) {
        return;
    }

    // 방향키/스페이스 스크롤 방지
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }
    if (e.code in keys) {
        keys[e.code] = true;
        
        // 시작 화면이나 게임 오버 상태에서 스페이스바를 누르면 게임 시작/재시작
        if ((isStartScreen || isGameOver) && e.code === 'Space') {
            if (isGameOver) {
                restartGame();
            } else {
                isStartScreen = false;
                // 게임 시작 시 목숨 관련 변수 초기화
                lastLifeCount = maxLives;
                lifeWarningTimer = 0;
                // 경고음 초기화
                initializeWarningSound();
                // 패턴 사용 기록 초기화
                resetPatternUsage();
            }
            return;
        }
        
        // 스페이스바를 처음 누를 때
        if (e.code === 'Space' && !isSpacePressed && !isGameOver) {
            const currentTime = Date.now();
            // 마지막 해제 후 일정 시간이 지났을 때만 연속 발사 상태 초기화
            if (currentTime - lastReleaseTime > 500) {
                isContinuousFire = false;
            }
            
            isSpacePressed = true;
            spacePressTime = currentTime;
            lastFireTime = 0;  // 첫 발사를 위해 딜레이 초기화
            canFire = true;  // 발사 가능 상태로 설정
        }
    }
    
    // F5 키를 눌렀을 때 게임 재시작
    if (e.code === 'F5' && isGameOver) {
        e.preventDefault(); // 브라우저 새로고침 방지
        restartGame();
    }
    
    // R 키를 눌렀을 때 최고 점수 리셋
    if (e.code === 'KeyR') {
        if (confirm('최고 점수를 리셋하시겠습니까?')) {
            highScore = 0;
            localStorage.setItem('highScore', '0');
            alert('최고 점수가 리셋되었습니다.');
            console.log('최고 점수 리셋');
        }
    }
    
    // P 키를 눌렀을 때 게임 일시정지/재개
    if (e.code === 'KeyP') {
        isPaused = !isPaused;
    }

    // 시작 화면에서 Enter를 누르면 게임 시작
    if (isStartScreen && e.code === 'Enter') {
        isStartScreen = false;
        // 게임 시작 시 목숨 관련 변수 초기화
        lastLifeCount = maxLives;
        lifeWarningTimer = 0;
        // 경고음 초기화
        initializeWarningSound();
        // 패턴 사용 기록 초기화
        resetPatternUsage();
        return;
    }
});

document.addEventListener('keyup', (e) => {
    // 사운드 패널이나 컨트롤에 포커스가 있는 경우에만 키보드 입력 무시
    const activeElement = document.activeElement;
    const isSoundPanelFocused = activeElement && (
        activeElement.id === 'effectVolume' ||
        activeElement.id === 'muteBtn' ||
        activeElement.closest('#soundPanel')
    );

    if (isSoundPanelFocused) {
        return;
    }

    if (e.code in keys) {
        keys[e.code] = false;
        
        // 스페이스바를 뗄 때
        if (e.code === 'Space') {
            isSpacePressed = false;
            lastReleaseTime = Date.now();  // 마지막 해제 시간 기록
            canFire = true;  // 발사 가능 상태로 설정
        }
    }
});

// 게임 오버 시 점수 처리 수정
function handleGameOver() {
    if (!isGameOver) {
        isGameOver = true;
        gameOverStartTime = Date.now();
        
        // 최고 점수 저장
        const finalScore = Math.max(score, highScore);
        if (finalScore > 0) {
            saveHighScoreDirectly(finalScore, 'handleGameOver');
        }
        
        console.log('게임 오버 - 최종 점수:', score, '최고 점수:', highScore);
        
        // 게임 오버 시 사운드 컨트롤 상태 초기화
        isSoundControlActive = false;
        
        // 게임 오버 시 캔버스에 포커스
        document.getElementById('gameCanvas').focus();
    }
}

// 점수 증가 함수 수정
function updateScore(points) {
    score += points;
    levelScore += points;
    
    // 특수 무기 게이지 증가
    specialWeaponCharge += points;
    if (specialWeaponCharge >= SPECIAL_WEAPON_MAX_CHARGE) {
        const newWeapons = Math.floor(specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE);
        specialWeaponCount += newWeapons;
        
        // 최대 보유 개수 5개로 제한
        if (specialWeaponCount > 5) {
            specialWeaponCount = 5;
        }
        
        specialWeaponCharge = specialWeaponCharge % SPECIAL_WEAPON_MAX_CHARGE;
        specialWeaponCharged = specialWeaponCount > 0;
    }
    
    // 최고 점수 즉시 업데이트 및 저장
    if (score > highScore) {
        highScore = score;
        saveHighScoreDirectly(highScore, 'updateScore');
    }
}

// 두 번째 비행기 처리 함수 추가
function handleSecondPlane() {
    if (score >= 4000 && score % 4000 === 0 && !hasSecondPlane) {
        hasSecondPlane = true;
        secondPlane.x = player.x - 60;
        secondPlane.y = player.y;
        secondPlaneTimer = Date.now(); // 타이머 시작
        // 두 번째 비행기 획득 메시지
        ctx.fillStyle = 'yellow';
        ctx.font = '40px Arial';
        ctx.fillText('추가 비행기 획득!', canvas.width/2 - 150, canvas.height/2);
    }

    if (hasSecondPlane) {
        const elapsedTime = Date.now() - secondPlaneTimer;
        if (elapsedTime >= 10000) { // 10초 체크
            hasSecondPlane = false;
            // 두 번째 비행기 소멸 메시지
            ctx.fillStyle = 'red';
            ctx.font = '40px Arial';
            ctx.fillText('추가 비행기 소멸!', canvas.width/2 - 150, canvas.height/2);
        }
    }
}


// 총알 이동 및 충돌 체크 함수 수정
function handleBullets() {
    bullets = bullets.filter(bullet => {
        if (bullet.isBossBullet) {
            // 보스 총알 이동
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            bullet.rotation += bullet.rotationSpeed;
            bullet.pulsePhase += bullet.pulseSpeed;
            
            // 총알 그리기
            ctx.save();
            ctx.translate(bullet.x, bullet.y);
            ctx.rotate(bullet.rotation);
            
            // 패턴별 색상 가져오기
            const patternColor = BOSS_PATTERN_COLORS[bullet.pattern] || '#FF0000'; // 기본값은 빨간색
            
            // 패턴별 총알 모양 렌더링
            renderBossBulletShape(bullet, patternColor);
            
            ctx.restore();
            
            // 보스 총알과 플레이어 충돌 체크
            if (checkCollision(bullet, player) || 
                (hasSecondPlane && checkCollision(bullet, secondPlane))) {
                handleCollision();
                // 총알 충돌 시 작은 폭발 효과
                explosions.push(new Explosion(bullet.x, bullet.y, false));
                return false;
            }
        } else if (bullet.isSpecial) {
            // 특수 무기 총알 이동 및 효과
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            
            // 꼬리 효과 추가
            bullet.trail.unshift({x: bullet.x, y: bullet.y});
            if (bullet.trail.length > 5) bullet.trail.pop();
            
            // 총알 그리기
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(bullet.x - bullet.width/2, bullet.y - bullet.height/2, bullet.width, bullet.height);
            
            // 꼬리 그리기
            bullet.trail.forEach((pos, index) => {
                const alpha = 1 - (index / bullet.trail.length);
                ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
                ctx.fillRect(pos.x - bullet.width/2, pos.y - bullet.height/2, 
                            bullet.width * (1 - index/bullet.trail.length), 
                            bullet.height * (1 - index/bullet.trail.length));
            });
            
            // 총알 주변에 빛나는 효과
            const gradient = ctx.createRadialGradient(
                bullet.x, bullet.y, 0,
                bullet.x, bullet.y, bullet.width
            );
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(bullet.x - bullet.width, bullet.y - bullet.height, 
                        bullet.width * 2, bullet.height * 2);
            
            // 총알 지속 시간 감소
            bullet.life--;
            if (bullet.life <= 0) return false;
        } else {
            // 일반 총알 이동
            bullet.y -= bullet.speed;
            ctx.fillStyle = 'yellow';
            ctx.fillRect(bullet.x - bullet.width/2, bullet.y - bullet.height/2, bullet.width, bullet.height);
        }
        
        // 보스 총알과 플레이어 충돌 체크
        if (bullet.isBossBullet && (checkCollision(bullet, player) || 
            (hasSecondPlane && checkCollision(bullet, secondPlane)))) {
            handleCollision();
            return false;
        }
        
        // 폭탄과 총알 충돌 체크
        bombs = bombs.filter(bomb => {
            if (checkCollision(bullet, bomb)) {
                // 폭탄 폭발
                explosions.push(new Explosion(bomb.x, bomb.y, true));
                // 폭발음 재생
                applyGlobalVolume();
                shootSound.currentTime = 0;
                shootSound.play().catch(error => {
                    console.log('오디오 재생 실패:', error);
                });
                return false;
            }
            return true;
        });

        // 다이나마이트와 총알 충돌 체크
        dynamites = dynamites.filter(dynamite => {
            if (checkCollision(bullet, dynamite)) {
                // 다이나마이트 폭발
                explosions.push(new Explosion(dynamite.x, dynamite.y, true));
                // 폭발음 재생
                applyGlobalVolume();
                shootSound.currentTime = 0;
                shootSound.play().catch(error => {
                    console.log('오디오 재생 실패:', error);
                });
                return false;
            }
            return true;
        });
        
        // 화면 밖으로 나간 총알 제거
        return bullet.y > 0 && bullet.y < canvas.height && 
               bullet.x > 0 && bullet.x < canvas.width;
    });
}

// 보스 관련 상수 추가
const BOSS_SETTINGS = {
    HEALTH: 1000,        // 기본 체력
    DAMAGE: 50,          // 보스 총알 데미지
    SPEED: 2,           // 보스 이동 속도
    BULLET_SPEED: 5,    // 보스 총알 속도 (원상복구)
    PATTERN_INTERVAL: 2000, // 패턴 변경 간격
    SPAWN_INTERVAL: 15000,  // 보스 출현 간격 (15초로 단축)
    BONUS_SCORE: 500,    // 보스 처치 보너스 점수를 500으로 설정
    PHASE_THRESHOLDS: [  // 페이즈 전환 체력 임계값
        { health: 750, speed: 2.5, bulletSpeed: 6 }, // 원상복구
        { health: 500, speed: 3, bulletSpeed: 7 },   // 원상복구
        { health: 250, speed: 3.5, bulletSpeed: 8 }   // 원상복구
    ]
};

// 게임 상태 변수에 추가
let lastBossSpawnTime = Date.now();  // 마지막 보스 출현 시간을 현재 시간으로 초기화

// 보스 생성 함수 수정
function createBoss() {
    console.log('보스 생성 함수 호출됨');
    
    // 이미 보스가 존재하는 경우
    if (bossActive) {
        console.log('보스가 이미 존재하여 생성하지 않음');
        return;
    }
    
    const currentTime = Date.now();
    const timeSinceLastBoss = currentTime - lastBossSpawnTime;
    
    // 레벨 체크
    if (gameLevel < 1) {
        console.log('보스 생성 레벨이 되지 않음:', {
            gameLevel,
            requiredLevel: 1
        });
        return;
    }
    
    // 시간 체크
    if (timeSinceLastBoss < BOSS_SETTINGS.SPAWN_INTERVAL) {
        console.log('보스 생성 시간이 되지 않음:', {
            timeSinceLastBoss,
            requiredInterval: BOSS_SETTINGS.SPAWN_INTERVAL,
            remainingTime: BOSS_SETTINGS.SPAWN_INTERVAL - timeSinceLastBoss
        });
        return;
    }
    
    console.log('보스 생성 시작:', {
        currentTime,
        lastBossSpawnTime,
        timeSinceLastBoss
    });
    
    // 보스 상태 초기화
    bossActive = true;
    bossHealth = BOSS_SETTINGS.HEALTH;
    bossPattern = 0;
    bossTimer = currentTime;
    lastBossSpawnTime = currentTime;
    bossDestroyed = false;  // 보스 파괴 상태 초기화
    
    // 보스 파괴 시 목숨 1개 추가
    maxLives++; // 최대 목숨 증가
    
    // 보스 객체 생성
    const boss = {
        x: Math.random() * (canvas.width - 60),
        y: -60,
        width: 60,
        height: 60,
        speed: BOSS_SETTINGS.SPEED,
        pattern: null, // 패턴은 나중에 설정됨
        angle: 0,
        movePhase: 0,
        targetX: canvas.width / 2 - 30,
        targetY: 60,
        phase: 0,
        patternTimer: currentTime,
        bulletSpeed: BOSS_SETTINGS.BULLET_SPEED,
        isBoss: true,
        health: BOSS_SETTINGS.HEALTH,
        randomOffsetX: Math.random() * 120 - 60,
        randomOffsetY: Math.random() * 120 - 60,
        randomAngle: Math.random() * Math.PI * 2,
        randomSpeed: Math.random() * 2 + 1,
        lastUpdateTime: currentTime,
        hitCount: 0,
        totalHitTime: 0,
        lastHitTime: null,
        isBeingHit: false,
        // 패턴 관련 타이머 변수들
        lastPatternChange: currentTime,
        patternDuration: 5000,  // 5초마다 패턴 변경
        lastShot: currentTime,
        patternAngle: 0,
        // 단일 패턴 시스템 변수들
        usedPatterns: [],  // 사용한 패턴들 기록
        currentPatterns: [],  // 현재 사용 중인 패턴들
        // 레벨별 패턴 순서 시스템 (레벨 1~5용)
        patternSequence: [],  // 현재 레벨에서 사용할 패턴 순서
        currentPatternIndex: 0,  // 현재 패턴 인덱스
        isPatternSequenceComplete: false,  // 패턴 순서 완료 여부
        // 단일 패턴 시스템 (레벨 1~5용)
        singlePattern: null  // 현재 사용할 단일 패턴
    };
    
    // 통합된 패턴 시스템 - 모든 레벨에서 모든 패턴 사용 가능
    const allAvailablePatterns = [
        // 기본 패턴들
        BOSS_PATTERNS.BASIC,
        BOSS_PATTERNS.CIRCLE_SHOT,
        BOSS_PATTERNS.CROSS_SHOT,
        BOSS_PATTERNS.SPIRAL_SHOT,
        BOSS_PATTERNS.WAVE_SHOT,
        BOSS_PATTERNS.DIAMOND_SHOT,
        BOSS_PATTERNS.RANDOM_SPREAD,
        BOSS_PATTERNS.DOUBLE_SPIRAL,
        BOSS_PATTERNS.TRIPLE_WAVE,
        BOSS_PATTERNS.TARGETED_SHOT,
        BOSS_PATTERNS.BURST_SHOT,
        // 확산 패턴들
        BOSS_PATTERNS.SPREAD_CIRCLE,
        BOSS_PATTERNS.SPREAD_CROSS,
        BOSS_PATTERNS.SPREAD_SPIRAL,
        BOSS_PATTERNS.SPREAD_WAVE,
        BOSS_PATTERNS.SPREAD_DIAMOND,
        BOSS_PATTERNS.SPREAD_BURST,
        BOSS_PATTERNS.SPREAD_TARGETED,
        BOSS_PATTERNS.SPREAD_RANDOM,
        BOSS_PATTERNS.MEGA_SPREAD,
        BOSS_PATTERNS.CHAOS_SPREAD,
        // 특수 모양 패턴들
        BOSS_PATTERNS.WINDMILL_SHOT,    // 바람개비 샷 (우선순위 높임)
        BOSS_PATTERNS.WINDMILL_SPREAD,  // 바람개비 패턴
        BOSS_PATTERNS.HEART_SHOT,       // 하트 모양
        BOSS_PATTERNS.STAR_SHOT,        // 별 모양
        BOSS_PATTERNS.FLOWER_SHOT,      // 꽃 모양
        BOSS_PATTERNS.BUTTERFLY_SHOT,   // 나비 모양
        BOSS_PATTERNS.ICE_SHOT,         // 빙설 모양
        BOSS_PATTERNS.GEAR_SHOT,        // 톱니바퀴 모양
        BOSS_PATTERNS.MOON_SHOT          // 달 모양
    ];
    
    console.log(`통합 패턴 목록 (총 ${allAvailablePatterns.length}개): ${allAvailablePatterns.join(', ')}`);
    
    // 랜덤 패턴 선택
    boss.pattern = allAvailablePatterns[Math.floor(Math.random() * allAvailablePatterns.length)];
    boss.currentPatterns = [boss.pattern];
    boss.usedPatterns = [boss.pattern];
    boss.singlePattern = boss.pattern;
    levelBossPatterns.currentLevelPattern = boss.pattern;
    
    console.log(`보스 생성 (레벨 ${gameLevel}): 통합 패턴 시스템 - ${boss.pattern}`);
    if (boss.pattern === BOSS_PATTERNS.WINDMILL_SHOT) {
        console.log('🎯 바람개비 샷이 선택되었습니다!');
    }
    
    // 패턴 변경 시간 초기화
    boss.lastPatternChange = currentTime;
    
    // 보스 추가
    enemies.push(boss);
    console.log('보스 생성 완료:', boss);
}

// 보스 패턴 처리 함수 수정
function handleBossPattern(boss) {
    const currentTime = Date.now();
    
    // 보스 체력이 0 이하이면 파괴 처리
    if (boss.health <= 0 && !bossDestroyed) {
        bossDestroyed = true;
        bossActive = false;
        bossHealth = 0;
        updateScore(BOSS_SETTINGS.BONUS_SCORE);
        
        // 레벨 1~5에서 패턴 사용 기록
        if (gameLevel <= 5 && boss.singlePattern) {
            if (!levelBossPatterns.usedPatterns.includes(boss.singlePattern)) {
                levelBossPatterns.usedPatterns.push(boss.singlePattern);
                console.log(`패턴 사용 기록: ${boss.singlePattern} (총 ${levelBossPatterns.usedPatterns.length}/${levelBossPatterns.patternSequence.length})`);
            }
        }
        
        // 보스 파괴 시 목숨 1개 추가
        maxLives++; // 최대 목숨 증가
        
        // 큰 폭발 효과
        explosions.push(new Explosion(
            boss.x + boss.width/2,
            boss.y + boss.height/2,
            true
        ));
        // 추가 폭발 효과
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const distance = 50;
            explosions.push(new Explosion(
                boss.x + boss.width/2 + Math.cos(angle) * distance,
                boss.y + boss.height/2 + Math.sin(angle) * distance,
                false
            ));
        }
        // 보스 파괴 시 폭발음 재생
        applyGlobalVolume();
        explosionSound.currentTime = 0;
        explosionSound.play().catch(error => {
            console.log('오디오 재생 실패:', error);
        });
        
        // 보스 파괴 시 목숨 1개 추가
        maxLives++; // 최대 목숨 증가
        
        return;
    }

    // 보스 이동 패턴 - 더 역동적으로 개선
    const movePattern = Math.floor(currentTime / 3000) % 5;  // 3초마다 이동 패턴 변경
    
    switch (movePattern) {
        case 0:  // 빠른 좌우 이동
            boss.x += Math.sin(currentTime / 200) * 6;  // 더 빠르고 큰 좌우 이동
            boss.y = 60 + Math.sin(currentTime / 800) * 20;  // 상하로도 약간 움직임
            break;
        case 1:  // 원형 이동 (더 빠르게)
            const radius = 120;
            const centerX = canvas.width / 2;
            const centerY = 100;
            boss.x = centerX + Math.cos(currentTime / 600) * radius;
            boss.y = centerY + Math.sin(currentTime / 600) * radius;
            break;
        case 2:  // 지그재그 이동 (더 역동적으로)
            boss.x += Math.sin(currentTime / 150) * 8;  // 더 빠른 좌우 이동
            boss.y = 60 + Math.abs(Math.sin(currentTime / 300)) * 60;  // 더 큰 상하 이동
            break;
        case 3:  // 추적 이동 (더 빠르게)
            const targetX = player.x;
            const dx = targetX - boss.x;
            boss.x += dx * 0.05;  // 더 빠른 추적
            boss.y = 60 + Math.sin(currentTime / 400) * 30;  // 상하 움직임 추가
            break;
        case 4:  // 새로운 패턴: 급격한 좌우 이동
            boss.x += Math.sin(currentTime / 100) * 10;  // 매우 빠른 좌우 이동
            boss.y = 60 + Math.sin(currentTime / 600) * 40;  // 상하 움직임
            break;
    }
    
    // 패턴 단계별 패턴 선택
    let patterns = [];
    
    // 통합된 패턴 목록 사용 (보스 생성 시와 동일)
    const availablePatterns = [
        // 기본 패턴들
        BOSS_PATTERNS.BASIC,
        BOSS_PATTERNS.CIRCLE_SHOT,
        BOSS_PATTERNS.CROSS_SHOT,
        BOSS_PATTERNS.SPIRAL_SHOT,
        BOSS_PATTERNS.WAVE_SHOT,
        BOSS_PATTERNS.DIAMOND_SHOT,
        BOSS_PATTERNS.RANDOM_SPREAD,
        BOSS_PATTERNS.DOUBLE_SPIRAL,
        BOSS_PATTERNS.TRIPLE_WAVE,
        BOSS_PATTERNS.TARGETED_SHOT,
        BOSS_PATTERNS.BURST_SHOT,
        // 확산 패턴들
        BOSS_PATTERNS.SPREAD_CIRCLE,
        BOSS_PATTERNS.SPREAD_CROSS,
        BOSS_PATTERNS.SPREAD_SPIRAL,
        BOSS_PATTERNS.SPREAD_WAVE,
        BOSS_PATTERNS.SPREAD_DIAMOND,
        BOSS_PATTERNS.SPREAD_BURST,
        BOSS_PATTERNS.SPREAD_TARGETED,
        BOSS_PATTERNS.SPREAD_RANDOM,
        BOSS_PATTERNS.MEGA_SPREAD,
        BOSS_PATTERNS.CHAOS_SPREAD,
        // 특수 모양 패턴들
        BOSS_PATTERNS.WINDMILL_SHOT,    // 바람개비 샷 (우선순위 높임)
        BOSS_PATTERNS.WINDMILL_SPREAD,  // 바람개비 패턴
        BOSS_PATTERNS.HEART_SHOT,       // 하트 모양
        BOSS_PATTERNS.STAR_SHOT,        // 별 모양
        BOSS_PATTERNS.FLOWER_SHOT,      // 꽃 모양
        BOSS_PATTERNS.BUTTERFLY_SHOT,   // 나비 모양
        BOSS_PATTERNS.ICE_SHOT,         // 빙설 모양
        BOSS_PATTERNS.GEAR_SHOT,        // 톱니바퀴 모양
        BOSS_PATTERNS.MOON_SHOT          // 달 모양
    ];
    
    // 통합된 패턴 시스템 - 모든 레벨에서 동일한 로직 사용
    // 레벨별 제한 제거
    // 통합된 랜덤 패턴 시스템 (한 번 등장한 패턴은 모든 패턴이 등장한 후에 다시 등장)
    
    // 보스별 사용한 패턴 추적 시스템 초기화
    if (!boss.usedPatterns) {
        boss.usedPatterns = [];
    }
    
    // 패턴 변경 시간 초기화
    if (!boss.lastPatternChange) {
        boss.lastPatternChange = currentTime;
    }
    
    // 패턴 변경 체크 (1초마다) - 테스트용
    if (currentTime - boss.lastPatternChange >= 1000) {
        console.log(`패턴 변경 시도 - 현재 시간: ${currentTime}, 마지막 변경: ${boss.lastPatternChange}`);
        // 사용 가능한 패턴 목록에서 아직 사용하지 않은 패턴들만 선택
        const unusedPatterns = availablePatterns.filter(pattern => !boss.usedPatterns.includes(pattern));
        console.log(`사용 가능한 패턴 수: ${availablePatterns.length}, 미사용 패턴 수: ${unusedPatterns.length}`);
        
        let selectedPattern;
        
        if (unusedPatterns.length > 0) {
            // 아직 사용하지 않은 패턴이 있으면 그 중에서 랜덤 선택
            console.log(`미사용 패턴 목록: ${unusedPatterns.join(', ')}`);
            selectedPattern = unusedPatterns[Math.floor(Math.random() * unusedPatterns.length)];
            boss.usedPatterns.push(selectedPattern);
            console.log(`보스 패턴 변경 (통합 시스템): ${selectedPattern} (사용된 패턴: ${boss.usedPatterns.length}/${availablePatterns.length})`);
        } else {
            // 모든 패턴을 다 사용했으면 사용 기록 초기화하고 랜덤 선택
            console.log(`모든 패턴 사용 완료, 기록 초기화`);
            boss.usedPatterns = [];
            selectedPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
            boss.usedPatterns.push(selectedPattern);
            console.log(`보스 패턴 변경 (통합 시스템): ${selectedPattern} (모든 패턴 사용 완료, 기록 초기화)`);
        }
        
        boss.currentPatterns = [selectedPattern];
        boss.pattern = selectedPattern; // 보스 패턴 속성도 업데이트
        boss.lastPatternChange = currentTime;
        console.log(`보스 패턴 변경됨: ${selectedPattern}`);
        if (selectedPattern === BOSS_PATTERNS.WINDMILL_SHOT) {
            console.log('🎯 바람개비 샷으로 패턴 변경되었습니다!');
        }
    }
    
    // 현재 패턴 사용
    if (boss.currentPatterns.length > 0) {
        patterns = boss.currentPatterns;
    } else {
        // 초기 패턴 설정
        const initialPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
        patterns = [initialPattern];
        boss.currentPatterns = [initialPattern];
        boss.pattern = initialPattern;
        boss.usedPatterns = [initialPattern];
        console.log(`보스 초기 패턴 설정: ${initialPattern}`);
    }
    
    // 현재 패턴들로 공격 실행
    patterns.forEach(pattern => {
        executeBossPattern(boss, pattern, currentTime);
    });
    
    // 보스 체력에 따른 패턴 강화
    const healthPercentage = boss.health / BOSS_SETTINGS.HEALTH;
    if (healthPercentage < 0.3) {  // 체력 30% 이하
        boss.bulletSpeed = BOSS_SETTINGS.BULLET_SPEED * 1.5;  // 총알 속도 증가
        boss.lastShot = Math.min(boss.lastShot, currentTime - 500);  // 공격 간격 감소
    } else if (healthPercentage < 0.6) {  // 체력 60% 이하
        boss.bulletSpeed = BOSS_SETTINGS.BULLET_SPEED * 1.2;  // 총알 속도 약간 증가
        boss.lastShot = Math.min(boss.lastShot, currentTime - 200);  // 공격 간격 약간 감소
    }
}

// 개별 패턴 실행 함수
function executeBossPattern(boss, pattern, currentTime) {
    console.log(`패턴 실행 시도: ${pattern}`);
    switch (pattern) {
        case BOSS_PATTERNS.BASIC:
            // 기본 패턴: 직선 발사 (느린 속도)
            if (currentTime - boss.lastShot >= 1500) {
                boss.lastShot = currentTime;
                createBossBullet(boss, Math.PI / 2, pattern);  // 일반 폭탄
            }
            break;
            
        case BOSS_PATTERNS.CIRCLE_SHOT:
            if (currentTime - boss.lastShot >= 800) {  // 0.8초마다 발사 (간격 증가)
                for (let i = 0; i < 6; i++) { // 8 → 6으로 감소
                    const angle = (Math.PI * 2 / 6) * i;
                    createBossBullet(boss, angle, pattern);
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.CROSS_SHOT:
            if (currentTime - boss.lastShot >= 800) {  // 0.8초마다 발사
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI / 2) * i;
                    createBossBullet(boss, angle, pattern);
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.SPIRAL_SHOT:
            if (currentTime - boss.lastShot >= 800) {  // 0.8초마다 발사 (간격 대폭 증가)
                createBossBullet(boss, boss.patternAngle, pattern);
                boss.patternAngle += Math.PI / 4;  // 45도씩 회전 (더 큰 각도)
                boss.lastShot = currentTime;
                
                // 나선 패턴이 한 바퀴 완료되면 초기화
                if (boss.patternAngle >= Math.PI * 2) {
                    boss.patternAngle = 0;
                }
            }
            break;
            
        case BOSS_PATTERNS.WAVE_SHOT:
            if (currentTime - boss.lastShot >= 600) {  // 0.6초마다 발사 (간격 증가)
                const waveAngle = Math.sin(boss.patternAngle) * (Math.PI / 4);  // -45도 ~ 45도 사이
                createBossBullet(boss, Math.PI / 2 + waveAngle, pattern);  // 아래쪽으로 파도형 발사
                boss.patternAngle += 0.3;
                boss.lastShot = currentTime;
                
                // 파도 패턴이 일정 시간 지나면 초기화
                if (boss.patternAngle >= Math.PI * 2) {
                    boss.patternAngle = 0;
                }
            }
            break;
            
        case BOSS_PATTERNS.DIAMOND_SHOT:
            if (currentTime - boss.lastShot >= 600) {  // 0.6초마다 발사
                const angles = [0, Math.PI/2, Math.PI, Math.PI*3/2];  // 상, 우, 하, 좌
                angles.forEach(angle => {
                    createBossBullet(boss, angle, pattern);
                });
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.RANDOM_SPREAD:
            if (currentTime - boss.lastShot >= 400) {  // 0.4초마다 발사 (더 빠르게)
                // 랜덤 확산 패턴 - 더 역동적으로 개선
                const baseAngles = [0, Math.PI/2, Math.PI, Math.PI*3/2]; // 4방향 기본 각도
                baseAngles.forEach(baseAngle => {
                    // 각 방향마다 3-5개의 총알을 랜덤하게 발사
                    const bulletCount = Math.floor(Math.random() * 3) + 3; // 3-5개
                    for (let i = 0; i < bulletCount; i++) {
                        const randomOffset = (Math.random() - 0.5) * Math.PI/3; // ±30도 랜덤
                        const angle = baseAngle + randomOffset;
                        createBossBullet(boss, angle, pattern);
                    }
                });
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.DOUBLE_SPIRAL:
            if (currentTime - boss.lastShot >= 1000) {  // 1.0초마다 발사 (간격 대폭 증가)
                // 두 개의 나선형 패턴을 동시에 발사
                createBossBullet(boss, boss.patternAngle, pattern);
                createBossBullet(boss, boss.patternAngle + Math.PI, pattern);  // 반대 방향
                boss.patternAngle += Math.PI / 6;  // 30도씩 회전 (더 큰 각도)
                boss.lastShot = currentTime;
                
                // 이중 나선 패턴이 한 바퀴 완료되면 초기화
                if (boss.patternAngle >= Math.PI * 2) {
                    boss.patternAngle = 0;
                }
            }
            break;
            
        case BOSS_PATTERNS.TRIPLE_WAVE:
            if (currentTime - boss.lastShot >= 500) {  // 0.5초마다 발사 (간격 증가)
                // 세 개의 파도형 패턴을 동시에 발사
                for (let i = 0; i < 3; i++) {
                    const waveAngle = Math.sin(boss.patternAngle + (i * Math.PI * 2 / 3)) * (Math.PI / 3);
                    createBossBullet(boss, Math.PI / 2 + waveAngle, pattern);
                }
                boss.patternAngle += 0.4;
                boss.lastShot = currentTime;
                
                // 삼중 파도 패턴이 일정 시간 지나면 초기화
                if (boss.patternAngle >= Math.PI * 2) {
                    boss.patternAngle = 0;
                }
            }
            break;
            
        case BOSS_PATTERNS.TARGETED_SHOT:
            if (currentTime - boss.lastShot >= 1000) {  // 1.0초마다 발사 (간격 대폭 증가)
                // 플레이어를 향해 3발 연속 발사
                const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
                for (let i = -1; i <= 1; i++) {
                    const spreadAngle = angleToPlayer + (i * Math.PI / 8);  // ±22.5도 스프레드
                    createBossBullet(boss, spreadAngle, pattern);
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.BURST_SHOT:
            if (currentTime - boss.lastShot >= 1000) {  // 1초마다 발사
                // 8방향으로 동시에 발사
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i;
                    createBossBullet(boss, angle, pattern);
                }
                // 중앙에 추가 발사
                createBossBullet(boss, Math.PI / 2, pattern);
                boss.lastShot = currentTime;
            }
            break;
            
        // 새로운 확산 패턴들
        case BOSS_PATTERNS.SPREAD_CIRCLE:
            if (currentTime - boss.lastShot >= 600) {  // 0.6초마다 발사
                // 원형 확산 패턴 - 각 방향마다 3발씩 발사
                for (let i = 0; i < 12; i++) {
                    const baseAngle = (Math.PI * 2 / 12) * i;
                    for (let j = 0; j < 3; j++) {
                        const spreadAngle = baseAngle + (j - 1) * 0.2; // ±0.2 라디안 확산
                        createBossBullet(boss, spreadAngle, pattern);
                    }
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.SPREAD_CROSS:
            if (currentTime - boss.lastShot >= 500) {  // 0.5초마다 발사
                // 십자 확산 패턴
                const crossAngles = [0, Math.PI/2, Math.PI, Math.PI*3/2];
                crossAngles.forEach(angle => {
                    for (let i = 0; i < 5; i++) {
                        const spreadAngle = angle + (i - 2) * 0.15; // ±0.3 라디안 확산
                        createBossBullet(boss, spreadAngle, pattern);
                    }
                });
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.SPREAD_SPIRAL:
            if (currentTime - boss.lastShot >= 600) {  // 0.6초마다 발사 (간격 증가)
                // 나선 확산 패턴
                for (let i = 0; i < 3; i++) {
                    const baseAngle = boss.patternAngle + (i * Math.PI * 2 / 3);
                    for (let j = 0; j < 2; j++) { // 3 → 2로 감소
                        const spreadAngle = baseAngle + (j - 0.5) * 0.3;
                        createBossBullet(boss, spreadAngle, pattern);
                    }
                }
                boss.patternAngle += Math.PI / 6;  // 30도씩 회전 (더 큰 각도)
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.SPREAD_WAVE:
            if (currentTime - boss.lastShot >= 700) {  // 0.7초마다 발사 (간격 증가)
                // 파도 확산 패턴
                const waveCount = 4; // 5 → 4로 감소
                for (let i = 0; i < waveCount; i++) {
                    const baseAngle = Math.PI / 2 + Math.sin(boss.patternAngle + i * 0.5) * 0.8;
                    for (let j = 0; j < 2; j++) { // 3 → 2로 감소
                        const spreadAngle = baseAngle + (j - 0.5) * 0.4;
                        createBossBullet(boss, spreadAngle, pattern);
                    }
                }
                boss.patternAngle += Math.PI / 8; // 더 큰 각도로 빠른 완료
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.SPREAD_DIAMOND:
            if (currentTime - boss.lastShot >= 700) {  // 0.7초마다 발사
                // 다이아몬드 확산 패턴
                const diamondAngles = [Math.PI/4, Math.PI*3/4, Math.PI*5/4, Math.PI*7/4];
                diamondAngles.forEach(angle => {
                    for (let i = 0; i < 4; i++) {
                        const spreadAngle = angle + (i - 1.5) * 0.2;
                        createBossBullet(boss, spreadAngle, pattern);
                    }
                });
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.SPREAD_BURST:
            if (currentTime - boss.lastShot >= 500) {  // 0.5초마다 발사
                // 폭발 확산 패턴 - 총알 수를 적절히 조정
                const burstCount = Math.floor(Math.random() * 2) + 2; // 2-3번의 폭발 (3-5에서 감소)
                for (let burst = 0; burst < burstCount; burst++) {
                    const burstAngle = (Math.PI * 2 / burstCount) * burst + Math.random() * 0.3; // 각 폭발마다 다른 각도
                    for (let i = 0; i < 5; i++) { // 각 폭발마다 5개의 총알 (6에서 감소)
                        const angle = burstAngle + (i * Math.PI * 2 / 5);
                        createBossBullet(boss, angle, pattern);
                    }
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.SPREAD_TARGETED:
            if (currentTime - boss.lastShot >= 1200) {  // 1.2초마다 발사 (간격 대폭 증가)
                // 추적 확산 패턴
                const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
                for (let i = 0; i < 5; i++) { // 7 → 5로 감소
                    const spreadAngle = angleToPlayer + (i - 2) * 0.3;
                    createBossBullet(boss, spreadAngle);
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.SPREAD_RANDOM:
            if (currentTime - boss.lastShot >= 600) {  // 0.6초마다 발사 (간격 증가)
                // 랜덤 확산 패턴 - 총알 수 감소로 성능 개선
                for (let i = 0; i < 5; i++) { // 8 → 5로 감소
                    const randomAngle = Math.random() * Math.PI * 2;
                    for (let j = 0; j < 2; j++) {
                        const spreadAngle = randomAngle + (j - 0.5) * 0.4;
                        createBossBullet(boss, spreadAngle, pattern);
                    }
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.MEGA_SPREAD:
            if (currentTime - boss.lastShot >= 2000) {  // 2초마다 발사 (간격 증가)
                // 메가 확산 패턴 - 총알 수 감소로 성능 개선
                for (let i = 0; i < 12; i++) { // 24 → 12로 감소
                    const baseAngle = (Math.PI * 2 / 12) * i;
                    for (let j = 0; j < 2; j++) { // 4 → 2로 감소
                        const spreadAngle = baseAngle + (j - 0.5) * 0.2;
                        createBossBullet(boss, spreadAngle, pattern);
                    }
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.CHAOS_SPREAD:
            if (currentTime - boss.lastShot >= 800) {  // 0.8초마다 발사 (간격 증가)
                // 카오스 확산 패턴 - 총알 수 감소로 성능 개선
                const chaosCount = 3 + Math.floor(Math.random() * 3); // 3~5개로 감소
                for (let i = 0; i < chaosCount; i++) {
                    const randomAngle = Math.random() * Math.PI * 2;
                    const spreadCount = 1 + Math.floor(Math.random() * 2); // 1~2개로 감소
                    for (let j = 0; j < spreadCount; j++) {
                        const spreadAngle = randomAngle + (j - spreadCount/2) * 0.4;
                        createBossBullet(boss, spreadAngle, pattern);
                    }
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.WINDMILL_SPREAD:
            console.log('바람개비 패턴 실행 중');
            if (currentTime - boss.lastShot >= 400) {  // 0.4초마다 발사 (더 빠르게)
                // 바람개비 확산 패턴 - 더 역동적으로 개선
                const windmillAngles = [0, Math.PI/2, Math.PI, Math.PI*3/2];
                windmillAngles.forEach(baseAngle => {
                    // 각 방향마다 2-3개의 총알을 발사
                    const bulletCount = Math.floor(Math.random() * 2) + 2; // 2-3개
                    for (let i = 0; i < bulletCount; i++) {
                        const spreadOffset = (i - (bulletCount-1)/2) * 0.3; // 좌우로 퍼짐
                        const angle = baseAngle + spreadOffset;
                        createBossBullet(boss, angle, pattern);
                    }
                });
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.WINDMILL_SHOT:
            console.log('🎯 바람개비 샷 패턴 실행 중!');
            if (currentTime - boss.lastShot >= 500) {  // 0.5초마다 발사
                // 바람개비 샷 패턴 - 플레이어를 향한 회전 바람개비 총알
                const playerAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                createBossBullet(boss, playerAngle, pattern);
                
                // 추가로 좌우로 약간씩 벌어진 각도로도 발사
                createBossBullet(boss, playerAngle + Math.PI/6, pattern);
                createBossBullet(boss, playerAngle - Math.PI/6, pattern);
                
                boss.lastShot = currentTime;
            }
            break;
            
        // 새로운 모양 패턴들
        case BOSS_PATTERNS.HEART_SHOT:
            console.log('하트 패턴 실행 중');
            if (currentTime - boss.lastShot >= 600) {  // 0.6초마다 발사
                // 하트 모양 패턴 - 5방향으로 발사
                const heartAngles = [Math.PI/2, Math.PI/2 + Math.PI/6, Math.PI/2 - Math.PI/6, Math.PI/2 + Math.PI/3, Math.PI/2 - Math.PI/3];
                heartAngles.forEach(angle => {
                    createBossBullet(boss, angle, pattern);
                });
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.STAR_SHOT:
            if (currentTime - boss.lastShot >= 500) {  // 0.5초마다 발사
                // 별 모양 패턴 - 5방향으로 발사
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2 / 5) + Math.PI/2;
                    createBossBullet(boss, angle, pattern);
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.FLOWER_SHOT:
            console.log('꽃 패턴 실행 중');
            if (currentTime - boss.lastShot >= 1000) {  // 1.0초마다 발사 (간격 대폭 증가)
                // 꽃 모양 패턴 - 6방향으로 발사
                for (let i = 0; i < 4; i++) { // 6 → 4로 감소
                    const angle = (i * Math.PI * 2 / 4) + Math.PI/2;
                    createBossBullet(boss, angle, pattern);
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.BUTTERFLY_SHOT:
            if (currentTime - boss.lastShot >= 700) {  // 0.7초마다 발사
                // 나비 모양 패턴 - 대각선 4방향으로 발사
                const butterflyAngles = [Math.PI/4, Math.PI*3/4, Math.PI*5/4, Math.PI*7/4];
                butterflyAngles.forEach(angle => {
                    createBossBullet(boss, angle, pattern);
                });
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.ICE_SHOT:
            if (currentTime - boss.lastShot >= 1000) {  // 1.0초마다 발사 (간격 증가)
                // 빙설 모양 패턴 - 6방향으로 발사 (총알 수 감소)
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI * 2 / 6);
                    createBossBullet(boss, angle, pattern);
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.GEAR_SHOT:
            if (currentTime - boss.lastShot >= 900) {  // 0.9초마다 발사 (간격 증가)
                // 톱니바퀴 모양 패턴 - 6방향으로 발사 (총알 수 감소)
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI * 2 / 6);
                    createBossBullet(boss, angle, pattern);
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.MOON_SHOT:
            if (currentTime - boss.lastShot >= 1100) {  // 1.1초마다 발사 (간격 증가)
                // 달 모양 패턴 - 4방향으로 발사 (총알 수 감소)
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI / 2);
                    createBossBullet(boss, angle, pattern);
                }
                boss.lastShot = currentTime;
            }
            break;
    }
}

// 보스 총알 생성 함수 수정
function createBossBullet(boss, angle, pattern = null) {
    // 실제 실행 중인 패턴을 우선적으로 사용
    let bulletPattern = pattern;
    if (!bulletPattern && boss.currentPatterns && boss.currentPatterns.length > 0) {
        bulletPattern = boss.currentPatterns[0]; // 현재 실행 중인 첫 번째 패턴 사용
    }
    if (!bulletPattern) {
        bulletPattern = boss.pattern; // 기본 패턴 사용
    }
    
    // 디버깅을 위한 로그
    if (bulletPattern && (bulletPattern.includes('heart') || bulletPattern.includes('star') || bulletPattern.includes('flower') || bulletPattern.includes('butterfly') || bulletPattern.includes('firework') || bulletPattern.includes('chaos') || bulletPattern.includes('ice'))) {
        console.log(`총알 생성: 패턴=${bulletPattern}, 각도=${angle}, 크기=24x24`);
    }
    
    const bullet = {
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        width: 24,  // 보스 총알 크기 24x24 (크기 증가)
        height: 24, // 보스 총알 크기 24x24 (크기 증가)
        speed: boss.bulletSpeed, // 속도 원상복구
        angle: angle,
        isBossBullet: true,
        damage: BOSS_SETTINGS.DAMAGE,
        rotation: 0, // 회전 효과를 위한 값
        rotationSpeed: 0.1, // 회전 속도
        pulsePhase: 0, // 펄스 효과를 위한 위상
        pulseSpeed: 0.3, // 펄스 속도
        pattern: bulletPattern // 패턴 정보 저장
    };
    bullets.push(bullet);
}

// 레벨업 체크 함수 수정
function checkLevelUp() {
    if (levelScore >= levelUpScore) {
        gameLevel++;
        levelScore = 0;
        levelUpScore = 1000 * gameLevel; // 레벨이 올라갈수록 다음 레벨까지 필요한 점수 증가
        
        // 현재 난이도 설정 가져오기
        const currentDifficulty = difficultySettings[Math.min(gameLevel, 5)] || {
            enemySpeed: 6 + (gameLevel - 5) * 0.5,
            enemySpawnRate: 0.06 + (gameLevel - 5) * 0.01,
            horizontalSpeedRange: 6 + (gameLevel - 5) * 0.5,
            patternChance: 1.0,
            maxEnemies: 20 + (gameLevel - 5) * 2,
            bossHealth: 1000 + (gameLevel - 5) * 250,  // 2000 → 1000, 500 → 250
            bossSpawnInterval: Math.max(10000, 20000 - (gameLevel - 5) * 1000),
            powerUpChance: 0.3,
            bombDropChance: 0.3,
            dynamiteDropChance: 0.25
        };
        
        // 보스 설정 업데이트
        BOSS_SETTINGS.HEALTH = currentDifficulty.bossHealth;
        BOSS_SETTINGS.SPAWN_INTERVAL = currentDifficulty.bossSpawnInterval;
        
        // 레벨업 시 패턴 사용 기록 초기화 (새로운 패턴들을 사용할 수 있도록)
        resetPatternUsage();
        
        // 레벨업 메시지 표시
        ctx.fillStyle = 'yellow';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${gameLevel}!`, canvas.width/2, canvas.height/2);
        ctx.font = '20px Arial';
        ctx.fillText(`난이도: ${getDifficultyName(gameLevel)}`, canvas.width/2, canvas.height/2 + 40);
        
        // 레벨업 보상
        if (gameLevel > 1) {
            // 레벨업 시 보상 지급
            const rewards = {
                2: { type: 'shield', duration: 15000 }, // 15초 실드
                3: { type: 'doubleDamage', duration: 20000 }, // 20초 데미지 2배
                4: { type: 'rapidFire', duration: 25000 }, // 25초 연사 속도 증가
                5: { type: 'all', duration: 30000 } // 30초 모든 파워업
            };
            
            const reward = rewards[gameLevel] || { type: 'all', duration: 30000 + (gameLevel - 5) * 5000 };
            if (reward) {
                if (reward.type === 'all') {
                    // 모든 파워업 적용
                    hasShield = true;
                    damageMultiplier = 2;
                    fireRateMultiplier = 2;
                    
                    // 파워업 지속 시간 설정
                    setTimeout(() => {
                        hasShield = false;
                        damageMultiplier = 1;
                        fireRateMultiplier = 1;
                    }, reward.duration);
                } else {
                    // 개별 파워업 적용
                    applyPowerUp(reward.type);
                }
                
                // 보상 메시지 표시
                ctx.fillStyle = '#00ff00';
                ctx.fillText(`보상: ${getRewardName(reward.type)}`, canvas.width/2, canvas.height/2 + 70);
            }
        }
    }
}

// 보상 이름 반환 함수 추가
function getRewardName(type) {
    switch(type) {
        case 'shield':
            return '15초 실드';
        case 'doubleDamage':
            return '20초 데미지 2배';
        case 'rapidFire':
            return '25초 연사 속도 증가';
        case 'all':
            return '30초 모든 파워업';
        default:
            return '';
    }
}

// 적 공격 패턴 상수 추가
const ENEMY_PATTERNS = {
    NORMAL: 'normal',
    ZIGZAG: 'zigzag',
    CIRCLE: 'circle',
    DIAGONAL: 'diagonal',
    DIVE: 'dive',
    SPIRAL: 'spiral',
    WAVE: 'wave',
    CROSS: 'cross',
    V_SHAPE: 'v_shape',
    RANDOM: 'random',
    // 새로운 역동적인 패턴들 추가
    BOUNCE: 'bounce',           // 튀어오르는 패턴
    CHASE: 'chase',             // 플레이어 추적 패턴
    FIGURE_EIGHT: 'figure_eight', // 8자 패턴
    PENDULUM: 'pendulum',       // 진자 패턴
    VORTEX: 'vortex',           // 소용돌이 패턴
    TELEPORT: 'teleport',       // 순간이동 패턴
    MIRROR: 'mirror',           // 거울 패턴 (플레이어 반대 방향)
    ACCELERATE: 'accelerate'    // 가속 패턴
};

// 파워업 아이템 타입 상수 추가
const POWERUP_TYPES = {
    SPEED_UP: 'speed_up',
    SHIELD: 'shield',
    DOUBLE_DAMAGE: 'double_damage',
    RAPID_FIRE: 'rapid_fire'
};

// 파워업 아이템 생성 함수
function createPowerUp() {
    const types = Object.values(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerUp = {
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 3,
        type: type,
        active: true,
        duration: 10000, // 10초 지속
        startTime: Date.now()
    };
    
    powerUps.push(powerUp);
}

// 파워업 아이템 처리 함수
function handlePowerUps() {
    powerUps = powerUps.filter(powerUp => {
        // 파워업 아이템 이동
        powerUp.y += powerUp.speed;
        
        // 파워업 아이템 그리기
        ctx.fillStyle = getPowerUpColor(powerUp.type);
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, 
                powerUp.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 플레이어와 충돌 체크
        if (checkCollision(player, powerUp) || 
            (hasSecondPlane && checkCollision(secondPlane, powerUp))) {
            applyPowerUp(powerUp.type);
            return false;
        }
        
        // 화면 밖으로 나간 경우 제거
        return powerUp.y < canvas.height;
    });
}

// 파워업 아이템 색상 반환 함수
function getPowerUpColor(type) {
    switch(type) {
        case POWERUP_TYPES.SPEED_UP:
            return '#00ff00'; // 초록색
        case POWERUP_TYPES.SHIELD:
            return '#0000ff'; // 파란색
        case POWERUP_TYPES.DOUBLE_DAMAGE:
            return '#ff0000'; // 빨간색
        case POWERUP_TYPES.RAPID_FIRE:
            return '#ff00ff'; // 보라색
        default:
            return '#ffffff'; // 흰색
    }
}

// 파워업 효과 적용 함수 수정
function applyPowerUp(type) {
    switch(type) {
        case POWERUP_TYPES.SPEED_UP:
            player.speed *= 1.5;
            setTimeout(() => player.speed /= 1.5, 10000);
            break;
        case POWERUP_TYPES.SHIELD:
            hasShield = true;
            setTimeout(() => hasShield = false, 10000);
            break;
        case POWERUP_TYPES.DOUBLE_DAMAGE:
            damageMultiplier = 2;
            setTimeout(() => damageMultiplier = 1, 10000);
            break;
        case POWERUP_TYPES.RAPID_FIRE:
            fireRateMultiplier = 4;  // 연사 속도 증가 효과 더욱 강화
            setTimeout(() => fireRateMultiplier = 1, 10000);
            break;
    }
}

// 게임 상태 변수에 추가
let powerUps = [];
let hasShield = false;
let damageMultiplier = 1;
let fireRateMultiplier = 1;
let lastFireTime = 0;  // 마지막 발사 시간
let isSpacePressed = false;  // 스페이스바 누름 상태
let spacePressTime = 0;  // 스페이스바를 처음 누른 시간
let fireDelay = 600;  // 기본 발사 딜레이 (끊어서 발사할 때 - 더 느리게)
let continuousFireDelay = 50;  // 연속 발사 딜레이 (빠르게)
let bulletSpeed = 12;  // 총알 속도
let baseBulletSize = 4.5;  // 기본 총알 크기 (1.5배 증가)
let isContinuousFire = false;  // 연속 발사 상태
let canFire = true;  // 발사 가능 상태 추가
let lastReleaseTime = 0;  // 마지막 스페이스바 해제 시간
let singleShotCooldown = 500;  // 단발 발사 쿨다운 시간 (더 길게)
let minPressDuration = 200;  // 연속 발사로 전환되는 최소 누름 시간
let minReleaseDuration = 100;  // 단발 발사를 위한 최소 해제 시간

// 총알 크기 계산 함수 수정
function calculateBulletSize() {
    let size = baseBulletSize;
    
    // 현재 게임 점수에 따른 크기 증가
    if (score >= 10000) {
        size = 8;  // 중간 크기로 통일
    } else if (score >= 5000) {
        size = 7;  // 중간 크기로 통일
    }
    
    // 난이도에 따른 크기 증가
    if (gameLevel >= 4) {
        size = Math.max(size, 8);  // 중간 크기로 통일
    } else if (gameLevel >= 3) {
        size = Math.max(size, 7);  // 중간 크기로 통일
    }
    
    return size;
}

// 게임 상태 변수에 추가
let lastEnemySpawnTime = 0;
const MIN_ENEMY_SPAWN_INTERVAL = 500; // 최소 적 생성 간격 (밀리초)

// 게임 상태 변수에 추가
let isStartScreen = true;  // 시작 화면 상태
let startScreenAnimation = 0;  // 시작 화면 애니메이션 변수
let titleY = -100;  // 제목 Y 위치
let subtitleY = canvas.height + 100;  // 부제목 Y 위치
let stars = [];  // 배경 별들

// 시작 화면 초기화 함수
function initStartScreen() {
    // 배경 별들 생성
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 1,
            brightness: Math.random()
        });
    }
}

// 시작 화면 그리기 함수
function drawStartScreen() {
    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#000066');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별들 그리기
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // 제목 그라데이션
    const titleGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    titleGradient.addColorStop(0, '#ff0000');
    titleGradient.addColorStop(0.5, '#ffff00');
    titleGradient.addColorStop(1, '#ff0000');

    // 제목 그림자
    ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    // 제목
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = titleGradient;
    ctx.textAlign = 'center';
    ctx.fillText('SPACE SHOOTER', canvas.width/2, titleY);

    // 시작 화면 애니메이션
    if (titleY < canvas.height/2 - 100) {
        titleY += 5;
    }
    if (subtitleY > canvas.height/2 + 50) {
        subtitleY -= 5;
    }

    // 깜빡이는 효과
    const blinkSpeed = 500;
    const currentTime = Date.now();
    const isVisible = Math.floor(currentTime / blinkSpeed) % 2 === 0;
    
    if (isVisible) {
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.fillText('Press SPACE to Start', canvas.width/2, subtitleY);
    }

    // 조작법 안내
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('Controls:', 50, canvas.height - 150);
    ctx.fillText('↑↓←→ : Move', 50, canvas.height - 120);
    ctx.fillText('SPACE : Shoot', 50, canvas.height - 90);
    ctx.fillText('B : Special Weapon', 50, canvas.height - 60);
    ctx.fillText('P : Pause', 50, canvas.height - 30);
}

// 폭탄 생성 함수 추가
function createBomb(enemy) {
    const bomb = {
        x: enemy.x + enemy.width/2,
        y: enemy.y + enemy.height,
        width: 15,
        height: 15,
        speed: 5,
        rotation: 0,
        rotationSpeed: 0.1,
        trail: []  // 폭탄 꼬리 효과를 위한 배열
    };
    bombs.push(bomb);
}

// 폭탄 처리 함수 수정
function handleBombs() {
    bombs = bombs.filter(bomb => {
        // 폭탄 이동
        bomb.y += bomb.speed;
        bomb.rotation += bomb.rotationSpeed;
        
        // 폭탄 꼬리 효과 추가
        bomb.trail.unshift({x: bomb.x, y: bomb.y});
        if (bomb.trail.length > 5) bomb.trail.pop();
        
        // 폭탄 그리기
        ctx.save();
        ctx.translate(bomb.x, bomb.y);
        ctx.rotate(bomb.rotation);
        
        // 폭탄 본체
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, 0, bomb.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 폭탄 꼬리
        bomb.trail.forEach((pos, index) => {
            const alpha = 1 - (index / bomb.trail.length);
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(pos.x - bomb.x, pos.y - bomb.y, bomb.width/2 * (1 - index/bomb.trail.length), 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
        
        // 플레이어와 충돌 체크
        if (checkCollision(bomb, player) || (hasSecondPlane && checkCollision(bomb, secondPlane))) {
            handleCollision();
            explosions.push(new Explosion(bomb.x, bomb.y, true));
            return false;
        }
        
        // 화면 밖으로 나간 폭탄 제거
        return bomb.y < canvas.height;
    });
}

// 다이나마이트 생성 함수 추가
function createDynamite(enemy) {
    const dynamite = {
        x: enemy.x + enemy.width/2,
        y: enemy.y + enemy.height,
        width: 20,
        height: 30,
        speed: 4,
        rotation: 0,
        rotationSpeed: 0.05,
        flameParticles: [],  // 불꽃 파티클 배열
        fuseTimer: 0,  // 도화선 타이머
        fuseLength: 100,  // 도화선 길이
        fuseBurning: true,  // 도화선 연소 상태
        trail: []  // 꼬리 효과를 위한 배열
    };
    
    // 초기 불꽃 파티클 생성
    for (let i = 0; i < 10; i++) {
        dynamite.flameParticles.push({
            x: 0,
            y: -dynamite.height/2,
            speed: Math.random() * 2 + 1,
            angle: Math.random() * Math.PI * 2,
            size: Math.random() * 3 + 1,
            life: 1
        });
    }
    
    dynamites.push(dynamite);
}

// 다이나마이트 처리 함수 수정
function handleDynamites() {
    dynamites = dynamites.filter(dynamite => {
        // 다이나마이트 이동
        dynamite.y += dynamite.speed;
        dynamite.rotation += dynamite.rotationSpeed;
        
        // 도화선 타이머 업데이트
        if (dynamite.fuseBurning) {
            dynamite.fuseTimer += 1;
            if (dynamite.fuseTimer >= dynamite.fuseLength) {
                // 도화선이 다 타면 폭발
                explosions.push(new Explosion(dynamite.x, dynamite.y, true));
                return false;
            }
        }
        
        // 불꽃 파티클 업데이트
        dynamite.flameParticles.forEach(particle => {
            particle.x += Math.cos(particle.angle) * particle.speed;
            particle.y += Math.sin(particle.angle) * particle.speed;
            particle.life -= 0.02;
            particle.size *= 0.98;
        });
        
        // 새로운 불꽃 파티클 추가
        if (Math.random() < 0.3) {
            dynamite.flameParticles.push({
                x: 0,
                y: -dynamite.height/2,
                speed: Math.random() * 2 + 1,
                angle: Math.random() * Math.PI * 2,
                size: Math.random() * 3 + 1,
                life: 1
            });
        }
        
        // 오래된 파티클 제거
        dynamite.flameParticles = dynamite.flameParticles.filter(p => p.life > 0);
        
        // 다이나마이트 그리기
        ctx.save();
        ctx.translate(dynamite.x, dynamite.y);
        ctx.rotate(dynamite.rotation);
        
        // 다이나마이트 본체
        ctx.fillStyle = '#8B4513';  // 갈색
        ctx.fillRect(-dynamite.width/2, -dynamite.height/2, dynamite.width, dynamite.height);
        
        // 다이나마이트 줄무늬
        ctx.fillStyle = '#FF0000';  // 빨간색
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-dynamite.width/2, -dynamite.height/2 + i * 10, dynamite.width, 3);
        }
        
        // 도화선
        const fuseProgress = dynamite.fuseTimer / dynamite.fuseLength;
        ctx.strokeStyle = '#FFA500';  // 주황색
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -dynamite.height/2);
        ctx.lineTo(0, -dynamite.height/2 - 20 * (1 - fuseProgress));
        ctx.stroke();
        
        // 불꽃 파티클 그리기
        dynamite.flameParticles.forEach(particle => {
            ctx.fillStyle = `rgba(255, ${Math.floor(100 + Math.random() * 155)}, 0, ${particle.life})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
        
        // 플레이어와 충돌 체크
        if (checkCollision(dynamite, player) || (hasSecondPlane && checkCollision(dynamite, secondPlane))) {
            handleCollision();
            explosions.push(new Explosion(dynamite.x, dynamite.y, true));
            return false;
        }
        
        // 화면 밖으로 나간 다이나마이트 제거
        return dynamite.y < canvas.height;
    });
}

// 게임 상태 변수에 추가
let maxLives = 5;  // 최대 목숨 수

// === 사운드 볼륨 전역 변수 및 함수 추가 ===
let globalVolume = 0.1;
let isMuted = false;
let lastExplosionTime = 0;
const EXPLOSION_COOLDOWN = 100; // 효과음 재생 간격 (밀리초)
const VOLUME_DECAY = 0.8; // 연속 재생 시 볼륨 감소 비율
const SNAKE_EXPLOSION_VOLUME_MULTIPLIER = 1.5; // 뱀패턴 효과음 볼륨 배수 (1.5로 조정하여 볼륨 범위 내 유지)

function applyGlobalVolume() {
    const vol = isMuted ? 0 : Math.min(1, Math.max(0, globalVolume));
    shootSound.volume = vol;
    explosionSound.volume = vol;
    collisionSound.volume = vol;
    
    // 경고음이 존재할 때만 볼륨 설정
    if (warningSound) {
        warningSound.volume = vol;
    }
}

function playExplosionSound(isSnakePattern = false) {
    const currentTime = Date.now();
    let volumeMultiplier = 2.0; //플레이어 폭발음 볼윰 증가
    
    if (isSnakePattern) {
        volumeMultiplier = SNAKE_EXPLOSION_VOLUME_MULTIPLIER;
    }
    
    if (currentTime - lastExplosionTime < EXPLOSION_COOLDOWN) {
        // 연속 재생 시 볼륨 감소
        const decayedVolume = globalVolume * Math.pow(VOLUME_DECAY, 
            Math.floor((currentTime - lastExplosionTime) / EXPLOSION_COOLDOWN));
        const finalVolume = isMuted ? 0 : Math.min(1, Math.max(0, decayedVolume * volumeMultiplier));
        explosionSound.volume = finalVolume;
    } else {
        // 일반 재생
        const finalVolume = isMuted ? 0 : Math.min(1, Math.max(0, globalVolume * volumeMultiplier));
        explosionSound.volume = finalVolume;
    }
    
    explosionSound.currentTime = 0;
    explosionSound.play().catch(error => {
        console.log('오디오 재생 실패:', error);
    });
    lastExplosionTime = currentTime;
}

// 게임 상태 변수 추가
let isGameActive = true;
let isSoundControlActive = false;

// 키보드 입력 처리 함수
function handleGameInput(e) {
    // 게임 오버 상태에서 스페이스바로 재시작
    if (isGameOver && e.code === 'Space') {
        e.preventDefault();
        restartGame();
        return;
    }

    if (!isGameActive || isSoundControlActive) {
        return;
    }

    // 방향키/스페이스 스크롤 방지
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }

    // 게임 키 입력 처리
    if (e.code in keys) {
        keys[e.code] = true;
        
        // 스페이스바를 누를 때
        if (e.code === 'Space') {
            isSpacePressed = true;
            if (!spacePressTime) {
                spacePressTime = Date.now();
            }
        }
    }
}

// 키보드 해제 처리 함수
function handleGameInputRelease(e) {
    if (!isGameActive || isSoundControlActive) {
        return;
    }

    if (e.code in keys) {
        keys[e.code] = false;
        
        // 스페이스바를 뗄 때
        if (e.code === 'Space') {
            isSpacePressed = false;
            isContinuousFire = false;
            spacePressTime = 0;
            lastReleaseTime = Date.now();
        }
    }
}

// 사운드 컨트롤 활성화/비활성화 함수
function setSoundControlActive(active) {
    isSoundControlActive = active;
    if (!active) {
        // 사운드 컨트롤이 비활성화되면 게임 캔버스에 포커스
        document.getElementById('gameCanvas').focus();
    }
}

// 이벤트 리스너 등록
document.addEventListener('keydown', handleGameInput);
document.addEventListener('keyup', handleGameInputRelease);

// 게임 초기화 함수 수정
async function initializeGame() {
    console.log('게임 초기화 시작');
    isGameActive = true;
    isSoundControlActive = false;
    
    try {
        // 종료 이벤트 핸들러 설정
        setupExitHandlers();
        
        // 최고 점수 로드
        highScore = await loadHighScore();
        console.log('초기화된 최고 점수:', highScore);
        
        // === 모든 게임 요소 완전 초기화 ===
        
        // 1. 충돌 및 게임 상태 초기화
        collisionCount = 0;
        maxLives = 5;  // 최대 목숨 초기화
        hasSecondPlane = false;
        secondPlaneTimer = 0;
        
        // 2. 모든 배열 완전 초기화
        score = 0;
        levelScore = 0;
        bullets = [];           // 총알 배열 초기화
        enemies = [];           // 적 비행기 배열 초기화
        explosions = [];        // 폭발 효과 배열 초기화
        bombs = [];             // 폭탄 배열 초기화
        dynamites = [];         // 다이나마이트 배열 초기화
        powerUps = [];          // 파워업 배열 초기화
        snakeEnemies = [];      // 뱀 패턴 적 배열 초기화
        snakeGroups = [];       // 뱀 패턴 그룹 배열 초기화
        
        // 3. 게임 상태 초기화
        isGameOver = false;
        isPaused = false;
        flashTimer = 0;
        gameOverStartTime = null;
        
        // 4. 뱀 패턴 상태 초기화
        isSnakePatternActive = false;
        snakePatternTimer = 0;
        snakePatternInterval = 0;
        lastSnakeGroupTime = 0;
        
        // 5. 보스 관련 상태 완전 초기화
        bossActive = false;
        bossHealth = 0;
        bossDestroyed = false;
        bossPattern = 0;
        lastBossSpawnTime = Date.now();
        
        // 6. 플레이어 초기 위치 설정
        player.x = canvas.width / 2;
        player.y = canvas.height - 80;
        secondPlane.x = canvas.width / 2 - 60;
        secondPlane.y = canvas.height - 80;
        
        // 7. 게임 타이머 초기화
        lastEnemySpawnTime = 0;
        
        // 8. 파워업 상태 초기화
        hasSpreadShot = false;
        hasShield = false;
        damageMultiplier = 1;
        fireRateMultiplier = 1;
        
        // 9. 발사 관련 상태 초기화
        lastFireTime = 0;
        isSpacePressed = false;
        spacePressTime = 0;
        fireDelay = 600;
        continuousFireDelay = 50;
        bulletSpeed = 12;
        baseBulletSize = 4.5;
        isContinuousFire = false;
        canFire = true;
        lastReleaseTime = 0;
        singleShotCooldown = 500;
        minPressDuration = 200;
        minReleaseDuration = 100;
        
        // 10. 특수무기 관련 상태 초기화
        specialWeaponCharged = false;
        specialWeaponCharge = 0;
        specialWeaponCount = 0;
        
        // 11. 키보드 입력 상태 초기화
        Object.keys(keys).forEach(key => {
            keys[key] = false;
        });
        
        // 12. 사운드 관련 상태 초기화
        lastCollisionTime = 0;
        lastExplosionTime = 0;
        
        // 13. 패턴 추적 시스템 초기화
        levelBossPatterns.usedPatterns = [];
        levelBossPatterns.currentLevelPattern = null;
        
        console.log('게임 상태 초기화 완료');
        console.log('초기화된 상태:', {
            enemies: enemies.length,
            bullets: bullets.length,
            explosions: explosions.length,
            bombs: bombs.length,
            dynamites: dynamites.length,
            powerUps: powerUps.length,
            snakeGroups: snakeGroups.length,
            bossActive: bossActive,
            isSnakePatternActive: isSnakePatternActive
        });
        
        // 게임 루프 시작
        requestAnimationFrame(gameLoop);
        console.log('게임 루프 시작됨');
        
    } catch (error) {
        console.error('게임 초기화 중 오류:', error);
    }
}

// 게임 오버 처리 함수 수정
function handleGameOver() {
    if (!isGameOver) {
        isGameOver = true;
        gameOverStartTime = Date.now();
        
        // 최고 점수 저장
        const finalScore = Math.max(score, highScore);
        if (finalScore > 0) {
            saveHighScoreDirectly(finalScore, 'handleGameOver');
        }
        
        console.log('게임 오버 - 최종 점수:', score, '최고 점수:', highScore);
        
        // 게임 오버 시 사운드 컨트롤 상태 초기화
        isSoundControlActive = false;
        
        // 게임 오버 시 캔버스에 포커스
        document.getElementById('gameCanvas').focus();
    }
}

// 게임 재시작 함수 수정
function restartGame() {
    // 게임 상태 초기화
    isGameActive = true;
    isSoundControlActive = false;
    isGameOver = false;
    
    console.log('게임 재시작 - 재시작 전 최고 점수:', highScore);
    
    // 현재 최고 점수 저장
    const currentHighScore = Math.max(score, highScore);
    if (currentHighScore > 0) {
        saveHighScoreDirectly(currentHighScore, 'restartGame');
    }
    
    // === 모든 게임 요소 완전 초기화 ===
    
    // 1. 충돌 및 게임 상태 초기화
    collisionCount = 0;
    maxLives = 5;  // 최대 목숨 초기화
    hasSecondPlane = false;
    secondPlaneTimer = 0;
    
    // 2. 모든 배열 완전 초기화
    enemies = [];           // 적 비행기 배열 초기화
    bullets = [];           // 총알 배열 초기화
    explosions = [];        // 폭발 효과 배열 초기화
    bombs = [];             // 폭탄 배열 초기화
    dynamites = [];         // 다이나마이트 배열 초기화
    powerUps = [];          // 파워업 배열 초기화
    snakeEnemies = [];      // 뱀 패턴 적 배열 초기화
    snakeGroups = [];       // 뱀 패턴 그룹 배열 초기화
    
    // 3. 플레이어 위치 초기화
    player.x = canvas.width / 2;
    player.y = canvas.height - 80;
    secondPlane.x = canvas.width / 2 - 60;
    secondPlane.y = canvas.height - 80;
    
    // 4. 게임 타이머 및 상태 초기화
    gameOverStartTime = null;
    flashTimer = 0;
    lastEnemySpawnTime = 0;
    lastBossSpawnTime = Date.now();
    
    // 5. 점수 및 레벨 초기화
    score = 0;
    levelScore = 0;
    gameLevel = 1;
    levelUpScore = 1000;
    
    // 6. 특수무기 관련 상태 초기화
    specialWeaponCharged = false;
    specialWeaponCharge = 0;
    specialWeaponCount = 0;
    
    // 7. 보스 관련 상태 완전 초기화
    bossActive = false;
    bossHealth = 0;
    bossDestroyed = false;
    bossPattern = 0;
    
    // 8. 뱀 패턴 상태 초기화
    isSnakePatternActive = false;
    snakePatternTimer = 0;
    snakePatternInterval = 0;
    lastSnakeGroupTime = 0;
    
    // 9. 파워업 상태 초기화
    hasSpreadShot = false;
    hasShield = false;
    damageMultiplier = 1;
    fireRateMultiplier = 1;
    
    // 10. 발사 관련 상태 초기화
    lastFireTime = 0;
    isSpacePressed = false;
    spacePressTime = 0;
    fireDelay = 600;
    continuousFireDelay = 50;
    bulletSpeed = 12;
    baseBulletSize = 4.5;
    isContinuousFire = false;
    canFire = true;
    lastReleaseTime = 0;
    singleShotCooldown = 500;
    minPressDuration = 200;
    minReleaseDuration = 100;
    
    // 11. 키보드 입력 상태 초기화
    Object.keys(keys).forEach(key => {
        keys[key] = false;
    });
    
    // 12. 게임 화면 상태 초기화
    isStartScreen = false;
    isPaused = false;
    
    // 13. 사운드 관련 상태 초기화
    lastCollisionTime = 0;
    lastExplosionTime = 0;
    
    // 14. 경고음 초기화
    initializeWarningSound();
    
    // 15. 패턴 추적 시스템 초기화
    levelBossPatterns.usedPatterns = [];
    levelBossPatterns.currentLevelPattern = null;
    
    // 15. 캔버스 포커스 설정
    setTimeout(() => {
        document.getElementById('gameCanvas').focus();
    }, 100);
    
    // 패턴 사용 기록 초기화
    resetPatternUsage();
    
    console.log('게임 재시작 완료 - 모든 요소 초기화됨');
    console.log('현재 최고 점수:', highScore);
    console.log('초기화된 상태:', {
        enemies: enemies.length,
        bullets: bullets.length,
        explosions: explosions.length,
        bombs: bombs.length,
        dynamites: dynamites.length,
        powerUps: powerUps.length,
        snakeGroups: snakeGroups.length,
        bossActive: bossActive,
        isSnakePatternActive: isSnakePatternActive
    });
}

// 사운드 컨트롤 이벤트 핸들러 추가
window.addEventListener('message', (e) => {
    if (e.data === 'soundControlStart') {
        setSoundControlActive(true);
    } else if (e.data === 'soundControlEnd') {
        setSoundControlActive(false);
    }
});

// 랜덤 보스 패턴 선택 함수 수정
function getRandomBossPattern() {
    let patterns = Object.values(BOSS_PATTERNS);
    // 레벨 5 미만에서는 CIRCLE_SHOT 제외
    if (gameLevel < 5) {
        patterns = patterns.filter(p => p !== BOSS_PATTERNS.CIRCLE_SHOT);
    }
    return patterns[Math.floor(Math.random() * patterns.length)];
}

// 레벨별 패턴 추적 시스템 추가
let levelBossPatterns = {
    usedPatterns: [], // 사용한 패턴들 기록
    currentLevelPattern: null, // 현재 레벨에서 사용할 패턴
    patternSequence: [
        // 새로운 모양 패턴들을 앞쪽에 배치
        BOSS_PATTERNS.HEART_SHOT,
        BOSS_PATTERNS.STAR_SHOT,
        BOSS_PATTERNS.FLOWER_SHOT,
        BOSS_PATTERNS.BUTTERFLY_SHOT,
        BOSS_PATTERNS.FIREWORK_SHOT,
        BOSS_PATTERNS.CHAOS_SHOT,
        BOSS_PATTERNS.ICE_SHOT,
        BOSS_PATTERNS.DRAGON_SHOT,
        BOSS_PATTERNS.LIGHTNING_SHOT,
        BOSS_PATTERNS.CRYSTAL_SHOT,
        BOSS_PATTERNS.CLOUD_SHOT,
        BOSS_PATTERNS.LEAF_SHOT,
        BOSS_PATTERNS.GEAR_SHOT,
        BOSS_PATTERNS.ARROW_SHOT,
        BOSS_PATTERNS.SHIELD_SHOT,
        BOSS_PATTERNS.CROWN_SHOT,
        BOSS_PATTERNS.MOON_SHOT,
        // 기존 패턴들
        BOSS_PATTERNS.CIRCLE_SHOT,
        BOSS_PATTERNS.CROSS_SHOT,
        BOSS_PATTERNS.SPIRAL_SHOT,
        BOSS_PATTERNS.WAVE_SHOT,
        BOSS_PATTERNS.DIAMOND_SHOT,
        BOSS_PATTERNS.DOUBLE_SPIRAL,
        BOSS_PATTERNS.TRIPLE_WAVE,
        BOSS_PATTERNS.TARGETED_SHOT,
        BOSS_PATTERNS.BURST_SHOT
    ]
};

// 패턴 사용 기록 초기화 함수
function resetPatternUsage() {
    levelBossPatterns.usedPatterns = [];
    levelBossPatterns.currentLevelPattern = null;
    console.log('패턴 사용 기록 초기화됨');
    console.log('사용 가능한 패턴들:', levelBossPatterns.patternSequence.map(p => p).join(', '));
}