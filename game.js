// 게임 상수 정의
const SPECIAL_WEAPON_MAX_CHARGE = 3000;  // 특수무기 최대 충전량
const SPECIAL_WEAPON_CHARGE_RATE = 10;   // 특수무기 충전 속도
const SPECIAL_WEAPON_MAX_COUNT = 5;      // 특수무기 최대 보유 개수
const TOP_EFFECT_ZONE = 20;  // 상단 효과 무시 영역 (픽셀)

// 모바일 디바이스 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 모바일 속도 조절 (60% 속도)
const mobileSpeedMultiplier = isMobile ? 0.5 : 1.0;

// 모바일 감지 디버그 로그
console.log('모바일 디바이스 감지:', isMobile);
console.log('User Agent:', navigator.userAgent);

// 추가 비행기 횟수
let lastSecondPlaneScore = 0;

// 전체화면 상태 추적 변수
let isFullscreenActive = false;
let fullscreenReactivationPending = false;
let lastFullscreenAttempt = 0;
const FULLSCREEN_COOLDOWN = 1000; // 전체화면 재시도 간격 (1초)

// 전체화면 상태 확인 함수
function checkFullscreenState() {
    const isFullscreen = !!(document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement);
    
    if (isFullscreen !== isFullscreenActive) {
        isFullscreenActive = isFullscreen;
        console.log('전체화면 상태 변경:', isFullscreenActive);
        
        // 전체화면이 종료되었고 재활성화가 대기 중인 경우
        if (!isFullscreenActive && fullscreenReactivationPending) {
            console.log('전체화면 재활성화 대기 중...');
        }
    }
    
    return isFullscreenActive;
}

// 전체화면 재활성화 함수
function reactivateFullscreen() {
    if (!isMobile) {
        return;
    }
    
    // 쿨다운 체크 제거 - 즉시 재활성화 시도
    const currentTime = Date.now();
    lastFullscreenAttempt = currentTime;
    
    console.log('전체화면 재활성화 시도');
    fullscreenReactivationPending = true;
    
    // 약간의 지연 후 전체화면 활성화
    setTimeout(() => {
        if (fullscreenReactivationPending) {
            enableFullscreen();
        }
    }, 500);
}

// 모바일 전체화면 모드 활성화
function enableFullscreen() {
    if (!isMobile) {
        console.log('데스크탑 환경이므로 전체화면 모드 건너뜀');
        return;
    }

    const currentTime = Date.now();
    lastFullscreenAttempt = currentTime;

    console.log('모바일 전체화면 모드 활성화 시도');
    
    // 현재 전체화면 상태 확인 - 이미 전체화면이어도 강제로 시도
    const currentFullscreenState = checkFullscreenState();
    if (currentFullscreenState) {
        console.log('이미 전체화면 모드가 활성화되어 있지만, 강제로 재시도합니다.');
        // return 제거 - 이미 전체화면이어도 계속 진행
    }

    try {
        // 모든 가능한 전체화면 API를 순차적으로 시도
        console.log('전체화면 API 시도 시작...');
        
        // 1. 표준 requestFullscreen API
        if (document.documentElement.requestFullscreen) {
            console.log('표준 requestFullscreen API 시도...');
            const result = document.documentElement.requestFullscreen();
            if (result && typeof result.then === 'function') {
                result.then(() => {
                    isFullscreenActive = true;
                    fullscreenReactivationPending = false;
                    console.log('전체화면 모드 활성화 성공 (requestFullscreen)');
                }).catch(err => {
                    console.log('표준 API 실패, webkit으로 재시도:', err);
                    // 실패 시 webkit 방식으로 재시도
                    if (document.documentElement.webkitRequestFullscreen) {
                        document.documentElement.webkitRequestFullscreen();
                        isFullscreenActive = true;
                        fullscreenReactivationPending = false;
                        console.log('webkit 방식으로 재시도 성공');
                    }
                });
            } else {
                isFullscreenActive = true;
                fullscreenReactivationPending = false;
                console.log('전체화면 모드 활성화 성공 (requestFullscreen, non-promise)');
            }
        }
        // 2. webkitRequestFullscreen API
        else if (document.documentElement.webkitRequestFullscreen) {
            console.log('webkitRequestFullscreen API 시도...');
            document.documentElement.webkitRequestFullscreen();
            isFullscreenActive = true;
            fullscreenReactivationPending = false;
            console.log('전체화면 모드 활성화 성공 (webkitRequestFullscreen)');
        }
        // 3. mozRequestFullScreen API
        else if (document.documentElement.mozRequestFullScreen) {
            console.log('mozRequestFullScreen API 시도...');
            document.documentElement.mozRequestFullScreen();
            isFullscreenActive = true;
            fullscreenReactivationPending = false;
            console.log('전체화면 모드 활성화 성공 (mozRequestFullScreen)');
        }
        // 4. msRequestFullscreen API
        else if (document.documentElement.msRequestFullscreen) {
            console.log('msRequestFullscreen API 시도...');
            document.documentElement.msRequestFullscreen();
            isFullscreenActive = true;
            fullscreenReactivationPending = false;
            console.log('전체화면 모드 활성화 성공 (msRequestFullscreen)');
        }
        // 5. 모든 API가 실패한 경우
        else {
            console.log('모든 전체화면 API가 지원되지 않음');
        }

        // iOS Safari에서 주소창 숨김 및 모바일 전체화면 강화
        if (window.navigator.standalone || isMobile) {
            // 강제 전체화면 CSS 적용
            document.body.style.position = 'fixed';
            document.body.style.top = '0';
            document.body.style.left = '0';
            document.body.style.width = '100vw';
            document.body.style.height = '100vh';
            document.body.style.overflow = 'hidden';
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            document.body.style.zIndex = '9999';
            
            // HTML 요소도 전체화면으로 설정
            document.documentElement.style.position = 'fixed';
            document.documentElement.style.top = '0';
            document.documentElement.style.left = '0';
            document.documentElement.style.width = '100vw';
            document.documentElement.style.height = '100vh';
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.margin = '0';
            document.documentElement.style.padding = '0';
            
            isFullscreenActive = true;
            console.log('모바일 강제 전체화면 CSS 적용 완료');
            
            // 추가로 1초 후 다시 한 번 시도
            setTimeout(() => {
                if (isMobile && !checkFullscreenState()) {
                    console.log('1초 후 전체화면 재시도...');
                    enableFullscreen();
                }
            }, 1000);
        }

        // 화면 방향 고정 (세로 모드)
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait').catch(err => {
                console.log('화면 방향 고정 실패:', err);
            });
        }

        console.log('모바일 전체화면 모드 활성화 시도 완료');
    } catch (error) {
        console.error('전체화면 모드 활성화 중 오류:', error);
    }
}

// 전체화면 이벤트 리스너 설정
function setupFullscreenEventListeners() {
    if (!isMobile) {
        return;
    }
    
    // 전체화면 상태 변경 이벤트
    document.addEventListener('fullscreenchange', () => {
        const wasFullscreen = isFullscreenActive;
        const isNowFullscreen = checkFullscreenState();
        
        if (wasFullscreen && !isNowFullscreen) {
            console.log('전체화면이 종료되었습니다. 재활성화 대기 중...');
            fullscreenReactivationPending = true;
        }
    });
    
    document.addEventListener('webkitfullscreenchange', () => {
        const wasFullscreen = isFullscreenActive;
        const isNowFullscreen = checkFullscreenState();
        
        if (wasFullscreen && !isNowFullscreen) {
            console.log('webkit 전체화면이 종료되었습니다. 재활성화 대기 중...');
            fullscreenReactivationPending = true;
        }
    });
    
    document.addEventListener('mozfullscreenchange', () => {
        checkFullscreenState();
    });
    
    document.addEventListener('MSFullscreenChange', () => {
        checkFullscreenState();
    });
    
    console.log('전체화면 이벤트 리스너 설정 완료');
}

// 터치 컨트롤 관련 변수
let touchStartX = 0;
let touchStartY = 0;

// 모바일 연속 발사 관련 변수
let mobileFireStartTime = 0;
let isMobileFirePressed = false;
let mobileContinuousFireInterval = null;

// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 변수 설정 (모바일용)
const CANVAS_WIDTH = 392;
const CANVAS_HEIGHT = 700;

// 캔버스 크기 설정
function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    if (container) {
        // 컨테이너 스타일 조정
        container.style.height = 'calc(100vh - 80px)';  // 모바일 컨트롤 높이만큼 제외
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        
        // 캔버스 스타일 조정
        canvas.style.borderRadius = '0';  // 모서리를 각지게
        
        // 캔버스 크기를 모바일 비율에 맞게 설정 (일관성 유지)
        canvas.width = CANVAS_WIDTH;  // 모바일 비율에 맞춘 가로 크기
        canvas.height = CANVAS_HEIGHT;  // 모바일 비율에 맞춘 세로 크기
        
        // CSS에서 설정한 크기와 일치하도록 스타일 설정
        canvas.style.width = '392px';
        canvas.style.height = '700px';
    }
}

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener('resize', resizeCanvas);

// 초기 캔버스 크기 설정
resizeCanvas();

// 모바일 터치 컨트롤 요소들
const mobileControls = {
    btnUp: document.getElementById('btn-up'),
    btnDown: document.getElementById('btn-down'),
    btnLeft: document.getElementById('btn-left'),
    btnRight: document.getElementById('btn-right'),
    btnFire: document.getElementById('btn-fire'),
    btnSpecial: document.getElementById('btn-special'),
    btnPause: document.getElementById('btn-pause'),
    btnReset: document.getElementById('btn-reset')
};

// 모바일 컨트롤 요소 확인
console.log('모바일 컨트롤 요소들:', mobileControls);

// 커스텀 최고 점수 리셋 모달 함수
function showResetModal(onYes, onNo) {
    const modal = document.getElementById('resetModal');
    modal.style.display = 'flex';
    const yesBtn = document.getElementById('resetYes');
    const noBtn = document.getElementById('resetNo');
    yesBtn.onclick = null;
    noBtn.onclick = null;
    yesBtn.onclick = () => {
        modal.style.display = 'none';
        if (onYes) onYes();
    };
    noBtn.onclick = () => {
        modal.style.display = 'none';
        if (onNo) onNo();
    };
}

// 모바일 터치 컨트롤 이벤트 설정

function setupMobileControls() {
    console.log('모바일 컨트롤 설정 시작');
    console.log('isMobile:', isMobile);
    
    if (!isMobile) {
        console.log('데스크탑 환경이므로 모바일 컨트롤 설정 건너뜀');
        return;
    }
    
    // 방향키 터치 이벤트
    mobileControls.btnUp.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.ArrowUp = true;
    }, { passive: false });
    mobileControls.btnUp.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.ArrowUp = false;
    }, { passive: false });
    
    mobileControls.btnDown.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.ArrowDown = true;
    }, { passive: false });
    mobileControls.btnDown.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.ArrowDown = false;
    }, { passive: false });
    
    mobileControls.btnLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.ArrowLeft = true;
    }, { passive: false });
    mobileControls.btnLeft.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.ArrowLeft = false;
    }, { passive: false });
    
    mobileControls.btnRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.ArrowRight = true;
    }, { passive: false });
    mobileControls.btnRight.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.ArrowRight = false;
    }, { passive: false });
    
    // 시작/재시작 버튼 터치 이벤트
    mobileControls.btnFire.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('시작/재시작 버튼 터치');
        
        // 전체화면 활성화 시도 (모바일에서만)
        if (isMobile) {
            console.log('전체화면 활성화 시도 - 현재 상태:', isFullscreenActive);
            enableFullscreen();
        }
        
        // 시작 화면에서 버튼을 누르면 게임 시작 준비
        if (isStartScreen) {
            isStartScreen = false;
            gameStarted = false; // 화면 터치 대기 상태
            console.log('모바일에서 게임 시작 준비 - 화면 터치 대기');
        }
        
        // 게임 오버 상태에서 재시작
        if (isGameOver) {
            restartGame();
            return;
        }
    }, { passive: false });
    
    mobileControls.btnFire.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('시작/재시작 버튼 터치 종료');
    }, { passive: false });
    
    // 클릭 이벤트도 추가 (데스크탑용)
    mobileControls.btnFire.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('시작/재시작 버튼 클릭');
        
        // 전체화면 활성화 시도 (모바일에서만) - 항상 먼저 실행
        if (isMobile) {
            console.log('전체화면 활성화 시도 - 현재 상태:', isFullscreenActive);
            enableFullscreen();
        }
        
        if (isStartScreen) {
            isStartScreen = false;
            gameStarted = false; // 화면 터치 대기 상태
            console.log('모바일에서 게임 시작 준비 - 화면 터치 대기');
        }
        
        // 게임 오버 상태에서 재시작
        if (isGameOver) {
            restartGame();
            return;
        }
    });
    
    mobileControls.btnSpecial.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.KeyB = true;
    }, { passive: false });
    mobileControls.btnSpecial.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.KeyB = false;
    }, { passive: false });
    
    mobileControls.btnPause.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('일시정지 버튼 터치');
        
        if (!isGameOver) {
            isPaused = !isPaused;
            if (isPaused) {
                console.log('게임 일시정지됨');
            } else {
                console.log('게임 재개됨');
            }
        }
    }, { passive: false });
    
    mobileControls.btnPause.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });
    
    // 클릭 이벤트도 추가 (데스크탑용)
    mobileControls.btnPause.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('일시정지 버튼 클릭');
        
        if (!isGameOver) {
            isPaused = !isPaused;
            if (isPaused) {
                console.log('게임 일시정지됨');
            } else {
                console.log('게임 재개됨');
            }
        }
    });
    
    mobileControls.btnReset.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('재시작 버튼 터치');
        showResetModal(
            () => {
                ScoreManager.reset().then(() => {
                    console.log('ScoreManager를 통한 최고 점수 리셋 완료');
                }).catch(error => {
                    console.error('ScoreManager 리셋 실패:', error);
                    highScore = 0;
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('백업 방법으로 최고 점수 리셋');
                });
            },
            () => {}
        );
    }, { passive: false });

    mobileControls.btnReset.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('재시작 버튼 클릭');
        showResetModal(
            () => {
                ScoreManager.reset().then(() => {
                    console.log('ScoreManager를 통한 최고 점수 리셋 완료');
                }).catch(error => {
                    console.error('ScoreManager 리셋 실패:', error);
                    highScore = 0;
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('백업 방법으로 최고 점수 리셋');
                });
            },
            () => {}
        );
    });
        
    // 마우스 이벤트도 추가 (데스크탑용)
    mobileControls.btnFire.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('시작/재시작 버튼 마우스 다운');
        
        // 전체화면 활성화 시도 (모바일에서만) - 항상 먼저 실행
        if (isMobile) {
            console.log('전체화면 활성화 시도 - 현재 상태:', isFullscreenActive);
            enableFullscreen();
        }
        
        if (isStartScreen) {
            isStartScreen = false;
            gameStarted = false; // 화면 터치 대기 상태
            console.log('모바일에서 게임 시작 준비 - 화면 터치 대기');
        }
    });
    
    mobileControls.btnFire.addEventListener('mouseup', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('시작/재시작 버튼 마우스 업');
    });
    
    mobileControls.btnPause.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('일시정지 버튼 마우스 다운');
        
        if (!isGameOver) {
            isPaused = !isPaused;
            if (isPaused) {
                console.log('게임 일시정지됨');
            } else {
                console.log('게임 재개됨');
            }
        }
    });
    
    mobileControls.btnPause.addEventListener('mouseup', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
}

// 오디오 요소 가져오기
let shootSound = null;
let explosionSound = null;
let collisionSound = null;

// 충돌 사운드 재생 시간 제어를 위한 변수 추가
let lastCollisionTime = 0;
const collisionSoundCooldown = 300;  // 충돌음 쿨다운 시간 증가

// 충돌 사운드 길이 제어 (초기화 후에 설정)
// 이 부분은 initializeGame 함수에서 처리됩니다

// 목숨 감소 시 경고음과 UI 깜빡임을 위한 변수들
let warningSound = null;
let lifeBlinkTimer = 0;
let lifeBlinkDuration = 2000; // 2초간 깜빡임
let isLifeBlinking = false;
let lastLifeCount = 5; // 이전 목숨 수

// 플레이어 우주선 - 모바일용 캔버스 크기(392x700)로 제한
const canvasWidth = CANVAS_WIDTH;
const canvasHeight = CANVAS_HEIGHT;
const player = {
    x: canvasWidth / 2,
    y: 0,  // 임시로 0으로 설정
    width: 58,
    height: 58,
    speed: 8
};
// Y 위치를 객체 생성 후 설정
player.y = canvasHeight - player.height - 10;

// 두 번째 비행기
const secondPlane = {
    x: canvasWidth / 2 - 60,
    y: 0,  // 임시로 0으로 설정
    width: 58,
    height: 58,
    speed: 8
};
// Y 위치를 객체 생성 후 설정
secondPlane.y = canvasHeight - secondPlane.height - 10;

// 게임 상태 변수 설정
let bullets = [];          // 플레이어 총알 배열
let bossBullets = [];      // 보스 총알 배열 (별도 분리)
let enemies = [];         // 적 배열
let explosions = [];      // 폭발 효과 배열
let bombParticles = [];   // 폭탄 폭발 파티클 배열
let enemyMissiles = [];   // 적 미사일 배열
let shieldedEnemies = []; // 방어막 적 배열
let gameLevel = 1;        // 게임 레벨
let levelScore = 0;       // 레벨 점수
let levelUpScore = 1000;  // 레벨업에 필요한 점수
let score = 0;           // 현재 점수
let highScore = 0;       // 최고 점수 (초기값 0으로 설정)
let hasSecondPlane = false;  // 두 번째 비행기 보유 여부
let secondPlaneTimer = 0;    // 두 번째 비행기 타이머
let isPaused = false;     // 일시정지 상태
let collisionCount = 0;   // 충돌 횟수
let maxLives = 5;        // 최대 목숨 수
let isGameOver = false;   // 게임 오버 상태
let flashTimer = 0;       // 깜박임 효과 타이머
let flashDuration = 500;  // 깜박임 지속 시간
let gameOverStartTime = null;  // 게임 오버 시작 시간
let isSnakePatternActive = false;  // 뱀 패턴 활성화 상태
let snakePatternTimer = 0;  // 뱀 패턴 타이머
let snakePatternDuration = 6000;  // 뱀 패턴 지속 시간 (6초로 단축)
let snakeEnemies = [];  // 뱀 패턴의 적군 배열
let snakePatternInterval = 0;  // 뱀 패턴 생성 간격
let snakeGroups = [];  // 뱀 패턴 그룹 배열
let lastSnakeGroupTime = 0;  // 마지막 뱀 그룹 생성 시간
const snakeGroupInterval = 2000;  // 그룹 생성 간격 (2초로 단축)
const maxSnakeGroups = 2;  // 최대 동시 그룹 수 (3에서 2로 감소)
let gameVersion = '1.0.0-202506161826';  // 게임 버전

// 게임 상태 변수에 추가
let isStartScreen = true;  // 시작 화면 상태
let gameStarted = false;   // 모바일에서 화면 터치 후 게임 시작 상태
let bossActive = false;
let bossHealth = 0;
let bossPattern = 0;
let specialWeaponCharged = false;
let specialWeaponCharge = 0;
let specialWeaponCount = 0;  // 특수무기 보유 개수
let specialWeaponUsedCount = 0;  // 특수무기 사용 횟수

// 보스 경고 시스템 변수 추가
let bossWarning = {
    active: false,
    pattern: '',
    message: '',
    timer: 0,
    duration: 3000, // 3초간 경고 표시
    patternDetails: '',
    warningTime: 3000 // 3초 전에 경고 시작
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
    // 새로운 확산탄 패턴들
    HEART_SHOT: 'heart_shot',        // 하트 모양 확산탄
    STAR_SHOT: 'star_shot',          // 별 모양 확산탄
    FLOWER_SHOT: 'flower_shot',      // 꽃 모양 확산탄
    BUTTERFLY_SHOT: 'butterfly_shot', // 나비 모양 확산탄
    SPIRAL_WAVE: 'spiral_wave',      // 나선형 파동 확산탄
    CONCENTRIC_CIRCLES: 'concentric_circles', // 동심원 확산탄
    FIREWORK_SHOT: 'firework_shot',  // 불꽃놀이 확산탄
    CHAOS_SHOT: 'chaos_shot'         // 혼돈 확산탄
};

// 키보드 입력 상태
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false,
    F5: false,
    KeyP: false,
    KeyB: false  // 특수 무기 발사 키
};

// 난이도 설정
const difficultySettings = {
    1: { // 초급 - 더 느리고 부드럽게 시작
        enemySpeed: 1.2 * mobileSpeedMultiplier,
        enemySpawnRate: 0.015,
        horizontalSpeedRange: 1.5 * mobileSpeedMultiplier,
        patternChance: 0.1,
        maxEnemies: 4,
        bossHealth: 1500,
        bossSpawnInterval: 25000, // 25초
        powerUpChance: 0.1,
        bombDropChance: 0.1,
        dynamiteDropChance: 0.05
    },
    2: { // 중급 - 점진적 증가
        enemySpeed: 1.8 * mobileSpeedMultiplier,
        enemySpawnRate: 0.025,
        horizontalSpeedRange: 2.2 * mobileSpeedMultiplier,
        patternChance: 0.25,
        maxEnemies: 6,
        bossHealth: 1800,
        bossSpawnInterval: 20000, // 20초
        powerUpChance: 0.15,
        bombDropChance: 0.15,
        dynamiteDropChance: 0.1
    },
    3: { // 고급 - 적당한 난이도
        enemySpeed: 2.4 * mobileSpeedMultiplier,
        enemySpawnRate: 0.035,
        horizontalSpeedRange: 3 * mobileSpeedMultiplier,
        patternChance: 0.4,
        maxEnemies: 8,
        bossHealth: 2100,
        bossSpawnInterval: 18000, // 18초
        powerUpChance: 0.2,
        bombDropChance: 0.2,
        dynamiteDropChance: 0.15
    },
    4: { // 전문가 - 도전적이지만 공정한 난이도
        enemySpeed: 3.2 * mobileSpeedMultiplier,
        enemySpawnRate: 0.045,
        horizontalSpeedRange: 4 * mobileSpeedMultiplier,
        patternChance: 0.6,
        maxEnemies: 12,
        bossHealth: 2400,
        bossSpawnInterval: 16000, // 16초
        powerUpChance: 0.25,
        bombDropChance: 0.25,
        dynamiteDropChance: 0.2
    },
    5: { // 마스터 - 최고 난이도
        enemySpeed: 4.2 * mobileSpeedMultiplier,
        enemySpawnRate: 0.055,
        horizontalSpeedRange: 5 * mobileSpeedMultiplier,
        patternChance: 0.8,
        maxEnemies: 16,
        bossHealth: 2700,
        bossSpawnInterval: 15000, // 15초
        powerUpChance: 0.3,
        bombDropChance: 0.3,
        dynamiteDropChance: 0.25
    }
};

// 레벨 6 이상을 위한 확장 난이도 설정 (더 부드러운 증가)
const extendedDifficultySettings = {
    6: { // 그랜드마스터
        enemySpeed: 4.8 * mobileSpeedMultiplier,
        enemySpawnRate: 0.062,
        horizontalSpeedRange: 5.5 * mobileSpeedMultiplier,
        patternChance: 0.85,
        maxEnemies: 18,
        bossHealth: 3000,
        bossSpawnInterval: 14000,
        powerUpChance: 0.35,
        bombDropChance: 0.35,
        dynamiteDropChance: 0.3
    },
    7: { // 레전드
        enemySpeed: 5.3 * mobileSpeedMultiplier,
        enemySpawnRate: 0.068,
        horizontalSpeedRange: 6 * mobileSpeedMultiplier,
        patternChance: 0.9,
        maxEnemies: 20,
        bossHealth: 3300,
        bossSpawnInterval: 13000,
        powerUpChance: 0.4,
        bombDropChance: 0.4,
        dynamiteDropChance: 0.35
    },
    8: { // 미스터
        enemySpeed: 5.7 * mobileSpeedMultiplier,
        enemySpawnRate: 0.073,
        horizontalSpeedRange: 6.4 * mobileSpeedMultiplier,
        patternChance: 0.92,
        maxEnemies: 22,
        bossHealth: 3600,
        bossSpawnInterval: 12000,
        powerUpChance: 0.45,
        bombDropChance: 0.45,
        dynamiteDropChance: 0.4
    },
    9: { // 고드
        enemySpeed: 6 * mobileSpeedMultiplier,
        enemySpawnRate: 0.077,
        horizontalSpeedRange: 6.7 * mobileSpeedMultiplier,
        patternChance: 0.94,
        maxEnemies: 24,
        bossHealth: 3900,
        bossSpawnInterval: 11000,
        powerUpChance: 0.5,
        bombDropChance: 0.5,
        dynamiteDropChance: 0.45
    },
    10: { // 울티메이트
        enemySpeed: 6.2 * mobileSpeedMultiplier,
        enemySpawnRate: 0.08,
        horizontalSpeedRange: 7 * mobileSpeedMultiplier,
        patternChance: 0.95,
        maxEnemies: 26,
        bossHealth: 4200,
        bossSpawnInterval: 12000,
        powerUpChance: 0.55,
        bombDropChance: 0.55,
        dynamiteDropChance: 0.5
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
            console.log('ScoreManager 리셋 시작');
            
            // 모든 저장소에서 점수 초기화
            highScore = 0;
            
            // localStorage 완전 리셋
            try {
                // 모든 관련 키들을 제거
                const keysToRemove = [
                    'highScore', 'highScore_backup', 'highScore_timestamp',
                    'ShootingGameHighScore', 'ShootingGameHighScore_backup',
                    'gameScore', 'gameHighScore', 'currentScore'
                ];
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // 0으로 설정
                localStorage.setItem('highScore', '0');
                localStorage.setItem('highScore_backup', '0');
                localStorage.setItem('highScore_timestamp', Date.now().toString());
                
                console.log('ScoreManager localStorage 완전 리셋 완료');
            } catch (e) {
                console.warn('ScoreManager localStorage 리셋 실패:', e);
                // 실패 시 전체 클리어 시도
                try {
                    localStorage.clear();
                    console.log('localStorage 전체 클리어 완료');
                } catch (clearError) {
                    console.error('localStorage 전체 클리어 실패:', clearError);
                }
            }
            
            // sessionStorage 완전 리셋
            try {
                // 모든 관련 키들을 제거
                const sessionKeysToRemove = [
                    'currentHighScore', 'ShootingGameCurrentHighScore',
                    'gameScore', 'gameHighScore', 'currentScore'
                ];
                
                sessionKeysToRemove.forEach(key => {
                    sessionStorage.removeItem(key);
                });
                
                // 0으로 설정
                sessionStorage.setItem('currentHighScore', '0');
                
                console.log('ScoreManager sessionStorage 완전 리셋 완료');
            } catch (e) {
                console.warn('ScoreManager sessionStorage 리셋 실패:', e);
                // 실패 시 전체 클리어 시도
                try {
                    sessionStorage.clear();
                    console.log('sessionStorage 전체 클리어 완료');
                } catch (clearError) {
                    console.error('sessionStorage 전체 클리어 실패:', clearError);
                }
            }
            
            // IndexedDB 리셋
            try {
                await saveScoreToIndexedDB(0);
                console.log('ScoreManager IndexedDB 리셋 완료');
            } catch (e) {
                console.warn('ScoreManager IndexedDB 리셋 실패:', e);
            }
            
            // Electron IPC 리셋 (Electron 환경에서만)
            try {
                if (window.electron && window.electron.ipcRenderer) {
                    await window.electron.ipcRenderer.invoke('reset-score');
                    console.log('ScoreManager Electron IPC 리셋 완료');
                }
            } catch (e) {
                console.warn('ScoreManager Electron IPC 리셋 실패:', e);
            }
            
            // 게임 변수들 리셋
            score = 0;
            levelScore = 0;
            gameLevel = 1;
            
            // 페이지 새로고침을 통한 완전한 리셋
            setTimeout(() => {
                console.log('페이지 새로고침으로 완전한 리셋 실행');
                window.location.reload();
            }, 100);
            
            console.log('ScoreManager 모든 저장소 리셋 완료 - 현재 최고 점수:', highScore);
        } catch (error) {
            console.error('ScoreManager 리셋 중 오류:', error);
            // 오류 발생 시 강제 새로고침
            setTimeout(() => {
                console.log('오류로 인한 강제 페이지 새로고침');
                window.location.reload();
            }, 100);
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
        // 이미지 로딩
        await loadGameImages();
        
        // 모바일 컨트롤 설정
        setupMobileControls();
        
        // 모바일에서 터치 드래그 컨트롤 설정
        if (isMobile) {
            setupTouchDragControls();
        }
        
        // 전체화면 이벤트 리스너 설정
        setupFullscreenEventListeners();
        
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
        lastSecondPlaneScore = 0; // ← 추가!
        
        // 2. 모든 배열 완전 초기화
        score = 0;
        levelScore = 0;
        bullets = [];           // 총알 배열 초기화
        enemies = [];           // 적 비행기 배열 초기화
        explosions = [];        // 폭발 효과 배열 초기화
        bombParticles = [];     // 폭탄 폭발 파티클 배열 초기화
        bombs = [];             // 폭탄 배열 초기화
        dynamites = [];         // 다이나마이트 배열 초기화
        powerUps = [];          // 파워업 배열 초기화
        snakeEnemies = [];      // 뱀 패턴 적 배열 초기화
        snakeGroups = [];       // 뱀 패턴 그룹 배열 초기화
        enemyMissiles = [];     // 적 미사일 배열 초기화
        shieldedEnemies = [];   // 방어막 적 배열 초기화
        
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
        bossDestroyed = false;  // 보스 파괴 상태 초기화
        bossPattern = 0;
        lastBossSpawnTime = Date.now();
               
        // 6. 플레이어 초기 위치 설정 - 모바일용 캔버스 크기(392x700)로 제한
        const canvasWidth = CANVAS_WIDTH;
        const canvasHeight = CANVAS_HEIGHT;
        player.x = canvasWidth / 2 - player.width / 2;
        player.y = canvasHeight - player.height - 10;
        secondPlane.x = canvasWidth / 2 - 60 - player.width / 2;
        secondPlane.y = canvasHeight - secondPlane.height - 10;
        
        // 7. 게임 타이머 초기화
        lastEnemySpawnTime = 0;
        lastShieldedEnemySpawnTime = 0;
        
        // 8. 파워업 상태 초기화
        hasShield = false;
        damageMultiplier = 1;
        fireRateMultiplier = 1;
        
        // 9. 발사 관련 상태 초기화
        lastFireTime = 0;
        isSpacePressed = false;
        spacePressTime = 0;
        fireDelay = 1200;
        continuousFireDelay = 50;
        bulletSpeed = 10 * mobileSpeedMultiplier;
        baseBulletSize = 5.0;
        isContinuousFire = false;
        canFire = true;
        lastReleaseTime = 0;
        singleShotCooldown = 500;
        minPressDuration = 200;
        minReleaseDuration = 100;
        
        // 총알 크기 캐시 초기화
        cachedBulletSize = null;
        lastBulletSizeCalculation = { score: -1, level: -1 };
        
        // 총알 크기 캐시 초기화
        cachedBulletSize = null;
        lastBulletSizeCalculation = { score: -1, level: -1 };
        
        // 10. 특수무기 관련 상태 초기화
        specialWeaponCharged = false;
        specialWeaponCharge = 0;
        specialWeaponCount = 0;
        specialWeaponUsedCount = 0;
        
        // 11. 키보드 입력 상태 초기화
        Object.keys(keys).forEach(key => {
            keys[key] = false;
        });
        
        // 12. 사운드 관련 상태 초기화
        lastCollisionTime = 0;
        lastExplosionTime = 0;
        
        // 13. 오디오 요소 초기화 (강화된 안전장치)
        try {
            // DOM이 완전히 로드될 때까지 대기
            let retryCount = 0;
            const maxRetries = 10;
            
            const initializeAudio = () => {
                shootSound = document.getElementById('shootSound');
                explosionSound = document.getElementById('explosionSound');
                collisionSound = document.getElementById('collisionSound');
                warningSound = document.getElementById('warningSound');
                
                console.log(`오디오 초기화 시도 ${retryCount + 1}/${maxRetries}:`, {
                    shootSound: !!shootSound,
                    explosionSound: !!explosionSound,
                    collisionSound: !!collisionSound,
                    warningSound: !!warningSound
                });
                
                // 모든 오디오 요소가 로드되었는지 확인
                if (shootSound && explosionSound && collisionSound && warningSound) {
                    console.log('모든 오디오 요소 로드 완료!');
                    
                    // 사운드 볼륨 설정
                    shootSound.volume = clampVolume(0.4);
                    explosionSound.volume = clampVolume(0.6);
                    collisionSound.volume = clampVolume(0.5);
                    warningSound.volume = clampVolume(0.6);
                    
                    // 충돌 사운드 길이 제어 설정
                    collisionSound.addEventListener('loadedmetadata', () => {
                        collisionSound.duration = Math.min(collisionSound.duration, 0.8);
                    });
                    
                    return true;
                }
                
                return false;
            };
            
            // 즉시 시도
            if (!initializeAudio()) {
                // 실패 시 재시도
                const retryInterval = setInterval(() => {
                    retryCount++;
                    if (initializeAudio() || retryCount >= maxRetries) {
                        clearInterval(retryInterval);
                        if (retryCount >= maxRetries) {
                            console.error('오디오 요소 초기화 실패 - 최대 재시도 횟수 초과');
                        }
                    }
                }, 100); // 100ms마다 재시도
            }
            
        } catch (error) {
            console.error('게임 초기화 - 오디오 요소 초기화 실패:', error);
        }
        
        // 충돌 사운드 길이 제어 설정
        if (collisionSound) {
            collisionSound.addEventListener('loadedmetadata', () => {
                // 사운드 길이를 0.8초로 제한
                collisionSound.duration = Math.min(collisionSound.duration, 0.8);
            });
        }
        
        // 14. 목숨 깜빡임 상태 초기화
        lifeBlinkTimer = 0;
        isLifeBlinking = false;
        lastLifeCount = maxLives;
        
        // 13. 패턴 추적 시스템은 각 보스별로 관리되므로 전역 초기화 불필요
        
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
        
        // 시작 화면 초기화
        initStartScreen();
        
        // 게임 루프 시작
        startGameLoop();
        console.log('게임 루프 시작됨');
        
        // 모바일에서 전체화면 모드 활성화
        //if (isMobile) {
        //    setTimeout(() => {
        //        enableFullscreen();
        //    }, 1000);
        //}
        
    } catch (error) {
        console.error('게임 초기화 중 오류:', error);
    }
}

// 페이지 로드 시 오디오 요소 초기화 및 모바일 전체화면 모드 활성화
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료 - 오디오 요소 초기화 시작...');
    
    // GitHub Pages 호환성을 위한 오디오 요소 동적 생성
    const createAudioElement = (id, filename) => {
        // 기존 요소가 있으면 제거
        const existingElement = document.getElementById(id);
        if (existingElement) {
            existingElement.remove();
        }
        
        // 새로운 오디오 요소 생성
        const audio = document.createElement('audio');
        audio.id = id;
        audio.preload = 'auto';
        
        // 다양한 경로 시도 (GitHub Pages 호환성)
        const possiblePaths = [
            `sounds/${filename}`,
            `./sounds/${filename}`,
            `../sounds/${filename}`,
            `../../sounds/${filename}`,
            `/${filename}`,
            filename
        ];
        
        // 첫 번째 경로로 설정
        audio.src = possiblePaths[0];
        
        // 오류 시 다른 경로 시도
        audio.addEventListener('error', () => {
            console.log(`${id} 오디오 로드 실패, 다른 경로 시도 중...`);
            let currentPathIndex = 0;
            
            const tryNextPath = () => {
                currentPathIndex++;
                if (currentPathIndex < possiblePaths.length) {
                    console.log(`${id} 경로 변경 시도: ${possiblePaths[currentPathIndex]}`);
                    audio.src = possiblePaths[currentPathIndex];
                } else {
                    console.error(`${id} 모든 경로 시도 실패`);
                }
            };
            
            audio.addEventListener('error', tryNextPath, { once: true });
        });
        
        // 성공 시 로그
        audio.addEventListener('canplaythrough', () => {
            console.log(`${id} 오디오 로드 성공: ${audio.src}`);
        });
        
        // 로드 완료 시 로그
        audio.addEventListener('loadeddata', () => {
            console.log(`${id} 오디오 데이터 로드 완료`);
        });
        
        document.body.appendChild(audio);
        return audio;
    };
    
    // 오디오 요소들을 동적으로 생성
    try {
        shootSound = createAudioElement('shootSound', 'shoot.mp3');
        explosionSound = createAudioElement('explosionSound', 'explosion.mp3');
        collisionSound = createAudioElement('collisionSound', 'collision.mp3');
        warningSound = createAudioElement('warningSound', 'warning.mp3');
        
        console.log('동적 오디오 요소 생성 완료:', {
            shootSound: !!shootSound,
            explosionSound: !!explosionSound,
            collisionSound: !!collisionSound,
            warningSound: !!warningSound
        });
        
        // 사운드 볼륨 설정
        if (shootSound) {
            shootSound.volume = clampVolume(0.4);
        }
        if (explosionSound) {
            explosionSound.volume = clampVolume(0.6);
        }
        if (collisionSound) {
            collisionSound.volume = clampVolume(0.5);
        }
        if (warningSound) {
            warningSound.volume = clampVolume(0.6);
        }
        
        console.log('오디오 요소 초기화 완료!');
        
    } catch (error) {
        console.error('DOM 로드 시 오디오 요소 초기화 실패:', error);
    }
    
    // 모바일에서 전체화면 모드 활성화
    if (isMobile) {
        // 페이지 로드 후 약간의 지연을 두고 전체화면 모드 활성화
        //setTimeout(() => {
        //    enableFullscreen();
        //}, 1000);
        
        // 사용자 상호작용 후 전체화면 모드 활성화 (iOS Safari 요구사항)
        document.addEventListener('touchstart', () => {
            enableFullscreen();
        }, { once: true });
        
        document.addEventListener('click', () => {
            enableFullscreen();
        }, { once: true });
    }
});

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
    enemyMissiles = [];     // 적 미사일 배열 초기화
    shieldedEnemies = [];   // 방어막 적 배열 초기화
    
    // 3. 플레이어 위치 초기화 - 모바일용 캔버스 크기(392x700)로 제한
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    player.x = canvasWidth / 2;
    player.y = canvasHeight - player.height - 10;  // 10에서 player.height + 10으로 변경하여 캔버스 하단에서 10픽셀 위에 위치
    secondPlane.x = canvasWidth / 2 - 60;
    secondPlane.y = canvasHeight - secondPlane.height - 10;  // 10에서 secondPlane.height + 10으로 변경하여 캔버스 하단에서 10픽셀 위에 위치
    
    // 4. 게임 타이머 및 상태 초기화
    gameOverStartTime = null;
    flashTimer = 0;
    lastEnemySpawnTime = 0;
    lastShieldedEnemySpawnTime = 0;
    lastBossSpawnTime = Date.now();
    
    // 5. 점수 및 레벨 초기화
    score = 0;
    levelScore = 0;
    scoreForSpread = 0;
    gameLevel = 1;
    levelUpScore = 1000;
    
    // 6. 특수무기 관련 상태 초기화
    specialWeaponCharged = false;
    specialWeaponCharge = 0;
    specialWeaponCount = 0;
    specialWeaponUsedCount = 0;
    
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
    fireDelay = 1200;
    continuousFireDelay = 50;
    bulletSpeed = 12;
    baseBulletSize = 5.0;
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
        
        // 14. 오디오 요소 초기화 (강화된 안전장치)
        try {
            // DOM이 완전히 로드될 때까지 대기
            let retryCount = 0;
            const maxRetries = 10;
            
            const initializeAudio = () => {
                shootSound = document.getElementById('shootSound');
                explosionSound = document.getElementById('explosionSound');
                collisionSound = document.getElementById('collisionSound');
                warningSound = document.getElementById('warningSound');
                
                console.log(`게임 재시작 - 오디오 초기화 시도 ${retryCount + 1}/${maxRetries}:`, {
                    shootSound: !!shootSound,
                    explosionSound: !!explosionSound,
                    collisionSound: !!collisionSound,
                    warningSound: !!warningSound
                });
                
                // 모든 오디오 요소가 로드되었는지 확인
                if (shootSound && explosionSound && collisionSound && warningSound) {
                    console.log('게임 재시작 - 모든 오디오 요소 로드 완료!');
                    
                    // 사운드 볼륨 설정
                    shootSound.volume = clampVolume(0.4);
                    explosionSound.volume = clampVolume(0.6);
                    collisionSound.volume = clampVolume(0.5);
                    warningSound.volume = clampVolume(0.6);
                    
                    return true;
                }
                
                return false;
            };
            
            // 즉시 시도
            if (!initializeAudio()) {
                // 실패 시 재시도
                const retryInterval = setInterval(() => {
                    retryCount++;
                    if (initializeAudio() || retryCount >= maxRetries) {
                        clearInterval(retryInterval);
                        if (retryCount >= maxRetries) {
                            console.error('게임 재시작 - 오디오 요소 초기화 실패 - 최대 재시도 횟수 초과');
                        }
                    }
                }, 100); // 100ms마다 재시도
            }
            
        } catch (error) {
            console.error('게임 재시작 - 오디오 요소 초기화 실패:', error);
        }
        
        // 15. 목숨 깜빡임 상태 초기화
        lifeBlinkTimer = 0;
        isLifeBlinking = false;
        lastLifeCount = maxLives;
    
    // 14. 패턴 추적 시스템은 각 보스별로 관리되므로 전역 초기화 불필요
    
    // 15. 캔버스 포커스 설정
    setTimeout(() => {
        document.getElementById('gameCanvas').focus();
    }, 100);
    
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
    // 레벨에 따른 난이도 설정 가져오기 (개선된 시스템)
    let currentDifficulty;
    if (gameLevel <= 5) {
        currentDifficulty = difficultySettings[gameLevel];
    } else if (gameLevel <= 10) {
        currentDifficulty = extendedDifficultySettings[gameLevel];
    } else {
        // 레벨 11 이상: 더 부드러운 증가
        const baseLevel = 10;
        const levelDiff = gameLevel - baseLevel;
        const baseSettings = extendedDifficultySettings[10];
        
        currentDifficulty = {
            enemySpeed: baseSettings.enemySpeed + (levelDiff * 0.1) * mobileSpeedMultiplier,
            enemySpawnRate: Math.min(0.12, baseSettings.enemySpawnRate + (levelDiff * 0.002)),
            horizontalSpeedRange: baseSettings.horizontalSpeedRange + (levelDiff * 0.1) * mobileSpeedMultiplier,
            patternChance: Math.min(0.98, baseSettings.patternChance + (levelDiff * 0.01)),
            maxEnemies: Math.min(35, baseSettings.maxEnemies + levelDiff),
            bossHealth: baseSettings.bossHealth + (levelDiff * 200),
            bossSpawnInterval: Math.max(12000, baseSettings.bossSpawnInterval), // 레벨 11 이상에서는 최소 12초 유지
            powerUpChance: Math.min(0.7, baseSettings.powerUpChance + (levelDiff * 0.01)),
            bombDropChance: Math.min(0.7, baseSettings.bombDropChance + (levelDiff * 0.01)),
            dynamiteDropChance: Math.min(0.6, baseSettings.dynamiteDropChance + (levelDiff * 0.01))
        };
    }
    
    // 뱀 패턴 생성은 handleSnakePattern에서 처리하도록 변경

    // 패턴 선택 확률 조정
    const patterns = Object.values(ENEMY_PATTERNS);
    const enemyType = Math.random() < currentDifficulty.patternChance ? 
        patterns[Math.floor(Math.random() * patterns.length)] : ENEMY_PATTERNS.NORMAL;
    
    // 적 생성 위치 계산 - 모바일용 캔버스 크기(392x700)로 제한
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    const spawnX = Math.random() * (canvasWidth - 30);
    const spawnY = -30;
    
    const enemy = {
        x: spawnX,
        y: spawnY,
        width: 47,  // 43에서 10% 증가 (47)
        height: 47, // 43에서 10% 증가 (47)
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
    
    // 모바일용 캔버스 크기(392x700)로 제한
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    
    // 적군이 화면 상단에 머무르지 않도록 기본 하강 속도 추가
    const baseSpeed = enemy.speed || 1.5;  // 2에서 1.5로 조정
    
    switch(enemy.type) {
        case ENEMY_PATTERNS.ZIGZAG:
            // 지그재그 패턴 - 더 자연스럽게 조정
            enemy.x += Math.sin(enemy.y * 0.05) * enemy.speed * 2;  // 0.08에서 0.05로, 3에서 2로
            enemy.y += baseSpeed * 1.1;  // 1.2에서 1.1로
            break;
            
        case ENEMY_PATTERNS.CIRCLE:
            // 원형 회전 패턴 - 더 자연스럽게 조정
            enemy.circleAngle += 0.06;  // 0.08에서 0.06으로
            enemy.x = enemy.circleCenterX + Math.cos(enemy.circleAngle) * enemy.circleRadius;
            enemy.y = enemy.circleCenterY + Math.sin(enemy.circleAngle) * enemy.circleRadius + baseSpeed * 1.3;  // 1.5에서 1.3으로
            break;
            
        case ENEMY_PATTERNS.DIAGONAL:
            // 대각선 다이빙 패턴 - 더 급격하게
            if (!enemy.isDiving) {
                enemy.x += enemy.diagonalDirection * enemy.speed * 1.5;
                enemy.y += baseSpeed * 0.8;
                if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
                    enemy.isDiving = true;
                    enemy.originalY = enemy.y;
                }
            } else {
                enemy.y += enemy.diveSpeed * 1.3;
                if (enemy.y >= enemy.originalY + 250) {
                    enemy.isDiving = false;
                    enemy.diagonalDirection *= -1;
                }
            }
            break;
            
        case ENEMY_PATTERNS.SPIRAL:
            // 나선형 패턴 - 더 복잡하게
            enemy.spiralAngle += 0.08;
            enemy.spiralRadius += 0.8;
            enemy.x = enemy.circleCenterX + Math.cos(enemy.spiralAngle) * enemy.spiralRadius;
            enemy.y = enemy.circleCenterY + Math.sin(enemy.spiralAngle) * enemy.spiralRadius + baseSpeed * 1.3;
            break;
            
        case ENEMY_PATTERNS.WAVE:
            // 파도형 패턴 - 더 큰 진폭으로
            enemy.waveAngle += enemy.waveFrequency * 1.5;
            enemy.x += Math.sin(enemy.waveAngle) * enemy.waveAmplitude * 0.15;
            enemy.y += baseSpeed * 1.1;
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
                enemy.x = Math.random() * (canvasWidth - enemy.width);
                enemy.y = Math.max(enemy.y - 100, 0); // 위로 순간이동
            }
            break;
            
                case ENEMY_PATTERNS.MIRROR:
            // 거울 패턴 (플레이어 반대 방향)
        const mirrorX = canvasWidth - player.x;
        const targetMirrorX = mirrorX + (enemy.mirrorOffset - canvasWidth / 2);
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
    if (enemy.x <= 0 || enemy.x >= canvasWidth - enemy.width) {
        enemy.direction *= -1;
    }
    if (enemy.y <= 0 || enemy.y >= canvasHeight - enemy.height) {
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
    console.log('startSnakePattern 함수 호출됨');
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
        speed: 2 + Math.random() * 2, // 속도 랜덤화 (원래 값으로 복원)
        amplitude: Math.random() * 100 + 150, // 진폭 (원래 값으로 복원)
        frequency: Math.random() * 0.5 + 0.75, // 주파수 (원래 값으로 복원)
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
        mirrorOffset: Math.random() * CANVAS_WIDTH,
        patternChangeTimer: 0,
        patternChangeInterval: 5000 + Math.random() * 3000, // 패턴 변경 간격
        currentSpeed: 2 + Math.random() * 2,
        maxSpeed: 5 + Math.random() * 3
    };
    
    // 첫 번째 적 생성
    const firstEnemy = {
        x: newGroup.startX,
        y: newGroup.startY,
        width: 47,  // 30에서 47로 변경 (일반 적과 동일한 크기)
        height: 47, // 30에서 47로 변경 (일반 적과 동일한 크기)
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
    snakeEnemies.push(firstEnemy); // snakeEnemies 배열에도 추가
    snakeGroups.push(newGroup);
    console.log('뱀 패턴 생성 완료:', { 
        snakeEnemiesLength: snakeEnemies.length, 
        snakeGroupsLength: snakeGroups.length, 
        isSnakePatternActive,
        firstEnemyType: firstEnemy.type,
        firstEnemyPosition: { x: firstEnemy.x, y: firstEnemy.y }
    });
}

// 그룹별 시작 위치 계산 함수 추가
function getRandomStartPosition() {
    // 모바일용 캔버스 크기(392x700)로 제한
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    
    // 화면을 4등분하여 각 구역별로 다른 시작 위치 설정
    const section = Math.floor(Math.random() * 4);
    const sectionWidth = canvasWidth / 4;
    
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
    const previousLifeCount = maxLives - collisionCount;
    collisionCount++;
    flashTimer = flashDuration;
    
    // 목숨이 감소했을 때 경고음 재생 및 깜빡임 시작
    const currentLifeCount = maxLives - collisionCount;
    console.log(`충돌 처리 - 이전 목숨: ${previousLifeCount}, 현재 목숨: ${currentLifeCount}, maxLives: ${maxLives}, collisionCount: ${collisionCount}`);
    
    if (currentLifeCount < previousLifeCount) {
        console.log('목숨 감소 감지! 경고음 재생 시작...');
        
        // 경고음 재생 (강화된 안전장치 포함)
        if (warningSound) {
            console.log('경고음 요소 발견, 재생 시도...');
            warningSound.currentTime = 0;
            warningSound.volume = clampVolume(0.6);
            applyGlobalVolume();
            warningSound.play().then(() => {
                console.log('경고음 재생 성공!');
            }).catch(error => {
                console.log('경고음 재생 실패:', error);
            });
        } else {
            console.log('경고음 요소를 찾을 수 없습니다. 재초기화 시도...');
            
            // 즉시 재초기화 시도
            try {
                warningSound = document.getElementById('warningSound');
                if (warningSound) {
                    console.log('경고음 요소 재발견! 재생 시도...');
                    warningSound.currentTime = 0;
                    warningSound.volume = clampVolume(0.6);
                    applyGlobalVolume();
                    warningSound.play().then(() => {
                        console.log('경고음 재생 성공! (재초기화 후)');
                    }).catch(error => {
                        console.log('경고음 재생 실패 (재초기화 후):', error);
                    });
                } else {
                    console.log('경고음 요소를 여전히 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('경고음 재초기화 실패:', error);
            }
        }
        
        // 목숨 UI 깜빡임 시작
        lifeBlinkTimer = lifeBlinkDuration;
        isLifeBlinking = true;
        lastLifeCount = currentLifeCount;
        
        console.log(`목숨 감소! 경고음 재생 및 UI 깜빡임 시작. 남은 목숨: ${currentLifeCount}`);
    } else {
        console.log('목숨 감소가 감지되지 않았습니다.');
    }
    
    // 플레이어와 미사일 충돌 시 폭발 효과 생성
    explosions.push(new Explosion(
        player.x + player.width/2,
        player.y + player.height/2,
        false
    ));
    
    // 두 번째 비행기가 있다면 해당 위치에도 폭발 효과
    if (hasSecondPlane) {
        explosions.push(new Explosion(
            secondPlane.x + secondPlane.width/2,
            secondPlane.y + secondPlane.height/2,
            false
        ));
    }
    
    if (currentTime - lastCollisionTime >= collisionSoundCooldown) {
        collisionSound.currentTime = 0;
        collisionSound.volume = clampVolume(0.5);
        // 폭발음으로 변경
        explosionSound.currentTime = 0;
        explosionSound.volume = clampVolume(0.6);
        applyGlobalVolume();
        explosionSound.play().catch(error => {
            console.log('오디오 재생 실패:', error);
        });
        lastCollisionTime = currentTime;
    }
    
    if (collisionCount >= maxLives) {  // maxLives 사용
        handleGameOver();
        
        // 폭발 효과
        explosions.push(new Explosion(
            player.x + player.width/2,
            player.y + player.height/2,
            true
        ));
        
        // 주변 폭발 효과
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 / 16) * i;
            const distance = 80;
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
            
            for (let i = 0; i < 16; i++) {
                const angle = (Math.PI * 2 / 16) * i;
                const distance = 80;
                explosions.push(new Explosion(
                    secondPlane.x + secondPlane.width/2 + Math.cos(angle) * distance,
                    secondPlane.y + secondPlane.height/2 + Math.sin(angle) * distance,
                    false
                ));
            }
        }
        
        // 게임 오버 시 폭발음 재생
        applyGlobalVolume();
        explosionSound.currentTime = 0;
        explosionSound.play().catch(error => {
            console.log('오디오 재생 실패:', error);
        });
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

// 폭탄 폭발 파티클 클래스
class BombExplosionParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8; // 랜덤 X 속도
        this.vy = (Math.random() - 0.5) * 8; // 랜덤 Y 속도
        this.size = Math.random() * 4 + 2; // 랜덤 크기
        this.life = 1.0; // 생명력
        this.decay = Math.random() * 0.02 + 0.01; // 감쇠 속도
        this.color = this.getRandomExplosionColor(); // 랜덤 색상
        this.rotation = Math.random() * Math.PI * 2; // 랜덤 회전
        this.rotationSpeed = (Math.random() - 0.5) * 0.2; // 회전 속도
    }
    
    getRandomExplosionColor() {
        const colors = [
            '#FF4500', // 주황빨강
            '#FF6347', // 토마토
            '#FF8C00', // 진한 주황
            '#FFA500', // 주황
            '#FFD700', // 금색
            '#FFFF00', // 노랑
            '#FF0000', // 빨강
            '#DC143C'  // 진한 빨강
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        // 위치 업데이트
        this.x += this.vx;
        this.y += this.vy;
        
        // 속도 감쇠
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        // 중력 효과
        this.vy += 0.1;
        
        // 생명력 감소
        this.life -= this.decay;
        
        // 회전 업데이트
        this.rotation += this.rotationSpeed;
        
        // 크기 감소
        this.size *= 0.99;
        
        return this.life > 0;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 파티클 그리기
        ctx.fillStyle = this.color + Math.floor(this.life * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 파티클 외곽선
        ctx.strokeStyle = '#FF0000' + Math.floor(this.life * 100).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
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
    // 적응형 프레임 레이트 업데이트
    adaptiveFrameRate.update();
    
    if (isPaused) {
        if (gameLoopRunning) {
            requestAnimationFrame(gameLoop);
        }
        return;
    }

    // 두 번째 비행기 처리
    handleSecondPlane(); // ← 추가

    // 성능 모드에서 프레임 스킵
    if (adaptiveFrameRate.shouldSkipFrame()) {
        if (gameLoopRunning) {
            requestAnimationFrame(gameLoop);
        }
        return;
    }

    // 화면 전체를 지우고 새로 그리기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isStartScreen) {
        drawStartScreen();
        if (gameLoopRunning) {
            requestAnimationFrame(gameLoop);
        }
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
                ctx.font = 'bold 48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 80);
                
                ctx.font = 'bold 20px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`최종 점수: ${score}`, canvas.width/2, canvas.height/2 - 20);
                ctx.fillText(`충돌 횟수: ${collisionCount}`, canvas.width/2, canvas.height/2 + 20);
                ctx.font = 'bold 20px Arial';
                ctx.fillStyle = '#ffff00';                
                ctx.fillText('시작/재시작 버튼 누른 후 터치하여 재시작', canvas.width/2, canvas.height/2 + 80);
            }
        }
        if (gameLoopRunning) {
            requestAnimationFrame(gameLoop);
        }
        return;
    }

    try {
        // 성능 모니터링 (레벨 9 이상에서만)
        if (gameLevel >= 9) {
            const startTime = performance.now();
            
            // 깜박임 효과 처리
            if (flashTimer > 0) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                flashTimer -= 16;
            }
            
            // 목숨 깜빡임 타이머 업데이트
            if (lifeBlinkTimer > 0) {
                lifeBlinkTimer -= 16;
                if (lifeBlinkTimer <= 0) {
                    isLifeBlinking = false;
                    lifeBlinkTimer = 0;
                }
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
                
                // 최소 12초 간격 보장
                const minInterval = Math.max(12000, BOSS_SETTINGS.SPAWN_INTERVAL);
                if (timeSinceLastBoss >= minInterval) {
                    console.log('보스 생성 조건 만족:', {
                        currentTime,
                        lastBossSpawnTime,
                        timeSinceLastBoss,
                        interval: minInterval
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
                    lastBossSpawnTime = currentTime;  // 다음 보스 등장 시간 업데이트
                    console.log('보스가 제거되어 상태 초기화');
                }
            }

            // 총알 이동 및 충돌 체크
            handleBullets();

            // 적 미사일 발사 처리
            handleEnemyMissileFiring();

            // 적 미사일 업데이트
            updateEnemyMissiles();

            // 방어막 적 업데이트
            updateShieldedEnemies();


            // 두 번째 비행기 처리
            handleSecondPlane();

            // 레벨업 체크
            checkLevelUp();

            // 폭발 효과 업데이트 및 그리기
            handleExplosions();

            // 폭탄 폭발 파티클 업데이트 및 그리기
            handleBombParticles();

            // 폭탄 처리 추가
            handleBombs();

            // 다이나마이트 처리 추가
            handleDynamites();

            // UI 그리기
            drawUI();

            // 성능 측정 및 로그 (1초에 한 번만)
            const endTime = performance.now();
            const frameTime = endTime - startTime;
            
            if (Math.random() < 0.016) { // 약 60fps에서 1초에 한 번
                console.log('성능 모니터링:', {
                    frameTime: frameTime.toFixed(2) + 'ms',
                    enemies: enemies.length,
                    bullets: bullets.length,
                    explosions: explosions.length,
                    bombParticles: bombParticles.length,
                    level: gameLevel,
                    fps: adaptiveFrameRate.currentFPS,
                    frameSkip: adaptiveFrameRate.frameSkip,
                    performanceMode: adaptiveFrameRate.performanceMode
                });
            }
        } else {
            // 레벨 9 미만에서는 기존 로직
            // 깜박임 효과 처리
            if (flashTimer > 0) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                flashTimer -= 16;
            }
            
            // 목숨 깜빡임 타이머 업데이트
            if (lifeBlinkTimer > 0) {
                lifeBlinkTimer -= 16;
                if (lifeBlinkTimer <= 0) {
                    isLifeBlinking = false;
                    lifeBlinkTimer = 0;
                }
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
                
                // 최소 12초 간격 보장
                const minInterval = Math.max(12000, BOSS_SETTINGS.SPAWN_INTERVAL);
                if (timeSinceLastBoss >= minInterval) {
                    console.log('보스 생성 조건 만족:', {
                        currentTime,
                        lastBossSpawnTime,
                        timeSinceLastBoss,
                        interval: minInterval
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
                    lastBossSpawnTime = currentTime;  // 다음 보스 등장 시간 업데이트
                    console.log('보스가 제거되어 상태 초기화');
                }
            }

            // 총알 이동 및 충돌 체크
            handleBullets();

            // 적 미사일 발사 처리
            handleEnemyMissileFiring();

            // 적 미사일 업데이트
            updateEnemyMissiles();

            // 방어막 적 업데이트
            updateShieldedEnemies();


            // 두 번째 비행기 처리
            handleSecondPlane();

            // 레벨업 체크
            checkLevelUp();

            // 폭발 효과 업데이트 및 그리기
            handleExplosions();

            // 폭탄 폭발 파티클 업데이트 및 그리기
            handleBombParticles();

            // 폭탄 처리 추가
            handleBombs();

            // 다이나마이트 처리 추가
            handleDynamites();

            // UI 그리기
            drawUI();
        }

        // 보스 총알 처리 (별도 함수)
        handleBossBullets();

        // 다음 프레임 요청 (게임 루프가 실행 중일 때만)
        if (gameLoopRunning) {
            requestAnimationFrame(gameLoop);
        }
    } catch (error) {
        console.error('게임 루프 실행 중 오류:', error);
        if (gameLoopRunning) {
            requestAnimationFrame(gameLoop);
        }
    }
}

// 플레이어 이동 처리 함수
function handlePlayerMovement() {
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;

    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed * 0.5;
    }
    if (keys.ArrowRight && player.x < CANVAS_WIDTH - player.width) {
        player.x += player.speed * 0.5;
    }
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < CANVAS_HEIGHT - player.height - 10) {
        player.y += player.speed;
    }
    // ↓↓↓ 아래 코드만 남기세요
    if (hasSecondPlane) {
        if (player.x + player.width + secondPlane.width < CANVAS_WIDTH) {
            secondPlane.x = player.x + player.width;
        } else if (player.x - secondPlane.width > 0) {
            secondPlane.x = player.x - secondPlane.width;
        } else {
            secondPlane.x = CANVAS_WIDTH - secondPlane.width - 10;
        }
        secondPlane.y = player.y;
    }
}

// 적 처리 함수 수정
function handleEnemies() {
    if (isMobile && !gameStarted) return;
    const currentTime = Date.now();
    
    // 레벨에 따른 난이도 설정 가져오기 (개선된 시스템)
    let currentDifficulty;
    if (gameLevel <= 5) {
        currentDifficulty = difficultySettings[gameLevel];
    } else if (gameLevel <= 10) {
        currentDifficulty = extendedDifficultySettings[gameLevel];
    } else {
        // 레벨 11 이상: 더 부드러운 증가
        const baseLevel = 10;
        const levelDiff = gameLevel - baseLevel;
        const baseSettings = extendedDifficultySettings[10];
        
        currentDifficulty = {
            enemySpeed: baseSettings.enemySpeed + (levelDiff * 0.1) * mobileSpeedMultiplier,
            enemySpawnRate: Math.min(0.12, baseSettings.enemySpawnRate + (levelDiff * 0.002)),
            horizontalSpeedRange: baseSettings.horizontalSpeedRange + (levelDiff * 0.1) * mobileSpeedMultiplier,
            patternChance: Math.min(0.98, baseSettings.patternChance + (levelDiff * 0.01)),
            maxEnemies: Math.min(35, baseSettings.maxEnemies + levelDiff),
            bossHealth: baseSettings.bossHealth + (levelDiff * 200),
            bossSpawnInterval: Math.max(12000, baseSettings.bossSpawnInterval), // 레벨 11 이상에서는 최소 12초 유지
            powerUpChance: Math.min(0.7, baseSettings.powerUpChance + (levelDiff * 0.01)),
            bombDropChance: Math.min(0.7, baseSettings.bombDropChance + (levelDiff * 0.01)),
            dynamiteDropChance: Math.min(0.6, baseSettings.dynamiteDropChance + (levelDiff * 0.01))
        };
    }

    // 뱀 패턴 처리 - 항상 체크하도록 수정
    handleSnakePattern();

    // 일반 적 생성 - 시간 기반 생성 로직으로 변경 (성능 모드에서 빈도 조절)
    const spawnRate = adaptiveFrameRate.performanceMode ? 
        currentDifficulty.enemySpawnRate * 0.8 : currentDifficulty.enemySpawnRate;  // 성능 모드에서 20% 감소
    const maxEnemies = adaptiveFrameRate.performanceMode ? 
        Math.min(currentDifficulty.maxEnemies, Math.floor(currentDifficulty.maxEnemies * 0.8)) : currentDifficulty.maxEnemies;  // 성능 모드에서 20% 감소
    
    if (currentTime - lastEnemySpawnTime >= MIN_ENEMY_SPAWN_INTERVAL &&
        Math.random() < spawnRate && 
        enemies.length < maxEnemies &&
        !isGameOver) {
        createEnemy();
        lastEnemySpawnTime = currentTime;
    }

    // 방어막 적 생성 (레벨 3 이상에서 등장)
    if (gameLevel >= 3 && 
        currentTime - lastShieldedEnemySpawnTime >= 8000 && // 8초마다
        shieldedEnemies.length < 2 && // 최대 2개까지만
        !isGameOver) {
        createShieldedEnemy();
        lastShieldedEnemySpawnTime = currentTime;
    }

    // 일반 적 이동 및 충돌 체크
    enemies = enemies.filter(enemy => {
        // 적 비행기 위치 업데이트
        updateEnemyPosition(enemy);
        
        // 새로운 위치에 적 비행기 그리기
        if (enemy.isBoss) {
            drawBoss(enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
            drawEnemy(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        
        // 충돌 체크 및 화면 밖 체크
        return checkEnemyCollisions(enemy);
    });
}

// 뱀 패턴 처리 함수 수정
function handleSnakePattern() {
    if (isMobile && !gameStarted) return;
    const currentTime = Date.now();
    
    // 새로운 그룹 생성 체크 - 더 자주 생성되도록 수정
    if (currentTime - lastSnakeGroupTime >= snakeGroupInterval && 
        snakeGroups.length < maxSnakeGroups) {
        lastSnakeGroupTime = currentTime;
        startSnakePattern();
    }
    
    // 각 그룹 처리
    snakeGroups = snakeGroups.filter(group => {
        if (!group.isActive) return false;
        
        // 그룹의 지속 시간 체크
        if (Date.now()- group.startTime >= snakePatternDuration) {
            group.isActive = false;
            return false;
        }
        
        // 초기 비행기 생성 (그룹이 시작될 때 한 번만)
        if (!group.initialEnemiesCreated) {
            if (Date.now() - group.patternInterval >= 300 && group.enemies.length < 12) {  // 15에서 12로 감소
                group.patternInterval = Date.now();
                
                // 파괴되지 않은 마지막 적을 찾기
                const activeEnemies = group.enemies.filter(enemy => !enemy.isHit);
                if (activeEnemies.length === 0) return false; // 활성 적이 없으면 그룹 종료
                
                const lastEnemy = activeEnemies[activeEnemies.length - 1];
                const newEnemy = {
                    x: lastEnemy.x,
                    y: lastEnemy.y,
                    width: 47,  // 30에서 47로 변경 (일반 적과 동일한 크기)
                    height: 47, // 30에서 47로 변경 (일반 적과 동일한 크기)
                    speed: group.speed,
                    type: 'snake',
                    targetX: lastEnemy.x,
                    targetY: lastEnemy.y,
                    angle: lastEnemy.angle,
                    isHit: false,
                    amplitude: group.amplitude,
                    frequency: group.frequency,
                    lastChange: Date.now(),
                    // 새로운 속성들 추가
                    waveAngle: group.waveAngle,
                    zigzagAngle: group.zigzagAngle,
                    circleAngle: group.circleAngle,
                    vortexAngle: group.vortexAngle,
                    bounceAngle: group.bounceAngle,
                    currentSpeed: group.currentSpeed
                };
                group.enemies.push(newEnemy);
                snakeEnemies.push(newEnemy); // snakeEnemies 배열에도 추가
                console.log(`뱀 패턴 적 추가: 총 ${group.enemies.length}개, snakeEnemies 배열 ${snakeEnemies.length}개`);
            }
            
            if (group.enemies.length >= 12) {  // 15에서 12로 감소
                group.initialEnemiesCreated = true;
            }
        }
        
        // 그룹 내 적군 이동
        group.enemies.forEach((enemy, index) => {
            if (index === 0) {
                // 패턴 변경 체크
                if (Date.now() - group.patternChangeTimer >= group.patternChangeInterval) {
                    group.patternType = getRandomPatternType();
                    group.patternChangeTimer = Date.now();
                    group.currentSpeed = Math.min(group.currentSpeed * 1.2, group.maxSpeed);
                }
                
                        // 첫 번째 적의 이동 패턴 - 모바일용 캔버스 크기(392x700)로 제한
                const canvasWidth = CANVAS_WIDTH;
                const canvasHeight = CANVAS_HEIGHT;
        switch(group.patternType) {
            case PATTERN_TYPES.SNAKE:
                // S자 움직임 - 더 자연스럽게 조정
                enemy.angle += 0.04;  // 0.05에서 0.04로
                const baseX = group.startX;
                const waveX = Math.sin(enemy.angle * group.frequency) * group.amplitude;
                enemy.x = baseX + waveX;
                enemy.y += enemy.speed * 1.1;  // 1.3에서 1.1로
                break;
                
            case PATTERN_TYPES.VERTICAL:
                // 세로 움직임 - 약간의 흔들림 추가
                enemy.y += enemy.speed * 1.2;
                enemy.x = group.startX + Math.sin(enemy.angle) * 50;
                enemy.angle += 0.03;
                break;
                
            case PATTERN_TYPES.DIAGONAL:
                // 대각선 움직임 - 더 급격하게
                enemy.x += enemy.speed * group.direction * 1.5;
                enemy.y += enemy.speed * 1.3;
                if (enemy.x <= 0 || enemy.x >= CANVAS_WIDTH - enemy.width) {
                    group.direction *= -1;
                    enemy.y += 30;
                }
                break;
                        
                    case PATTERN_TYPES.HORIZONTAL:
                        // 가로 움직임 - 더 역동적으로
                        enemy.x += enemy.speed * group.direction * 1.4;
                        enemy.y = group.startY + Math.sin(enemy.angle) * 60;
                        enemy.angle += 0.04;
                        if (enemy.x <= 0 || enemy.x >= CANVAS_WIDTH - enemy.width) {
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
                        const mirrorX = CANVAS_WIDTH - player.x;
                        const targetMirrorX = mirrorX + (group.mirrorOffset - CANVAS_WIDTH / 2);
                        const dxMirror = targetMirrorX - enemy.x;
                        enemy.x += dxMirror * 0.03;
                        enemy.y += enemy.speed * 1.2;
                        break;
                }
            } else {
                // 뒤따르는 적들의 움직임 - 스페이스 슈팅게임용 파일과 동일하게
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
                drawSnakeEnemy(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });
        
        // 충돌 체크
        let collisionOccurred = false;
        group.enemies.forEach((enemy, index) => {
            if (!enemy.isHit && !collisionOccurred) {
                bullets = bullets.filter(bullet => {
                    if (checkCollision(bullet, enemy)) {
                        // 폭발 효과를 더 부드럽게
                        explosions.push(new Explosion(
                            enemy.x + enemy.width/2,
                            enemy.y + enemy.height/2
                        ));
                        updateScore(20); //뱀 패턴 비행기 한 대당 획득 점수
                        // 뱀 패턴 파괴: shootSound
                        applyGlobalVolume();
                        shootSound.currentTime = 0;
                        shootSound.play().catch(error => {
                            console.log('오디오 재생 실패:', error);
                        });
                        
                        // 즉시 제거 - 페이드아웃 효과 제거
                        enemy.isHit = true;
                        
                        return false;
                    }
                    return true;
                });
                
                if (!collisionOccurred && (checkCollision(player, enemy) || 
                    (hasSecondPlane && checkCollision(secondPlane, enemy)))) {
                    handleCollision();
                    explosions.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2));
                    
                    // 즉시 제거 - 페이드아웃 효과 제거
                    enemy.isHit = true;
                    
                    collisionOccurred = true;
                }
            }
        });
        
        // 피격된 적들을 즉시 제거 - 페이드아웃 타이머 체크 제거
        group.enemies = group.enemies.filter(enemy => !enemy.isHit);
        
        // 모든 적이 파괴되었으면 그룹 종료
        if (group.enemies.length === 0) {
            return false;
        }
        
        // 화면 밖으로 나간 적 제거 - 모바일용 캔버스 크기(392x700)로 제한
        const canvasWidth = CANVAS_WIDTH;
        const canvasHeight = CANVAS_HEIGHT;
        group.enemies = group.enemies.filter(enemy => 
            enemy.y < CANVAS_HEIGHT + 100 && 
            enemy.y > -100 && 
            enemy.x > -100 && 
            enemy.x < CANVAS_WIDTH + 100
        );
        
        // snakeEnemies 배열에서도 제거된 적들을 제거
        snakeEnemies = snakeEnemies.filter(enemy => 
            group.enemies.includes(enemy) && !enemy.isHit
        );
        
        // 디버그: 뱀 패턴 적 상태 출력
        if (group.enemies.length > 0) {
            console.log(`뱀 패턴 그룹 상태: 활성 적 ${group.enemies.length}개, snakeEnemies 배열 ${snakeEnemies.length}개`);
        }
        
        // 제거된 적들이 발사한 미사일들도 제거 - 제거됨
        // group.enemies.forEach(enemy => {
        //     if (!snakeEnemies.includes(enemy)) {
        //         removeEnemyMissiles(enemy);
        //     }
        // });
        
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

        // 총알이 화면 밖으로 나간 경우 충돌 체크하지 않음
        const canvasWidth = CANVAS_WIDTH;
        const canvasHeight = CANVAS_HEIGHT;
        const topBoundary = 30;
        
        if (bullet.y <= topBoundary || bullet.y >= canvasHeight || 
            bullet.x <= 0 || bullet.x >= canvasWidth) {
            return false;
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
                    
                    // 보스 파괴 시 다음 보스 등장 시간 업데이트
                    lastBossSpawnTime = Date.now();
                    
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
                        const distance = 40;
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
                
                // 추가 작은 폭발 효과
                for (let i = 0; i < 3; i++) {
                    const offsetX = (Math.random() - 0.5) * 20;
                    const offsetY = (Math.random() - 0.5) * 20;
                    explosions.push(new Explosion(
                        bullet.x + offsetX,
                        bullet.y + offsetY,
                        false
                    ));
                }
                
                // 체력 감소 (각 총알당 50의 데미지)
                enemy.health -= 50;
                bossHealth = enemy.health;
                
                // 보스 피격음 재생 (최적화: 중복 재생 방지)
                if (currentTime - lastCollisionTime > 100) {
                    applyGlobalVolume();
                    shootSound.currentTime = 0;
                    shootSound.play().catch(error => {
                        console.log('오디오 재생 실패:', error);
                    });
                    lastCollisionTime = currentTime;
                }
                
                // 보스는 체력이 0이 될 때까지 계속 비행하며 공격
                // 피격 시간 기반 파괴 로직 제거 - 체력 기반으로만 파괴
                
                // 보스가 파괴되지 않은 상태에서는 점수 부여하지 않음
                isHit = true;
                return false;
            } else {
                // 일반 적 처치
                explosions.push(new Explosion(
                    enemy.x + enemy.width/2,
                    enemy.y + enemy.height/2
                ));
                
                // 추가 작은 폭발 효과
                for (let i = 0; i < 2; i++) {
                    const offsetX = (Math.random() - 0.5) * 15;
                    const offsetY = (Math.random() - 0.5) * 15;
                    explosions.push(new Explosion(
                        enemy.x + enemy.width/2 + offsetX,
                        enemy.y + enemy.height/2 + offsetY,
                        false
                    ));
                }
                
                updateScore(20); //적 처치 시 획득 점수
                
                // 해당 적이 발사한 미사일들 제거
                // removeEnemyMissiles(enemy);
            }
            
            // 적을 맞췄을 때 효과음 재생 (최적화: 중복 재생 방지)
            const currentTime = Date.now();
            if (currentTime - lastCollisionTime > 50) {
                applyGlobalVolume();
                shootSound.currentTime = 0;
                shootSound.play().catch(error => {
                    console.log('오디오 재생 실패:', error);
                });
                lastCollisionTime = currentTime;
            }
            
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
        
        // 충돌 시 추가 폭발 효과
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i;
            const distance = 25;
            explosions.push(new Explosion(
                enemy.x + enemy.width/2 + Math.cos(angle) * distance,
                enemy.y + enemy.height/2 + Math.sin(angle) * distance,
                false
            ));
        }
        
        // 해당 적이 발사한 미사일들 제거
        // removeEnemyMissiles(enemy);
        
        return false;
    }

    // 화면 밖으로 나간 적 제거
    return enemy.y < canvasHeight + 100 && 
           enemy.y > -100 && 
           enemy.x > -100 && 
           enemy.x < canvasWidth + 100;
}

// 보스 총알 처리 함수 (별도 분리)
function handleBossBullets() {
    bossBullets = bossBullets.filter(bullet => {
        // 보스 총알 이동
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
        
        // 총알 생명력 감소
        bullet.life--;
        if (bullet.life <= 0) return false;
        
        // 펄스 효과
        bullet.pulsePhase += bullet.pulseSpeed;
        const pulseScale = 1 + Math.sin(bullet.pulsePhase) * 0.3;
        
        // 회전 효과
        bullet.rotation += bullet.rotationSpeed;
        
        // 총알 그리기
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(bullet.rotation);
        ctx.scale(pulseScale, pulseScale);
        
        // 총알 모양에 따라 다른 렌더링
        drawBossBullet(bullet);
        
        ctx.restore();
        
        // 보스 총알과 플레이어 충돌 체크
        if (checkCollision(bullet, player) || 
            (hasSecondPlane && checkCollision(bullet, secondPlane))) {
            handleCollision();
            // 총알 충돌 시 작은 폭발 효과
            explosions.push(new Explosion(bullet.x, bullet.y, false));
            return false;
        }
        
        // 화면 밖으로 나간 총알 제거
        return bullet.y < CANVAS_HEIGHT + 50 && 
        bullet.y > -50 && 
        bullet.x > -50 && 
        bullet.x < CANVAS_WIDTH + 50;
    });
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
        
        // 총알 발사 (최적화: 총알 개수 제한)
        const bullet = {
            x: player.x + player.width/2,
            y: player.y,
            width: currentBulletSize,
            height: currentBulletSize * 2,
            speed: bulletSpeed,
            damage: 100 * damageMultiplier
        };
        bullets.push(bullet);
        
        // 총알 개수 제한 (성능 최적화)
        if (bullets.length > 100) {
            bullets = bullets.slice(-80); // 최신 80개만 유지
        }
        
        // 두 번째 비행기 발사 (최적화: 총알 개수 제한)
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
    if (keys.KeyB && specialWeaponCount > 0) {  // 보유 개수만 확인
        // 특수 무기 발사 (50% 증가: 36발 → 54발)
        for (let i = 0; i < 360; i += 6.67) { // 각도 간격을 10도에서 6.67도로 감소 (총알 개수 50% 증가)
            const angle = (i * Math.PI) / 180;
            const bullet = {
                x: player.x + player.width/2,
                y: player.y,
                width: 10,  // 총알 크기 감소
                height: 10, // 총알 크기 감소
                speed: bulletSpeed,  // 총알 속도와 동일
                angle: angle,
                isSpecial: true,
                life: 80,   // 총알 지속 시간 감소
                trail: [],   // 꼬리 효과를 위한 배열
                rotation: 0,
                rotationSpeed: 0.1
            };
            bullets.push(bullet);
        }
        
        // 두 번째 비행기가 있을 경우 추가 발사 (50% 증가: 36발 → 54발)
        if (hasSecondPlane) {
            for (let i = 0; i < 360; i += 6.67) { // 각도 간격 감소
                const angle = (i * Math.PI) / 180;
                const bullet = {
                    x: secondPlane.x + secondPlane.width/2,
                    y: secondPlane.y,
                    width: 10,  // 총알 크기 감소
                    height: 10, // 총알 크기 감소
                    speed: bulletSpeed,  // 총알 속도와 동일
                    angle: angle,
                    isSpecial: true,
                    life: 80,   // 총알 지속 시간 감소
                    trail: [],
                    rotation: 0,
                    rotationSpeed: 0.1
                };
                bullets.push(bullet);
            }
        }
        
        // 특수무기 사용 처리 (보유 개수만 사용)
        console.log(`특수무기 사용 전 - 보유: ${specialWeaponCount}, 사용: ${specialWeaponUsedCount}, 점수: ${score}`);
        specialWeaponCount--; // 보유 개수 직접 감소
        specialWeaponUsedCount++;
        console.log(`특수무기 사용 후 - 보유: ${specialWeaponCount}, 사용: ${specialWeaponUsedCount}, 점수: ${score}`);
        
        // 키 입력 상태 리셋 (연속 발사 방지)
        keys.KeyB = false;
        
        // 특수 무기 발사 효과음
        applyGlobalVolume();
        shootSound.currentTime = 0;
        shootSound.play().catch(error => {
            console.log('오디오 재생 실패:', error);
        });
        
    }
}

// 폭발 효과 업데이트 및 그리기
function handleExplosions() {
    // 성능 최적화: 폭발 효과 배열 길이 제한
    if (explosions.length > 30) {
        explosions.splice(0, explosions.length - 20); // 오래된 폭발 효과 10개 제거
    }
    
    explosions = explosions.filter(explosion => {
        explosion.draw();
        return explosion.update();
    });
}

// UI 그리기 함수 수정
function drawUI() {
    // 플레이어 비행기 그리기
    drawPlayer(player.x, player.y, player.width, player.height);
    if (hasSecondPlane) {
        // 디버깅을 위한 로그 추가 (너무 자주 출력되지 않도록 조건 추가)
        if (Math.random() < 0.01) { // 1% 확률로만 로그 출력
            console.log('추가 비행기 그리기:', {
                hasSecondPlane: hasSecondPlane,
                x: secondPlane.x,
                y: secondPlane.y,
                width: secondPlane.width,
                height: secondPlane.height
            });
        }
        drawPlayer(secondPlane.x, secondPlane.y, secondPlane.width, secondPlane.height);
    }
    
    // 성능 모드에서는 UI 요소 최소화
    if (adaptiveFrameRate.performanceMode) {
        // 기본 점수만 표시
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`점수: ${score}`, 10, 30);
        ctx.fillText(`레벨: ${gameLevel}`, 10, 50);
        ctx.fillText(`목숨: ${maxLives - collisionCount}`, 10, 70);
        return;
    }

    // 적 미사일 그리기
    drawEnemyMissiles();

    // 방어막 적 그리기
    drawShieldedEnemies();

    // 점수와 레벨 표시
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`점수: ${score}`, 10, 30);
    ctx.fillText(`레벨: ${gameLevel} (${getDifficultyName(gameLevel)})`, 10, 60);
    ctx.fillText(`다음 레벨까지: ${Math.max(0, levelUpScore - levelScore)}`, 10, 90);
    ctx.fillText(`최고 점수: ${highScore}`, 10, 120);
    if (!hasSecondPlane) {
        const nextPlaneScore = Math.ceil(score / 4000) * 4000;
        ctx.fillText(`다음 추가 비행기까지: ${nextPlaneScore - score}점`, 10, 150);
    } else {
        const remainingTime = Math.ceil((10000 - (Date.now() - secondPlaneTimer)) / 1000);
        ctx.fillText(`추가 비행기 남은 시간: ${remainingTime}초`, 10, 150);
    }
    
    // 남은 목숨 표시 (깜빡임 효과 포함)
    if (isLifeBlinking && lifeBlinkTimer > 0) {
        // 깜빡임 효과: 흰 배경에 빨간 텍스트
        const blinkInterval = 200; // 200ms마다 깜빡임
        const isBlinkOn = Math.floor(lifeBlinkTimer / blinkInterval) % 2 === 0;
        
        if (isBlinkOn) {
            // 흰 배경에 빨간 텍스트
            ctx.fillStyle = 'white';
            ctx.fillRect(5, 165, 200, 30);
            ctx.fillStyle = 'red';
        } else {
            // 빨간 배경에 흰 텍스트
            ctx.fillStyle = 'red';
            ctx.fillRect(5, 165, 200, 30);
            ctx.fillStyle = 'white';
        }
        
        // 깜빡임 타이머 감소
        lifeBlinkTimer -= 16; // 약 60fps 기준
        
        // 깜빡임 종료 체크
        if (lifeBlinkTimer <= 0) {
            isLifeBlinking = false;
            lifeBlinkTimer = 0;
        }
    } else {
        // 일반 상태: 빨간색 텍스트
        ctx.fillStyle = 'red';
    }
    
    ctx.font = 'bold 20px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(`남은 목숨: ${maxLives - collisionCount}`, 10, 180);
    
    // 특수 무기 게이지 표시 (보유 개수 시스템)
    const canUseSpecialWeapon = specialWeaponCount > 0;
    
    // 디버깅용 로그 (개발 시에만 사용)
    if (Math.floor(Date.now() / 1000) % 5 === 0) { // 5초마다 한 번씩 로그
        console.log(`특수무기 상태 - 충전: ${specialWeaponCharge}, 보유: ${specialWeaponCount}, 사용: ${specialWeaponUsedCount}, 점수: ${score}`);
    }
    
    if (!canUseSpecialWeapon) {
        // 사용 불가능한 상태 - 충전 게이지만 표시
        // 게이지 바 배경
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(10, 210, 200, 20);
        
        // 게이지 바
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.fillRect(10, 210, (specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 200, 20);
        
        // 게이지 바 위에 텍스트 표시
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const percentText = `특수무기: ${Math.floor((specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 100)}%(보유:${specialWeaponCount}/${SPECIAL_WEAPON_MAX_COUNT}개)`;
        ctx.fillText(percentText, 110, 220);
    } else {
        // 사용 가능한 상태 - 깜빡이는 효과
        const blinkSpeed = 500; // 깜빡임 속도 (밀리초)
        const currentTime = Date.now();
        const isRed = Math.floor(currentTime / blinkSpeed) % 2 === 0;
        
        // 배경색 설정 (게이지 바)
        ctx.fillStyle = isRed ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 255, 0.3)';
        ctx.fillRect(10, 210, 200, 20);
        
        // 테두리 효과
        ctx.strokeStyle = isRed ? 'red' : 'cyan';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 210, 200, 20);
        
        // 게이지 바 위에 텍스트 표시
        ctx.fillStyle = isRed ? 'red' : 'cyan';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const percentText = `특수무기: ${Math.floor((specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 100)}%(보유:${specialWeaponCount}/${SPECIAL_WEAPON_MAX_COUNT}개)`;
        ctx.fillText(percentText, 110, 220);
        
        // 준비 완료 메시지 배경
        ctx.fillStyle = isRed ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 255, 0.2)';
        ctx.fillRect(10, 240, 300, 30);
        
        // 텍스트 색상 설정
        ctx.fillStyle = isRed ? 'red' : 'cyan';
        ctx.font = 'bold 15px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('아래 [특수무기]버튼을 터치하세요.', 15, 255);
    }

    // 제작자 정보 표시
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('제작/저작권자:Lee.SS.C', CANVAS_WIDTH - 20, CANVAS_HEIGHT - 30);
    
    // 일시정지 상태 표시
    if (isPaused) {
        // 반투명 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // 일시정지 텍스트
        ctx.fillStyle = 'yellow';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('일시정지', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 50);
        
        // 재개 안내 텍스트
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('P키를 눌러 게임을 재개하세요', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 20);
        
        // 텍스트 정렬을 다시 왼쪽으로 복원
        ctx.textAlign = 'left';
    }
    
    // 보스 체력 표시 개선
    if (bossActive) {
        // 체력바 배경
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(CANVAS_WIDTH/2 - 100, 10, 200, 20);
        
        // 체력바
        const healthPercentage = Math.max(0, bossHealth) / BOSS_SETTINGS.HEALTH;
        let healthColor;
        if (healthPercentage > 0.7) healthColor = 'rgba(0, 255, 0, 0.8)';
        else if (healthPercentage > 0.3) healthColor = 'rgba(255, 255, 0, 0.8)';
        else healthColor = 'rgba(255, 0, 0, 0.8)';
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(CANVAS_WIDTH/2 - 100, 10, healthPercentage * 200, 20);
        
        // 체력 수치
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`보스 체력: ${Math.max(0, Math.ceil(bossHealth))}/${BOSS_SETTINGS.HEALTH}`, CANVAS_WIDTH/2, 30);       
        
        // 페이즈 표시
        const currentPhase = BOSS_SETTINGS.PHASE_THRESHOLDS.findIndex(
            threshold => bossHealth > threshold.health
        );
        if (currentPhase >= 0) {
        ctx.fillText(`페이즈 ${currentPhase + 1}`, CANVAS_WIDTH/2, 50);
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

        // 사운드 컨트롤 패널이 존재하는 경우에만 초기화
        const effectVolume = document.getElementById('effectVolume');
        const volumeValue = document.getElementById('volumeValue');
        const muteBtn = document.getElementById('muteBtn');

        if (effectVolume && volumeValue && muteBtn) {
            // 초기화: 슬라이더, %표시, 버튼
            effectVolume.value = globalVolume;
            volumeValue.textContent = Math.round(globalVolume * 100) + '%';
            muteBtn.textContent = isMuted ? '🔇 전체 음소거' : '🔊 전체 음소거';
            applyGlobalVolume();

            // 슬라이더 조작 시
            effectVolume.addEventListener('input', (e) => {
                globalVolume = clampVolume(parseFloat(e.target.value));
                isMuted = (globalVolume === 0);
                applyGlobalVolume();
                volumeValue.textContent = Math.round(globalVolume * 100) + '%';
                muteBtn.textContent = isMuted ? '🔇 전체 음소거 해제' : '🔊 전체 음소거';
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
                    if (globalVolume === 0) globalVolume = clampVolume(0.5);
                    effectVolume.value = globalVolume;
                    applyGlobalVolume();
                    muteBtn.textContent = '🔊 전체 음소거';
                    volumeValue.textContent = Math.round(globalVolume * 100) + '%';
                }
                setTimeout(() => { document.getElementById('gameCanvas').focus(); }, 0);
            });
        } else {
            // 사운드 컨트롤 패널이 없는 경우 기본 볼륨 설정
            applyGlobalVolume();
        }
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
    const names = [
        '초급', '중급', '고급', '전문가', '마스터', 
        '그랜드마스터', '레전드', '미스터', '고드', '울티메이트',
        '데빌', '카오스', '인페르노', '아포칼립스', '디바인'
    ];
    return names[level - 1] || `레벨 ${level}`;
}

// 키 이벤트 리스너 수정 (중복 제거를 위해 주석 처리)
/*
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
        console.log('R키 눌림 - 최고 점수 리셋 시도');
        if (confirm('최고 점수를 리셋하시겠습니까?')) {
            highScore = 0;
            localStorage.setItem('highScore', '0');
            alert('최고 점수가 리셋되었습니다.');
            console.log('최고 점수 리셋 완료');
        }
    }
    
    // P 키를 눌렀을 때 게임 일시정지/재개
    if (e.code === 'KeyP') {
        isPaused = !isPaused;
        console.log('일시정지 상태 변경:', isPaused);
    }

    // 시작 화면에서 Enter를 누르면 게임 시작
    if (isStartScreen && e.code === 'Enter') {
        isStartScreen = false;
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
*/

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
    
    // 특수무기 충전 및 보유 개수 증가
    specialWeaponCharge += points;
    if (specialWeaponCharge >= SPECIAL_WEAPON_MAX_CHARGE) {
        // 최대 보유 개수 제한 확인
        if (specialWeaponCount < SPECIAL_WEAPON_MAX_COUNT) {
            // 충전이 100%가 되면 보유 개수에 추가
            specialWeaponCount++;
            specialWeaponCharge = 0; // 충전 게이지 리셋
            console.log(`특수무기 획득! 현재 보유 개수: ${specialWeaponCount}/${SPECIAL_WEAPON_MAX_COUNT}`);
        } else {
            // 최대 보유 개수에 도달한 경우 충전 게이지만 리셋
            specialWeaponCharge = 0;
            console.log(`특수무기 최대 보유 개수 도달! (${SPECIAL_WEAPON_MAX_COUNT}개) - 충전 게이지 리셋`);
        }
    }
    
    // 최고 점수 즉시 업데이트 및 저장
    if (score > highScore) {
        highScore = score;
        saveHighScoreDirectly(highScore, 'updateScore');
    }
}

// 두 번째 비행기 처리 함수 추가
function handleSecondPlane() {
    // 주기적으로 상태 출력 (너무 자주 출력되지 않도록 조건 추가)
    if (Math.random() < 0.001) { // 0.1% 확률로만 로그 출력
        console.log('추가 비행기 상태 체크:', {
            score: score,
            scoreMod4000: score % 4000,
            hasSecondPlane: hasSecondPlane,
            nextPlaneScore: Math.ceil(score / 4000) * 4000,
            remainingPoints: Math.ceil(score / 4000) * 4000 - score
        });
    }

    // 4000점마다 추가 비행기 지급
    // 여러 구간을 건너뛰었을 때도 모두 지급
    while (score - lastSecondPlaneScore >= 4000) {
        hasSecondPlane = true;
        lastSecondPlaneScore += 4000; // score가 아니라, 4000씩 증가!
        // 기존 위치 계산 로직
        if (player.x + player.width + secondPlane.width < CANVAS_WIDTH) {
            secondPlane.x = player.x + player.width;
        } else if (player.x - secondPlane.width > 0) {
            secondPlane.x = player.x - secondPlane.width;
        } else {
            secondPlane.x = CANVAS_WIDTH - secondPlane.width - 10;
        }
        secondPlane.y = player.y;
        secondPlaneTimer = Date.now();
        console.log('추가 비행기 활성화:', {
            x: secondPlane.x,
            y: secondPlane.y,
            timer: secondPlaneTimer
        });
        // 두 번째 비행기 획득 메시지
        ctx.fillStyle = 'yellow';
        ctx.font = '40px Arial';
        ctx.fillText('추가 비행기 획득!', CANVAS_WIDTH/2 - 150, CANVAS_HEIGHT/2 + 100);
    }

    if (hasSecondPlane) {
        const elapsedTime = Date.now() - secondPlaneTimer;
        if (elapsedTime >= 10000) { // 10초 체크
            console.log('추가 비행기 시간 만료:', {
                elapsedTime: elapsedTime,
                maxTime: 10000
            });
            hasSecondPlane = false;
            // 두 번째 비행기 소멸 메시지
            ctx.fillStyle = 'red';
            ctx.font = '40px Arial';
            ctx.fillText('추가 비행기 소멸!', CANVAS_WIDTH/2 - 150, CANVAS_HEIGHT/2 + 100);
        }
    }
}


// 총알 이동 및 충돌 체크 함수 수정
function handleBullets() {
    bullets = bullets.filter(bullet => {
        if (bullet.isSpecial) {
            // 특수 무기 총알 이동 및 효과
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            
            // 꼬리 효과 추가
            bullet.trail.unshift({x: bullet.x, y: bullet.y});
            if (bullet.trail.length > 5) bullet.trail.pop();
            
            // 총알 그리기
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(bullet.x - bullet.width/2, bullet.y - bullet.height/2, bullet.width, bullet.height);
            
            // 꼬리 그리기
            bullet.trail.forEach((pos, index) => {
                const alpha = 1 - (index / bullet.trail.length);
                ctx.fillStyle = `rgba(0, 255, 136, ${alpha * 0.5})`;
                ctx.fillRect(pos.x - bullet.width/2, pos.y - bullet.height/2, 
                            bullet.width * (1 - index/bullet.trail.length), 
                            bullet.height * (1 - index/bullet.trail.length));
            });
            
            // 총알 주변에 빛나는 효과
            const gradient = ctx.createRadialGradient(
                bullet.x, bullet.y, 0,
                bullet.x, bullet.y, bullet.width
            );
            gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
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
        
        // 보스 총알과 플레이어 충돌 체크는 별도 함수에서 처리
        
        // 폭탄과 총알 충돌 체크 (파티클 효과 적용)
        bombs = bombs.filter(bomb => {
            if (checkCollision(bullet, bomb)) {
                // 폭탄 폭발 파티클 효과 생성
                createBombExplosionParticles(bomb.x, bomb.y);
                // 폭발음 재생 (최적화: 중복 재생 방지)
                const currentTime = Date.now();
                if (currentTime - lastExplosionTime > 200) {
                    applyGlobalVolume();
                    shootSound.currentTime = 0;
                    shootSound.play().catch(error => {
                        console.log('오디오 재생 실패:', error);
                    });
                    lastExplosionTime = currentTime;
                }
                return false;
            }
            return true;
        });

        // 다이나마이트와 총알 충돌 체크 (최적화: 중복 재생 방지)
        dynamites = dynamites.filter(dynamite => {
            if (checkCollision(bullet, dynamite)) {
                // 다이나마이트 폭발
                explosions.push(new Explosion(dynamite.x, dynamite.y, true));
                // 폭발음 재생 (최적화: 중복 재생 방지)
                const currentTime = Date.now();
                if (currentTime - lastExplosionTime > 200) {
                    applyGlobalVolume();
                    explosionSound.currentTime = 0;
                    explosionSound.play().catch(error => {
                        console.log('오디오 재생 실패:', error);
                    });
                    lastExplosionTime = currentTime;
                }
                return false;
            }
            return true;
        });
        
        // 적 미사일과 총알 충돌 체크 (최적화: 폭발 효과 감소)
        for (let i = enemyMissiles.length - 1; i >= 0; i--) {
            const missile = enemyMissiles[i];
            if (checkCollision(bullet, missile)) {
                // 미사일 파괴
                enemyMissiles.splice(i, 1);
                
                // 폭발 효과 (최적화: 개수 감소)
                explosions.push(new Explosion(missile.x + missile.width/2, missile.y + missile.height/2, false));
                
                // 미사일 파괴 효과음 재생 (최적화: 중복 재생 방지)
                const currentTime = Date.now();
                if (currentTime - lastCollisionTime > 50) {
                    applyGlobalVolume();
                    shootSound.currentTime = 0;
                    shootSound.play().catch(error => {
                        console.log('미사일 파괴 효과음 재생 실패:', error);
                    });
                    lastCollisionTime = currentTime;
                }
                
                // 미사일 파괴 보너스 점수
                updateScore(10);
                
                // 총알도 제거
                return false;
            }
        }
        
        // 방어막 적과 총알 충돌 체크 (최적화: 중복 재생 방지)
        for (let i = shieldedEnemies.length - 1; i >= 0; i--) {
            const enemy = shieldedEnemies[i];
            if (checkCollision(bullet, enemy)) {
                // 체력 감소
                enemy.health--;
                
                // 피격 효과음 재생 (최적화: 중복 재생 방지)
                const currentTime = Date.now();
                if (currentTime - lastCollisionTime > 50) {
                    applyGlobalVolume();
                    shootSound.currentTime = 0;
                    shootSound.play().catch(error => {
                        console.log('방어막 적 피격 효과음 재생 실패:', error);
                    });
                    lastCollisionTime = currentTime;
                }
                
                // 피격 효과
                explosions.push(new Explosion(bullet.x, bullet.y, false));
                
                // 피격 로그 출력
                console.log(`방어막 적 피격: ${enemy.health}/${enemy.maxHealth} (${20 - enemy.health}발 맞음)`);
                
                // 방어막이 비활성화된 경우 또는 체력이 0인 경우
                if (enemy.health <= 0) {
                    // 적 파괴
                    shieldedEnemies.splice(i, 1);
                    
                    // 큰 폭발 효과
                    explosions.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, false));
                    
                    // 추가 폭발 효과
                    for (let j = 0; j < 6; j++) {
                        const angle = (Math.PI * 2 / 6) * j;
                        const distance = 25;
                        const offsetX = Math.cos(angle) * distance;
                        const offsetY = Math.sin(angle) * distance;
                        explosions.push(new Explosion(
                            enemy.x + enemy.width/2 + offsetX,
                            enemy.y + enemy.height/2 + offsetY,
                            false
                        ));
                    }
                    
                    // 폭발음 재생
                    applyGlobalVolume();
                    shootSound.currentTime = 0;
                    shootSound.play().catch(error => {
                        console.log('방어막 적 파괴 효과음 재생 실패:', error);
                    });
                    
                    // 점수 보상 (방어막 적은 더 높은 점수)
                    updateScore(100);
                    
                    // 파괴 로그 출력
                    console.log(`방어막 적 파괴 완료! 총 20발 맞춤`);
                    
                    // 해당 적이 발사한 미사일들 제거
                    // removeEnemyMissiles(enemy);
                } else {
                    // 방어막이 활성화된 경우 방어막 효과음
                    if (enemy.shieldActive) {
                        // 방어막 피격 효과음 (다른 톤)
                        applyGlobalVolume();
                        shootSound.currentTime = 0;
                        shootSound.play().catch(error => {
                            console.log('방어막 피격 효과음 재생 실패:', error);
                        });
                    }
                }
                
                // 총알 제거
                return false;
            }
        }
        
        // 화면 밖으로 나간 총알 제거 - 모바일용 캔버스 크기로 제한
        const canvasWidth = CANVAS_WIDTH;
        const canvasHeight = CANVAS_HEIGHT;
        
        // 상단에서 30픽셀 전에 총알 소멸 (모바일과 데스크톱 모두)
        const topBoundary = 30;
        
        return bullet.y > topBoundary && bullet.y < canvasHeight && 
               bullet.x > 0 && bullet.x < canvasWidth;
    });
}

// 보스 관련 상수 추가
const BOSS_SETTINGS = {
    HEALTH: 1500,        // 기본 체력 (레벨에 따라 동적 조정)
    DAMAGE: 50,          // 보스 총알 데미지
    SPEED: 2 * mobileSpeedMultiplier,           // 보스 이동 속도
    BULLET_SPEED: 5 * mobileSpeedMultiplier,    // 보스 총알 속도
    PATTERN_INTERVAL: 2000, // 패턴 변경 간격
    SPAWN_INTERVAL: 25000,  // 보스 출현 간격 (레벨별 설정으로 동적 조정)
    BONUS_SCORE: 500,    // 보스 처치 보너스 점수
    PHASE_THRESHOLDS: [  // 페이즈 전환 체력 임계값
        { health: 750, speed: 2.5 * mobileSpeedMultiplier, bulletSpeed: 6 * mobileSpeedMultiplier },
        { health: 500, speed: 3 * mobileSpeedMultiplier, bulletSpeed: 7 * mobileSpeedMultiplier },
        { health: 250, speed: 3.5 * mobileSpeedMultiplier, bulletSpeed: 8 * mobileSpeedMultiplier }
    ]
};

// 게임 상태 변수에 추가
let lastBossSpawnTime = Date.now();  // 마지막 보스 출현 시간을 현재 시간으로 초기화

// 보스 생성 함수 수정
function createBoss() {
    if (isMobile && !gameStarted) return;
    console.log('보스 생성 함수 호출됨');
    
    // 이미 보스가 존재하는 경우
    if (bossActive) {
        console.log('보스가 이미 존재하여 생성하지 않음');
        return;
    }
    
    const currentTime = Date.now();
    const timeSinceLastBoss = currentTime - lastBossSpawnTime;
    
   
    // 시간 체크 - 최소 12초 간격 보장
    const minInterval = Math.max(12000, BOSS_SETTINGS.SPAWN_INTERVAL);
    if (timeSinceLastBoss < minInterval) {
        console.log('보스 생성 시간이 되지 않음:', {
            timeSinceLastBoss,
            requiredInterval: minInterval,
            remainingTime: minInterval - timeSinceLastBoss
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
    
    // 보스 객체 생성 - 모바일용 캔버스 크기(392x700)로 제한
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    const boss = {
        x: Math.random() * (canvasWidth - 69),
        y: -69,
        width: 69,
        height: 69,
        speed: BOSS_SETTINGS.SPEED,
        pattern: (gameLevel < 5) ? BOSS_PATTERNS.WAVE_SHOT : BOSS_PATTERNS.CIRCLE_SHOT,
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
        singlePattern: null,  // 현재 사용할 단일 패턴
        spawnTime: currentTime,  // 보스 등장 시간 기록
        currentPattern: null  // 현재 사용 중인 패턴 (연속 발사 방지용)
    };
    
    // 레벨별 패턴 설정 - 모든 레벨에서 랜덤 패턴 시스템 사용
    if (gameLevel <= 5) {
        // 레벨 1~5: 랜덤 단일 패턴 시스템
        const availablePatterns = [
            BOSS_PATTERNS.CIRCLE_SHOT,
            BOSS_PATTERNS.CROSS_SHOT,
            BOSS_PATTERNS.SPIRAL_SHOT,
            BOSS_PATTERNS.WAVE_SHOT,
            BOSS_PATTERNS.DIAMOND_SHOT,
            BOSS_PATTERNS.RANDOM_SPREAD,
            BOSS_PATTERNS.DOUBLE_SPIRAL,
            BOSS_PATTERNS.TRIPLE_WAVE,
            BOSS_PATTERNS.TARGETED_SHOT,
            BOSS_PATTERNS.BURST_SHOT
        ];
        
        // 보스별 사용한 패턴 추적 시스템 초기화
        if (!boss.usedPatterns) {
            boss.usedPatterns = [];
        }
        
        // 사용 가능한 패턴 목록에서 아직 사용하지 않은 패턴들만 선택
        const unusedPatterns = availablePatterns.filter(pattern => !boss.usedPatterns.includes(pattern));
        
        let selectedPattern;
        if (unusedPatterns.length > 0) {
            // 아직 사용하지 않은 패턴이 있으면 그 중에서 랜덤 선택
            selectedPattern = unusedPatterns[Math.floor(Math.random() * unusedPatterns.length)];
            boss.usedPatterns.push(selectedPattern);
        } else {
            // 모든 패턴을 다 사용했으면 사용 기록 초기화하고 랜덤 선택
            boss.usedPatterns = [];
            selectedPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
            boss.usedPatterns.push(selectedPattern);
        }
        
        // 현재 패턴을 저장하여 연속 발사 방지
        boss.currentPattern = selectedPattern;
        
        boss.singlePattern = selectedPattern;
        // 패턴은 보스별로 관리되므로 전역 설정 불필요
        console.log(`보스 생성 (레벨 ${gameLevel}): 랜덤 패턴 ${selectedPattern}`);
    } else {
        // 레벨 6 이상: 단일 랜덤 패턴 시스템
        boss.singlePattern = null;
        // 패턴은 보스별로 관리되므로 전역 설정 불필요
        console.log(`보스 생성 (레벨 ${gameLevel}): 단일 랜덤 패턴 시스템`);
    }
    
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
        
        // 보스 파괴 시 다음 보스 등장 시간 업데이트
        lastBossSpawnTime = currentTime;
        
        // 패턴 사용 기록은 각 보스별로 관리되므로 여기서는 제거
        
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
        
        // 보스 경고 시스템 초기화
        bossWarning.active = false;
        bossWarning.pattern = '';
        bossWarning.message = '';
        bossWarning.timer = 0;
        bossWarning.patternDetails = '';
        
        // 보스 파괴 시 목숨 1개 추가
        maxLives++; // 최대 목숨 증가
        
        return;
    }

    // 보스 이동 패턴 - 화면 내에서 안정적으로 체공
    const movePattern = Math.floor(currentTime / 5000) % 4;  // 5초마다 이동 패턴 변경
    
    // 보스 등장 후 경과 시간 계산
    const bossSpawnTime = currentTime - boss.spawnTime;
    const isStablePhase = bossSpawnTime < 15000;  // 15초 동안 안정적 체공
    
    if (isStablePhase) {
        // 안정적 체공 패턴 (15초 동안) - 좌우 화면 여백을 모두 사용
        switch (movePattern) {
            case 0:  // 전체 화면 좌우 이동
                const fullWidthRange = (CANVAS_WIDTH - boss.width) / 2;
                boss.x = CANVAS_WIDTH / 2 - boss.width / 2 + Math.sin(currentTime / 800) * fullWidthRange;
                boss.y = 100 + Math.sin(currentTime / 1000) * 20;
                break;
            case 1:  // 지그재그 전체 화면 이동
                const zigzagRange = (CANVAS_WIDTH - boss.width) / 2;
                boss.x = CANVAS_WIDTH / 2 - boss.width / 2 + Math.sin(currentTime / 500) * zigzagRange;
                boss.y = 120 + Math.abs(Math.sin(currentTime / 600)) * 30;
                break;
            case 2:  // 큰 원형 이동 (화면 전체 활용)
                const radius = (CANVAS_WIDTH - boss.width) / 2;
                const centerX = CANVAS_WIDTH / 2;
                const centerY = 120;
                boss.x = centerX + Math.cos(currentTime / 1000) * radius - boss.width / 2;
                boss.y = centerY + Math.sin(currentTime / 1000) * radius;
                break;
            case 3:  // 플레이어 추적 (전체 화면 범위)
                const targetX = Math.max(0, Math.min(CANVAS_WIDTH - boss.width, player.x));
                const dx = targetX - boss.x;
                boss.x += dx * 0.02;  // 부드러운 추적
                boss.y = 110 + Math.sin(currentTime / 800) * 25;
                break;
        }
    } else {
        // 15초 후 더 역동적인 패턴
        switch (movePattern) {
            case 0:  // 좌우 이동
                boss.x += Math.sin(currentTime / 400) * 3;
                boss.y = 80 + Math.sin(currentTime / 600) * 20;
                break;
            case 1:  // 원형 이동
                const radius = 100;
                const centerX = CANVAS_WIDTH / 2;
                const centerY = 120;
                boss.x = centerX + Math.cos(currentTime / 800) * radius - boss.width / 2;
                boss.y = centerY + Math.sin(currentTime / 800) * radius;
                break;
            case 2:  // 지그재그 이동
                boss.x += Math.sin(currentTime / 250) * 4;
                boss.y = 60 + Math.abs(Math.sin(currentTime / 400)) * 50;
                break;
            case 3:  // 추적 이동
                const targetX = Math.max(50, Math.min(CANVAS_WIDTH - boss.width - 50, player.x));
                const dx = targetX - boss.x;
                boss.x += dx * 0.02;
                boss.y = 100 + Math.sin(currentTime / 500) * 30;
                break;
        }
    }
    
    // 모든 패턴에 대해 화면 경계 체크 적용
    boss.x = Math.max(0, Math.min(CANVAS_WIDTH - boss.width, boss.x));
    boss.y = Math.max(50, Math.min(250, boss.y));
    
    // 패턴 단계별 패턴 선택
    let patterns = [];
    
    // 사용 가능한 패턴 목록
    const availablePatterns = [
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
        // 새로운 확산탄 패턴들
        BOSS_PATTERNS.HEART_SHOT,
        BOSS_PATTERNS.STAR_SHOT,
        BOSS_PATTERNS.FLOWER_SHOT,
        BOSS_PATTERNS.BUTTERFLY_SHOT,
        BOSS_PATTERNS.SPIRAL_WAVE,
        BOSS_PATTERNS.CONCENTRIC_CIRCLES,
        BOSS_PATTERNS.FIREWORK_SHOT,
        BOSS_PATTERNS.CHAOS_SHOT
    ];
    
    // 레벨별 패턴 시스템
    if (gameLevel <= 5) {
        // 레벨 1~5: 순차적 패턴 시스템
        if (boss.singlePattern) {
            patterns = [boss.singlePattern];
        } else {
            // 기본 패턴 사용
            patterns = [BOSS_PATTERNS.BASIC];
        }
    } else {
        // 레벨 6 이상: 단일 랜덤 패턴 시스템 (한 번 등장한 패턴은 모든 패턴이 등장한 후에 다시 등장)
        
        // 보스별 사용한 패턴 추적 시스템 초기화
        if (!boss.usedPatterns) {
            boss.usedPatterns = [];
        }
        
        // 패턴 변경 체크 (5초마다)
        if (currentTime - boss.lastPatternChange >= boss.patternDuration) {
            // 사용 가능한 패턴 목록에서 아직 사용하지 않은 패턴들만 선택
            const unusedPatterns = availablePatterns.filter(pattern => !boss.usedPatterns.includes(pattern));
            
            let selectedPattern;
            
            if (unusedPatterns.length > 0) {
                // 아직 사용하지 않은 패턴이 있으면 그 중에서 랜덤 선택
                // 단, 현재 패턴과 같은 패턴은 제외
                const differentPatterns = unusedPatterns.filter(pattern => pattern !== boss.currentPattern);
                if (differentPatterns.length > 0) {
                    selectedPattern = differentPatterns[Math.floor(Math.random() * differentPatterns.length)];
                } else {
                    // 다른 패턴이 없으면 (마지막 패턴인 경우) 그냥 선택
                    selectedPattern = unusedPatterns[Math.floor(Math.random() * unusedPatterns.length)];
                }
                boss.usedPatterns.push(selectedPattern);
                console.log(`보스 패턴 변경 (단일 랜덤): ${selectedPattern} (사용된 패턴: ${boss.usedPatterns.length}/${availablePatterns.length})`);
            } else {
                // 모든 패턴을 다 사용했으면 사용 기록 초기화하고 랜덤 선택
                boss.usedPatterns = [];
                // 현재 패턴과 다른 패턴 선택
                const differentPatterns = availablePatterns.filter(pattern => pattern !== boss.currentPattern);
                if (differentPatterns.length > 0) {
                    selectedPattern = differentPatterns[Math.floor(Math.random() * differentPatterns.length)];
                } else {
                    selectedPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
                }
                boss.usedPatterns.push(selectedPattern);
                console.log(`보스 패턴 변경 (단일 랜덤): ${selectedPattern} (모든 패턴 사용 완료, 기록 초기화)`);
            }
            
            boss.currentPatterns = [selectedPattern];
            boss.currentPattern = selectedPattern; // 현재 패턴 저장
            boss.lastPatternChange = currentTime;
        }
        
        // 현재 패턴 사용
        if (boss.currentPatterns.length > 0) {
            patterns = boss.currentPatterns;
        } else {
            // 초기 패턴 설정
            const initialPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
            patterns = [initialPattern];
            boss.currentPatterns = [initialPattern];
            boss.usedPatterns = [initialPattern];
            boss.currentPattern = initialPattern; // 현재 패턴 저장
            console.log(`보스 초기 패턴 설정: ${initialPattern}`);
        }
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
    switch (pattern) {
        case BOSS_PATTERNS.BASIC:
            // 기본 패턴: 직선 발사 (느린 속도)
            if (currentTime - boss.lastShot >= 1500) {
                boss.lastShot = currentTime;
                createBossBullet(boss, Math.PI / 2, 'basic');  // 기본 패턴
            }
            break;
            
        case BOSS_PATTERNS.CIRCLE_SHOT:
            if (currentTime - boss.lastShot >= 500) {  // 0.5초마다 발사
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i;
                    createBossBullet(boss, angle, 'circle_shot');
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.CROSS_SHOT:
            if (currentTime - boss.lastShot >= 800) {  // 0.8초마다 발사
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI / 2) * i;
                    createBossBullet(boss, angle, 'cross_shot');
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.SPIRAL_SHOT:
            if (currentTime - boss.lastShot >= 200) {  // 0.2초마다 발사
                createBossBullet(boss, boss.patternAngle, 'spiral_shot');
                boss.patternAngle += Math.PI / 8;  // 22.5도씩 회전
                boss.lastShot = currentTime;
                
                // 나선 패턴이 한 바퀴 완료되면 초기화
                if (boss.patternAngle >= Math.PI * 2) {
                    boss.patternAngle = 0;
                }
            }
            break;
            
        case BOSS_PATTERNS.WAVE_SHOT:
            if (currentTime - boss.lastShot >= 300) {  // 0.3초마다 발사
                const waveAngle = Math.sin(boss.patternAngle) * (Math.PI / 4);  // -45도 ~ 45도 사이
                createBossBullet(boss, Math.PI / 2 + waveAngle, 'wave_shot');  // 아래쪽으로 파도형 발사
                boss.patternAngle += 0.2;
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
                    createBossBullet(boss, angle, 'diamond_shot');
                });
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.RANDOM_SPREAD:
            if (currentTime - boss.lastShot >= 400) {  // 0.4초마다 발사
                for (let i = 0; i < 5; i++) {
                    const randomAngle = Math.random() * Math.PI * 2;  // 0~360도 랜덤
                    createBossBullet(boss, randomAngle, 'random_spread');
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.DOUBLE_SPIRAL:
            if (currentTime - boss.lastShot >= 150) {  // 0.15초마다 발사
                // 두 개의 나선형 패턴을 동시에 발사
                createBossBullet(boss, boss.patternAngle, 'double_spiral');
                createBossBullet(boss, boss.patternAngle + Math.PI, 'double_spiral');  // 반대 방향
                boss.patternAngle += Math.PI / 12;  // 15도씩 회전
                boss.lastShot = currentTime;
                
                // 이중 나선 패턴이 한 바퀴 완료되면 초기화
                if (boss.patternAngle >= Math.PI * 2) {
                    boss.patternAngle = 0;
                }
            }
            break;
            
        case BOSS_PATTERNS.TRIPLE_WAVE:
            if (currentTime - boss.lastShot >= 200) {  // 0.2초마다 발사
                // 세 개의 파도형 패턴을 동시에 발사
                for (let i = 0; i < 3; i++) {
                    const waveAngle = Math.sin(boss.patternAngle + (i * Math.PI * 2 / 3)) * (Math.PI / 3);
                    createBossBullet(boss, Math.PI / 2 + waveAngle, 'triple_wave');
                }
                boss.patternAngle += 0.3;
                boss.lastShot = currentTime;
                
                // 삼중 파도 패턴이 일정 시간 지나면 초기화
                if (boss.patternAngle >= Math.PI * 2) {
                    boss.patternAngle = 0;
                }
            }
            break;
            
        case BOSS_PATTERNS.TARGETED_SHOT:
            if (currentTime - boss.lastShot >= 400) {  // 0.4초마다 발사
                // 플레이어를 향해 3발 연속 발사
                const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
                for (let i = -1; i <= 1; i++) {
                    const spreadAngle = angleToPlayer + (i * Math.PI / 12);  // ±15도 스프레드
                    createBossBullet(boss, spreadAngle, 'targeted_shot');
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.BURST_SHOT:
            if (currentTime - boss.lastShot >= 1000) {  // 1초마다 발사
                // 8방향으로 동시에 발사
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i;
                    createBossBullet(boss, angle, 'burst_shot');
                }
                // 중앙에 추가 발사
                createBossBullet(boss, Math.PI / 2, 'burst_shot');
                boss.lastShot = currentTime;
            }
            break;
            
        // 새로운 확산탄 패턴들
        case BOSS_PATTERNS.HEART_SHOT:
            if (currentTime - boss.lastShot >= 1200) {  // 1.2초마다 발사
                // 하트 모양으로 발사 (8개 총알)
                const heartAngles = [
                    Math.PI / 2,           // 위
                    Math.PI / 2 + Math.PI / 6,  // 위-오른쪽
                    Math.PI / 2 - Math.PI / 6,  // 위-왼쪽
                    Math.PI / 3,           // 오른쪽-위
                    Math.PI - Math.PI / 3, // 왼쪽-위
                    Math.PI / 4,           // 오른쪽
                    Math.PI - Math.PI / 4, // 왼쪽
                    Math.PI / 2 + Math.PI / 4  // 아래-오른쪽
                ];
                heartAngles.forEach(angle => {
                    createBossBullet(boss, angle, 'heart_shot');
                });
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.STAR_SHOT:
            if (currentTime - boss.lastShot >= 1000) {  // 1초마다 발사
                // 별 모양으로 발사 (5개 총알)
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 / 5) * i + Math.PI / 2;
                    createBossBullet(boss, angle, 'star_shot');
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.FLOWER_SHOT:
            if (currentTime - boss.lastShot >= 800) {  // 0.8초마다 발사
                // 꽃 모양으로 발사 (6개 총알)
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    createBossBullet(boss, angle, 'flower_shot');
                }
                // 중앙에 추가 발사
                createBossBullet(boss, Math.PI / 2, 'flower_shot');
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.BUTTERFLY_SHOT:
            if (currentTime - boss.lastShot >= 900) {  // 0.9초마다 발사
                // 나비 모양으로 발사 (4개 총알)
                const butterflyAngles = [
                    Math.PI / 4,           // 오른쪽-위
                    Math.PI - Math.PI / 4, // 왼쪽-위
                    Math.PI / 2 + Math.PI / 4, // 오른쪽-아래
                    Math.PI / 2 - Math.PI / 4  // 왼쪽-아래
                ];
                butterflyAngles.forEach(angle => {
                    createBossBullet(boss, angle, 'butterfly_shot');
                });
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.SPIRAL_WAVE:
            if (currentTime - boss.lastShot >= 300) {  // 0.3초마다 발사
                createBossBullet(boss, boss.patternAngle, 'spiral_wave');
                boss.patternAngle += Math.PI / 6;  // 30도씩 회전
                boss.lastShot = currentTime;
                
                // 나선 패턴이 한 바퀴 완료되면 초기화
                if (boss.patternAngle >= Math.PI * 2) {
                    boss.patternAngle = 0;
                }
            }
            break;
            
        case BOSS_PATTERNS.CONCENTRIC_CIRCLES:
            if (currentTime - boss.lastShot >= 1500) {  // 1.5초마다 발사
                // 동심원으로 발사 (3개 원, 각각 8개 총알)
                for (let ring = 0; ring < 3; ring++) {
                    for (let i = 0; i < 8; i++) {
                        const angle = (Math.PI * 2 / 8) * i;
                        createBossBullet(boss, angle, 'concentric_circles');
                    }
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.FIREWORK_SHOT:
            if (currentTime - boss.lastShot >= 2000) {  // 2초마다 발사
                // 불꽃놀이 모양으로 발사 (12개 총알)
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 / 12) * i;
                    createBossBullet(boss, angle, 'firework_shot');
                }
                boss.lastShot = currentTime;
            }
            break;
            
        case BOSS_PATTERNS.CHAOS_SHOT:
            if (currentTime - boss.lastShot >= 500) {  // 0.5초마다 발사
                // 혼돈 모양으로 발사 (랜덤 각도)
                for (let i = 0; i < 6; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    createBossBullet(boss, angle, 'chaos_shot');
                }
                boss.lastShot = currentTime;
            }
            break;
    }
}

// 보스 총알 생성 함수 수정
function createBossBullet(boss, angle, pattern = null, bulletType = 'normal') {
    // 성능 최적화: 보스 총알 배열 길이 제한
    if (bossBullets.length > 50) {
        bossBullets.splice(0, bossBullets.length - 40); // 오래된 보스 총알 10개 제거
    }
    
    const bullet = {
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        width: 18,
        height: 18,
        speed: boss.bulletSpeed,
        angle: angle,
        isBossBullet: true,
        damage: BOSS_SETTINGS.DAMAGE,
        trail: [], // 총알 꼬리 효과를 위한 배열
        glow: 1, // 빛나는 효과를 위한 값
        rotation: 0, // 회전 효과를 위한 값
        rotationSpeed: 0.1, // 회전 속도
        pattern: pattern, // 패턴 정보
        bulletType: bulletType, // 총알 타입
        color: getBulletColor(pattern, bulletType), // 총알 색상
        shape: getBulletShape(pattern, bulletType), // 총알 모양
        life: 300, // 총알 생명력 (프레임 단위)
        pulsePhase: Math.random() * Math.PI * 2, // 펄스 효과를 위한 위상
        pulseSpeed: 0.2 // 펄스 속도
    };
    
    // 디버깅: 총알 정보 출력
    console.log(`보스 총알 생성: 패턴=${pattern}, 색상=${bullet.color}, 모양=${bullet.shape}`);
    
    bossBullets.push(bullet); // 보스 총알 배열에 추가
}

// 총알 색상 결정 함수
function getBulletColor(pattern, bulletType) {
    const colorMap = {
        // 기존 패턴들
        'basic': '#FF0000',           // 빨간색
        'circle_shot': '#00FF00',     // 초록색
        'cross_shot': '#00FF80',      // 청녹색
        'spiral_shot': '#FFFF00',     // 노란색
        'wave_shot': '#FF00FF',       // 마젠타
        'diamond_shot': '#00FFFF',    // 시안
        'random_spread': '#FFA500',   // 오렌지
        'double_spiral': '#DDA0DD',   // 플럼 - 밝은 퍼플
        'triple_wave': '#FFC0CB',     // 핑크
        'targeted_shot': '#FFD700',   // 골드
        'burst_shot': '#FF6347',      // 토마토
        // 새로운 확산탄 패턴들
        'heart_shot': '#FF69B4',      // 핫핑크
        'star_shot': '#FFD700',       // 골드
        'flower_shot': '#FF1493',     // 딥핑크
        'butterfly_shot': '#BA55D3',  // 미디엄오키드 - 밝은 퍼플
        'spiral_wave': '#40E0D0',     // 터콰이즈 - 밝은 터콰이즈
        'concentric_circles': '#FF6347', // 토마토
        'firework_shot': '#FF4500',   // 오렌지레드
        'chaos_shot': '#FF6B6B',      // 밝은 빨간색
        'normal': '#FF0000'           // 기본 빨간색
    };
    return colorMap[pattern] || colorMap[bulletType] || '#FF0000';
}

// 총알 모양 결정 함수
function getBulletShape(pattern, bulletType) {
    const shapeMap = {
        // 기존 패턴들
        'basic': 'rectangle',
        'circle_shot': 'circle',
        'cross_shot': 'rectangle',
        'spiral_shot': 'spiral',
        'wave_shot': 'rectangle',
        'diamond_shot': 'rectangle',
        'random_spread': 'rectangle',
        'double_spiral': 'spiral',
        'triple_wave': 'rectangle',
        'targeted_shot': 'rectangle',
        'burst_shot': 'rectangle',
        // 새로운 확산탄 패턴들
        'heart_shot': 'heart',
        'star_shot': 'star',
        'flower_shot': 'flower',
        'butterfly_shot': 'butterfly',
        'spiral_wave': 'spiral',
        'concentric_circles': 'circle',
        'firework_shot': 'firework',
        'chaos_shot': 'chaos',
        'normal': 'rectangle'
    };
    return shapeMap[pattern] || shapeMap[bulletType] || 'rectangle';
}

// 보스 총알 그리기 함수
function drawBossBullet(bullet) {
    ctx.fillStyle = bullet.color;
    ctx.strokeStyle = bullet.color;
    ctx.lineWidth = 2;
    
    switch (bullet.shape) {
        case 'heart':
            drawHeart(bullet);
            break;
        case 'star':
            drawStar(bullet);
            break;
        case 'flower':
            drawFlower(bullet);
            break;
        case 'butterfly':
            drawButterfly(bullet);
            break;
        case 'spiral':
            drawSpiral(bullet);
            break;
        case 'circle':
            drawCircle(bullet);
            break;
        case 'firework':
            drawFirework(bullet);
            break;
        case 'chaos':
            drawChaos(bullet);
            break;
        default:
            drawRectangle(bullet);
    }
}

// 하트 모양 그리기
function drawHeart(bullet) {
    const size = bullet.width / 2;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size, size * 0.2, 0, size);
    ctx.bezierCurveTo(size, size * 0.2, size * 0.5, -size * 0.3, 0, size * 0.3);
    ctx.fill();
    ctx.stroke();
}

// 별 모양 그리기
function drawStar(bullet) {
    const size = bullet.width / 2;
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 꽃 모양 그리기
function drawFlower(bullet) {
    const size = bullet.width / 2;
    const petals = 6;
    
    ctx.beginPath();
    for (let i = 0; i < petals; i++) {
        const angle = (i * Math.PI * 2) / petals;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        
        ctx.ellipse(x, y, size * 0.3, size * 0.6, angle, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();
    
    // 중앙 원
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
}

// 나비 모양 그리기
function drawButterfly(bullet) {
    const size = bullet.width / 2;
    
    // 왼쪽 날개
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, -size * 0.2, size * 0.4, size * 0.6, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 오른쪽 날개
    ctx.beginPath();
    ctx.ellipse(size * 0.3, -size * 0.2, size * 0.4, size * 0.6, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 몸통
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.1, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#8B4513';
    ctx.fill();
}

// 나선 모양 그리기
function drawSpiral(bullet) {
    const size = bullet.width / 2;
    const turns = 2;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let i = 0; i < turns * Math.PI * 2; i += 0.1) {
        const radius = (i / (turns * Math.PI * 2)) * size;
        const x = Math.cos(i) * radius;
        const y = Math.sin(i) * radius;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
}

// 원 모양 그리기
function drawCircle(bullet) {
    const size = bullet.width / 2;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

// 불꽃놀이 모양 그리기
function drawFirework(bullet) {
    const size = bullet.width / 2;
    const rays = 8;
    
    for (let i = 0; i < rays; i++) {
        const angle = (i * Math.PI * 2) / rays;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    
    // 중앙 원
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

// 혼돈 모양 그리기
function drawChaos(bullet) {
    const size = bullet.width / 2;
    
    // 랜덤한 선들
    for (let i = 0; i < 5; i++) {
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI * 2;
        const radius1 = Math.random() * size;
        const radius2 = Math.random() * size;
        
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle1) * radius1, Math.sin(angle1) * radius1);
        ctx.lineTo(Math.cos(angle2) * radius2, Math.sin(angle2) * radius2);
        ctx.stroke();
    }
}

// 사각형 모양 그리기 (기본)
function drawRectangle(bullet) {
    const size = bullet.width / 2;
    ctx.fillRect(-size, -size, bullet.width, bullet.height);
    ctx.strokeRect(-size, -size, bullet.width, bullet.height);
}

// 레벨업 체크 함수 수정
function checkLevelUp() {
    if (levelScore >= levelUpScore) {
        gameLevel++;
        levelScore = 0;
        
        // 레벨업에 필요한 점수를 더 부드럽게 증가
        if (gameLevel <= 5) {
            levelUpScore = 1000 * gameLevel; // 레벨 1-5: 기존 방식
        } else if (gameLevel <= 10) {
            levelUpScore = 5000 + (gameLevel - 5) * 1500; // 레벨 6-10: 점진적 증가
        } else {
            levelUpScore = 12500 + (gameLevel - 10) * 2000; // 레벨 11+: 더 완만한 증가
        }
        
        // 현재 난이도 설정 가져오기 (개선된 시스템)
        let currentDifficulty;
        if (gameLevel <= 5) {
            currentDifficulty = difficultySettings[gameLevel];
        } else if (gameLevel <= 10) {
            currentDifficulty = extendedDifficultySettings[gameLevel];
        } else {
            // 레벨 11 이상: 더 부드러운 증가
            const baseLevel = 10;
            const levelDiff = gameLevel - baseLevel;
            const baseSettings = extendedDifficultySettings[10];
            
            currentDifficulty = {
                enemySpeed: baseSettings.enemySpeed + (levelDiff * 0.1) * mobileSpeedMultiplier,
                enemySpawnRate: Math.min(0.12, baseSettings.enemySpawnRate + (levelDiff * 0.002)),
                horizontalSpeedRange: baseSettings.horizontalSpeedRange + (levelDiff * 0.1) * mobileSpeedMultiplier,
                patternChance: Math.min(0.98, baseSettings.patternChance + (levelDiff * 0.01)),
                maxEnemies: Math.min(35, baseSettings.maxEnemies + levelDiff),
                bossHealth: baseSettings.bossHealth + (levelDiff * 200),
                bossSpawnInterval: Math.max(12000, baseSettings.bossSpawnInterval), // 레벨 11 이상에서는 최소 12초 유지
                powerUpChance: Math.min(0.7, baseSettings.powerUpChance + (levelDiff * 0.01)),
                bombDropChance: Math.min(0.7, baseSettings.bombDropChance + (levelDiff * 0.01)),
                dynamiteDropChance: Math.min(0.6, baseSettings.dynamiteDropChance + (levelDiff * 0.01))
            };
        }
        
        // 보스 설정 업데이트
        BOSS_SETTINGS.HEALTH = currentDifficulty.bossHealth;
        BOSS_SETTINGS.SPAWN_INTERVAL = currentDifficulty.bossSpawnInterval;
        
        // 레벨업 메시지 표시
        ctx.fillStyle = 'yellow';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${gameLevel}!`, canvas.width/2, canvas.height/2 + 100);  // +100 추가
        ctx.font = '20px Arial';
        ctx.fillText(`난이도: ${getDifficultyName(gameLevel)}`, canvas.width/2, canvas.height/2 + 140);  // 40에서 140으로 변경
        
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
                ctx.fillText(`보상: ${getRewardName(reward.type)}`, canvas.width/2, canvas.height/2 + 170);  // 70에서 170으로 변경
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
    SPREAD_SHOT: 'spread_shot',
    SHIELD: 'shield',
    DOUBLE_DAMAGE: 'double_damage',
    RAPID_FIRE: 'rapid_fire'
};

// 파워업 아이템 생성 함수
function createPowerUp() {
    const types = Object.values(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    // 모바일용 캔버스 크기(392x700)로 제한
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    
    const powerUp = {
        x: Math.random() * (canvasWidth - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 3 * mobileSpeedMultiplier,
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
        
        // 화면 밖으로 나간 경우 제거 - 모바일용 캔버스 크기(392x700)로 제한
        const canvasWidth = CANVAS_WIDTH;
        const canvasHeight = CANVAS_HEIGHT;
        return powerUp.y < canvasHeight;
    });
}

// 파워업 아이템 색상 반환 함수
function getPowerUpColor(type) {
    switch(type) {
        case POWERUP_TYPES.SPEED_UP:
            return '#00ff00'; // 초록색
        case POWERUP_TYPES.SPREAD_SHOT:
            return '#ffff00'; // 노란색
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
        case POWERUP_TYPES.SPREAD_SHOT:
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
            fireRateMultiplier = 1.5;  // 연사 속도 증가 효과 완화
            setTimeout(() => fireRateMultiplier = 1, 5000);
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
let fireDelay = 1200;  // 기본 발사 딜레이 (끊어서 발사할 때 - 더 느리게)
let continuousFireDelay = 50;  // 연속 발사 딜레이 (빠르게)
let bulletSpeed = 12;  // 총알 속도
let baseBulletSize = 5.0;  // 기본 총알 크기 (1.5배 증가)
let isContinuousFire = false;  // 연속 발사 상태
let canFire = true;  // 발사 가능 상태 추가
let lastReleaseTime = 0;  // 마지막 스페이스바 해제 시간
let singleShotCooldown = 500;  // 단발 발사 쿨다운 시간 (더 길게)
let minPressDuration = 200;  // 연속 발사로 전환되는 최소 누름 시간
let minReleaseDuration = 100;  // 단발 발사를 위한 최소 해제 시간

// 총알 크기 계산 함수 최적화 (캐싱 추가)
let cachedBulletSize = null;
let lastBulletSizeCalculation = { score: -1, level: -1 };

function calculateBulletSize() {
    // 캐싱: 점수와 레벨이 변경되지 않았으면 캐시된 값 반환
    if (lastBulletSizeCalculation.score === score && 
        lastBulletSizeCalculation.level === gameLevel) {
        return cachedBulletSize;
    }
    
    let size = baseBulletSize;
    
    // 현재 게임 점수에 따른 크기 증가 (최대 5.5로 제한)
    if (score >= 10000) {
        size = 5.5;  // 최대 크기 제한
    } else if (score >= 5000) {
        size = 5.0;  // 크기 조정
    }
    
    // 난이도에 따른 크기 증가 (최대 5.5로 제한)
    if (gameLevel >= 4) {
        size = Math.max(size, 5.5);  // 최대 크기 제한
    } else if (gameLevel >= 3) {
        size = Math.max(size, 4.5);  // 크기 조정
    }
    
    // 최대 크기를 5.5로 제한
    size = Math.min(size, 5.5);
    
    // 캐시 업데이트
    cachedBulletSize = size;
    lastBulletSizeCalculation.score = score;
    lastBulletSizeCalculation.level = gameLevel;
    
    return size;
}

// 게임 상태 변수에 추가
let lastEnemySpawnTime = 0;
const MIN_ENEMY_SPAWN_INTERVAL = 500; // 최소 적 생성 간격 (밀리초)

// 게임 상태 변수에 추가
let startScreenAnimation = 0;  // 시작 화면 애니메이션 변수
let titleY = -100;  // 제목 Y 위치
let subtitleY = CANVAS_HEIGHT + 100;  // 부제목 Y 위치 - 모바일용 캔버스 크기(392x700)로 제한
let stars = [];  // 배경 별들

// 시작 화면 초기화 함수
function initStartScreen() {
    // 배경 별들 생성 - 모바일용 캔버스 크기(392x700)로 제한
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 1,
            brightness: Math.random()
        });
    }
}

// 시작 화면 그리기 함수
function drawStartScreen() {
    // 배경 그라데이션 - 모바일용 캔버스 크기(392x700)로 제한
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#000066');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 별들 그리기 - 모바일용 캔버스 크기(392x700)로 제한
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvasHeight) {
            star.y = 0;
            star.x = Math.random() * canvasWidth;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // 제목 그라데이션 - 모바일용 캔버스 크기(392x700)로 제한
    const titleGradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
    titleGradient.addColorStop(0, '#ff0000');
    titleGradient.addColorStop(0.5, '#ffff00');
    titleGradient.addColorStop(1, '#ff0000');

    // 제목 그림자
    ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    // 제목 - 모바일용 캔버스 크기(392x700)로 제한
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = titleGradient;
    ctx.textAlign = 'center';
    ctx.fillText('PAPER PLANE SHOOTER', canvasWidth/2, titleY);

    // 시작 화면 애니메이션 - 모바일용 캔버스 크기(392x700)로 제한
    if (titleY < canvasHeight/2 - 100) {
        titleY += 5;
    }
    if (subtitleY > canvasHeight/2 + 50) {
        subtitleY -= 5;
    }

    // 깜빡이는 효과
    const blinkSpeed = 500;
    const currentTime = Date.now();
    const isVisible = Math.floor(currentTime / blinkSpeed) % 2 === 0;
    
    if (isVisible) {
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText('시작/재시작 버튼 누른 후 터치하여 시작', canvas.width/2, subtitleY);
    }

    // 조작법 안내
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('화면을 터치하면 플레이어 비행기가', 50, CANVAS_HEIGHT - 200);
    ctx.fillText('터치한 지점으로 바로 이동하고', 50, CANVAS_HEIGHT - 170);
    ctx.fillText('자동으로 총알이 발사됩니다.', 50, CANVAS_HEIGHT - 140);
}

// 폭탄 생성 함수 추가
function createBomb(enemy) {
    const bomb = {
        x: enemy.x + enemy.width/2,
        y: enemy.y + enemy.height,
        width: 15,
        height: 15,
        speed: 5 * mobileSpeedMultiplier,
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
            // 폭탄 폭발 파티클 효과 생성
            createBombExplosionParticles(bomb.x, bomb.y);
            return false;
        }
        
        // 화면 밖으로 나간 폭탄 제거 (파티클 효과 추가)
        if (bomb.y >= CANVAS_HEIGHT) {
            // 폭탄이 화면 밖으로 나갈 때도 파티클 효과 생성
            createBombExplosionParticles(bomb.x, bomb.y);
            return false;
        }
        
        return true;
    });
}

// 폭탄 폭발 파티클 생성 함수
function createBombExplosionParticles(x, y) {
    // 많은 파티클 생성 (폭탄 특성)
    for (let i = 0; i < 50; i++) {
        bombParticles.push(new BombExplosionParticle(x, y));
    }
}

// 폭탄 폭발 파티클 처리 함수
function handleBombParticles() {
    // 성능 최적화: 파티클 배열 길이 제한
    if (bombParticles.length > 200) {
        bombParticles.splice(0, bombParticles.length - 150); // 오래된 파티클 50개 제거
    }
    
    bombParticles = bombParticles.filter(particle => {
        particle.draw();
        return particle.update();
    });
}

// 다이나마이트 생성 함수 추가
function createDynamite(enemy) {
    const dynamite = {
        x: enemy.x + enemy.width/2,
        y: enemy.y + enemy.height,
        width: 20,
        height: 30,
        speed: 4 * mobileSpeedMultiplier,
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
        return dynamite.y < CANVAS_HEIGHT;
    });
}

// 게임 상태 변수에 추가
// maxLives는 이미 전역으로 선언되어 있음

// === 사운드 볼륨 전역 변수 및 함수 추가 ===
let globalVolume = 0.1;
let isMuted = false;
let lastExplosionTime = 0;
const EXPLOSION_COOLDOWN = 100; // 효과음 재생 간격 (밀리초)
const VOLUME_DECAY = 0.8; // 연속 재생 시 볼륨 감소 비율
const SNAKE_EXPLOSION_VOLUME_MULTIPLIER = 3.0; // 뱀패턴 효과음 볼륨 배수

// 볼륨 값을 0-1 범위로 제한하는 함수
function clampVolume(volume) {
    return Math.max(0, Math.min(1, volume));
}

function applyGlobalVolume() {
    const vol = isMuted ? 0 : clampVolume(globalVolume);
    shootSound.volume = vol;
    explosionSound.volume = vol;
    collisionSound.volume = vol;
}

function playExplosionSound(isSnakePattern = false) {
    // 성능 모드에서는 사운드 재생 빈도 감소
    if (adaptiveFrameRate.performanceMode && Math.random() < 0.5) {
        return; // 50% 확률로 사운드 스킵
    }
    
    const currentTime = Date.now();
    let volumeMultiplier = 1.0;
    
    if (isSnakePattern) {
        volumeMultiplier = SNAKE_EXPLOSION_VOLUME_MULTIPLIER;
    }
    
    if (currentTime - lastExplosionTime < EXPLOSION_COOLDOWN) {
        // 연속 재생 시 볼륨 감소
        const decayedVolume = globalVolume * Math.pow(VOLUME_DECAY, 
            Math.floor((currentTime - lastExplosionTime) / EXPLOSION_COOLDOWN));
        explosionSound.volume = isMuted ? 0 : clampVolume(decayedVolume * volumeMultiplier);
    } else {
        // 일반 재생
        explosionSound.volume = isMuted ? 0 : clampVolume(globalVolume * volumeMultiplier);
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
    // 시작 화면에서 스페이스바를 누르면 게임 시작
    if (isStartScreen && e.code === 'Space') {
        e.preventDefault();
        isStartScreen = false;
        console.log('시작 화면에서 스페이스바 눌림 - 게임 시작');
        return;
    }

    // 게임 오버 상태에서 스페이스바로 재시작
    if (isGameOver && e.code === 'Space') {
        e.preventDefault();
        restartGame();
        return;
    }

    // R 키를 눌렀을 때 최고 점수 리셋
    if (e.code === 'KeyR') {
        console.log('R키 눌림 - 최고 점수 리셋 시도');
        if (confirm('최고 점수를 리셋하시겠습니까?')) {
            // 모든 저장소에서 최고 점수 리셋
            highScore = 0;
            
            // localStorage 리셋
            try {
                localStorage.setItem('highScore', '0');
                localStorage.setItem('highScore_backup', '0');
                localStorage.setItem('highScore_timestamp', Date.now().toString());
                console.log('localStorage 리셋 완료');
            } catch (e) {
                console.warn('localStorage 리셋 실패:', e);
            }
            
            // sessionStorage 리셋
            try {
                sessionStorage.setItem('currentHighScore', '0');
                console.log('sessionStorage 리셋 완료');
            } catch (e) {
                console.warn('sessionStorage 리셋 실패:', e);
            }
            
            // IndexedDB 리셋
            try {
                saveScoreToIndexedDB(0).then(() => {
                    console.log('IndexedDB 리셋 완료');
                }).catch(e => {
                    console.warn('IndexedDB 리셋 실패:', e);
                });
            } catch (e) {
                console.warn('IndexedDB 리셋 실패:', e);
            }
            
            // Electron IPC 리셋 (Electron 환경에서만)
            try {
                if (window.electron && window.electron.ipcRenderer) {
                    window.electron.ipcRenderer.invoke('reset-score').then(() => {
                        console.log('Electron IPC 리셋 완료');
                    }).catch(e => {
                        console.warn('Electron IPC 리셋 실패:', e);
                    });
                }
            } catch (e) {
                console.warn('Electron IPC 리셋 실패:', e);
            }
            
            alert('최고 점수가 리셋되었습니다.');
            console.log('모든 저장소에서 최고 점수 리셋 완료');
        }
        return;
    }

    // P 키를 눌렀을 때 게임 일시정지/재개
    if (e.code === 'KeyP') {
        isPaused = !isPaused;
        console.log('일시정지 상태 변경:', isPaused);
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
    gameLoopRunning = false; // 게임 루프 중복 실행 방지
    
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
    lastSecondPlaneScore = 0; // ← 추가!
    
    // 2. 모든 배열 완전 초기화
    enemies = [];           // 적 비행기 배열 초기화
    bullets = [];           // 총알 배열 초기화
    bossBullets = [];       // 보스 총알 배열 초기화
    explosions = [];        // 폭발 효과 배열 초기화
    bombs = [];             // 폭탄 배열 초기화
    dynamites = [];         // 다이나마이트 배열 초기화
    powerUps = [];          // 파워업 배열 초기화
    snakeEnemies = [];      // 뱀 패턴 적 배열 초기화
    snakeGroups = [];       // 뱀 패턴 그룹 배열 초기화
    enemyMissiles = [];     // 적 미사일 배열 초기화
    shieldedEnemies = [];   // 방어막 적 배열 초기화
    
    // 3. 플레이어 위치 초기화 - 모바일용 캔버스 크기(392x700)로 제한
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    player.x = canvasWidth / 2;
    player.y = canvasHeight - player.height - 10;  // 10에서 player.height + 10으로 변경하여 캔버스 하단에서 10픽셀 위에 위치
    secondPlane.x = canvasWidth / 2 - 60;
    secondPlane.y = canvasHeight - secondPlane.height - 10;  // 10에서 secondPlane.height + 10으로 변경하여 캔버스 하단에서 10픽셀 위에 위치
    
    // 4. 게임 타이머 및 상태 초기화
    gameOverStartTime = null;
    flashTimer = 0;
    lastEnemySpawnTime = 0;
    lastShieldedEnemySpawnTime = 0;
    lastBossSpawnTime = Date.now();
    
    // 5. 점수 및 레벨 초기화
    score = 0;
    levelScore = 0;
    scoreForSpread = 0;
    gameLevel = 1;
    levelUpScore = 1000;
    
    // 6. 특수무기 관련 상태 초기화
    specialWeaponCharged = false;
    specialWeaponCharge = 0;
    specialWeaponCount = 0;
    specialWeaponUsedCount = 0;
    
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
    fireDelay = 1200;
    continuousFireDelay = 50;
    bulletSpeed = 10 * mobileSpeedMultiplier;
    baseBulletSize = 5.0;
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
    gameStarted = false;  // 게임 시작 상태 초기화
    
    // 13. 사운드 관련 상태 초기화
    lastCollisionTime = 0;
    lastExplosionTime = 0;
    
    // 14. 패턴 추적 시스템은 각 보스별로 관리되므로 전역 초기화 불필요
    
    // 15. 적응형 프레임 레이트 시스템 초기화
    adaptiveFrameRate.frameSkip = 0;
    adaptiveFrameRate.performanceMode = false;
    adaptiveFrameRate.currentFPS = 60;
    
    // 16. 캔버스 포커스 설정
    setTimeout(() => {
        document.getElementById('gameCanvas').focus();
    }, 100);
    
    // 17. 게임 루프 재시작
    setTimeout(() => {
        startGameLoop();
    }, 200);
    
    console.log('게임 재시작 완료 - 모든 요소 초기화됨');
    console.log('현재 최고 점수:', highScore);
    console.log('초기화된 상태:', {
        enemies: enemies.length,
        bullets: bullets.length,
        bossBullets: bossBullets.length,
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
        // 새로운 확산탄 패턴들
        BOSS_PATTERNS.HEART_SHOT,
        BOSS_PATTERNS.STAR_SHOT,
        BOSS_PATTERNS.FLOWER_SHOT,
        BOSS_PATTERNS.BUTTERFLY_SHOT,
        BOSS_PATTERNS.SPIRAL_WAVE,
        BOSS_PATTERNS.CONCENTRIC_CIRCLES,
        BOSS_PATTERNS.FIREWORK_SHOT,
        BOSS_PATTERNS.CHAOS_SHOT
    ]
};

// 게임 이미지 로딩
const gameImages = {
    player: null,
    enemy: null,
    boss: null,
    snakeGroups: null,
    missile1: null,
    missile2: null
};

async function loadGameImages() {
    return new Promise((resolve, reject) => {
        const imagesToLoad = [
            { key: 'player', src: './images/player.png' },
            { key: 'enemy', src: './images/enemy.png' },
            { key: 'boss', src: './images/BOSS.png' },
            { key: 'snakeGroups', src: './images/snakeGroups.png' },
            { key: 'missile1', src: './images/missile1.png' },
            { key: 'missile2', src: './images/missile2.png' }
        ];
        
        let loadedCount = 0;
        const totalImages = imagesToLoad.length;
        
        imagesToLoad.forEach(({ key, src }) => {
            const img = new Image();
            img.onload = () => {
                gameImages[key] = img;
                loadedCount++;
                console.log(`이미지 로드 완료: ${key}`);
                if (loadedCount === totalImages) {
                    console.log('모든 이미지 로드 완료');
                    resolve();
                }
            };
            img.onerror = (error) => {
                console.error(`이미지 로드 실패: ${key}`, error);
                console.log(`시도한 경로: ${src}`);
                // 이미지 로드 실패 시에도 계속 진행
                loadedCount++;
                if (loadedCount === totalImages) {
                    console.log('일부 이미지 로드 실패했지만 게임 계속 진행');
                    resolve();
                }
            };
            img.src = src;
            });
});

// 모든 리소스 로드 완료 후 오디오 요소 최종 확인
window.addEventListener('load', () => {
    console.log('모든 리소스 로드 완료 - 오디오 요소 최종 확인...');
    
    // 오디오 요소들을 다시 한 번 확인
    try {
        if (!shootSound) shootSound = document.getElementById('shootSound');
        if (!explosionSound) explosionSound = document.getElementById('explosionSound');
        if (!collisionSound) collisionSound = document.getElementById('collisionSound');
        if (!warningSound) warningSound = document.getElementById('warningSound');
        
        console.log('리소스 로드 후 오디오 요소 최종 상태:', {
            shootSound: !!shootSound,
            explosionSound: !!explosionSound,
            collisionSound: !!collisionSound,
            warningSound: !!warningSound
        });
        
        // 경고음이 여전히 없으면 강제로 찾기
        if (!warningSound) {
            console.log('경고음 요소를 강제로 찾는 중...');
            const allAudioElements = document.querySelectorAll('audio');
            console.log('페이지의 모든 오디오 요소:', allAudioElements);
            
            for (let audio of allAudioElements) {
                if (audio.id === 'warningSound') {
                    warningSound = audio;
                    warningSound.volume = clampVolume(0.6);
                    console.log('경고음 요소 강제 발견 및 설정 완료!');
                    break;
                }
            }
        }
        
    } catch (error) {
        console.error('리소스 로드 후 오디오 요소 확인 실패:', error);
    }
});
}

// 이미지 기반 비행기 그리기 함수
function drawAirplaneWithImage(x, y, width, height, imageType, isEnemy = false) {
    const image = gameImages[imageType];
    if (!image) {
        // 이미지가 로드되지 않은 경우 기존 함수 사용
        drawAirplane(x, y, width, height, 'white', isEnemy);
        return;
    }
    
    ctx.save();
    ctx.translate(x + width/2, y + height/2);
    
    if (isEnemy) {
        ctx.rotate(Math.PI); // 적 비행기는 180도 회전
    }
    
    // 이미지 그리기
    ctx.drawImage(image, -width/2, -height/2, width, height);
    
    ctx.restore();
}

// 플레이어 비행기 그리기
function drawPlayer(x, y, width, height) {
    drawAirplaneWithImage(x, y, width, height, 'player', false);
}

// 일반 적 비행기 그리기
function drawEnemy(x, y, width, height) {
    drawAirplaneWithImage(x, y, width, height, 'enemy', true);
}

// 보스 그리기
function drawBoss(x, y, width, height) {
    drawAirplaneWithImage(x, y, width, height, 'boss', true);
}

// 뱀 패턴 적 그리기
function drawSnakeEnemy(x, y, width, height) {
    drawAirplaneWithImage(x, y, width, height, 'snakeGroups', true);
}

// 적 미사일 생성 함수
function createEnemyMissile(enemy, missileType = 'missile1', angle = null) {
    // 파괴된 적은 미사일 발사하지 않음
    if (enemy.isHit) {
        console.log('파괴된 적은 미사일 발사하지 않음');
        return;
    }
    
    // 성능 최적화: 적 미사일 배열 길이 제한
    if (enemyMissiles.length > 40) {
        enemyMissiles.splice(0, enemyMissiles.length - 30); // 오래된 미사일 10개 제거
    }
    
    const missileSize = Math.min(enemy.width, enemy.height) * 1.2; // 적 비행기보다 20% 크게
    const missile = {
        x: enemy.x + enemy.width / 2 - missileSize / 2,
        y: enemy.y + enemy.height,
        width: missileSize,
        height: missileSize,
        speed: 4 * mobileSpeedMultiplier,
        type: missileType,
        parentEnemy: enemy, // 부모 적 참조 추가
        angle: angle, // 각도 정보 추가
        pattern: enemy.pattern // 패턴 정보 추가
    };
    enemyMissiles.push(missile);
    console.log(`미사일 생성 완료: ${missileType} (${missileType === 'missile1' ? '적색' : '청색'}), 총 미사일 수: ${enemyMissiles.length}`);
}

// 적 미사일 업데이트 함수
function updateEnemyMissiles() {
    for (let i = enemyMissiles.length - 1; i >= 0; i--) {
        const missile = enemyMissiles[i];
        
        // 각도가 있는 미사일 (방어막 적의 패턴 미사일)
        if (missile.angle !== null) {
            missile.x += Math.cos(missile.angle) * missile.speed;
            missile.y += Math.sin(missile.angle) * missile.speed;
        } else {
            // 기본 미사일 (아래로 이동)
            missile.y += missile.speed;
        }
        
        // 화면 밖으로 나간 미사일 제거 - 모바일용 캔버스 크기(392x700)로 제한
        const canvasWidth = CANVAS_WIDTH;
        const canvasHeight = CANVAS_HEIGHT;
        if (missile.y > canvasHeight + 50 || missile.y < -50 || 
            missile.x > canvasWidth + 50 || missile.x < -50) {
            enemyMissiles.splice(i, 1);
            continue;
        }
        
        // 플레이어와의 충돌 검사
        if (checkCollision(missile, player)) {
            handleCollision();
            enemyMissiles.splice(i, 1);
            continue;
        }
        
        // 두 번째 비행기와의 충돌 검사
        if (hasSecondPlane && checkCollision(missile, secondPlane)) {
            handleCollision();
            enemyMissiles.splice(i, 1);
            continue;
        }
    }
}

// 적 미사일 그리기 함수
function drawEnemyMissiles() {
    enemyMissiles.forEach(missile => {
        const image = gameImages[missile.type];
        if (image) {
            // 미사일 이미지 사용
            ctx.drawImage(image, missile.x, missile.y, missile.width, missile.height);
        } else {
            // 이미지가 없으면 기본 미사일 모양 그리기 (fallback)
            ctx.fillStyle = missile.type === 'missile1' ? '#ff4444' : '#4488ff';
            ctx.fillRect(missile.x, missile.y, missile.width, missile.height);
        }
    });
}

// 적 미사일 발사 로직
function handleEnemyMissileFiring() {
    const currentTime = Date.now();
    
    // 일반 적과 뱀 패턴 적, 보스만 미사일 발사 (방어막 적은 별도 처리)
    const normalEnemies = enemies.filter(enemy => !enemy.isBoss && enemy.type !== 'shielded');
    
    // 뱀 패턴 적들을 snakeGroups에서 추출하여 별도로 관리
    const activeSnakeEnemies = [];
    snakeGroups.forEach(group => {
        if (group.isActive) {
            group.enemies.forEach(enemy => {
                if (!enemy.isHit) {
                    activeSnakeEnemies.push(enemy);
                }
            });
        }
    });
    
    // 디버그: 현재 적 수 출력
    if (normalEnemies.length > 0 || activeSnakeEnemies.length > 0 || enemies.filter(e => e.isBoss).length > 0) {
        console.log(`미사일 발사 대상 적 수: 일반 ${normalEnemies.length}, 뱀 ${activeSnakeEnemies.length}, 보스 ${enemies.filter(e => e.isBoss).length}`);
        console.log('모바일 상태:', isMobile);
        console.log('일반 적 타입들:', normalEnemies.map(e => e.type));
    }
    
    // 일반 적들 처리
    normalEnemies.forEach(enemy => {
        // 미사일 발사 시간 초기화 (파괴되지 않은 적만)
        if (!enemy.lastMissileTime && !enemy.isHit) {
            enemy.lastMissileTime = currentTime - Math.random() * 2000; // 랜덤한 시작 시간
        }
        
        // 파괴된 적은 미사일 발사하지 않음
        if (enemy.isHit) {
            console.log(`적 파괴됨으로 미사일 발사 스킵: normal 타입`);
            return;
        }
        
        // 일반 적: missile1(적색) 미사일만 발사 간격(2.25-3.75초 간격)
        const mobileIntervalMultiplier = 1.0;
        const missileInterval = (2250 + Math.random() * 1500) * mobileIntervalMultiplier;
        const missileType = 'missile1'; // 적색 미사일 이미지
        const fireChance = isMobile ? 0.9 : 0.95; // 발사 확률을 더 높임
        
        // 미사일 발사 조건 체크
        const timeSinceLastMissile = currentTime - enemy.lastMissileTime;
        console.log(`적 미사일 체크: normal 타입, 경과시간: ${timeSinceLastMissile}ms, 필요간격: ${missileInterval}ms, 발사확률: ${fireChance}`);
        
        if (timeSinceLastMissile > missileInterval) {
            // 랜덤 확률로 미사일 발사
            const randomValue = Math.random();
            console.log(`미사일 발사 시도: normal 타입, 랜덤값: ${randomValue.toFixed(3)}, 필요확률: ${fireChance}`);
            
            if (randomValue < fireChance) {
                console.log(`적 미사일 발사 성공: normal 타입, 미사일: ${missileType}, 간격: ${missileInterval}ms, 모바일: ${isMobile}`);
                createEnemyMissile(enemy, missileType);
                enemy.lastMissileTime = currentTime;
            } else {
                // 발사하지 않더라도 다음 간격을 랜덤하게 조정
                enemy.lastMissileTime = currentTime - (Math.random() * 500);
                console.log(`미사일 발사 실패: normal 타입, 확률: ${fireChance}, 모바일: ${isMobile}`);
            }
        } else {
            // 간격이 아직 안 된 경우
            const remainingTime = missileInterval - timeSinceLastMissile;
            if (Math.random() < 0.01) { // 1% 확률로만 로그 출력 (너무 많이 출력되지 않도록)
                console.log(`미사일 발사 대기: normal 타입, 남은 시간: ${remainingTime.toFixed(0)}ms, 모바일: ${isMobile}`);
            }
        }
    });
    
    // 뱀 패턴 적들 처리
    activeSnakeEnemies.forEach(enemy => {
        // 미사일 발사 시간 초기화 (파괴되지 않은 적만)
        if (!enemy.lastMissileTime && !enemy.isHit) {
            enemy.lastMissileTime = currentTime - Math.random() * 2000; // 랜덤한 시작 시간
        }
        
        // 파괴된 적은 미사일 발사하지 않음
        if (enemy.isHit) {
            console.log(`적 파괴됨으로 미사일 발사 스킵: snake 타입`);
            return;
        }
        
        // 뱀 패턴 적: missile2(청색) 미사일만 발사 간격 (2.25-3.75초 간격)
        const mobileIntervalMultiplier = 1.0;
        const missileInterval = (2250 + Math.random() * 1500) * mobileIntervalMultiplier;
        const missileType = 'missile2'; // 청색 미사일 이미지
        const fireChance = isMobile ? 0.92 : 0.98; // 발사 확률을 더 높임
        
        // 미사일 발사 조건 체크
        const timeSinceLastMissile = currentTime - enemy.lastMissileTime;
        console.log(`적 미사일 체크: snake 타입, 경과시간: ${timeSinceLastMissile}ms, 필요간격: ${missileInterval}ms, 발사확률: ${fireChance}`);
        
        if (timeSinceLastMissile > missileInterval) {
            // 랜덤 확률로 미사일 발사
            const randomValue = Math.random();
            console.log(`미사일 발사 시도: snake 타입, 랜덤값: ${randomValue.toFixed(3)}, 필요확률: ${fireChance}`);
            
            if (randomValue < fireChance) {
                console.log(`적 미사일 발사 성공: snake 타입, 미사일: ${missileType}, 간격: ${missileInterval}ms, 모바일: ${isMobile}`);
                createEnemyMissile(enemy, missileType);
                enemy.lastMissileTime = currentTime;
            } else {
                // 발사하지 않더라도 다음 간격을 랜덤하게 조정
                enemy.lastMissileTime = currentTime - (Math.random() * 500);
                console.log(`미사일 발사 실패: snake 타입, 확률: ${fireChance}, 모바일: ${isMobile}`);
            }
        } else {
            // 간격이 아직 안 된 경우
            const remainingTime = missileInterval - timeSinceLastMissile;
            if (Math.random() < 0.01) { // 1% 확률로만 로그 출력 (너무 많이 출력되지 않도록)
                console.log(`미사일 발사 대기: snake 타입, 남은 시간: ${remainingTime.toFixed(0)}ms, 모바일: ${isMobile}`);
            }
        }
    });
    
    // 보스들 처리
    enemies.filter(enemy => enemy.isBoss).forEach(enemy => {
        // 미사일 발사 시간 초기화 (파괴되지 않은 적만)
        if (!enemy.lastMissileTime && !enemy.isHit) {
            enemy.lastMissileTime = currentTime - Math.random() * 2000; // 랜덤한 시작 시간
        }
        
        // 파괴된 적은 미사일 발사하지 않음
        if (enemy.isHit) {
            console.log(`적 파괴됨으로 미사일 발사 스킵: boss 타입`);
            return;
        }
        
        // 보스: missile1만 미사일 발사 간격(2.25-3.75초 간격)
        const mobileIntervalMultiplier = 1.0;
        const missileInterval = (2250 + Math.random() * 1500) * mobileIntervalMultiplier;
        const missileType = 'missile1'; // 적색 미사일 이미지만 사용
        const fireChance = isMobile ? 0.9 : 0.96; // 발사 확률을 높임
        
        // 미사일 발사 조건 체크
        const timeSinceLastMissile = currentTime - enemy.lastMissileTime;
        console.log(`적 미사일 체크: boss 타입, 경과시간: ${timeSinceLastMissile}ms, 필요간격: ${missileInterval}ms, 발사확률: ${fireChance}`);
        
        if (timeSinceLastMissile > missileInterval) {
            // 랜덤 확률로 미사일 발사
            const randomValue = Math.random();
            console.log(`미사일 발사 시도: boss 타입, 랜덤값: ${randomValue.toFixed(3)}, 필요확률: ${fireChance}`);
            
            if (randomValue < fireChance) {
                console.log(`적 미사일 발사 성공: boss 타입, 미사일: ${missileType}, 간격: ${missileInterval}ms, 모바일: ${isMobile}`);
                createEnemyMissile(enemy, missileType);
                enemy.lastMissileTime = currentTime;
            } else {
                // 발사하지 않더라도 다음 간격을 랜덤하게 조정
                enemy.lastMissileTime = currentTime - (Math.random() * 500);
                console.log(`미사일 발사 실패: boss 타입, 확률: ${fireChance}, 모바일: ${isMobile}`);
            }
        } else {
            // 간격이 아직 안 된 경우
            const remainingTime = missileInterval - timeSinceLastMissile;
            if (Math.random() < 0.01) { // 1% 확률로만 로그 출력 (너무 많이 출력되지 않도록)
                console.log(`미사일 발사 대기: boss 타입, 남은 시간: ${remainingTime.toFixed(0)}ms, 모바일: ${isMobile}`);
            }
        }
    });
}

// 방어막 적 생성 함수
function createShieldedEnemy() {
    if (isMobile && !gameStarted) return;
    // 8가지 동적 움직임 패턴 중 하나 선택
    const patterns = ['zigzag', 'circle', 'wave', 'diagonal', 'spiral', 'bounce', 'chase', 'pendulum'];
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // 모바일용 캔버스 크기(392x700)로 제한
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    
    const shieldedEnemy = {
        x: Math.random() * (canvasWidth - 53),
        y: -53,
        width: 53,
        height: 53,
        speed: 1.5 * mobileSpeedMultiplier,
        health: 20, // 플레이어 총알 20발을 맞으면 피격
        maxHealth: 20, // 최대 체력도 20으로 설정
        shieldActive: true,
        shieldTimer: Date.now(),
        shieldDuration: 5000,
        lastShot: 0,
        shotInterval: isMobile ? 9000 : 6000, // 모바일에서는 9초, 데스크탑에서는 6초 (반으로 줄임)
        type: 'shielded',
        
        // 동적 움직임 패턴 관련 속성
        pattern: selectedPattern,
        patternStartTime: Date.now(),
        patternDuration: 8000 + Math.random() * 4000, // 8-12초마다 패턴 변경
        originalX: 0,
        originalY: 0,
        
        // 패턴별 특수 속성
        zigzagDirection: 1,
        zigzagAmplitude: 50,
        circleRadius: 30,
        circleAngle: 0,
        waveAmplitude: 40,
        waveFrequency: 0.02,
        diagonalDirection: Math.random() < 0.5 ? 1 : -1,
        spiralRadius: 20,
        spiralAngle: 0,
        bounceVelocity: -2,
        bounceGravity: 0.1,
        chaseSpeed: 2,
        pendulumAngle: 0,
        pendulumSpeed: 0.03
    };
    
    // 초기 위치 저장
    shieldedEnemy.originalX = shieldedEnemy.x;
    shieldedEnemy.originalY = shieldedEnemy.y;
    
    shieldedEnemies.push(shieldedEnemy);
}

// 방어막 적 업데이트 함수
function updateShieldedEnemies() {
    const currentTime = Date.now();
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    
    for (let i = shieldedEnemies.length - 1; i >= 0; i--) {
        const enemy = shieldedEnemies[i];
        
        // 방어막 타이머 업데이트
        if (enemy.shieldActive && currentTime - enemy.shieldTimer > enemy.shieldDuration) {
            enemy.shieldActive = false;
        }
        
        // 패턴 변경 체크 (8-12초마다)
        if (currentTime - enemy.patternStartTime > enemy.patternDuration) {
            const patterns = ['zigzag', 'circle', 'wave', 'diagonal', 'spiral', 'bounce', 'chase', 'pendulum'];
            enemy.pattern = patterns[Math.floor(Math.random() * patterns.length)];
            enemy.patternStartTime = currentTime;
            enemy.patternDuration = 8000 + Math.random() * 4000;
            
            // 패턴별 속성 재설정
            enemy.zigzagDirection = 1;
            enemy.circleAngle = 0;
            enemy.diagonalDirection = Math.random() < 0.5 ? 1 : -1;
            enemy.spiralAngle = 0;
            enemy.bounceVelocity = -2;
            enemy.pendulumAngle = 0;
        }
        
        // 기본 아래로 이동
        enemy.y += enemy.speed;
        
        // 패턴별 움직임 적용
        switch(enemy.pattern) {
            case 'zigzag':
                enemy.x = enemy.originalX + Math.sin(currentTime * 0.003) * enemy.zigzagAmplitude;
                if (enemy.x < 0 || enemy.x > canvasWidth - enemy.width) {
                    enemy.zigzagDirection *= -1;
                }
                break;
                
            case 'circle':
                enemy.circleAngle += 0.05;
                enemy.x = enemy.originalX + Math.cos(enemy.circleAngle) * enemy.circleRadius;
                enemy.y = enemy.originalY + Math.sin(enemy.circleAngle) * enemy.circleRadius;
                break;
                
            case 'wave':
                enemy.x = enemy.originalX + Math.sin(currentTime * enemy.waveFrequency) * enemy.waveAmplitude;
                break;
                
            case 'diagonal':
                enemy.x += enemy.diagonalDirection * 2;
                if (enemy.x < 0 || enemy.x > canvasWidth - enemy.width) {
                    enemy.diagonalDirection *= -1;
                }
                break;
                
            case 'spiral':
                enemy.spiralAngle += 0.08;
                enemy.x = enemy.originalX + Math.cos(enemy.spiralAngle) * enemy.spiralRadius;
                enemy.y = enemy.originalY + Math.sin(enemy.spiralAngle) * enemy.spiralRadius;
                enemy.spiralRadius += 0.1;
                break;
                
            case 'bounce':
                enemy.bounceVelocity += enemy.bounceGravity;
                enemy.y += enemy.bounceVelocity;
                if (enemy.y > canvasHeight - enemy.height) {
                    enemy.y = canvasHeight - enemy.height;
                    enemy.bounceVelocity = -Math.abs(enemy.bounceVelocity) * 0.8;
                }
                break;
                
            case 'chase':
                // 플레이어를 향해 이동
                const targetX = player.x;
                if (enemy.x < targetX) {
                    enemy.x += enemy.chaseSpeed;
                } else if (enemy.x > targetX) {
                    enemy.x -= enemy.chaseSpeed;
                }
                break;
                
            case 'pendulum':
                enemy.pendulumAngle += enemy.pendulumSpeed;
                enemy.x = enemy.originalX + Math.sin(enemy.pendulumAngle) * 60;
                break;
        }
        
        // 경계 체크
        if (enemy.x < 0) enemy.x = 0;
        if (enemy.x > canvasWidth - enemy.width) enemy.x = canvasWidth - enemy.width;
        
        // 화면 밖으로 나간 적 제거
        if (enemy.y > canvasHeight + 100) {
            shieldedEnemies.splice(i, 1);
            continue;
        }
        
        // 패턴별 미사일 발사
        if (currentTime - enemy.lastShot > enemy.shotInterval) {
            // 패턴에 따른 다양한 미사일 발사 (미사일 이미지 사용)
            switch(enemy.pattern) {
                case 'zigzag':
                    // 지그재그 패턴: missile1(적색) 대각선 미사일
                    createEnemyMissile(enemy, 'missile1', Math.PI / 4);
                    createEnemyMissile(enemy, 'missile1', -Math.PI / 4);
                    break;
                case 'circle':
                    // 원형 패턴: missile2(청색) 360도 분산 미사일
                    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                        createEnemyMissile(enemy, 'missile2', angle);
                    }
                    break;
                case 'wave':
                    // 웨이브 패턴: missile1(적색) 파도 모양 미사일
                    createEnemyMissile(enemy, 'missile1', Math.PI / 6);
                    createEnemyMissile(enemy, 'missile1', -Math.PI / 6);
                    createEnemyMissile(enemy, 'missile1', 0);
                    break;
                case 'diagonal':
                    // 대각선 패턴: missile2(청색) 대각선 미사일
                    createEnemyMissile(enemy, 'missile2', Math.PI / 3);
                    createEnemyMissile(enemy, 'missile2', -Math.PI / 3);
                    break;
                case 'spiral':
                    // 스파이럴 패턴: missile1(적색) 회전 미사일
                    createEnemyMissile(enemy, 'missile1', enemy.spiralAngle);
                    createEnemyMissile(enemy, 'missile1', enemy.spiralAngle + Math.PI);
                    break;
                case 'bounce':
                    // 바운스 패턴: missile2(청색) 위아래 미사일
                    createEnemyMissile(enemy, 'missile2', Math.PI / 2);
                    createEnemyMissile(enemy, 'missile2', -Math.PI / 2);
                    break;
                case 'chase':
                    // 추적 패턴: missile1(적색) 플레이어 방향 미사일
                    const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                    createEnemyMissile(enemy, 'missile1', angleToPlayer);
                    break;
                case 'pendulum':
                    // 진자 패턴: missile2(청색) 좌우 미사일
                    createEnemyMissile(enemy, 'missile2', 0);
                    createEnemyMissile(enemy, 'missile2', Math.PI);
                    break;
                default:
                    // 기본: missile1(적색) 미사일
                    createEnemyMissile(enemy, 'missile1');
            }
            enemy.lastShot = currentTime;
        }
        
        // 플레이어와의 충돌 체크
        if (checkCollision(enemy, player) || 
            (hasSecondPlane && checkCollision(enemy, secondPlane))) {
            handleCollision();
            shieldedEnemies.splice(i, 1);
            continue;
        }
    }
}

// 방어막 적 그리기 함수
function drawShieldedEnemies() {
    shieldedEnemies.forEach(enemy => {
        // 적 비행기 그리기
        drawEnemy(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // 방어막 그리기 (활성화된 경우)
        if (enemy.shieldActive) {
            ctx.save();
            
            // 패턴별 방어막 색상 설정
            let shieldColor = '#00ffff'; // 기본 청록색
            let shieldGlowColor = 'rgba(0, 255, 255, 0.3)';
            
            switch(enemy.pattern) {
                case 'zigzag':
                    shieldColor = '#ff00ff'; // 마젠타
                    shieldGlowColor = 'rgba(255, 0, 255, 0.3)';
                    break;
                case 'circle':
                    shieldColor = '#ffff00'; // 노란색
                    shieldGlowColor = 'rgba(255, 255, 0, 0.3)';
                    break;
                case 'wave':
                    shieldColor = '#00ff00'; // 초록색
                    shieldGlowColor = 'rgba(0, 255, 0, 0.3)';
                    break;
                case 'diagonal':
                    shieldColor = '#ff6600'; // 주황색
                    shieldGlowColor = 'rgba(255, 102, 0, 0.3)';
                    break;
                case 'spiral':
                    shieldColor = '#ff0080'; // 핑크
                    shieldGlowColor = 'rgba(255, 0, 128, 0.3)';
                    break;
                case 'bounce':
                    shieldColor = '#8000ff'; // 보라색
                    shieldGlowColor = 'rgba(128, 0, 255, 0.3)';
                    break;
                case 'chase':
                    shieldColor = '#ff0000'; // 빨간색
                    shieldGlowColor = 'rgba(255, 0, 0, 0.3)';
                    break;
                case 'pendulum':
                    shieldColor = '#0080ff'; // 파란색
                    shieldGlowColor = 'rgba(0, 128, 255, 0.3)';
                    break;
            }
            
            ctx.strokeStyle = shieldColor;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.8;
            
            // 방어막 원형 그리기
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                   enemy.width/2 + 10, 0, Math.PI * 2);
            ctx.stroke();
            
            // 패턴별 특수 효과
            const currentTime = Date.now();
            switch(enemy.pattern) {
                case 'zigzag':
                    // 지그재그 효과: 깜빡이는 방어막
                    if (Math.sin(currentTime * 0.01) > 0) {
                        ctx.globalAlpha = 0.4;
                    }
                    break;
                case 'circle':
                    // 원형 효과: 회전하는 방어막
                    ctx.save();
                    ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    ctx.rotate(currentTime * 0.001);
                    ctx.beginPath();
                    ctx.arc(0, 0, enemy.width/2 + 15, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                    break;
                case 'wave':
                    // 웨이브 효과: 파도 모양 방어막
                    ctx.beginPath();
                    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                        const radius = enemy.width/2 + 10 + Math.sin(angle * 3 + currentTime * 0.005) * 5;
                        const x = enemy.x + enemy.width/2 + Math.cos(angle) * radius;
                        const y = enemy.y + enemy.height/2 + Math.sin(angle) * radius;
                        if (angle === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    ctx.stroke();
                    break;
                case 'spiral':
                    // 스파이럴 효과: 확장하는 방어막
                    const spiralRadius = enemy.width/2 + 10 + Math.sin(currentTime * 0.003) * 10;
                    ctx.beginPath();
                    ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                           spiralRadius, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                case 'bounce':
                    // 바운스 효과: 압축되는 방어막
                    const bounceScale = 1 + Math.sin(currentTime * 0.01) * 0.2;
                    ctx.save();
                    ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    ctx.scale(bounceScale, 1/bounceScale);
                    ctx.beginPath();
                    ctx.arc(0, 0, enemy.width/2 + 10, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                    break;
                case 'chase':
                    // 추적 효과: 플레이어 방향으로 뻗는 방어막
                    const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                    ctx.save();
                    ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    ctx.rotate(angleToPlayer);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, enemy.width/2 + 15, enemy.width/2 + 5, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                    break;
            }
            
            // 방어막 내부 그라데이션
            const gradient = ctx.createRadialGradient(
                enemy.x + enemy.width/2, enemy.y + enemy.height/2, 0,
                enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2 + 10
            );
            gradient.addColorStop(0, shieldGlowColor);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();
            
            ctx.restore();
        }
        
        // 패턴 표시 텍스트 (디버깅용, 필요시 주석 처리)
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.pattern, enemy.x + enemy.width/2, enemy.y - 20);
        ctx.restore();
        
        // 체력바 그리기
        const healthBarWidth = enemy.width;
        const healthBarHeight = 4;
        const healthBarX = enemy.x;
        const healthBarY = enemy.y - 10;
        
        // 체력바 배경
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // 체력바
        const healthPercentage = enemy.health / enemy.maxHealth;
        ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
        
        // 체력 숫자 표시 (남은 총알 수)
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        const healthText = `${enemy.health}/${enemy.maxHealth}`;
        ctx.strokeText(healthText, enemy.x + enemy.width/2, healthBarY - 2);
        ctx.fillText(healthText, enemy.x + enemy.width/2, healthBarY - 2);
        ctx.restore();
    });
}

// 적이 파괴될 때 해당 적이 발사한 미사일들 제거
function removeEnemyMissiles(enemy) {
    enemyMissiles = enemyMissiles.filter(missile => missile.parentEnemy !== enemy);
}

// 게임 루프 실행 상태 변수
let gameLoopRunning = false;

// 성능 최적화를 위한 적응형 프레임 레이트 시스템
let adaptiveFrameRate = {
    targetFPS: 60,
    currentFPS: 60,
    frameCount: 0,
    lastTime: 0,
    frameSkip: 0,
    maxFrameSkip: 2,
    performanceMode: false,
    
    update() {
        const currentTime = performance.now();
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // 성능에 따른 프레임 스킵 조정
            if (this.currentFPS < 30) {
                this.frameSkip = Math.min(this.maxFrameSkip, this.frameSkip + 1);
                this.performanceMode = true;
            } else if (this.currentFPS > 50) {
                this.frameSkip = Math.max(0, this.frameSkip - 1);
                this.performanceMode = false;
            }
        }
    },
    
    shouldSkipFrame() {
        return false; // 프레임 스킵 비활성화로 일관된 속도 유지
    }
};

// 총알 발사 함수
function fireBullet() {
    if (!canFire || isGameOver) return;
    
    const currentTime = Date.now();
    if (currentTime - lastFireTime < fireDelay) return;
    
    // 성능 최적화: 총알 배열 길이 제한
    if (bullets.length > 100) {
        bullets.splice(0, bullets.length - 80); // 오래된 총알 20개 제거
    }
    
    // 일반 총알 발사
    const bullet = {
        x: player.x + player.width / 2,
        y: player.y,
        trail: [],
        rotation: 0,
        rotationSpeed: 0.1,
        width: 4,
        height: 8,
        speed: 8 * mobileSpeedMultiplier
    };
    bullets.push(bullet);
    
    // 두 번째 비행기 발사
    if (hasSecondPlane) {
        const bullet = {
            x: secondPlane.x + secondPlane.width / 2,
            y: secondPlane.y,
            width: 4,
            height: 8,
            speed: 8 * mobileSpeedMultiplier,
            trail: [],
            rotation: 0,
            rotationSpeed: 0.1
        };
        bullets.push(bullet);
    }
    
    // 성능 최적화: 총알 배열 길이 제한 (두 번째 비행기 발사 후)
    if (bullets.length > 100) {
        bullets.splice(0, bullets.length - 80); // 오래된 총알 20개 제거
    }
    
    lastFireTime = currentTime;
    canFire = false;
    
    // 일정 시간 후 다시 발사 가능하도록 설정
    setTimeout(() => {
        canFire = true;
    }, fireDelay);
}

// 모바일 연속 발사 시작
function startMobileContinuousFire() {
    isContinuousFire = true;
    keys.Space = true; // 연속발사 상태에서 Space를 계속 true로 유지
    isSpacePressed = true; // 웹 발사 로직과 동일하게 설정
    spacePressTime = Date.now(); // 터치 시작 시간 설정
}

// 모바일 연속 발사 중지
function stopMobileContinuousFire() {
    isContinuousFire = false;
    keys.Space = false; // 연속발사 중지 시 Space를 false로
    isSpacePressed = false; // 웹 발사 로직과 동일하게 설정
    lastReleaseTime = Date.now(); // 터치 종료 시간 설정
}

// 터치 위치 이동 컨트롤 설정
function setupTouchDragControls() {
    console.log('터치 위치 이동 컨트롤 설정');
    
    // 터치 시작
    canvas.addEventListener('touchstart', (e) => {
        if (isMobile && !gameStarted && !isStartScreen && !isGameOver) {
            gameStarted = true;
            console.log('모바일 화면 터치로 게임 본격 시작!');
        }
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // 시작 화면과 게임 오버 화면에서는 터치로 시작/재시작 불가
        if (isStartScreen || isGameOver) {
            return;
        }
        
        // 게임 중에만 플레이어 이동 가능
        if (!isGameActive) {
            return;
        }
        
        // 터치한 위치로 플레이어 즉시 이동 (터치 지점과 플레이어 중심점의 거리를 일정하게 유지)
        let newX = touchX - player.width / 6; // 터치 지점을 기준으로 플레이어 중심을 왼쪽으로 조정하여 일정한 거리 유지 (50% 증가)
        let newY = touchY - player.height * 1.2; // 비행기 꼬리 부분으로 조정 (꼬리가 터치 지점에 오도록) (50% 증가)
        
        // 경계 제한 - 모바일용 캔버스 크기(392x700)로 제한
        const canvasWidth = 392;
        const canvasHeight = 700;
        const margin = 10;
        const maxY = canvasHeight - 100; // 모바일 컨트롤 영역 고려
        const rightExpansion = player.width; // 오른쪽 확장 영역 (플레이어 몸체만큼)
        const leftExpansion = player.width; // 왼쪽 확장 영역 (플레이어 몸체만큼)
        
        newX = Math.max(-leftExpansion, Math.min(canvasWidth + rightExpansion, newX));
        newY = Math.max(margin, Math.min(maxY, newY));
        
        // 플레이어 위치 업데이트
        player.x = newX;
        player.y = newY;
        
        // 두 번째 비행기도 함께 이동
        if (hasSecondPlane) {
            if (player.x + player.width + secondPlane.width < CANVAS_WIDTH) {
                secondPlane.x = player.x + player.width;
            } else if (player.x - secondPlane.width > 0) {
                secondPlane.x = player.x - secondPlane.width;
            } else {
                secondPlane.x = CANVAS_WIDTH - secondPlane.width - 10;
            }
            secondPlane.y = player.y;
        }
        // 터치 시 자동 연속발사 시작
        if (!isGameOver && !isStartScreen) {
            keys.Space = true;
            isSpacePressed = true;
            spacePressTime = Date.now();
            isContinuousFire = true;
            console.log('터치 연속발사 시작');
        }
        
        console.log('터치 위치 이동:', newX, newY);
    }, { passive: false });
    
    // 터치 이동 (드래그 중에도 위치 업데이트)
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        // 시작 화면, 게임 오버, 게임 비활성 상태에서는 터치 이동 불가
        if (isStartScreen || isGameOver || !isGameActive) {
            return;
        }
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // 터치한 위치로 플레이어 즉시 이동 (터치 지점과 플레이어 중심점의 거리를 일정하게 유지)
        let newX = touchX - player.width / 6; // 터치 지점을 기준으로 플레이어 중심을 왼쪽으로 조정하여 일정한 거리 유지 (50% 증가)
        let newY = touchY - player.height * 1.2; // 비행기 꼬리 부분으로 조정 (꼬리가 터치 지점에 오도록) (50% 증가)
        
        // 경계 제한 - 모바일용 캔버스 크기로 제한
        const canvasWidth = CANVAS_WIDTH;
        const canvasHeight = CANVAS_HEIGHT;
        const margin = 10;
        const maxY = canvasHeight - 100; // 모바일 컨트롤 영역 고려
        const rightExpansion = player.width; // 오른쪽 확장 영역 (플레이어 몸체만큼)
        const leftExpansion = player.width; // 왼쪽 확장 영역 (플레이어 몸체만큼)
        
        newX = Math.max(-leftExpansion, Math.min(canvasWidth + rightExpansion, newX));
        newY = Math.max(margin, Math.min(maxY, newY));
        
        // 플레이어 위치 업데이트
        player.x = newX;
        player.y = newY;
        
        // 두 번째 비행기도 함께 이동
        if (hasSecondPlane) {
            secondPlane.x = newX + (canvasWidth / 2 - 60) - (canvasWidth / 2 - (240 * 0.7 * 0.7 * 0.8) / 2);
            secondPlane.y = newY;
        }
        
    }, { passive: false });
    
    // 터치 종료
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        // 게임 중에만 연속발사 중지 처리
        if (isGameActive && !isGameOver && !isStartScreen) {
            keys.Space = false;
            isSpacePressed = false;
            lastReleaseTime = Date.now();
            isContinuousFire = false;
            console.log('터치 연속발사 중지');
        }
        
        console.log('터치 종료');
    }, { passive: false });
}

// 게임 루프 시작
function startGameLoop() {
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        console.log('게임 루프 시작');
        gameLoop();
    } else {
        console.log('게임 루프가 이미 실행 중입니다');
    }
}