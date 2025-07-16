// 게임 상수 정의
const SPECIAL_WEAPON_MAX_CHARGE = 1000;  // 특수무기 최대 충전량
const SPECIAL_WEAPON_CHARGE_RATE = 10;   // 특수무기 충전 속도
const TOP_EFFECT_ZONE = 20;  // 상단 효과 무시 영역 (픽셀)

// 모바일 디바이스 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 모바일 속도 조절 (더 느리게 조정)
const mobileSpeedMultiplier = isMobile ? 1.0 : 1.0;

// 모바일 프레임 제한 (60fps 대신 55fps로 완화)
const MOBILE_FPS_LIMIT = isMobile ? 100 : 100;
const MOBILE_FRAME_INTERVAL = 800 / MOBILE_FPS_LIMIT;

// 전체화면 상태 추적 변수
let isFullscreenActive = false;
let fullscreenActivationInProgress = false;
let lastFullscreenAttempt = 0;
let lastFullscreenCheck = 0;
const FULLSCREEN_COOLDOWN = 1000; // 1초 쿨다운

// 게임 상태 변수
let gameStarted = false;

// 전체화면 상태 확인 함수
function checkFullscreenState() {
    return !!(document.fullscreenElement || 
              document.webkitFullscreenElement || 
              document.mozFullScreenElement || 
              document.msFullscreenElement);
}

// 전체화면 상태 업데이트 함수
function updateFullscreenState() {
    const wasFullscreen = isFullscreenActive;
    isFullscreenActive = checkFullscreenState();
    
    if (wasFullscreen && !isFullscreenActive) {
        console.log('전체화면 모드가 종료되었습니다.');
        fullscreenActivationInProgress = false;
        // 전체화면 종료 시 쿨다운도 초기화
        lastFullscreenAttempt = 0;
    }
    
    return isFullscreenActive;
}

// 모바일 전체화면 모드 활성화 (개선된 버전)
function enableFullscreen() {
    if (!isMobile) return;
    
    const currentTime = Date.now();
    
    // 쿨다운 체크
    if (currentTime - lastFullscreenAttempt < FULLSCREEN_COOLDOWN) {
        console.log('전체화면 활성화 쿨다운 중...');
        return;
    }
    
    // 이미 활성화 중이면 중복 실행 방지
    if (fullscreenActivationInProgress) {
        console.log('전체화면 활성화가 이미 진행 중입니다.');
        return;
    }
    
    // 이미 전체화면 상태인지 확인
    if (checkFullscreenState()) {
        console.log('이미 전체화면 모드입니다.');
        isFullscreenActive = true;
        return;
    }
    
    console.log('모바일 전체화면 모드 활성화 시도');
    fullscreenActivationInProgress = true;
    lastFullscreenAttempt = currentTime;
    
    // 게임 렌더링을 방해하지 않도록 비동기로 처리
    requestAnimationFrame(() => {
        try {
    
    // iOS Safari 전체화면 모드
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
            .then(() => {
                console.log('전체화면 모드 활성화 성공');
                isFullscreenActive = true;
                fullscreenActivationInProgress = false;
            })
            .catch(err => {
                console.log('전체화면 모드 실패:', err);
                fullscreenActivationInProgress = false;
            });
    }
    
    // iOS Safari에서 주소창 숨김 및 전체화면 스타일 적용
    if (window.navigator.standalone) {
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.left = '0';
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }
    
    // Android Chrome 전체화면 모드
    if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen()
            .then(() => {
                console.log('webkit 전체화면 모드 활성화 성공');
                isFullscreenActive = true;
                fullscreenActivationInProgress = false;
            })
            .catch(err => {
                console.log('webkit 전체화면 모드 실패:', err);
                fullscreenActivationInProgress = false;
            });
    }
    
    // Firefox 전체화면 모드
    if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen()
            .then(() => {
                console.log('moz 전체화면 모드 활성화 성공');
                isFullscreenActive = true;
                fullscreenActivationInProgress = false;
            })
            .catch(err => {
                console.log('moz 전체화면 모드 실패:', err);
                fullscreenActivationInProgress = false;
            });
    }
    
    // MS Edge 전체화면 모드
    if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen()
            .then(() => {
                console.log('ms 전체화면 모드 활성화 성공');
                isFullscreenActive = true;
                fullscreenActivationInProgress = false;
            })
            .catch(err => {
                console.log('ms 전체화면 모드 실패:', err);
                fullscreenActivationInProgress = false;
            });
    }
    
    // 화면 방향 고정 (세로 모드)
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait').catch(err => {
            console.log('화면 방향 고정 실패:', err);
        });
    }
    
    // iOS Safari에서 주소창 숨김을 위한 추가 스타일
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.left = '0';
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // iOS Safari에서 주소창 숨김을 위한 메타 태그 동적 추가
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui');
        }
    }
    
    // Android Chrome에서 전체화면 스타일 적용
    if (/Android/.test(navigator.userAgent)) {
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.left = '0';
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }
    
    // 전체화면 상태 확인을 위한 타이머 설정
    setTimeout(() => {
        updateFullscreenState();
    }, 500);
    
    // 전체화면 변경 이벤트 리스너 추가
    document.addEventListener('fullscreenchange', () => {
        console.log('fullscreenchange 이벤트 발생');
        updateFullscreenState();
    });
    
    document.addEventListener('webkitfullscreenchange', () => {
        console.log('webkitfullscreenchange 이벤트 발생');
        updateFullscreenState();
    });
    
    document.addEventListener('mozfullscreenchange', () => {
        console.log('mozfullscreenchange 이벤트 발생');
        updateFullscreenState();
    });
    
    document.addEventListener('MSFullscreenChange', () => {
        console.log('MSFullscreenChange 이벤트 발생');
        updateFullscreenState();
    });
        } catch (error) {
            console.error('전체화면 활성화 중 오류:', error);
            fullscreenActivationInProgress = false;
        }
    });
}

// 전체화면 재활성화 함수 (게임 시작/재시작 시 호출)
function reactivateFullscreen() {
    if (!isMobile) return;
    
    console.log('전체화면 재활성화 시도');
    
    // 현재 전체화면 상태를 강제로 다시 확인
    const currentFullscreenState = checkFullscreenState();
    isFullscreenActive = currentFullscreenState;
    
    console.log('현재 전체화면 상태:', isFullscreenActive);
    
    // 전체화면이 비활성화되어 있고, 활성화가 진행 중이 아니면 재활성화
    if (!isFullscreenActive && !fullscreenActivationInProgress) {
        console.log('전체화면 모드 재활성화 중...');
        // 쿨다운 초기화하여 즉시 재시도 가능하도록 함
        lastFullscreenAttempt = 0;
        
        setTimeout(() => {
            enableFullscreen();
        }, 300); // 200ms에서 300ms로 증가
    } else if (isFullscreenActive) {
        console.log('이미 전체화면 모드가 활성화되어 있습니다.');
    } else {
        console.log('전체화면 활성화가 이미 진행 중입니다.');
    }
}

// 터치 위치 이동 관련 변수 (향후 확장을 위해 유지)
let touchStartX = 0;
let touchStartY = 0;

// 모바일 연속 발사 관련 변수
let mobileFireStartTime = 0;
let isMobileFirePressed = false;
let mobileContinuousFireInterval = null;

// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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

// 화면에 모바일 컨트롤 상태 표시
function showMobileControlStatus() {
    // 모바일 컨트롤 상태 표시 제거 (게임 상황 안내와 겹침 방지)
    // if (isMobile) {
    //     ctx.fillStyle = 'white';
    //     ctx.font = '14px Arial';
    //     ctx.fillText('모바일 모드', 10, 70);
    //     
    //     // 각 버튼의 존재 여부 표시
    //     const buttons = ['btnFire', 'btnSpecial', 'btnPause', 'btnReset', 'btnUp', 'btnDown', 'btnLeft', 'btnRight'];
    //     buttons.forEach((btn, index) => {
    //         const element = mobileControls[btn];
    //         const status = element ? '✓' : '✗';
    //         ctx.fillText(`${btn}: ${status}`, 10, 90 + index * 15);
    //     });
    // }
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
    
    // 시작/재시작 버튼 터치 이벤트 (개선된 버전)
    mobileControls.btnFire.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('시작/재시작 버튼 터치');
        
        // 시작 화면에서 버튼을 누르면 게임 시작
        if (isStartScreen) {
            isStartScreen = false;
            gameStarted = true;
            console.log('모바일에서 게임 시작');
            // 모바일에서 게임 시작 시 전체화면 모드 활성화
            if (isMobile) {
                setTimeout(() => {
                    reactivateFullscreen();
                }, 200);
            }
        }
        
        // 게임 오버 상태에서 재시작
        if (isGameOver) {
            restartGame();
            // 모바일에서 게임 재시작 시 전체화면 모드 활성화
            if (isMobile) {
                setTimeout(() => {
                    reactivateFullscreen();
                }, 200);
            }
            return;
        }
    }, { passive: false });
    
    mobileControls.btnFire.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('시작/재시작 버튼 터치 종료');
    }, { passive: false });
    
    // 클릭 이벤트도 추가 (데스크탑용, 개선된 버전)
    mobileControls.btnFire.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('시작/재시작 버튼 클릭');
        
        if (isStartScreen) {
            isStartScreen = false;
            gameStarted = true;
            console.log('모바일에서 게임 시작');
            // 모바일에서 게임 시작 시 전체화면 모드 활성화
            if (isMobile) {
                setTimeout(() => {
                    reactivateFullscreen();
                }, 200);
            }
        }
        
        // 게임 오버 상태에서 재시작
        if (isGameOver) {
            restartGame();
            // 모바일에서 게임 재시작 시 전체화면 모드 활성화
            if (isMobile) {
                setTimeout(() => {
                    reactivateFullscreen();
                }, 200);
            }
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
        
        // 직접 일시정지 상태 토글
        isPaused = !isPaused;
        
        // 일시정지 시 모바일 연속 발사 중지
        if (isPaused) {
            isMobileFirePressed = false;
            isContinuousFire = false;
            console.log('게임 일시정지됨');
        } else {
            console.log('게임 재개됨');
        }
    }, { passive: false });
    
    // 일시정지 버튼 클릭 이벤트 추가
    mobileControls.btnPause.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('일시정지 버튼 클릭');
        
        // 직접 일시정지 상태 토글
        isPaused = !isPaused;
        
        // 일시정지 시 모바일 연속 발사 중지
        if (isPaused) {
            isMobileFirePressed = false;
            isContinuousFire = false;
            console.log('게임 일시정지됨');
        } else {
            console.log('게임 재개됨');
        }
    });
    
    mobileControls.btnReset.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('재시작 버튼 터치');
        if (isGameOver) {
            restartGame();
        } else {
            showResetConfirmModal((result) => {
                if (result) resetAllHighScores();
            });
        }
    }, { passive: false });
    
    // 클릭 이벤트도 추가
    mobileControls.btnReset.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('재시작 버튼 클릭');
        if (isGameOver) {
            restartGame();
        } else {
            showResetConfirmModal((result) => {
                if (result) resetAllHighScores();
            });
        }
    });
    
    // 마우스 이벤트도 추가 (데스크탑에서 테스트용)
    mobileControls.btnUp.addEventListener('mousedown', () => keys.ArrowUp = true);
    mobileControls.btnUp.addEventListener('mouseup', () => keys.ArrowUp = false);
    mobileControls.btnDown.addEventListener('mousedown', () => keys.ArrowDown = true);
    mobileControls.btnDown.addEventListener('mouseup', () => keys.ArrowDown = false);
    mobileControls.btnLeft.addEventListener('mousedown', () => keys.ArrowLeft = true);
    mobileControls.btnLeft.addEventListener('mouseup', () => keys.ArrowLeft = false);
    mobileControls.btnRight.addEventListener('mousedown', () => keys.ArrowRight = true);
    mobileControls.btnRight.addEventListener('mouseup', () => keys.ArrowRight = false);
    mobileControls.btnFire.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('시작/재시작 버튼 마우스 다운');
        
        // 시작 화면에서 버튼을 누르면 게임 시작
        if (isStartScreen) {
            isStartScreen = false;
            gameStarted = true;
            console.log('모바일에서 게임 시작');
            // 모바일에서 게임 시작 시 전체화면 모드 활성화
            if (isMobile) {
                setTimeout(() => {
                    reactivateFullscreen();
                }, 100);
            }
        }
        
                    // 게임 오버 상태에서 재시작
            if (isGameOver) {
                restartGame();
                // 모바일에서 게임 재시작 시 전체화면 모드 활성화
                if (isMobile) {
                    setTimeout(() => {
                        reactivateFullscreen();
                    }, 200);
                }
                return;
            }
    });
    
    mobileControls.btnFire.addEventListener('mouseup', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('시작/재시작 버튼 마우스 업');
    });
    mobileControls.btnSpecial.addEventListener('mousedown', () => keys.KeyB = true);
    mobileControls.btnSpecial.addEventListener('mouseup', () => keys.KeyB = false);
    mobileControls.btnPause.addEventListener('mousedown', () => {
        console.log('일시정지 버튼 마우스 다운');
        
        // 직접 일시정지 상태 토글
        isPaused = !isPaused;
        
        // 일시정지 시 모바일 연속 발사 중지
        if (isPaused) {
            isMobileFirePressed = false;
            isContinuousFire = false;
            console.log('게임 일시정지됨');
        } else {
            console.log('게임 재개됨');
        }
    });
}

// 캔버스 크기 설정
function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    if (container) {
        // 컨테이너 스타일 조정
        container.style.height = 'calc(100vh - 70px)';  // 모바일 컨트롤 높이만큼 제외
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        
        // 캔버스 스타일 조정
        canvas.style.borderRadius = '0';  // 모서리를 각지게
        
        // 캔버스 크기를 모바일 비율에 맞게 설정 (일관성 유지)
        canvas.width = 392;  // 모바일 비율에 맞춘 가로 크기
        canvas.height = 700;  // 모바일 비율에 맞춘 세로 크기
        
        // CSS에서 설정한 크기와 일치하도록 스타일 설정
        canvas.style.width = '392px';
        canvas.style.height = '700px';
    }
}

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener('resize', resizeCanvas);

// 초기 캔버스 크기 설정
resizeCanvas();

// 모바일 컨트롤 설정
setupMobileControls();

// 터치 위치 이동 이벤트 설정
if (isMobile) {
    setupTouchPositionControls();
}

// 전체화면 상태 변화 감지 이벤트 리스너
if (isMobile) {
    // 전체화면 상태 변화 감지
    document.addEventListener('fullscreenchange', updateFullscreenState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenState);
    document.addEventListener('mozfullscreenchange', updateFullscreenState);
    document.addEventListener('MSFullscreenChange', updateFullscreenState);
    
    // 페이지 가시성 변화 감지 (사용자가 다른 탭으로 이동했다가 돌아올 때)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(() => {
                updateFullscreenState();
            }, 100);
        }
    });
}

// 이미지 로딩 후 게임 초기화
loadAllImages().then(() => {
    console.log('게임 초기화 시작');
    initializeGame();
    startGameLoop();
});

// 오디오 요소 가져오기
const shootSound = new Audio();
const explosionSound = new Audio();
const collisionSound = new Audio();
const levelUpSound = new Audio();  // 레벨업 효과음 추가

// 사운드 파일 경로 설정
if (window.electronAPI) {
    window.electronAPI.getSoundPath('shoot.mp3').then(path => {
        shootSound.src = path;
    });
    window.electronAPI.getSoundPath('explosion.mp3').then(path => {
        explosionSound.src = path;
    });
    window.electronAPI.getSoundPath('collision.mp3').then(path => {
        collisionSound.src = path;
    });
    window.electronAPI.getSoundPath('levelup.mp3').then(path => {
        levelUpSound.src = path;
    });
} else {
    shootSound.src = 'sounds/shoot.mp3';
    explosionSound.src = 'sounds/explosion.mp3';
    collisionSound.src = 'sounds/collision.mp3';
    levelUpSound.src = 'sounds/levelup.mp3';
}

// 사운드 설정
shootSound.volume = 0.1;  // 발사음 볼륨
explosionSound.volume = 0.1;  // 폭발음 볼륨
collisionSound.volume = 0.1;  // 충돌음 볼륨
levelUpSound.volume = 0.1;  // 레벨업 효과음 볼륨

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
    x: canvas.width / 2 - (240 * 0.7 * 0.7 * 0.8) / 2, // 중앙 정렬
    y: canvas.height - 100, // 모바일 컨트롤 영역을 고려하여 더 위로 배치 (120에서 100으로 조정)
    width: 240 * 0.7 * 0.7 * 0.8,   // 폭을 80%로 줄임
    height: 71.5,   // 높이를 110%로 늘림
    speed: 3 * mobileSpeedMultiplier  // 속도를 2에서 3으로 증가
};

// 두 번째 비행기
const secondPlane = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 100, // 모바일 컨트롤 영역을 고려하여 더 위로 배치 (120에서 100으로 조정)
    width: 40,
    height: 40,
    speed: 3 * mobileSpeedMultiplier  // 속도를 2에서 3으로 증가
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
let scoreForSpread = 0;   // 확산탄을 위한 점수
let hasSecondPlane = false;  // 두 번째 비행기 보유 여부
let secondPlaneTimer = 0;    // 두 번째 비행기 타이머
let isPaused = false;     // 일시정지 상태
let collisionCount = 0;   // 충돌 횟수
let isGameOver = false;   // 게임 오버 상태
let flashTimer = 0;       // 깜박임 효과 타이머
let flashDuration = 500;  // 깜박임 지속 시간
let gameOverStartTime = null;  // 게임 오버 시작 시간
let isSnakePatternActive = false;  // 뱀 패턴 활성화 상태
let snakePatternTimer = 0;  // 뱀 패턴 타이머
let snakePatternDuration = 10000;  // 뱀 패턴 지속 시간 (10초)
let snakeEnemies = [];  // 뱀 패턴의 적군 배열
let snakePatternInterval = 0;  // 뱀 패턴 생성 간격
let snakeGroups = [];  // 뱀 패턴 그룹 배열
let lastSnakeGroupTime = 0;  // 마지막 뱀 그룹 생성 시간
let bossActive = false;
let bossHealth = 0;
let bossPattern = 0;
let specialWeaponCharged = false;
let specialWeaponCharge = 0;
let enemySpawnRate = 2000;  // 적 생성 주기 (ms)
let enemySpeed = 2 * mobileSpeedMultiplier;  // 적 이동 속도

// 보스 패턴 상수 추가
const BOSS_PATTERNS = {
    CIRCLE_SHOT: 'circle_shot',
    CROSS_SHOT: 'cross_shot',
    SPIRAL_SHOT: 'spiral_shot',
    WAVE_SHOT: 'wave_shot'
};

// 키보드 입력 상태
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false,
    KeyB: false,  // 특수 무기 발사 키를 V에서 B로 변경
    F5: false,
    KeyP: false,
    Enter: false  // Enter 키 추가
};

// 난이도 설정
const difficultySettings = {
    1: {
        enemySpeed: 1,  // 적 속도를 2에서 1로 줄임
        enemySpawnRate: 0.3,
        maxEnemies: 5,
        enemyHealth: 1,
        patternChance: 0.3,
        fireInterval: 3000,    // 6000에서 3000으로 감소
        bombDropChance: 0.2,   // 폭탄 발사 확률
        bulletSpeed: 4,        // 총알 속도를 3에서 4로 증가
        specialPatternChance: 0.1  // 특수 패턴 확률
    },
    2: {
        enemySpeed: 1.5,  // 적 속도를 2.5에서 1.5로 줄임
        enemySpawnRate: 0.4,
        maxEnemies: 6,
        enemyHealth: 2,
        patternChance: 0.4,
        fireInterval: 2500,    // 5000에서 2500으로 감소
        bombDropChance: 0.3,
        bulletSpeed: 5,  // 총알 속도를 4에서 5로 증가
        specialPatternChance: 0.2
    },
    3: {
        enemySpeed: 2,  // 적 속도를 3에서 2로 줄임
        enemySpawnRate: 0.5,
        maxEnemies: 7,
        enemyHealth: 3,
        patternChance: 0.5,
        fireInterval: 2000,    // 4000에서 2000으로 감소
        bombDropChance: 0.4,
        bulletSpeed: 6,  // 총알 속도를 5에서 6으로 증가
        specialPatternChance: 0.3
    },
    4: {
        enemySpeed: 2.5,  // 적 속도를 3.5에서 2.5로 줄임
        enemySpawnRate: 0.6,
        maxEnemies: 8,
        enemyHealth: 4,
        patternChance: 0.6,
        fireInterval: 1500,    // 3000에서 1500으로 감소
        bombDropChance: 0.5,
        bulletSpeed: 7,  // 총알 속도를 6에서 7로 증가
        specialPatternChance: 0.4
    },
    5: {
        enemySpeed: 3,  // 적 속도를 4에서 3으로 줄임
        enemySpawnRate: 0.7,
        maxEnemies: 8,
        enemyHealth: 5,
        patternChance: 0.7,
        fireInterval: 1200,    // 2500에서 1200으로 감소
        bombDropChance: 0.6,
        bulletSpeed: 8,  // 총알 속도를 7에서 8로 증가
        specialPatternChance: 0.5
    }
};

// IndexedDB 설정
const dbName = 'SpaceShooterGameDB_v1';
const dbVersion = 1;
const storeName = 'highScores';

// 최고 점수 로드 함수
async function loadHighScore() {
    try {
        console.log('점수 로드 시작...');
        let maxScore = 0;
        
        // localStorage에서 점수 로드 (가장 먼저)
        try {
            const localStorageScore = parseInt(localStorage.getItem('ThunderboltHighScore')) || 0;
            const backupScore = parseInt(localStorage.getItem('ThunderboltHighScore_backup')) || 0;
            maxScore = Math.max(maxScore, localStorageScore, backupScore);
            console.log('localStorage 점수:', { localStorageScore, backupScore });
        } catch (e) {
            console.warn('localStorage 점수 로드 실패:', e);
        }
        
        // sessionStorage에서 점수 로드
        try {
            const sessionScore = parseInt(sessionStorage.getItem('ThunderboltCurrentHighScore')) || 0;
            maxScore = Math.max(maxScore, sessionScore);
            console.log('sessionStorage 점수:', sessionScore);
        } catch (e) {
            console.warn('sessionStorage 점수 로드 실패:', e);
        }
        
        console.log('최종 선택된 점수:', maxScore);
        return maxScore;
    } catch (error) {
        console.error('점수 로드 중 오류:', error);
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
                    localStorage.setItem('ThunderboltHighScore', score.toString());
                    localStorage.setItem('ThunderboltHighScore_backup', score.toString());
                    localStorage.setItem('ThunderboltHighScore_timestamp', Date.now().toString());
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
                    localStorage.setItem('ThunderboltHighScore', score.toString());
                    localStorage.setItem('ThunderboltHighScore_backup', score.toString());
                    localStorage.setItem('ThunderboltHighScore_timestamp', Date.now().toString());
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
            localStorage.setItem('ThunderboltHighScore', score.toString());
            localStorage.setItem('ThunderboltHighScore_backup', score.toString());
            localStorage.setItem('ThunderboltHighScore_timestamp', Date.now().toString());
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
                    const localScore = parseInt(localStorage.getItem('ThunderboltHighScore')) || 0;
                    const backupScore = parseInt(localStorage.getItem('ThunderboltHighScore_backup')) || 0;
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
                    const localScore = parseInt(localStorage.getItem('ThunderboltHighScore')) || 0;
                    const backupScore = parseInt(localStorage.getItem('ThunderboltHighScore_backup')) || 0;
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
            const localScore = parseInt(localStorage.getItem('ThunderboltHighScore')) || 0;
            const backupScore = parseInt(localStorage.getItem('ThunderboltHighScore_backup')) || 0;
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
        const currentStored = parseInt(localStorage.getItem('ThunderboltHighScore')) || 0;
        console.log('현재 저장된 점수:', currentStored, '새 점수:', newScore);
        
        // 새 점수가 더 높은 경우에만 저장
        if (newScore > currentStored) {
            // localStorage에 저장 (가장 먼저)
            try {
                localStorage.setItem('ThunderboltHighScore', newScore.toString());
                localStorage.setItem('ThunderboltHighScore_backup', newScore.toString());
                localStorage.setItem('ThunderboltHighScore_timestamp', Date.now().toString());
                console.log('localStorage 저장 성공');
            } catch (e) {
                console.warn('localStorage 저장 실패:', e);
            }
            
            // sessionStorage에 저장
            try {
                sessionStorage.setItem('ThunderboltCurrentHighScore', newScore.toString());
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
            // 점수 초기화는 리셋 버튼을 통해서만 수행
            score = 0;
            levelScore = 0;
            scoreForSpread = 0;
            
            // 저장된 최고점수 로드
            const savedHighScore = await this.getHighScore();
            highScore = savedHighScore;
            
            console.log('초기화 완료 - 현재 최고점수:', highScore);
        } catch (error) {
            console.error('ScoreManager 초기화 실패:', error);
        }
    },

    async save() {
        try {
            if (score > highScore) {
                highScore = score;
                // Electron 환경인 경우 IPC를 통해 저장
                if (window.electron) {
                    const saved = await window.electron.ipcRenderer.invoke('save-score', highScore);
                    if (saved) {
                        console.log('Electron IPC를 통한 점수 저장 성공:', highScore);
                    }
                }
                // localStorage에도 저장
                await saveHighScoreDirectly(highScore, 'ScoreManager.save');
            }
        } catch (error) {
            console.error('점수 저장 실패:', error);
        }
    },

    async getHighScore() {
        try {
            // Electron 환경인 경우 IPC를 통해 로드
            if (window.electron) {
                const electronScore = await window.electron.ipcRenderer.invoke('load-score');
                if (electronScore > 0) {
                    return electronScore;
                }
            }
            // 브라우저 환경이거나 Electron에서 점수를 가져오지 못한 경우
            return await loadHighScore();
        } catch (error) {
            console.error('최고 점수 로드 실패:', error);
            return 0;
        }
    },

    async reset() {
        try {
            // Electron 환경인 경우 IPC를 통해 초기화
            if (window.electron) {
                await window.electron.ipcRenderer.invoke('reset-score');
            }
            
            // localStorage 초기화
            localStorage.removeItem('ThunderboltHighScore');
            localStorage.removeItem('ThunderboltHighScore_backup');
            localStorage.removeItem('ThunderboltHighScore_timestamp');
            sessionStorage.removeItem('ThunderboltCurrentHighScore');
            
            score = 0;
            levelScore = 0;
            scoreForSpread = 0;
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
                localStorage.setItem('ThunderboltHighScore', finalScore.toString());
                localStorage.setItem('ThunderboltHighScore_backup', finalScore.toString());
                localStorage.setItem('ThunderboltHighScore_timestamp', Date.now().toString());
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
                localStorage.setItem('ThunderboltHighScore', finalScore.toString());
                localStorage.setItem('ThunderboltHighScore_backup', finalScore.toString());
                localStorage.setItem('ThunderboltHighScore_timestamp', Date.now().toString());
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
    
    try {
        // 종료 이벤트 핸들러 설정
        setupExitHandlers();
        
        // 저장된 최고점수 로드
        const savedHighScore = await loadHighScore();
        highScore = savedHighScore;
        console.log('저장된 최고점수 로드:', highScore);
        
        // 게임 상태 초기화
        score = 0;
        levelScore = 0;
        scoreForSpread = 0;
        gameStarted = false;
        isStartScreen = true;
        
        // 모든 투사체 및 폭발물 완전 초기화
        bullets = [];
        enemies = [];
        explosions = [];
        bombs = [];
        dynamites = [];
        helicopterBullets = [];
        enemyBullets = [];
        collisionEffects = [];
        
        collisionCount = 0;
        maxLives = 5;  // 최대 목숨 초기화
        isGameOver = false;
        isPaused = false;
        flashTimer = 0;
        gameOverStartTime = null;
        isSnakePatternActive = false;
        snakeEnemies = [];
        snakePatternTimer = 0;
        snakePatternInterval = 0;
        snakeGroups = [];
        lastSnakeGroupTime = 0;
        
        // 보스 관련 상태 초기화
        bossActive = false;
        bossHealth = 0;
        bossDestroyed = false;
        lastBossSpawnTime = Date.now();
        
        // 플레이어 초기 위치 설정
        player.x = canvas.width / 2 - (240 * 0.7 * 0.7 * 0.8) / 2;
        player.y = canvas.height - 100; // 모바일 컨트롤 영역을 고려하여 더 위로 배치 (120에서 100으로 조정)
        secondPlane.x = canvas.width / 2 - 60;
        secondPlane.y = canvas.height - 100; // 모바일 컨트롤 영역을 고려하여 더 위로 배치
        
        // 적 생성 타이머 초기화 - 즉시 적들이 생성되도록
        lastEnemySpawnTime = 0;
        lastHelicopterSpawnTime = 0;
        
        // 파워업 상태 초기화
        hasSpreadShot = false;
        hasShield = false;
        damageMultiplier = 1;
        fireRateMultiplier = 1;
        
        // 발사 관련 상태 초기화
        lastFireTime = 0;
        isSpacePressed = false;
        spacePressTime = 0;
        isContinuousFire = false;
        canFire = true;
        lastReleaseTime = 0;
        
        console.log('게임 상태 초기화 완료');
        
        // 시작 화면 초기화
        initStartScreen();
        
        // 게임 루프 시작
        startGameLoop();
        console.log('게임 루프 시작됨');
    } catch (error) {
        console.error('게임 초기화 중 오류:', error);
    }
}

// 게임 재시작 함수 수정
function restartGame() {
    console.log('게임 재시작 - 재시작 전 최고 점수:', highScore);
    
    // 현재 최고 점수 저장
    const currentHighScore = Math.max(score, highScore);
    if (currentHighScore > 0) {
        saveHighScoreDirectly(currentHighScore, 'restartGame');
    }
    
    // 게임 상태 초기화
    collisionCount = 0;
    maxLives = 5;  // 최대 목숨 초기화
    isGameOver = false;
    hasSecondPlane = false;
    
    // 모든 투사체 및 폭발물 완전 초기화
    enemies = [];
    bullets = [];
    explosions = [];
    bombs = [];
    dynamites = [];
    helicopterBullets = [];
    enemyBullets = [];
    collisionEffects = [];
    
    // 플레이어 위치 초기화
    player.x = canvas.width / 2 - (240 * 0.7 * 0.7 * 0.8) / 2;
            player.y = canvas.height - 100; // 모바일 컨트롤 영역을 고려하여 더 위로 배치
    secondPlane.x = canvas.width / 2 - 60;
    secondPlane.y = canvas.height - 120; // 모바일 컨트롤 영역을 고려하여 더 위로 배치
    gameOverStartTime = null;
    
    // 현재 점수만 초기화 (최고 점수는 유지)
    score = 0;
    levelScore = 0;
    scoreForSpread = 0;
    gameLevel = 1;
    
    // 특수무기 관련 상태 초기화
    specialWeaponCharged = false;
    specialWeaponCharge = 0;
    
    // 보스 관련 상태 초기화
    bossActive = false;
    bossHealth = 0;
    bossDestroyed = false;
    lastBossSpawnTime = Date.now();
    
    // 시작 화면으로 돌아가지 않고 바로 게임 시작
    isStartScreen = false;
    
    // 적 생성 타이머 초기화 - 즉시 적들이 생성되도록
    lastEnemySpawnTime = 0;
    lastHelicopterSpawnTime = 0;
    
    // 뱀 패턴 관련 초기화
    isSnakePatternActive = false;
    snakeEnemies = [];
    snakePatternTimer = 0;
    snakePatternInterval = 0;
    snakeGroups = [];
    lastSnakeGroupTime = 0;
    
    // 파워업 상태 초기화
    hasSpreadShot = false;
    hasShield = false;
    damageMultiplier = 1;
    fireRateMultiplier = 1;
    
    // 발사 관련 상태 초기화
    lastFireTime = 0;
    isSpacePressed = false;
    spacePressTime = 0;
    isContinuousFire = false;
    canFire = true;
    lastReleaseTime = 0;
    
    // 모바일 연속 발사 상태 초기화
    isMobileFirePressed = false;
    isContinuousFire = false;
    
    console.log('게임 재시작 완료 - 현재 최고 점수:', highScore);
}

// 적 생성 함수 수정 - 화면 상단에서 등장하도록 개선
function createEnemy() {
    const currentDifficulty = difficultySettings[gameLevel] || difficultySettings[1];
    
    // 헬리콥터 출현 비율을 레벨에 따라 조정
    const isHelicopter = Math.random() < (0.3 + (gameLevel * 0.05));
    
    if (!isBossActive && isHelicopter) {
        // 일반 헬리콥터와 helicopter2 중에서 선택
        const isHelicopter2 = Math.random() < 0.5;  // 50% 확률로 helicopter2 생성
        
        if (isHelicopter2) {
            const enemy = {
                x: Math.random() * (canvas.width - 48),
                y: -48,  // 화면 상단에서 시작
                width: 48,
                height: 48,
                speed: currentDifficulty.enemySpeed,
                type: ENEMY_TYPES.HELICOPTER2,
                rotorAngle: 0,
                rotorSpeed: 0.2,
                hoverHeight: Math.random() * 200 + 100,
                hoverTimer: 0,
                hoverDirection: 1,
                canDropBomb: Math.random() < currentDifficulty.bombDropChance,
                lastBombDrop: 0,
                bombDropInterval: 3000,
                lastUpdateTime: Date.now(),
                canFire: true,
                lastFireTime: 0,
                fireInterval: currentDifficulty.fireInterval,
                bulletSpeed: currentDifficulty.bulletSpeed,
                health: currentDifficulty.enemyHealth,
                score: 100 * gameLevel,
                isElite: Math.random() < (0.05 + (gameLevel * 0.02)),
                specialAbility: Math.random() < (0.1 + (gameLevel * 0.03)) ? getRandomSpecialAbility() : null
            };

            // 엘리트 적 보너스
            if (enemy.isElite) {
                enemy.health *= (1.5 + (gameLevel * 0.2));
                enemy.speed *= 1.2;
                enemy.score *= 2;
                enemy.bulletSpeed *= 1.2;
                enemy.fireInterval *= 0.8;
            }

            enemies.push(enemy);
            console.log('helicopter2 생성됨:', enemy);
            return;
        } else {
            const helicopter = {
                x: Math.random() * (canvas.width - 48),
                y: -48,  // 화면 상단에서 시작
                width: 48,
                height: 48,
                speed: currentDifficulty.enemySpeed * 0.8,
                type: ENEMY_TYPES.HELICOPTER,
                rotorAngle: 0,
                rotorSpeed: 0.2,
                hoverHeight: Math.random() * 200 + 100,
                hoverTimer: 0,
                hoverDirection: 1,
                canDropBomb: Math.random() < currentDifficulty.bombDropChance,
                lastBombDrop: 0,
                bombDropInterval: 2000 + Math.random() * 3000,
                lastUpdateTime: Date.now(),
                bulletSpeed: currentDifficulty.bulletSpeed,
                health: currentDifficulty.enemyHealth,
                score: 150 * gameLevel,
                isElite: Math.random() < (0.05 + (gameLevel * 0.02)),
                specialAbility: Math.random() < (0.1 + (gameLevel * 0.03)) ? getRandomSpecialAbility() : null
            };

            // 엘리트 헬리콥터 보너스
            if (helicopter.isElite) {
                helicopter.health *= (1.5 + (gameLevel * 0.2));
                helicopter.speed *= 1.2;
                helicopter.score *= 2;
                helicopter.bulletSpeed *= 1.2;
                helicopter.bombDropInterval *= 0.8;
            }

            enemies.push(helicopter);
            return;
        }
    }

    // 일반 비행기 생성
    const patterns = Object.values(ENEMY_PATTERNS);
    const enemyType = Math.random() < currentDifficulty.patternChance ? 
        patterns[Math.floor(Math.random() * patterns.length)] : ENEMY_PATTERNS.NORMAL;
    
    const spawnX = Math.random() * (canvas.width - 72);  // 크기가 1.5배로 커졌으므로 여백도 1.5배로
    const spawnY = -72;  // 화면 상단에서 시작
    
    const enemy = {
        x: spawnX,
        y: spawnY,  // 화면 상단에서 시작
        width: 72,  // 48 * 1.5 = 72
        height: 72, // 48 * 1.5 = 72
        speed: currentDifficulty.enemySpeed,
        pattern: enemyType,
        angle: 0,
        movePhase: 0,
        type: ENEMY_TYPES.PLANE,
        lastUpdateTime: Date.now(),
        canFire: true,
        lastFireTime: 0,
        fireInterval: currentDifficulty.fireInterval,
        entryDelay: 1000 + Math.random() * 2000,
        canDropBomb: Math.random() < currentDifficulty.bombDropChance,
        lastBombDrop: 0,
        bombDropInterval: 3000,
        bombCount: 3,
        bulletCount: 3,
        bulletSpeed: currentDifficulty.bulletSpeed,
        chaoticTimer: 0,
        bounceHeight: Math.random() * 100 + 50,
        bounceSpeed: Math.random() * 0.05 + 0.02,
        bounceDirection: Math.random() < 0.5 ? 1 : -1,
        health: currentDifficulty.enemyHealth,
        score: 100 * gameLevel,
        isElite: Math.random() < (0.05 + (gameLevel * 0.02)),
        specialAbility: Math.random() < (0.1 + (gameLevel * 0.03)) ? getRandomSpecialAbility() : null
    };

    // 엘리트 적 보너스
    if (enemy.isElite) {
        enemy.health *= (1.5 + (gameLevel * 0.2));
        enemy.speed *= 1.2;
        enemy.score *= 2;
        enemy.bulletSpeed *= 1.2;
        enemy.fireInterval *= 0.8;
    }

    enemies.push(enemy);
    console.log('일반 비행기 생성됨:', enemy);
}

// 특수 능력 랜덤 선택 함수
function getRandomSpecialAbility() {
    const baseChance = 0.1;  // 기본 확률
    const levelBonus = (gameLevel - 1) * 0.05;  // 레벨당 5% 증가
    const totalChance = Math.min(0.5, baseChance + levelBonus);  // 최대 50%까지
    
    if (Math.random() < totalChance) {
        const abilities = ['bomb', 'dynamite', 'helicopter', 'drone'];
        return abilities[Math.floor(Math.random() * abilities.length)];
    }
    return null;
}

// 적 비행기 총알 배열 추가
let enemyBullets = [];

// 적 비행기 총알 발사 및 이동 처리 함수 추가
function handleEnemyBullets() {
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        ctx.fillStyle = 'yellow';  // 빨간색에서 노란색으로 변경
        ctx.fillRect(bullet.x - bullet.width/2, bullet.y - bullet.height/2, bullet.width, bullet.height);
        // 플레이어와 충돌 체크
        if (checkCollision(bullet, player) || (hasSecondPlane && checkCollision(bullet, secondPlane))) {
            handleCollision();
            explosions.push(new Explosion(bullet.x, bullet.y, false));
            // 폭발음
            safePlay(explosionSound);
            return false;
        }
        // 플레이어 총알과의 충돌 체크 (충돌 이펙트/음으로 변경)
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (checkCollision(bullet, bullets[i])) {
                // 충돌 이펙트: 크기와 지속시간 증가
                collisionEffects.push({ 
                    x: bullet.x, 
                    y: bullet.y, 
                    radius: 30,  // 3배 증가
                    life: 30,    // 3배 증가
                    pulse: 0     // 펄스 효과를 위한 변수 추가
                });
                // 충돌음
                safePlay(collisionSound);
                bullets.splice(i, 1);
                return false;
            }
        }
        return bullet.y < canvas.height;
    });
}

// 적 비행기에서 총알 발사 로직 수정
function handleEnemyPlaneBullets() {
    const currentTime = Date.now();
    enemies.forEach(enemy => {
        if (enemy.type === ENEMY_TYPES.PLANE) {
            // 비행기가 화면에 진입한 후 일정 시간이 지나면 발사 가능하도록 설정
            if (!enemy.canFire && enemy.y >= 0) {
                enemy.entryStartTime = currentTime;
                enemy.canFire = true;
            }

            // 진입 후 지정된 시간이 지났고, 발사 간격이 지났을 때만 발사
            if (enemy.canFire && 
                currentTime - enemy.entryStartTime >= enemy.entryDelay && 
                currentTime - enemy.lastFireTime >= enemy.fireInterval) {
                
                // 특수 능력에 따른 발사 패턴
                if (enemy.specialAbility) {
                    switch(enemy.specialAbility) {
                        case 'rapidFire':
                            // 빠른 발사: 3발 연속 발사
                            for (let i = 0; i < 3; i++) {
                                setTimeout(() => {
                                    fireEnemyBullet(enemy);
                                }, i * 200);
                            }
                            break;
                            
                        case 'tripleShot':
                            // 삼중 발사: 3방향으로 동시 발사
                            const angles = [-Math.PI/6, 0, Math.PI/6];
                            angles.forEach(angle => {
                                const bullet = {
                                    x: enemy.x + enemy.width/2,
                                    y: enemy.y + enemy.height,
                                    width: 8,
                                    height: 18,
                                    speed: enemy.bulletSpeed,
                                    angle: angle
                                };
                                enemyBullets.push(bullet);
                            });
                            break;
                            
                        case 'homingShot':
                            // 유도 발사: 플레이어 방향으로 발사
                            const px = player.x + player.width/2;
                            const py = player.y + player.height/2;
                            const ex = enemy.x + enemy.width/2;
                            const ey = enemy.y + enemy.height;
                            const angle = Math.atan2(py - ey, px - ex);
                            const bullet = {
                                x: ex,
                                y: ey,
                                width: 8,
                                height: 18,
                                speed: enemy.bulletSpeed,
                                angle: angle,
                                isHoming: true
                            };
                            enemyBullets.push(bullet);
                            break;
                            
                        default:
                            // 기본 발사
                            fireEnemyBullet(enemy);
                    }
                } else {
                    // 일반 발사
                    fireEnemyBullet(enemy);
                }
                
                enemy.lastFireTime = currentTime;
            }
        }
    });
}

// 적 비행기 총알 발사 함수
function fireEnemyBullet(enemy) {
    // 랜덤으로 총알 또는 폭탄 발사 결정
    if (Math.random() < 0.7) {  // 70% 확률로 총알 발사
        const leftX = enemy.x + enemy.width * 0.18;
        const rightX = enemy.x + enemy.width * 0.82;
        const bulletY = enemy.y + enemy.height;
        enemyBullets.push({
            x: leftX,
            y: bulletY,
            width: 8,
            height: 18,
            speed: enemy.bulletSpeed
        });
        enemyBullets.push({
            x: rightX,
            y: bulletY,
            width: 8,
            height: 18,
            speed: enemy.bulletSpeed
        });
    } else {  // 30% 확률로 폭탄 발사
        for (let i = 0; i < enemy.bombCount; i++) {
            createBomb(enemy);
        }
    }
}

// 미사일 궤적 그리기 함수
function drawMissileTrail(missile) {
    // 위쪽(0 라디안)으로 향하도록
    drawTaurusMissile(ctx, missile.x, missile.y, missile.width, missile.height, 0);
}

// 적 비행기 미사일 처리 함수
function handleEnemyMissiles() {
    enemies.forEach(enemy => {
        if (enemy.type === ENEMY_TYPES.PLANE && enemy.missiles) {
            const currentTime = Date.now();

            // 10초 간격으로 1발씩, 최대 2발만 발사
            if (
                enemy.canFire &&
                currentTime - enemy.lastFireTime >= enemy.fireInterval &&
                enemy.missileCount > 0 &&
                enemy.missiles.length < 2 // 동시에 2발까지만
            ) {
                createEnemyMissile(enemy);
                enemy.lastFireTime = currentTime;
                enemy.missileCount--;
            }

            // 미사일 위치 업데이트 및 처리
            enemy.missiles = enemy.missiles.filter(missile => {
                // 상단 효과 무시 영역 체크
                if (missile.y < TOP_EFFECT_ZONE) {
                    return true; // 미사일은 계속 이동하되 효과는 발생하지 않음
                }
                
                // 미사일이 비행기와 함께 움직이도록 위치 업데이트
                missile.x = enemy.x + enemy.width / 2 - 15 + (missile.offsetX || 0);
                missile.y += missile.speed;

                // 미사일 그리기
                drawTaurusMissile(ctx, missile.x, missile.y, missile.width, missile.height, Math.PI);
                drawMissileTrail(missile);

                // 플레이어와의 충돌 체크
                if (checkCollision(missile, player)) {
                    handleCollision();
                    return false;
                }

                // 플레이어 총알과의 충돌 체크
                for (let i = bullets.length - 1; i >= 0; i--) {
                    if (checkCollision(missile, bullets[i])) {
                        // 총알 충돌과 동일한 작은 폭발 효과
                        explosions.push(new Explosion(
                            missile.x + missile.width / 2,
                            missile.y + missile.height / 2,
                            false
                        ));
                        
                        // 발사음으로 변경
                        safePlay(shootSound);
                        bullets.splice(i, 1);
                        return false; // 미사일 제거
                    }
                }

                // 화면 밖으로 나간 미사일 제거
                return missile.y < canvas.height;
            });
        }
    });
}

// 적 위치 업데이트 함수 수정
function updateEnemyPosition(enemy, options = {}) {
    if (!enemy) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - enemy.lastUpdateTime;
    enemy.lastUpdateTime = currentTime;

    // 헬리콥터 처리
    if (enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) {
        // 헬리콥터 특수 움직임
        enemy.rotorAngle += enemy.rotorSpeed;
        
        // 호버링 효과 개선
        enemy.hoverTimer += deltaTime;
        const hoverOffset = Math.sin(enemy.hoverTimer * 0.002) * 30; // 진폭 증가
        
        // 좌우 움직임 개선
        const horizontalSpeed = Math.sin(enemy.hoverTimer * 0.001) * 3; // 속도 증가
        enemy.x += horizontalSpeed;
        
        // 상하 움직임 개선
        if (enemy.y < enemy.hoverHeight) {
            enemy.y += enemy.speed * 1.2; // 상승 속도 증가
        } else {
            // 호버링 중 고도 변화
            const verticalSpeed = Math.cos(enemy.hoverTimer * 0.001) * 2;
            enemy.y = enemy.hoverHeight + hoverOffset + verticalSpeed;
        }
        
        // 급격한 방향 전환 추가
        if (Math.random() < 0.005) { // 0.5% 확률로 급격한 방향 전환
            enemy.hoverDirection *= -1;
            enemy.hoverHeight = Math.random() * 200 + 100;
        }
        
        // 폭탄 투하 체크
        if (enemy.canDropBomb && currentTime - enemy.lastBombDrop >= enemy.bombDropInterval) {
            createBomb(enemy);
            enemy.lastBombDrop = currentTime;
        }
        
        // 헬리콥터 총알 발사
        if (!enemy.fireCooldown) enemy.fireCooldown = 2500 + Math.random()*1000;
        if (!enemy.lastFireTime) enemy.lastFireTime = 0;
        if (!options.helicopterFiredThisFrame && currentTime - enemy.lastFireTime > enemy.fireCooldown) {
            // 플레이어 방향 각도 계산
            const px = player.x + player.width/2;
            const py = player.y + player.height/2;
            const ex = enemy.x + enemy.width/2;
            const ey = enemy.y + enemy.height/2;
            const angle = Math.atan2(py - ey, px - ex);
            helicopterBullets.push({
                x: ex,
                y: ey,
                angle: angle,
                speed: 7,
                width: 36,
                height: 8,
                isBossBullet: enemy.isBoss
            });
            enemy.lastFireTime = currentTime;
            enemy.fireCooldown = 2500 + Math.random()*1000;
            if (options) options.helicopterFiredThisFrame = true;
        }
    } else if (enemy.type === ENEMY_TYPES.PLANE) {
        // 일반 비행기 처리
        const baseSpeed = enemy.speed || 2;
        
        // 패턴에 따른 이동
        switch(enemy.pattern) {
            case ENEMY_PATTERNS.ZIGZAG:
                // 지그재그 패턴 개선
                const zigzagSpeed = Math.sin(enemy.y * 0.05) * enemy.speed * 2.5; // 진폭 증가
                enemy.x += zigzagSpeed;
                enemy.y += baseSpeed * (1 + Math.sin(enemy.y * 0.02) * 0.3); // 속도 변화 추가
                break;
                
            case ENEMY_PATTERNS.CIRCLE:
                if (!enemy.circleAngle) enemy.circleAngle = 0;
                if (!enemy.circleCenterX) enemy.circleCenterX = enemy.x;
                if (!enemy.circleCenterY) enemy.circleCenterY = enemy.y;
                if (!enemy.circleRadius) enemy.circleRadius = 50;
                
                // 원형 패턴 개선
                enemy.circleAngle += 0.06; // 회전 속도 증가
                const radiusVariation = Math.sin(enemy.circleAngle * 2) * 10; // 반지름 변화
                enemy.x = enemy.circleCenterX + Math.cos(enemy.circleAngle) * (enemy.circleRadius + radiusVariation);
                enemy.y = enemy.circleCenterY + Math.sin(enemy.circleAngle) * (enemy.circleRadius + radiusVariation) + baseSpeed;
                break;
                
            case ENEMY_PATTERNS.DIAGONAL:
                if (!enemy.isDiving) {
                    if (!enemy.diagonalDirection) enemy.diagonalDirection = Math.random() < 0.5 ? 1 : -1;
                    enemy.x += enemy.diagonalDirection * enemy.speed * 1.2; // 대각선 이동 속도 증가
                    enemy.y += baseSpeed * 0.6;
                    if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
                        enemy.isDiving = true;
                        enemy.originalY = enemy.y;
                    }
                } else {
                    if (!enemy.diveSpeed) enemy.diveSpeed = baseSpeed * 2.5; // 급강하 속도 증가
                    enemy.y += enemy.diveSpeed;
                    if (enemy.y >= enemy.originalY + 250) { // 급강하 거리 증가
                        enemy.isDiving = false;
                        enemy.diagonalDirection *= -1;
                    }
                }
                break;
                
            default: // NORMAL 패턴
                // 기본 이동에 약간의 변화 추가
                enemy.x += Math.sin(enemy.y * 0.02) * 1.5;
                enemy.y += baseSpeed * (1 + Math.sin(enemy.y * 0.01) * 0.2);
                break;
        }
        
        // 급격한 방향 전환 추가 (모든 패턴에 적용)
        if (Math.random() < 0.003) { // 0.3% 확률로 급격한 방향 전환
            enemy.speed *= (Math.random() < 0.5 ? 1.5 : 0.7); // 속도 변화
            if (enemy.pattern === ENEMY_PATTERNS.NORMAL) {
                enemy.pattern = Object.values(ENEMY_PATTERNS)[Math.floor(Math.random() * Object.values(ENEMY_PATTERNS).length)];
            }
        }

        // 미사일 발사 체크
        if (enemy.canFire && currentTime - enemy.lastFireTime > enemy.fireInterval) {
            fireEnemyBullet(enemy);
            enemy.lastFireTime = currentTime;
        }

        // 폭탄 투하 체크
        if (enemy.canDropBomb && currentTime - enemy.lastBombDrop > enemy.bombDropInterval) {
            createBomb(enemy);
            enemy.lastBombDrop = currentTime;
        }
    }
}

// 패턴 타입 상수 수정
const PATTERN_TYPES = {
    SNAKE: 'snake',      // S자 움직임
    VERTICAL: 'vertical', // 세로 움직임
    DIAGONAL: 'diagonal', // 대각선 움직임
    HORIZONTAL: 'horizontal', // 가로 움직임
    SPIRAL: 'spiral'     // 나선형 움직임 추가
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
        speed: 2,
        amplitude: Math.random() * 100 + 150,
        frequency: Math.random() * 0.5 + 0.75,
        spiralRadius: 50,
        spiralAngle: 0,
        initialEnemiesCreated: false
    };
    
    // 첫 번째 적 생성
    const firstEnemy = {
        x: newGroup.startX,
        y: newGroup.startY,
        width: 30,
        height: 30,
        speed: newGroup.speed,
        type: 'dynamite', // 'snake'에서 'dynamite'로 변경
        targetX: newGroup.startX,
        targetY: newGroup.startY,
        angle: 0,
        isHit: false,
        amplitude: newGroup.amplitude,
        frequency: newGroup.frequency,
        lastChange: Date.now()
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
    // 상단 효과 무시 영역 체크
    const isInTopZone = rect1.y < TOP_EFFECT_ZONE || rect2.y < TOP_EFFECT_ZONE;
    
    return !isInTopZone && 
           rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 충돌 처리 함수 수정
function handleCollision() {
    // 상단 효과 무시 영역 체크
    if (player.y < TOP_EFFECT_ZONE) {
        return;
    }
    
    safePlay(explosionSound);
    try {
        if (hasShield) {
            hasShield = false;
            return;
        }
        
        const currentTime = Date.now();
        collisionCount++;
        flashTimer = flashDuration;
        
        if (currentTime - lastCollisionTime >= collisionSoundCooldown) {
            safePlay(collisionSound);
            lastCollisionTime = currentTime;
        }
        
        // 목숨이 모두 소진되었을 때만 게임 오버
        if (collisionCount >= maxLives) {
            handleGameOver();
        }
    } catch (error) {
        console.error('충돌 처리 중 오류 발생:', error);
    }
}

// 폭발 효과 클래스
class Explosion {
    constructor(x, y, isFinal = false, customMaxRadius = null) {
        this.x = x;
        this.y = y;
        this.radius = 1;
        this.maxRadius = customMaxRadius !== null
            ? customMaxRadius
            : (isFinal ? 100 : 30); // 일반 폭발의 최대 반경을 30으로 제한
        this.speed = isFinal ? 1 : 2; // 일반 폭발의 속도를 증가
        this.particles = [];
        this.isFinal = isFinal;
        this.isFinished = false;
        
        // 구름 모양 폭발 효과를 위한 설정
        if (isFinal && customMaxRadius === null) {
            this.cloudParticles = [];
            this.maxRadius = 30; // 폭발 범위를 반으로 줄임 (60 → 30)
            this.cloudRadius = 0;
            this.cloudSpeed = 2;
            
            // 구름 파티클 생성 (불규칙한 구름 모양)
            for (let i = 0; i < 25; i++) {
                this.cloudParticles.push({
                    x: this.x,
                    y: this.y,
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 3 + 1,
                    size: Math.random() * 8 + 4,
                    life: 1,
                    alpha: Math.random() * 0.5 + 0.3,
                    color: Math.random() < 0.4 ? '#FF8C00' : Math.random() < 0.7 ? '#FFA500' : '#FF7F50' // 주황색 계통
                });
            }
        }
    }

    update() {
        if (this.isFinished) return false;
        
        this.radius += this.speed;
        
        if (this.isFinal) {
            // 구름 모양 폭발 업데이트
            this.cloudRadius += this.cloudSpeed;
            
            // 구름 파티클 업데이트
            for (let particle of this.cloudParticles) {
                // 불규칙한 움직임으로 구름 모양 생성
                particle.x += Math.cos(particle.angle) * particle.speed * 0.5;
                particle.y += Math.sin(particle.angle) * particle.speed * 0.5;
                
                // 파티클이 중심에서 멀어질수록 크기와 투명도 조정
                const distance = Math.sqrt((particle.x - this.x) ** 2 + (particle.y - this.y) ** 2);
                if (distance > this.cloudRadius) {
                    particle.life -= 0.03;
                    particle.size *= 0.98;
                }
                
                // 약간의 랜덤 움직임 추가
                particle.angle += (Math.random() - 0.5) * 0.1;
            }
            
            // 구름이 최대 반경에 도달하거나 파티클이 모두 사라지면 종료
            this.isFinished = this.cloudRadius >= this.maxRadius || 
                             !this.cloudParticles.some(p => p.life > 0.1);
            return !this.isFinished;
        }
        
        // 일반 폭발은 최대 반경에 도달하면 종료
        if (this.radius >= this.maxRadius) {
            this.isFinished = true;
            return false;
        }
        
        return true;
    }

    draw() {
        if (this.isFinished) return;
        
        if (this.isFinal) {
            // 구름 모양 폭발 효과
            for (let particle of this.cloudParticles) {
                if (particle.life > 0.1) {
                    // 구름 파티클 그리기 (부드러운 원형)
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    
                    // 그라데이션으로 구름 느낌 생성
                    const gradient = ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, particle.size
                    );
                    gradient.addColorStop(0, `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`);
                    gradient.addColorStop(0.7, `${particle.color}${Math.floor(particle.alpha * 0.5 * 255).toString(16).padStart(2, '0')}`);
                    gradient.addColorStop(1, `${particle.color}00`);
                    
                    ctx.fillStyle = gradient;
                    ctx.fill();
                    
                    // 구름 가장자리 부드럽게
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size * 1.2, 0, Math.PI * 2);
                    ctx.fillStyle = `${particle.color}20`;
                    ctx.fill();
                }
            }
        } else {
            // 일반 폭발 효과
            const alpha = 1 - (this.radius / this.maxRadius);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 50, 0, ${alpha})`;
            ctx.fill();
        }
    }
}

// 비행기 그리기 함수
function drawAirplane(x, y, width, height, color, isEnemy = false) {
    ctx.save();
    if (!isEnemy) {
        // 플레이어: 준비된 이미지를 그대로 그림
        ctx.drawImage(playerImage, x, y, width, height);
    } else {
        // 적: 이미지 사용
        ctx.translate(x + width/2, y + height/2);
        ctx.scale(1, -1); // 아래로 향하도록 뒤집기
        ctx.drawImage(enemyPlaneImage, -width/2, -height/2, width, height);
    }
    ctx.restore();
}

// 게임 루프 수정
function gameLoop() {
    if (!gameLoopRunning) {
        console.log('게임 루프가 실행되지 않음: gameLoopRunning =', gameLoopRunning);
        return;
    }
    
    // 모바일에서 전체화면 상태 주기적 확인 (5초마다)
    if (isMobile && !isStartScreen) {
        const currentTime = Date.now();
        if (!lastFullscreenCheck || currentTime - lastFullscreenCheck > 5000) {
            updateFullscreenState();
            lastFullscreenCheck = currentTime;
        }
    }
    
    if (isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (isStartScreen) {
        console.log('시작 화면 렌더링 중...');
        try {
            // 시작 화면에서는 검정색 배경을 그리지 않고 drawStartScreen에서 처리
            drawStartScreen();
        } catch (error) {
            console.error('시작 화면 그리기 중 오류:', error);
            // 오류 발생 시 기본 시작 화면 표시
            ctx.fillStyle = '#000033';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Thunderbolt Shooter', canvas.width/2, canvas.height/2);
            ctx.font = 'bold 20px Arial';
            ctx.fillText('시작/재시작 버튼을 눌러 시작', canvas.width/2, canvas.height/2 + 50);
        }
        // 모바일에서만 프레임 제한 적용
        if (isMobile) {
            setTimeout(() => {
                requestAnimationFrame(gameLoop);
            }, MOBILE_FRAME_INTERVAL);
        } else {
            requestAnimationFrame(gameLoop);
        }
        return;
    }

    // 게임 진행 중일 때만 검정색 배경 그리기
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isGameOver) {
        try {
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
                    ctx.font = 'bold 45px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 80);
                    
                    ctx.font = 'bold 20px Arial';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(`최종 점수: ${score}`, canvas.width/2, canvas.height/2 - 20);
                    ctx.fillText(`충돌 횟수: ${collisionCount}`, canvas.width/2, canvas.height/2 + 20);
                    ctx.font = 'bold 20px Arial';
                    ctx.fillStyle = '#ffff00';                    
                    ctx.fillText('시작/재시작 버튼 누른 후 터치하여 재시작', canvas.width/2, canvas.height/2 + 60);
                }
            }
        } catch (error) {
            console.error('게임 오버 화면 처리 중 오류:', error);
            // 오류 발생 시 기본 게임 오버 화면 표시
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 64px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
            ctx.font = 'bold 32px Arial';
            ctx.fillText(`최종 점수: ${score}`, canvas.width/2, canvas.height/2 + 60);
            ctx.fillText('스페이스바를 눌러 재시작', canvas.width/2, canvas.height/2 + 160);
        }
        // 모바일에서만 프레임 제한 적용
        if (isMobile) {
            setTimeout(() => {
                requestAnimationFrame(gameLoop);
            }, MOBILE_FRAME_INTERVAL);
        } else {
            requestAnimationFrame(gameLoop);
        }
        return;
    }

    try {
        // 깜박임 효과 처리
        if (flashTimer > 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            flashTimer -= 16;
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
        if (!bossActive) {
            const timeSinceLastBoss = currentTime - lastBossSpawnTime;
            if (timeSinceLastBoss >= BOSS_SETTINGS.SPAWN_INTERVAL) {
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
                bossDestroyed = false;
            }
        }

        // 총알 이동 및 충돌 체크
        handleBullets();

        // 확산탄 처리
        handleSpreadShot();

        // 두 번째 비행기 처리
        handleSecondPlane();

        // 레벨업 체크
        checkLevelUp();

        // 폭발 효과 업데이트 및 그리기
        handleExplosions();

        // 충돌 효과 업데이트 및 그리기
        handleCollisionEffects();

        // 폭탄 처리 추가
        handleBombs();

        // 다이나마이트 처리 추가
        handleDynamites();

        // UI 그리기
        drawUI();
        
        // 모바일 컨트롤 상태 표시
        showMobileControlStatus();

        // 모바일에서만 프레임 제한 적용
        if (isMobile) {
            setTimeout(() => {
                requestAnimationFrame(gameLoop);
            }, MOBILE_FRAME_INTERVAL);
        } else {
            requestAnimationFrame(gameLoop);
        }
    } catch (error) {
        console.error('게임 루프 실행 중 오류:', error);
        // 오류 발생 시 게임 오버 처리
        handleGameOver();
    }
}

// 플레이어 이동 처리 함수
function handlePlayerMovement() {
    const margin = 10; 
    
    // 모바일에서는 하단 컨트롤 영역을 고려하여 제한 (처음 위치와 동일하게 확장)
    const maxY = isMobile ? canvas.height - 100 : canvas.height - player.height - margin;
    
    // 비행기 중심을 기준으로 좌우 이동 제한 설정
    // 비행기 일부가 화면 밖으로 나갈 수 있도록 허용
    if (keys.ArrowLeft && player.x > -player.width / 2.5) {
        player.x -= player.speed * 1.2; // 좌우 이동 속도를 0.5에서 1.2로 증가
        if (hasSecondPlane) {
            secondPlane.x -= player.speed * 1.2;
        }
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width / 2) {
        player.x += player.speed * 1.2; // 좌우 이동 속도를 0.5에서 1.2로 증가
        if (hasSecondPlane) {
            secondPlane.x += player.speed * 1.2;
        }
    }
    if (keys.ArrowUp && player.y > margin) {
        player.y -= player.speed;
        if (hasSecondPlane) {
            secondPlane.y -= player.speed;
        }
    }
    if (keys.ArrowDown && player.y < maxY) {
        player.y += player.speed;
        if (hasSecondPlane) {
            secondPlane.y += player.speed;
        }
    }
}

// 적 처리 함수 수정 - 적 생성 로직 개선
function handleEnemies() {
    const currentTime = Date.now();
    const currentDifficulty = difficultySettings[gameLevel];
    const bossExists = enemies.some(enemy => enemy.type === 'helicopter' && enemy.isBoss);
    
    // 보스 생성 조건 추가
    if (score >= 2000 * gameLevel && !isBossActive && !bossExists) {
        createBoss();
        isBossActive = true;
    }
    
    if (bossExists) {
        isBossActive = true;
    } else if (isBossActive) {
        lastHelicopterSpawnTime = currentTime;
        isBossActive = false;
    }
    
    if (isSnakePatternActive) {
        handleSnakePattern();
    }
    
    // 적 생성 로직 개선 - 게임 시작 시 즉시 적들이 생성되도록
    if (currentTime - lastEnemySpawnTime >= MIN_ENEMY_SPAWN_INTERVAL &&
        Math.random() < currentDifficulty.enemySpawnRate * 0.3 && // 생성 확률을 30%로 더 줄임
        enemies.length < currentDifficulty.maxEnemies &&
        !isGameOver) {
        createEnemy();
        lastEnemySpawnTime = currentTime;
        console.log('새로운 적 생성됨');
    }
    
    // 헬리콥터 생성 로직 개선 - 게임 시작 시 즉시 생성되도록
    if (!isBossActive && currentTime - lastHelicopterSpawnTime >= MIN_HELICOPTER_SPAWN_INTERVAL) {
        if (Math.random() < 0.01) { // 1% 확률로 헬리콥터 생성
            const helicopter = createHelicopter();
            if (helicopter) {
                enemies.push(helicopter);
                lastHelicopterSpawnTime = currentTime;
            }
        }
    }
    
    let helicopterFiredThisFrame = false;
    enemies = enemies.filter(enemy => {
        updateEnemyPosition(enemy, {helicopterFiredThisFrame});
        drawEnemy(enemy);
        return checkEnemyCollisions(enemy);
    });
    handleEnemyPlaneBullets();
    handleEnemyBullets();
    handleHelicopterBullets();
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
            if (currentTime - group.patternInterval >= 300 && group.enemies.length < 10) {
                group.patternInterval = currentTime;
                const lastEnemy = group.enemies[group.enemies.length - 1];
                const newEnemy = {
                    x: lastEnemy.x,
                    y: lastEnemy.y,
                    width: 30,
                    height: 30,
                    speed: group.speed,
                    type: 'dynamite', // 'snake'에서 'dynamite'로 변경
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
                // 첫 번째 적의 이동 패턴
                switch(group.patternType) {
                    case PATTERN_TYPES.SNAKE:
                        enemy.angle += 0.03;
                        const baseX = group.startX;
                        const waveX = Math.sin(enemy.angle * group.frequency) * group.amplitude;
                        enemy.x = baseX + waveX;
                        enemy.y += enemy.speed;
                        break;
                        
                    case PATTERN_TYPES.VERTICAL:
                        enemy.y += enemy.speed;
                        enemy.x = group.startX + Math.sin(enemy.angle) * 30;
                        enemy.angle += 0.02;
                        break;
                        
                    case PATTERN_TYPES.DIAGONAL:
                        enemy.x += enemy.speed * group.direction;
                        enemy.y += enemy.speed;
                        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
                            group.direction *= -1;
                            enemy.y += 20;
                        }
                        break;
                        
                    case PATTERN_TYPES.HORIZONTAL:
                        enemy.x += enemy.speed * group.direction;
                        enemy.y = group.startY + Math.sin(enemy.angle) * 40;
                        enemy.angle += 0.02;
                        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
                            group.direction *= -1;
                            group.startY += 30;
                        }
                        break;
                        
                    case PATTERN_TYPES.SPIRAL:
                        group.spiralAngle += 0.05;
                        group.spiralRadius += 0.5;
                        enemy.x = group.startX + Math.cos(group.spiralAngle) * group.spiralRadius;
                        enemy.y = group.startY + Math.sin(group.spiralAngle) * group.spiralRadius;
                        break;
                }
            } else {
                const prevEnemy = group.enemies[index - 1];
                const dx = prevEnemy.x - enemy.x;
                const dy = prevEnemy.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const targetDistance = 35;
                if (distance > targetDistance) {
                    const moveX = (dx / distance) * (distance - targetDistance);
                    const moveY = (dy / distance) * (distance - targetDistance);
                    enemy.x += moveX;
                    enemy.y += moveY;
                }
            }
            
            if (!enemy.isHit) {
                drawEnemy(enemy);
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
                        updateScore(100);
                        safePlay(shootSound);
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

    // 총알과 충돌 체크
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
                enemy.health = Math.max(0, enemy.health - 100);
                bossHealth = enemy.health;
                
                // 보스 피격음 재생
                safePlay(collisionSound);
                // 추가: 플레이어 총알이 보스에 명중 시 발사음도 재생
                safePlay(shootSound);
                
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
                    
                    // 보스 파괴 시 충돌음 재생
                    safePlay(collisionSound);
                    
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
                updateScore(10);
                // 추가: 플레이어 총알이 적 비행기/헬기에 명중 시 발사음 재생
                safePlay(shootSound);
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
    
    // 발사키 상태 디버깅 (모바일에서는 숨김)
    if (keys.Space && !isMobile) {
        console.log('스페이스키가 눌려있음');
    }
    const currentFireDelay = isContinuousFire ? continuousFireDelay : fireDelay;
    const adjustedFireDelay = currentFireDelay / fireRateMultiplier;
    const currentBulletSize = calculateBulletSize();
    
    // 연속 발사 상태 체크
    if (isSpacePressed && currentTime - spacePressTime > minPressDuration) {
        isContinuousFire = true;
    }
    
    // 발사 조건 체크
    if (isSpacePressed && canFire) {
        // 단발 발사일 때는 더 엄격한 조건 체크
        if (!isContinuousFire) {
            // 마지막 발사 후 일정 시간이 지나지 않았으면 발사하지 않음
            if (currentTime - lastFireTime < singleShotCooldown) {
                return;
            }
            // 스페이스바를 누른 시간이 너무 짧거나 길면 발사하지 않음
            const pressDuration = currentTime - spacePressTime;
            if (pressDuration < 50 || pressDuration > 150) {
                return;
            }
            // 마지막 해제 후 일정 시간이 지나지 않았으면 발사하지 않음
            if (currentTime - lastReleaseTime < minReleaseDuration) {
                return;
            }
        }
        
        // 연속 발사일 때는 딜레이 체크
        if (isContinuousFire && currentTime - lastFireTime < adjustedFireDelay) {
            return;
        }
        
        lastFireTime = currentTime;
        canFire = false;  // 발사 후 즉시 발사 불가 상태로 변경
        
        if (hasSpreadShot) {
            // 확산탄 발사
            for (let i = -3; i <= 3; i++) {
                const angle = (i * 12) * (Math.PI / 180);
                const bullet = {
                    x: player.x + player.width/2, // 기본값에서
                    y: player.y,                  // 기본값에서
                    width: currentBulletSize,
                    height: currentBulletSize * 2,
                    speed: bulletSpeed,
                    angle: angle,
                    damage: 100 * damageMultiplier,
                    isBossBullet: false,
                    isSpecial: false
                };
                // 머리 끝 중앙에서 발사되도록 조정
                bullet.x = player.x + player.width/2;
                bullet.y = player.y;
                bullets.push(bullet);
            }
        } else {
            // 일반 총알 발사 (한 발씩)
            const bullet = {
                x: player.x + player.width/2, // 기본값에서
                y: player.y,                  // 기본값에서
                width: currentBulletSize,
                height: currentBulletSize * 2,
                speed: bulletSpeed,
                damage: 100 * damageMultiplier,
                isBossBullet: false,
                isSpecial: false
            };
            // 머리 끝 중앙에서 발사되도록 조정
            bullet.x = player.x + player.width/2;
            bullet.y = player.y;
            bullets.push(bullet);
        }
        
        // 두 번째 비행기 발사
        if (hasSecondPlane) {
            if (hasSpreadShot) {
                for (let i = -3; i <= 3; i++) {
                    const angle = (i * 12) * (Math.PI / 180);
                    const bullet = {
                        x: secondPlane.x + secondPlane.width/2,
                        y: secondPlane.y,
                        width: currentBulletSize,
                        height: currentBulletSize * 2,
                        speed: bulletSpeed,
                        angle: angle,
                        damage: 100 * damageMultiplier,
                        isBossBullet: false,
                        isSpecial: false
                    };
                    bullets.push(bullet);
                }
            } else {
                const bullet = {
                    x: secondPlane.x + secondPlane.width/2,
                    y: secondPlane.y,
                    width: currentBulletSize,
                    height: currentBulletSize * 2,
                    speed: bulletSpeed,
                    damage: 100 * damageMultiplier,
                    isBossBullet: false,
                    isSpecial: false
                };
                bullets.push(bullet);
            }
        }
        
        // 발사음 재생 (볼륨 조정)
        if (currentTime - lastFireTime >= 20) {
            safePlay(shootSound);
            // shootSound.volume = 0.4;  // 발사음 볼륨 설정 (이 줄 삭제)
        }
        
        // 일정 시간 후 다시 발사 가능하도록 설정
        setTimeout(() => {
            canFire = true;
        }, isContinuousFire ? 20 : 400);  // 연속 발사일 때는 빠르게, 단발일 때는 더 느리게
    }
}

// 특수 무기 처리 함수 수정
function handleSpecialWeapon() {
    if (specialWeaponCharged && keys.KeyB) {  // KeyN을 KeyB로 변경
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
        
        specialWeaponCharged = false;
        specialWeaponCharge = 0;
        
        // 특수 무기 발사 효과음 제거 (적기에 맞았을 때만 재생)
        // safePlay(shootSound);
        
        // V키 상태 초기화
        keys.KeyB = false;  // KeyN을 KeyB로 변경
    }
}

// 폭발 효과 업데이트 및 그리기
function handleExplosions() {
    explosions = explosions.filter(explosion => {
        // 상단 효과 무시 영역 체크
        if (explosion.y < TOP_EFFECT_ZONE) {
            return false; // 폭발 효과 제거
        }
        
        explosion.update();
        explosion.draw();
        return !explosion.isFinished;
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
    ctx.fillText(`점수: ${score}`, 20, 70);
    ctx.fillText(`레벨: ${gameLevel} (${getDifficultyName(gameLevel)})`, 20, 100);
    ctx.fillText(`다음 레벨까지: ${levelUpScore - levelScore}`, 20, 130);
    ctx.fillText(`최고 점수: ${highScore}`, 20, 160);
    ctx.fillText(`다음 확산탄까지: ${500 - scoreForSpread}점`, 20, 190);
    if (!hasSecondPlane) {
        const nextPlaneScore = Math.ceil(score / 2000) * 2000;  // 8000 * gameLevel에서 2000으로 변경
        ctx.fillText(`다음 추가 비행기까지: ${nextPlaneScore - score}점`, 20, 220);
    } else {
        const remainingTime = Math.ceil((10000 - (Date.now() - secondPlaneTimer)) / 1000);
        ctx.fillText(`추가 비행기 남은 시간: ${remainingTime}초`, 20, 220);
    }
    
    // 충돌 횟수 표시 (붉은색으로)
    ctx.fillStyle = 'red';
    ctx.font = 'bold 20px Arial';  // 폰트를 진하게 변경
    ctx.fillText(`남은 목숨: ${maxLives - collisionCount}`, 20, 250);

    // 제작자 정보 표시
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('제작/저작권자:Lee.SS.C', canvas.width - 20, canvas.height - 30); 

    // 특수 무기 게이지 표시
    if (!specialWeaponCharged) {
        // 게이지 바 배경
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(20, 280, 200, 20);
        
        // 게이지 바
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.fillRect(20, 280, (specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 200, 20);
        
        // 게이지 바 위에 텍스트 표시
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        const percentText = `특수 무기 : ${Math.floor((specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 100)}%`;
        ctx.fillText(percentText, 120, 295);
    } else {
        // 깜빡이는 효과를 위한 시간 계산
        const blinkSpeed = 500; // 깜빡임 속도 (밀리초)
        const currentTime = Date.now();
        const isRed = Math.floor(currentTime / blinkSpeed) % 2 === 0;
        
        // 배경색 설정 (게이지 바)
        ctx.fillStyle = isRed ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 255, 0.3)';
        ctx.fillRect(10, 260, 200, 20);
        
        // 테두리 효과
        ctx.strokeStyle = isRed ? 'red' : 'cyan';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 260, 200, 20);
        
        // 게이지 바 위에 텍스트 표시
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        const percentText = `특수 무기 : ${Math.floor((specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 100)}%`;
        ctx.fillText(percentText, 120, 275);
        
        // 준비 완료 메시지 배경
        ctx.fillStyle = isRed ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 255, 0.2)';
        ctx.fillRect(10, 280, 300, 30);
        
        // 텍스트 색상 설정
        ctx.fillStyle = isRed ? 'red' : 'cyan';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('특수 무기 준비 완료', 15, 300); 
    }
    
    // 보스 체력 표시 개선
    if (bossActive) {
        // 체력바 배경
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(canvas.width/2 - 100, 20, 200, 20);
        
        // 체력바
        const healthPercentage = bossHealth / BOSS_SETTINGS.HEALTH;
        let healthColor;
        if (healthPercentage > 0.7) healthColor = 'rgba(0, 255, 0, 0.8)';
        else if (healthPercentage > 0.3) healthColor = 'rgba(255, 255, 0, 0.8)';
        else healthColor = 'rgba(255, 0, 0, 0.8)';
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(canvas.width/2 - 100, 20, healthPercentage * 200, 20);
        
        // 체력 수치
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`보스 체력: ${Math.ceil(bossHealth)}/${BOSS_SETTINGS.HEALTH}`, canvas.width/2, 35);
        
        // 페이즈 표시
        const currentPhase = BOSS_SETTINGS.PHASE_THRESHOLDS.findIndex(
            threshold => bossHealth > threshold.health
        );
        if (currentPhase >= 0) {
            ctx.fillText(`페이즈 ${currentPhase + 1}`, canvas.width/2, 60);
        }
    }
    
    // 파워업 상태 표시
    if (hasSpreadShot) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('확산탄 활성화', 20, 350);
    }
    if (hasShield) {
        ctx.fillStyle = '#0000ff';
        ctx.fillText('실드 활성화', 20, 380);
    }
    if (damageMultiplier > 1) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText('데미지 2배', 20, 410);
    }
    if (fireRateMultiplier > 1) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillText('연사 속도 증가', 20, 440);
    }
    
    // 총알 크기 정보 표시
    const currentBulletSize = calculateBulletSize();
    if (currentBulletSize > baseBulletSize) {
        ctx.fillStyle = '#ffff00';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`총알 크기 증가: ${currentBulletSize}`, 20, 470);
    }
}

// 게임 시작 이벤트 리스너 수정
window.addEventListener('load', async () => {
    console.log('페이지 로드 완료');
    
    try {
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
    } catch (error) {
        console.error('게임 시작 중 오류:', error);
        // 오류 발생 시 localStorage에서 점수 로드 시도
        try {
            const localScore = parseInt(localStorage.getItem('ThunderboltHighScore')) || 0;
            const backupScore = parseInt(localStorage.getItem('ThunderboltHighScore_backup')) || 0;
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
    const names = ['초급', '중급', '고급', '전문가', '마스터'];
    return names[level - 1] || '마스터';
}

// 키 이벤트 리스너 수정
document.addEventListener('keydown', (e) => {
    if (e.code in keys) {
        keys[e.code] = true;
        
        // 시작 화면에서 스페이스바를 누르면 게임 시작
        if (isStartScreen && e.code === 'Space') {
            isStartScreen = false;
            // 모바일에서 게임 시작 시 전체화면 모드 활성화
            if (isMobile) {
                setTimeout(() => {
                    reactivateFullscreen();
                }, 100);
            }
            return;
        }
        
        // 게임 오버 화면에서 스페이스바를 누르면 게임 재시작
        if (isGameOver && e.code === 'Space') {
            restartGame();
            // 모바일에서 게임 재시작 시 전체화면 모드 활성화
            if (isMobile) {
                setTimeout(() => {
                    reactivateFullscreen();
                }, 100);
            }
            return;
        }
        
        // 스페이스바를 처음 누를 때
        if (e.code === 'Space' && !isSpacePressed) {
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
    
    // R 키를 눌렀을 때 최고 점수 리셋
    if (e.code === 'KeyR') {
        showResetConfirmModal((result) => {
            if (result) {
                resetAllHighScores();
                alert('최고 점수가 리셋되었습니다.');
                console.log('최고 점수 리셋');
            }
        });
    }
    
    // P 키를 눌렀을 때 게임 일시정지/재개 (keys 객체와 독립적으로 처리)
    if (e.code === 'KeyP') {
        isPaused = !isPaused;
        console.log('P키 눌림 - 일시정지 상태:', isPaused);
        
        // 일시정지 시 모바일 연속 발사 중지
        if (isPaused) {
            isMobileFirePressed = false;
            isContinuousFire = false;
        }
    }
});

document.addEventListener('keyup', (e) => {
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
    try {
        if (!isGameOver) {
            isGameOver = true;
            gameOverStartTime = Date.now();
            
            // 최고 점수 저장
            const finalScore = Math.max(score, highScore);
            if (finalScore > 0) {
                saveHighScoreDirectly(finalScore, 'handleGameOver');
            }
            
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
            
            console.log('게임 오버 - 최종 점수:', score, '최고 점수:', highScore);
            
            // 모바일 연속 발사 중지
            isMobileFirePressed = false;
            isContinuousFire = false;
        }
    } catch (error) {
        console.error('게임 오버 처리 중 오류 발생:', error);
    }
}

// 점수 증가 함수 수정
function updateScore(points) {
    score += points;
    scoreForSpread += points;
    levelScore += points;
    
    // 특수 무기 게이지 증가
    if (!specialWeaponCharged) {
        specialWeaponCharge += points;
        if (specialWeaponCharge >= SPECIAL_WEAPON_MAX_CHARGE) {
            specialWeaponCharged = true;
            specialWeaponCharge = SPECIAL_WEAPON_MAX_CHARGE;
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
    if (score >= 2000 && score % 2000 === 0 && !hasSecondPlane) {  // 10000에서 2000으로 변경
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

// 확산탄 처리 함수 추가
function handleSpreadShot() {
    if (scoreForSpread >= 500) {  // 2000에서 500으로 변경
        // 8발의 확산탄을 원형으로 발사
        for (let i = 0; i < 8; i++) {
            const angle = (i * 45) * (Math.PI / 180);
            const missile = {
                x: player.x + player.width/2,  // 비행기 중앙 X좌표
                y: player.y - player.height/2,  // 비행기 앞부분 Y좌표
                width: 10,
                height: 25,
                speed: 8,  // 속도를 14.4에서 8로 감소
                angle: angle,
                isSpread: true
            };
            bullets.push(missile);

            // 두 번째 비행기가 있으면 확산탄 발사
            if (hasSecondPlane) {
                const secondMissile = {
                    x: secondPlane.x + secondPlane.width/2,  // 두 번째 비행기 중앙 X좌표
                    y: secondPlane.y - secondPlane.height/2,  // 두 번째 비행기 앞부분 Y좌표
                    width: 10,
                    height: 25,
                    speed: 8,  // 속도를 14.4에서 8로 감소
                    angle: angle,
                    isSpread: true
                };
                bullets.push(secondMissile);
            }
        }
        // 확산탄 발사음도 제거 (적기에 맞았을 때만 재생)
        // safePlay(shootSound);
        scoreForSpread = 0;
    }
}

// 총알 이동 및 충돌 체크 함수 수정
function handleBullets() {
    bullets = bullets.filter(bullet => {
        // 상단 효과 무시 영역 체크
        if (bullet.y < TOP_EFFECT_ZONE) {
            return true; // 총알은 계속 이동하되 효과는 발생하지 않음
        }
        
        if (bullet.isBossBullet) {
            // 보스 총알 처리
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            
            // 회전 효과
            bullet.rotation += bullet.rotationSpeed;
            
            // 꼬리 효과 업데이트
            bullet.trail.unshift({x: bullet.x, y: bullet.y});
            if (bullet.trail.length > 5) bullet.trail.pop();
            
            // 총알 그리기
            ctx.save();
            ctx.translate(bullet.x, bullet.y);
            ctx.rotate(bullet.rotation);
            
            // 총알 본체
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bullet.width/2);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, bullet.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // 총알 꼬리
            bullet.trail.forEach((pos, index) => {
                const alpha = 1 - (index / bullet.trail.length);
                ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(pos.x - bullet.x, pos.y - bullet.y, 
                        bullet.width/2 * (1 - index/bullet.trail.length), 0, Math.PI * 2);
                ctx.fill();
            });
            
            // 총알 주변에 빛나는 효과
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bullet.width);
            glowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
            glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, bullet.width, 0, Math.PI * 2);
            ctx.fill();
            
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
            // 특수 무기 총알 처리
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
        } else if (bullet.isSpread) {
            // 확산탄 이동
            bullet.x += Math.sin(bullet.angle) * bullet.speed;
            bullet.y -= Math.cos(bullet.angle) * bullet.speed;
            ctx.fillStyle = '#00CED1'; // 청녹색으로 변경
            ctx.fillRect(bullet.x - bullet.width/2, bullet.y - bullet.height/2, bullet.width, bullet.height);
        } else {
            // 일반 총알 이동
            bullet.y -= bullet.speed;
            ctx.fillStyle = 'yellow';
            ctx.fillRect(bullet.x - bullet.width/2, bullet.y - bullet.height/2, bullet.width, bullet.height);
        }
        
        // 헬리콥터 총알과 충돌 체크
        for (let i = helicopterBullets.length - 1; i >= 0; i--) {
            const helicopterBullet = helicopterBullets[i];
            if (!helicopterBullet.isBossBullet && checkCollision(bullet, helicopterBullet)) {
                // 충돌 시 폭발 효과 추가
                explosions.push(new Explosion(helicopterBullet.x, helicopterBullet.y, false));
                // 충돌음 재생
                safePlay(collisionSound);
                // 헬리콥터 총알 제거
                helicopterBullets.splice(i, 1);
                // 플레이어 총알도 제거
                return false;
            }
        }
        
        // 폭탄과 총알 충돌 체크
        bombs = bombs.filter(bomb => {
            if (checkCollision(bullet, bomb)) {
                // 폭탄 폭발 (붉은색 파동 제거된 효과)
                explosions.push(new Explosion(bomb.x, bomb.y, true));
                // 충돌음 재생
                safePlay(collisionSound);
                return false;
            }
            return true;
        });

        // 다이나마이트와 총알 충돌 체크
        dynamites = dynamites.filter(dynamite => {
            if (checkCollision(bullet, dynamite)) {
                // 다이나마이트 폭발 (붉은색 파동 제거된 효과)
                explosions.push(new Explosion(dynamite.x, dynamite.y, true));
                // 충돌음 재생
                safePlay(collisionSound);
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
    HEALTH: 3000,        // 체력 3000으로 상향
    DAMAGE: 50,          // 보스 총알 데미지
    SPEED: 1,           // 보스 이동 속도를 2에서 1로 줄임
    BULLET_SPEED: 4,    // 보스 총알 속도를 3에서 4로 증가
    PATTERN_INTERVAL: 5000, // 5초(5000ms)로 단축
    SPAWN_INTERVAL: 10000,  // 보스 출현 간격 (10초로 단축)
    BONUS_SCORE: 500,    // 보스 처치 보너스 점수를 500으로 설정
    PHASE_THRESHOLDS: [  // 페이즈 전환 체력 임계값
        { health: 2250, speed: 1.5, bulletSpeed: 5 },  // 총알 속도 증가
        { health: 1500, speed: 2, bulletSpeed: 6 },    // 총알 속도 증가
        { health: 750, speed: 2.5, bulletSpeed: 7 }    // 총알 속도 증가
    ]
};

// 게임 상태 변수에 추가
let lastBossSpawnTime = Date.now();  // 마지막 보스 출현 시간을 현재 시간으로 초기화

// 보스 생성 함수 수정
function createBoss() {
    console.log('보스 헬리콥터 생성 함수 호출됨');
    
    // 이미 보스가 존재하는 경우
    if (bossActive) {
        console.log('보스가 이미 존재하여 생성하지 않음');
        return;
    }
    
    const currentTime = Date.now();
    const timeSinceLastBoss = currentTime - lastBossSpawnTime;
    
    // 시간 체크
    if (timeSinceLastBoss < BOSS_SETTINGS.SPAWN_INTERVAL) {
        console.log('보스 생성 시간이 되지 않음:', {
            timeSinceLastBoss,
            requiredInterval: BOSS_SETTINGS.SPAWN_INTERVAL,
            remainingTime: BOSS_SETTINGS.SPAWN_INTERVAL - timeSinceLastBoss
        });
        return;
    }
    
    console.log('보스 헬리콥터 생성 시작:', {
        currentTime,
        lastBossSpawnTime,
        timeSinceLastBoss
    });
    
    // 보스 상태 초기화
    bossActive = true;
    isBossActive = true; // 보스 활성화 상태 설정
    bossHealth = BOSS_SETTINGS.HEALTH;
    bossPattern = 0;
    bossTimer = currentTime;
    lastBossSpawnTime = currentTime;
    bossDestroyed = false;
    
    // 보스 헬리콥터 객체 생성
    const boss = {
        x: Math.random() * (canvas.width - 68),
        y: -68,  // 화면 상단에서 시작
        width: 68,
        height: 68,
        speed: BOSS_SETTINGS.SPEED,
        pattern: BOSS_PATTERNS.CIRCLE_SHOT,
        angle: 0,
        movePhase: 0,
        targetX: canvas.width / 2 - 34,
        targetY: 68,
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
        type: ENEMY_TYPES.HELICOPTER,
        rotorAngle: 0,
        rotorSpeed: 0.2,
        hoverHeight: 150,
        hoverTimer: 0,
        hoverDirection: 1,
        canDropBomb: true,
        lastBombDrop: 0,
        bombDropInterval: 3000
    };
    
    // 보스 추가
    enemies.push(boss);
    console.log('보스 헬리콥터 생성 완료:', boss);
}

// 보스 패턴 처리 함수 수정
function handleBossPattern(boss) {
    const currentTime = Date.now();
    
    // 보스 페이즈 체크 및 업데이트
    const currentPhase = BOSS_SETTINGS.PHASE_THRESHOLDS.findIndex(
        threshold => bossHealth > threshold.health
    );
    
    if (currentPhase !== boss.phase) {
        boss.phase = currentPhase;
        if (currentPhase >= 0) {
            const phaseSettings = BOSS_SETTINGS.PHASE_THRESHOLDS[currentPhase];
            boss.speed = phaseSettings.speed;
            boss.bulletSpeed = phaseSettings.bulletSpeed;
            
            // 페이즈 변경 시 화면에 메시지 표시
            ctx.fillStyle = 'red';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`보스 페이즈 ${currentPhase + 1}!`, canvas.width/2, canvas.height/2);
        }
    }
    
    // 로터 회전 업데이트
    boss.rotorAngle += boss.rotorSpeed;
    
    // 보스 이동 패턴
    if (boss.movePhase === 0) {
        // 초기 진입 - 비규칙적인 경로로 진입
        boss.y += boss.speed;
        boss.x += Math.sin(currentTime / 500) * 2;
        if (boss.y >= boss.hoverHeight) {
            boss.movePhase = 1;
            boss.timer = currentTime;
        }
    } else if (boss.movePhase === 1) {
        // 호버링 패턴
        const timeFactor = (currentTime - boss.timer) / 1000;
        
        // 기본 호버링 움직임
        boss.x += Math.sin(timeFactor) * boss.speed;
        boss.y = boss.hoverHeight + Math.sin(timeFactor * 0.5) * 20;
        
        // 랜덤한 오프셋 추가
        boss.x += Math.sin(timeFactor * boss.randomSpeed + boss.randomAngle) * boss.randomOffsetX * 0.01;
        boss.y += Math.cos(timeFactor * boss.randomSpeed + boss.randomAngle) * boss.randomOffsetY * 0.01;
        
        // 화면 경계 체크 및 반전
        if (boss.x < 0 || boss.x > canvas.width - boss.width) {
            boss.randomOffsetX *= -1;
        }
        if (boss.y < boss.hoverHeight - 50 || boss.y > boss.hoverHeight + 50) {
            boss.randomOffsetY *= -1;
        }
        
        // 폭탄 투하
        if (boss.canDropBomb && currentTime - boss.lastBombDrop >= boss.bombDropInterval) {
            boss.lastBombDrop = currentTime;
            createBomb(boss);
        }
        
        // 공격 패턴
        if (currentTime - boss.patternTimer >= BOSS_SETTINGS.PATTERN_INTERVAL) {
            boss.patternTimer = currentTime;
            
            // 플레이어 방향으로 발사하는 패턴 추가
            // if (Math.random() < 0.3) { // 30% 확률로 플레이어 추적 발사
            //     const targetX = player.x + player.width/2;
            //     const targetY = player.y + player.height/2;
            //     const angle = Math.atan2(targetY - (boss.y + boss.height/2), targetX - (boss.x + boss.width/2));
                
            //     // 3발의 총알을 약간 다른 각도로 발사
            //     for (let i = -1; i <= 1; i++) {
            //         const spreadAngle = angle + (i * 0.2); // 각 총알 사이에 0.2 라디안의 각도 차이
            //         createBossBullet(boss, spreadAngle);
            //     }
            // }
        }
    }
}

// 보스 총알 생성 함수 수정
function createBossBullet(boss, angle) {
    const bullet = {
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        width: 12,
        height: 12,
        speed: boss.bulletSpeed,
        angle: angle,
        isBossBullet: true,
        isSpread: true, // 확산탄으로 설정
        damage: BOSS_SETTINGS.DAMAGE,
        trail: [], // 총알 꼬리 효과를 위한 배열
        glow: 1, // 빛나는 효과를 위한 값
        rotation: 0, // 회전 효과를 위한 값
        rotationSpeed: 0.1 // 회전 속도
    };
    bullets.push(bullet);
}

// 레벨업 체크
function checkLevelUp() {
    if (levelScore >= levelUpScore && gameLevel < 5) {
        safePlay(levelUpSound);
        gameLevel++;
        levelScore = 0;
        levelUpScore = 800 * gameLevel; // 1000에서 800으로 감소
        
        // 레벨업 메시지 표시
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffff00';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${gameLevel}!`, canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText(`난이도: ${getDifficultyName(gameLevel)}`, canvas.width/2, canvas.height/2 + 40);
    }
}

// 적 공격 패턴 상수 추가
const ENEMY_PATTERNS = {
    NORMAL: 'normal',
    ZIGZAG: 'zigzag',
    CIRCLE: 'circle',
    DIAGONAL: 'diagonal',
    SPIRAL: 'spiral',
    WAVE: 'wave',
    CROSS: 'cross',
    V_SHAPE: 'v_shape',
    RANDOM: 'random',
    CHAOTIC: 'chaotic',  // 새로운 패턴 추가
    BOUNCE: 'bounce'     // 새로운 패턴 추가
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
            hasSpreadShot = true;
            setTimeout(() => hasSpreadShot = false, 10000);
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
let hasSpreadShot = false;
let hasShield = false;
let damageMultiplier = 1;
let fireRateMultiplier = 1;
let lastFireTime = 0;  // 마지막 발사 시간
let isSpacePressed = false;  // 스페이스바 누름 상태
let spacePressTime = 0;  // 스페이스바를 처음 누른 시간
let fireDelay = 600;  // 기본 발사 딜레이를 600에서 400으로 줄임
let continuousFireDelay = 50;  // 연속 발사 딜레이를 50에서 30으로 줄임
    let bulletSpeed = 7;  // 총알 속도를 5에서 7로 증가
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
        size = 7.5;  // 1.5배 증가
    } else if (score >= 5000) {
        size = 6.75;  // 1.5배 증가
    }
    
    // 난이도에 따른 크기 증가
    if (gameLevel >= 4) {
        size = Math.max(size, 7.5);  // 1.5배 증가
    } else if (gameLevel >= 3) {
        size = Math.max(size, 6.75);  // 1.5배 증가
    }
    
    return size;
}

// 게임 상태 변수에 추가
let lastEnemySpawnTime = 0;
const MIN_ENEMY_SPAWN_INTERVAL = 500; // 최소 적 생성 간격 (밀리초)

// 게임 상태 변수에 추가
let isStartScreen = true;  // 시작 화면 상태(시작화면 복구)
const startScreenAnimation = 0;  // 시작 화면 애니메이션 변수
let titleY = -100;  // 제목 Y 위치
let subtitleY = canvas.height + 100;  // 부제목 Y 위치
let stars = [];  // 배경 별들

// 시작 화면 초기화 함수
function initStartScreen() {
    // 시작 화면 애니메이션 변수 초기화
    titleY = -100;  // 제목 Y 위치
    subtitleY = canvas.height + 100;  // 부제목 Y 위치
    stars = [];  // 배경 별들
    
    // 배경 별들 생성
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
    console.log('drawStartScreen 호출됨, canvas 크기:', canvas.width, 'x', canvas.height);
    
    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#000066');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별들 그리기
    if (stars && stars.length > 0) {
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
    }

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
    ctx.font = 'bold 35px Arial';
    ctx.fillStyle = titleGradient;
    ctx.textAlign = 'center';
    ctx.fillText('Thunderbolt Shooter', canvas.width/2, titleY);

    // 부제목


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
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText('시작/재시작 버튼 누른 후 터치하여 시작', canvas.width/2, canvas.height/2 + 40);
    }

    // 조작법 안내
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('플레이어 비행기를 손가락으로 터치하면', 50, canvas.height - 200);
    ctx.fillText('총알이 자동발사 되고 드래그하여', 50, canvas.height - 170);
    ctx.fillText('상하좌우로 움직일 수 있습니다.', 50, canvas.height - 140);
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
        trail: [],
        isBossBomb: !!enemy.isBoss // 보스가 발사한 폭탄이면 true
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

// 적 타입 상수 추가
const ENEMY_TYPES = {
    PLANE: 'plane',
    HELICOPTER: 'helicopter',
    HELICOPTER2: 'helicopter2'  // 새로운 헬리콥터 타입 추가
};

// 헬리콥터 생성 함수 수정
function createHelicopter() {
    const helicopter = {
        x: Math.random() * (canvas.width - 48), // 40 * 1.2 = 48
        y: -48,  // 화면 상단에서 시작
        width: 48, // 40 * 1.2 = 48
        height: 48, // 40 * 1.2 = 48
        speed: 2,
        type: ENEMY_TYPES.HELICOPTER,
        rotorAngle: 0,
        rotorSpeed: 0.2,
        hoverHeight: Math.random() * 200 + 100,
        hoverTimer: 0,
        hoverDirection: 1,
        canDropBomb: Math.random() < 0.4,  // 40% 확률로 폭탄 투하 가능
        lastBombDrop: 0,
        bombDropInterval: 2000 + Math.random() * 3000
    };
    enemies.push(helicopter);
}

// 헬리콥터 그리기 함수 수정
function drawHelicopter(x, y, width, height, rotorAngle) {
    ctx.save();
    ctx.translate(x + width/2, y + height/2);
    
    // 플레이어 방향으로 회전 각도 계산 (머리가 플레이어를 향하도록)
    const dx = player.x - x;
    const dy = player.y - y;
    const angle = Math.atan2(dy, dx) + Math.PI/2;  // Math.PI/2를 더해서 헬리콥터가 플레이어를 향하도록 수정
    ctx.rotate(angle);
    
    // 보스와 helicopter2 타입 확인
    const isBoss = enemies.find(enemy => enemy.x === x && enemy.y === y && enemy.isBoss);
    const isHelicopter2 = enemies.find(enemy => enemy.x === x && enemy.y === y && enemy.type === ENEMY_TYPES.HELICOPTER2);
    
    let mainColor, secondaryColor, glassColor, glassBorderColor;
    
    if (isBoss) {
        mainColor = '#ff4500';
        secondaryColor = '#ff8c00';
        glassColor = '#ffd700';
        glassBorderColor = '#ffa500';
    } else if (isHelicopter2) {
        mainColor = '#FF8C00';  // 다크 오렌지
        secondaryColor = '#FFA500';  // 오렌지
        glassColor = 'rgba(255, 140, 0, 0.3)';  // 반투명 다크 오렌지
        glassBorderColor = 'rgba(255, 165, 0, 0.5)';  // 반투명 오렌지
    } else {
        mainColor = '#20B2AA';  // 라이트 시안
        secondaryColor = '#008B8B';  // 다크 시안
        glassColor = '#48D1CC';  // 미디엄 시안
        glassBorderColor = '#008B8B';  // 다크 시안
    }

    // 1. 메인 로터 (세로로 길게, 끝에 흰색 포인트, 투명도 효과)
    ctx.save();
    // 로터 회전 적용
    ctx.rotate(rotorAngle);
    for (let i = 0; i < 2; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI/2);
        // 블레이드(투명도 효과)
        ctx.beginPath();
        ctx.moveTo(0, -height*0.55);
        ctx.lineTo(0, height*0.55);
        ctx.lineWidth = width*0.10;
        ctx.strokeStyle = isBoss ? 'rgba(255,69,0,0.55)' : isHelicopter2 ? 'rgba(255,140,0,0.55)' : 'rgba(32,178,170,0.55)';
        ctx.shadowColor = isBoss ? 'rgba(255,140,0,0.3)' : isHelicopter2 ? 'rgba(255,165,0,0.3)' : 'rgba(0,139,139,0.3)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // 블레이드 끝 강조
        ctx.beginPath();
        ctx.arc(0, height*0.55, width*0.05, 0, Math.PI*2);
        ctx.arc(0, -height*0.55, width*0.05, 0, Math.PI*2);
        ctx.fillStyle = isBoss ? '#ff8c00' : isHelicopter2 ? '#FFA500' : '#008B8B';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        // 블레이드 끝 흰색 포인트
        ctx.beginPath();
        ctx.arc(0, height*0.55, width*0.022, 0, Math.PI*2);
        ctx.arc(0, -height*0.55, width*0.022, 0, Math.PI*2);
        ctx.fillStyle = isBoss ? '#ffd700' : isHelicopter2 ? '#9ACD32' : '#20B2AA';
        ctx.globalAlpha = 0.95;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
    ctx.restore();

    // 2. 동체 (앞뒤로 길쭉한 타원, 앞쪽 뾰족)
    ctx.beginPath();
    ctx.ellipse(0, 0, width*0.18, height*0.50, 0, 0, Math.PI*2);
    ctx.fillStyle = mainColor;
    ctx.fill();
    // 앞부분 뾰족하게
    ctx.beginPath();
    ctx.moveTo(0, -height*0.50);
    ctx.lineTo(width*0.10, -height*0.60);
    ctx.lineTo(-width*0.10, -height*0.60);
    ctx.closePath();
    ctx.fillStyle = secondaryColor;
    ctx.fill();

    // 3. 조종석 (앞쪽, 세로로 긴 타원)
    ctx.beginPath();
    ctx.ellipse(0, -height*0.36, width*0.13, height*0.18, 0, 0, Math.PI*2);
    ctx.fillStyle = glassColor;
    ctx.fill();
    ctx.strokeStyle = glassBorderColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    // 유리창 분할선
    ctx.beginPath();
    ctx.moveTo(0, -height*0.54);
    ctx.lineTo(0, -height*0.18);
    ctx.moveTo(-width*0.09, -height*0.36);
    ctx.lineTo(width*0.09, -height*0.36);
    ctx.strokeStyle = isBoss ? 'rgba(255,165,0,0.5)' : 'rgba(80,180,255,0.5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 4. 양쪽 엔진/포드 (동체 옆, 세로로)
    ctx.beginPath();
    ctx.ellipse(-width*0.18, 0, width*0.06, height*0.13, 0, 0, Math.PI*2);
    ctx.ellipse(width*0.18, 0, width*0.06, height*0.13, 0, 0, Math.PI*2);
    ctx.fillStyle = isBoss ? '#ff6b00' : isHelicopter2 ? '#9ACD32' : '#20B2AA';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-width*0.18, height*0.10, width*0.04, height*0.07, 0, 0, Math.PI*2);
    ctx.ellipse(width*0.18, height*0.10, width*0.04, height*0.07, 0, 0, Math.PI*2);
    ctx.fillStyle = isBoss ? '#ffa500' : isHelicopter2 ? '#ADFF2F' : '#48D1CC';
    ctx.fill();

    // 5. 꼬리빔 (가늘고 길게 뒤로)
    ctx.beginPath();
    ctx.moveTo(-width*0.05, height*0.50);
    ctx.lineTo(-width*0.05, height*0.90);
    ctx.lineTo(width*0.05, height*0.90);
    ctx.lineTo(width*0.05, height*0.50);
    ctx.closePath();
    ctx.fillStyle = secondaryColor;
    ctx.fill();

    // 6. 꼬리 수직날개
    ctx.beginPath();
    ctx.moveTo(0, height*0.90);
    ctx.lineTo(-width*0.10, height*0.98);
    ctx.lineTo(width*0.10, height*0.98);
    ctx.closePath();
    ctx.fillStyle = isBoss ? '#ff4500' : isHelicopter2 ? '#7CFC00' : '#008B8B';
    ctx.fill();

    // 7. 테일로터 (꼬리 끝)
    ctx.save();
    ctx.translate(0, height*0.98);
    // 테일로터 회전 적용
    ctx.rotate(rotorAngle * 2);
    for (let i = 0; i < 2; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI/2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height*0.08);
        ctx.lineWidth = 3;
        ctx.strokeStyle = isBoss ? '#ff8c00' : isHelicopter2 ? '#9ACD32' : '#20B2AA';
        ctx.stroke();
        // 테일로터 끝 포인트
        ctx.beginPath();
        ctx.arc(0, height*0.08, width*0.012, 0, Math.PI*2);
        ctx.fillStyle = isBoss ? '#ffd700' : isHelicopter2 ? '#ADFF2F' : '#48D1CC';
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
    ctx.restore();

    // 8. 착륙 스키드(다리, 앞뒤로)
    ctx.strokeStyle = isBoss ? '#ff8c00' : isHelicopter2 ? '#9ACD32' : '#20B2AA';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-width*0.13, height*0.30);
    ctx.lineTo(width*0.13, height*0.30);
    ctx.moveTo(-width*0.13, height*0.40);
    ctx.lineTo(width*0.13, height*0.40);
    ctx.stroke();
    // 스키드 연결
    ctx.beginPath();
    ctx.moveTo(-width*0.13, height*0.30);
    ctx.lineTo(-width*0.13, height*0.40);
    ctx.moveTo(width*0.13, height*0.30);
    ctx.lineTo(width*0.13, height*0.40);
    ctx.stroke();

    // 9. 그림자 효과
    ctx.globalAlpha = 0.10;
    ctx.beginPath();
    ctx.ellipse(0, height*0.60, width*0.20, height*0.08, 0, 0, Math.PI*2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.restore();
}

// 적 그리기 함수 수정
function drawEnemy(enemy) {
    if (enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) {
        drawHelicopter(enemy.x, enemy.y, enemy.width, enemy.height, enemy.rotorAngle);
    } else if (enemy.type === ENEMY_TYPES.PLANE) {
        drawAirplane(enemy.x, enemy.y, enemy.width, enemy.height, 'red', true);
    } else if (enemy.type === 'dynamite') {
        drawDrone(enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

// 헬리콥터 총알 배열 추가
let helicopterBullets = [];

// 헬리콥터 총알 그리기 함수
function drawHelicopterBullet(bullet) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(bullet.angle);
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
}

// 헬리콥터 총알 이동 및 충돌 처리 수정
function handleHelicopterBullets() {
    helicopterBullets = helicopterBullets.filter(bullet => {
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
        drawHelicopterBullet(bullet);
        
        // 모든 헬리콥터 총알(보스 포함)이 플레이어 총알과 충돌하도록 수정
        for (let i = bullets.length - 1; i >= 0; i--) {
            const playerBullet = bullets[i];
            if (!playerBullet.isBossBullet && !playerBullet.isSpecial && checkCollision(bullet, playerBullet)) {
                console.log('충돌! 플레이어 총알과 헬기 총알', bullet, playerBullet);
                explosions.push(new Explosion(bullet.x, bullet.y, false));
                
                // 충돌음 재생
                safePlay(collisionSound);
                
                bullets.splice(i, 1);
                return false; // 충돌한 헬리콥터 총알 제거
            }
        }
        
        // 플레이어와 충돌 체크
        if (checkCollision(bullet, player) || (hasSecondPlane && checkCollision(bullet, secondPlane))) {
            handleCollision();
            explosions.push(new Explosion(bullet.x, bullet.y, false));
            return false;
        }
        
        // 화면 밖으로 나가면 제거
        return bullet.x > -20 && bullet.x < canvas.width + 20 && bullet.y > -20 && bullet.y < canvas.height + 20;
    });
}

// 드론(삼각형 델타윙) 그리기 함수를 다이나마이트 지뢰 그리기 함수로 변경
function drawDrone(x, y, width, height) {
    // 크기를 70%로 조정
    width = width * 0.7;
    height = height * 0.7;
    
    ctx.save();
    ctx.translate(x + width/2, y + height/2);
    ctx.rotate(Math.PI); // 180도 회전하여 방향 반전
    
    // 미사일 본체
    ctx.beginPath();
    ctx.rect(-width/4, -height/2, width/2, height);
    ctx.fillStyle = '#808080'; // 회색
    ctx.fill();
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 미사일 날개
    const wingWidth = width * 0.4;
    const wingHeight = height * 0.3;
    
    // 왼쪽 날개
    ctx.beginPath();
    ctx.moveTo(-width/4, -height/4);
    ctx.lineTo(-width/4 - wingWidth, -height/4 + wingHeight);
    ctx.lineTo(-width/4, -height/4 + wingHeight);
    ctx.closePath();
    ctx.fillStyle = '#A0A0A0';
    ctx.fill();
    ctx.strokeStyle = '#606060';
    ctx.stroke();
    
    // 오른쪽 날개
    ctx.beginPath();
    ctx.moveTo(width/4, -height/4);
    ctx.lineTo(width/4 + wingWidth, -height/4 + wingHeight);
    ctx.lineTo(width/4, -height/4 + wingHeight);
    ctx.closePath();
    ctx.fillStyle = '#A0A0A0';
    ctx.fill();
    ctx.strokeStyle = '#606060';
    ctx.stroke();
    
    // 미사일 추진부 (엔진)
    ctx.beginPath();
    ctx.rect(-width/6, height/2, width/3, height/4);
    ctx.fillStyle = '#404040';
    ctx.fill();
    ctx.strokeStyle = '#202020';
    ctx.stroke();
    
    // 엔진 불꽃
    const flameHeight = height * 0.4;
    const flameWidth = width * 0.3;
    
    // 외부 불꽃
    ctx.beginPath();
    ctx.moveTo(-flameWidth/2, height/2 + height/4);
    ctx.lineTo(0, height/2 + height/4 + flameHeight);
    ctx.lineTo(flameWidth/2, height/2 + height/4);
    ctx.closePath();
    ctx.fillStyle = '#FF4500'; // 주황색
    ctx.fill();
    
    // 내부 불꽃
    ctx.beginPath();
    ctx.moveTo(-flameWidth/4, height/2 + height/4);
    ctx.lineTo(0, height/2 + height/4 + flameHeight * 0.8);
    ctx.lineTo(flameWidth/4, height/2 + height/4);
    ctx.closePath();
    ctx.fillStyle = '#FFFF00'; // 노란색
    ctx.fill();
    
    // 미사일 머리 부분
    ctx.beginPath();
    ctx.moveTo(-width/4, -height/2);
    ctx.lineTo(0, -height/2 - height/4);
    ctx.lineTo(width/4, -height/2);
    ctx.closePath();
    ctx.fillStyle = '#A0A0A0';
    ctx.fill();
    ctx.strokeStyle = '#606060';
    ctx.stroke();
    
    // 미사일 장식 (빨간색 줄무늬)
    for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.rect(-width/4, -height/2 + height/4 * i, width/2, 4);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
    }
    
    // 엔진 파티클 효과
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // -45도 ~ 45도
        const distance = Math.random() * flameHeight;
        const particleX = Math.cos(angle) * distance;
        const particleY = height/2 + height/4 + Math.sin(angle) * distance;
        
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 100 + 100)}, 0, ${Math.random() * 0.5 + 0.5})`;
        ctx.fill();
    }
    
    ctx.restore();
}

// 전역 변수 추가
let lastHelicopterShotTime = 0;
const MIN_SHOT_INTERVAL = 5000; // 최소 발사 간격 (5초)

// 전역 변수 추가
let lastHelicopterSpawnTime = 0;
const MIN_HELICOPTER_SPAWN_INTERVAL = 10000; // 10초(10000ms)로 설정
let isBossActive = false; // 보스 활성화 상태 추적

function handleEnemies() {
    const currentTime = Date.now();
    const currentDifficulty = difficultySettings[gameLevel];
    const bossExists = enemies.some(enemy => enemy.type === 'helicopter' && enemy.isBoss);
    
    // 보스 생성 조건 추가
    if (score >= 2000 * gameLevel && !isBossActive && !bossExists) {
        createBoss();
        isBossActive = true;
    }
    
    if (bossExists) {
        isBossActive = true;
    } else if (isBossActive) {
        lastHelicopterSpawnTime = currentTime;
        isBossActive = false;
    }
    if (isSnakePatternActive) {
        handleSnakePattern();
    }
    if (currentTime - lastEnemySpawnTime >= MIN_ENEMY_SPAWN_INTERVAL &&
        Math.random() < currentDifficulty.enemySpawnRate && 
        enemies.length < currentDifficulty.maxEnemies &&
        !isGameOver) {
        createEnemy();
        lastEnemySpawnTime = currentTime;
        console.log('새로운 적 생성됨');
    }
    if (!isBossActive && currentTime - lastHelicopterSpawnTime >= MIN_HELICOPTER_SPAWN_INTERVAL) {
        if (Math.random() < 0.01) { // 1% 확률로 헬리콥터 생성
            const helicopter = createHelicopter();
            if (helicopter) {
                enemies.push(helicopter);
                lastHelicopterSpawnTime = currentTime;
            }
        }
    }
    let helicopterFiredThisFrame = false;
    enemies = enemies.filter(enemy => {
        updateEnemyPosition(enemy, {helicopterFiredThisFrame});
        drawEnemy(enemy);
        return checkEnemyCollisions(enemy);
    });
    handleEnemyPlaneBullets();
    handleEnemyBullets();
    handleHelicopterBullets();
}

// 보스 생성 함수 수정
function createBoss() {
    console.log('보스 헬리콥터 생성 함수 호출됨');
    
    // 이미 보스가 존재하는 경우
    if (bossActive) {
        console.log('보스가 이미 존재하여 생성하지 않음');
        return;
    }
    
    const currentTime = Date.now();
    const timeSinceLastBoss = currentTime - lastBossSpawnTime;
    
    // 시간 체크
    if (timeSinceLastBoss < BOSS_SETTINGS.SPAWN_INTERVAL) {
        console.log('보스 생성 시간이 되지 않음:', {
            timeSinceLastBoss,
            requiredInterval: BOSS_SETTINGS.SPAWN_INTERVAL,
            remainingTime: BOSS_SETTINGS.SPAWN_INTERVAL - timeSinceLastBoss
        });
        return;
    }
    
    console.log('보스 헬리콥터 생성 시작:', {
        currentTime,
        lastBossSpawnTime,
        timeSinceLastBoss
    });
    
    // 보스 상태 초기화
    bossActive = true;
    isBossActive = true; // 보스 활성화 상태 설정
    bossHealth = BOSS_SETTINGS.HEALTH;
    bossPattern = 0;
    bossTimer = currentTime;
    lastBossSpawnTime = currentTime;
    bossDestroyed = false;
    
    // 보스 헬리콥터 객체 생성
    const boss = {
        x: Math.random() * (canvas.width - 68),
        y: -68,  // 화면 상단에서 시작
        width: 68,
        height: 68,
        speed: BOSS_SETTINGS.SPEED,
        pattern: BOSS_PATTERNS.CIRCLE_SHOT,
        angle: 0,
        movePhase: 0,
        targetX: canvas.width / 2 - 34,
        targetY: 68,
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
        type: ENEMY_TYPES.HELICOPTER,
        rotorAngle: 0,
        rotorSpeed: 0.2,
        hoverHeight: 150,
        hoverTimer: 0,
        hoverDirection: 1,
        canDropBomb: true,
        lastBombDrop: 0,
        bombDropInterval: 3000
    };
    
    // 보스 추가
    enemies.push(boss);
    console.log('보스 헬리콥터 생성 완료:', boss);
}

// 보스 파괴 시 처리
function handleBossDestruction() {
    bossActive = false;
    isBossActive = false; // 보스 비활성화 상태 설정
    lastHelicopterSpawnTime = Date.now(); // 일반 헬리콥터 생성 타이머 리셋
    console.log('보스 헬리콥터 파괴됨');
}

// 미사일 이미지 로드
// let missileImage = new Image();
// missileImage.src = 'taurus.png';

// 타우러스 미사일 그리기 함수
function drawTaurusMissile(ctx, x, y, width, height, angle = Math.PI) {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(angle);

    // 1. 본체(흰색 원통)
    ctx.fillStyle = "#eaeaea";
    ctx.fillRect(-width * 0.18, -height * 0.45, width * 0.36, height * 0.9);

    // 2. 머리(둥글고 약간 뾰족한 회색)
    ctx.beginPath();
    ctx.ellipse(0, height * 0.45, width * 0.18, height * 0.13, 0, Math.PI, 0, true); // 둥글게
    ctx.lineTo(width * 0.18, height * 0.25);
    ctx.lineTo(-width * 0.18, height * 0.25);
    ctx.closePath();
    ctx.fillStyle = "#bbb";
    ctx.fill();

    // 3. 꼬리(편평한 부분, 위쪽)
    ctx.beginPath();
    ctx.arc(0, -height * 0.45, width * 0.09, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = "#ffb300";
    ctx.fill();

    // 4. 꼬리 화염(더 진한 빨간색, 위쪽)
    let flameLength = height * 1.3;
    let flameWidth = width * 0.5;
    let grad = ctx.createLinearGradient(0, -height * 0.45, 0, -height * 0.45 - flameLength);
    grad.addColorStop(0, "rgba(255,0,0,1)");
    grad.addColorStop(0.2, "rgba(255,80,0,0.8)");
    grad.addColorStop(0.5, "rgba(255,200,0,0.5)");
    grad.addColorStop(1, "rgba(255,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(-flameWidth / 2, -height * 0.45);
    ctx.lineTo(0, -height * 0.45 - flameLength);
    ctx.lineTo(flameWidth / 2, -height * 0.45);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 5. 날개(4개, 십자형)
    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 2) * i);
        ctx.beginPath();
        ctx.moveTo(0, -height * 0.25);
        ctx.lineTo(0, -height * 0.55);
        ctx.stroke();
        ctx.restore();
    }

    ctx.restore();
}

function drawMissileTrail(missile) {
    // 위쪽(0 라디안)으로 향하도록
    drawTaurusMissile(ctx, missile.x, missile.y, missile.width, missile.height, 0);
}

function bossFireSpreadShot(boss) {
    const spreadCount = 12; // 한 번에 12발
    for (let i = 0; i < spreadCount; i++) {
        const angle = (i * 2 * Math.PI) / spreadCount;
        createBossBullet(boss, angle);
    }
}

function handleBossPattern(boss) {
    const currentTime = Date.now();

    // ... (기존 페이즈, 이동 등 유지)

    // 공격 패턴: 확산탄만 발사
    if (currentTime - boss.patternTimer >= BOSS_SETTINGS.PATTERN_INTERVAL) {
        boss.patternTimer = currentTime;
        bossFireSpreadShot(boss); // 확산탄만 발사
    }
}

// 충돌 이펙트 배열 추가
let collisionEffects = [];

// 충돌 이펙트 그리기 및 수명 감소
function handleCollisionEffects() {
    collisionEffects = collisionEffects.filter(effect => {
        ctx.save();
        
        // 펄스 효과 계산
        effect.pulse += 0.2;
        const pulseScale = 1 + Math.sin(effect.pulse) * 0.2;
        const currentRadius = effect.radius * pulseScale;
        
        // 메인 그라데이션
        const gradient = ctx.createRadialGradient(
            effect.x, effect.y, 0,
            effect.x, effect.y, currentRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 200, 200, 0.7)');
        gradient.addColorStop(0.6, 'rgba(180, 180, 180, 0.5)');
        gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
        
        // 메인 원 그리기
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 외곽선 그리기 (빛나는 효과)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(effect.pulse * 2) * 0.3})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 추가적인 빛나는 효과
        const glowGradient = ctx.createRadialGradient(
            effect.x, effect.y, currentRadius * 0.5,
            effect.x, effect.y, currentRadius * 1.2
        );
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, currentRadius * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // 작은 입자 효과 추가
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + effect.pulse;
            const distance = currentRadius * 0.8;
            const particleX = effect.x + Math.cos(angle) * distance;
            const particleY = effect.y + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
        }
        
        ctx.restore();
        
        effect.life--;
        return effect.life > 0;
    });
}

// gameLoop 내에서 handleCollisionEffects 호출 (폭발/이펙트 그리기 직후 등)
// ... existing code ...
// 예시: handleExplosions(); 아래에 추가
// handleExplosions();
// handleCollisionEffects();
// ... existing code ...

// 이미지 로딩 시스템
const gameImages = {
    player: null,
    enemyPlane: null,
    enemyPlane2: null
};

// 이미지 로딩 함수
function loadImage(src, key) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            gameImages[key] = img;
            resolve(img);
        };
        img.onerror = () => {
            console.warn(`이미지 로딩 실패: ${src}`);
            gameImages[key] = null;
            resolve(null);
        };
        img.src = src;
    });
}

// 모든 이미지 로딩
async function loadAllImages() {
    try {
        await Promise.all([
            loadImage('images/player.png', 'player'),
            loadImage('images/enemyplane.png', 'enemyPlane'),
            loadImage('images/enemyplane2.png', 'enemyPlane2')
        ]);
        console.log('이미지 로딩 완료');
    } catch (error) {
        console.error('이미지 로딩 중 오류:', error);
    }
}

// 사운드 play 함수 예외처리 래퍼
function safePlay(audio) {
    try {
        if (audio && audio.play) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    } catch (e) {
        // 사운드 파일이 없거나 재생 불가 시 무시
    }
}

// 최고점수 완전 초기화 함수
async function resetAllHighScores() {
    try {
        // IndexedDB 초기화
        const db = await initDB();
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        await store.clear();
        
        // localStorage 초기화 - 모든 관련 항목 제거
        localStorage.removeItem('ThunderboltHighScore');
        localStorage.removeItem('ThunderboltHighScore_backup');
        localStorage.removeItem('ThunderboltHighScore_timestamp');
        
        // sessionStorage 초기화
        sessionStorage.removeItem('ThunderboltCurrentHighScore');
        
        // 현재 게임의 최고 점수 초기화
        highScore = 0;
        
        console.log('모든 최고 점수가 초기화되었습니다.');
        return true;
    } catch (error) {
        console.error('최고 점수 초기화 중 오류:', error);
        return false;
    }
}
// 단축키: Ctrl+Shift+R로 최고점수 초기화
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyR') {
        resetAllHighScores();
    }
});

// ===== 사운드 컨트롤 패널 동적 생성 및 연동 =====
function createSoundControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'sound-control-panel';
    panel.style.position = 'fixed';
    panel.style.right = '30px';
    panel.style.bottom = '30px';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    panel.style.padding = '12px';
    panel.style.borderRadius = '8px';
    panel.style.color = 'white';
    panel.style.zIndex = '1000';
    panel.style.cursor = 'move';
    panel.style.userSelect = 'none';
    panel.style.width = '340px';
    panel.style.height = 'fit-content';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.gap = '5px';
    panel.style.boxSizing = 'border-box';
    panel.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';

    // 볼륨 컨트롤 추가
    const volumeControl = document.createElement('div');
    volumeControl.style.display = 'flex';
    volumeControl.style.alignItems = 'center';
    volumeControl.style.gap = '12px';
    volumeControl.style.width = '100%';
    volumeControl.innerHTML = `
        <label style="white-space: nowrap;">효과음 볼륨:</label>
        <input type="range" min="0" max="100" value="10" id="sfx-volume" style="flex: 1; min-width: 120px; max-width: 200px;"> 
        <span id="volume-value" style="min-width: 40px; text-align:right;">10%</span>
    `;
    panel.appendChild(volumeControl);

    // body에 패널 추가
    document.body.appendChild(panel);
    setupSoundControlEvents();
    setupPanelDrag(panel);
}

function setupSoundControlEvents() {
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    const volumeValue = document.getElementById('volume-value');
    
    if (sfxVolumeSlider && volumeValue) {
        sfxVolumeSlider.addEventListener('input', function(e) {
            e.stopPropagation();  // 이벤트 전파 중단
            const volume = this.value / 100;  // 0-1 사이의 값으로 변환
            volumeValue.textContent = `${this.value}%`;
            
            // 모든 효과음 볼륨 업데이트
            shootSound.volume = volume;
            explosionSound.volume = volume;
            collisionSound.volume = volume;
            levelUpSound.volume = volume;
        });

        // 마우스 이벤트가 다른 요소에 영향을 주지 않도록 처리
        sfxVolumeSlider.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
        
        sfxVolumeSlider.addEventListener('mouseup', function(e) {
            e.stopPropagation();
            this.blur();  // 포커스 제거
        });
    }
}

// 패널 드래그 기능 설정
function setupPanelDrag(panel) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // 드래그 시작
    panel.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT') return;  // 볼륨 슬라이더는 드래그 방지
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        if (e.target === panel || e.target.parentNode === panel) {
            isDragging = true;
            panel.style.transition = 'none';  // 드래그 중 애니메이션 제거
        }
    });

    // 드래그 중
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();  // 드래그 중 기본 동작 방지
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            xOffset = currentX;
            yOffset = currentY;
            
            // 패널 위치 업데이트
            panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    });

    // 드래그 종료
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            panel.style.transition = 'transform 0.1s ease';  // 드래그 종료 후 애니메이션 복원
        }
    });

    // 마우스가 창 밖으로 나갈 때 드래그 종료
    document.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            panel.style.transition = 'transform 0.1s ease';
        }
    });
}

// 페이지 로드 시 사운드 컨트롤 패널 생성 및 전체화면 모드 활성화
window.addEventListener('DOMContentLoaded', () => {
    // 모바일에서 전체화면 모드 활성화
    if (isMobile) {
        // 페이지 로드 후 약간의 지연을 두고 전체화면 모드 활성화
        setTimeout(() => {
            enableFullscreen();
        }, 1000);
        // 사용자 상호작용 후 전체화면 모드 활성화 (iOS Safari 요구사항)
        document.addEventListener('touchstart', () => {
            enableFullscreen();
        }, { once: true });
        document.addEventListener('click', () => {
            enableFullscreen();
        }, { once: true });
    }
});

// 게임 루프 시작
function startGameLoop() {
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        gameLoop();
    }
}

// 게임 루프 실행 상태 변수
let gameLoopRunning = false;

// 총알 발사 함수
function fireBullet() {
    if (!canFire || !gameStarted || isGameOver) return;
    
    const currentTime = Date.now();
    if (currentTime - lastFireTime < fireDelay) return;
    
    // 확산탄 발사
    if (hasSpreadShot) {
        const spreadAngles = [-15, -10, -5, 0, 5, 10, 15];
        spreadAngles.forEach(angle => {
            const bullet = {
                x: player.x + player.width / 2,
                y: player.y,
                width: 4,
                height: 8,
                speed: 6 * mobileSpeedMultiplier,
                angle: (angle * Math.PI) / 180
            };
            bullets.push(bullet);
        });
    } else {
        // 일반 총알 발사
        const bullet = {
            x: player.x + player.width / 2,
            y: player.y,
            width: 4,
            height: 8,
            speed: 6 * mobileSpeedMultiplier
        };
        bullets.push(bullet);
    }
    
    // 두 번째 비행기 발사
    if (hasSecondPlane) {
        const bullet = {
            x: secondPlane.x + secondPlane.width / 2,
            y: secondPlane.y,
            width: 4,
            height: 8,
            speed: 6 * mobileSpeedMultiplier
        };
        bullets.push(bullet);
    }
    
    // 발사음은 제거 (적기에 맞았을 때만 재생)
    // safePlay(shootSound);
    
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
function setupTouchPositionControls() {
    console.log('터치 위치 이동 컨트롤 설정');
    
    // 터치 시작
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // 게임 진행 중일 때만 플레이어 이동
        if (gameStarted && !isGameOver && !isStartScreen) {
            // 터치한 위치로 플레이어 즉시 이동 (비행기 중심점을 날개폭의 반만큼 오른쪽으로)
            let newX = touchX - player.width / 2 + player.width / 4; // 터치 위치를 플레이어 중심으로 조정하고 날개폭의 반만큼 오른쪽으로 이동
            let newY = touchY - player.height * 0.8; // 비행기 꼬리 부분이 터치 지점에 오도록 조정
            
            // 경계 제한
            const margin = 10;
            const maxY = canvas.height - 100; // 모바일 컨트롤 영역 고려
            
            newX = Math.max(-player.width / 2.5, Math.min(canvas.width - player.width / 2, newX));
            newY = Math.max(margin, Math.min(maxY, newY));
            
            // 플레이어 위치 업데이트
            player.x = newX;
            player.y = newY;
            
            // 두 번째 비행기도 함께 이동
            if (hasSecondPlane) {
                secondPlane.x = newX + (canvas.width / 2 - 60) - (canvas.width / 2 - (240 * 0.7 * 0.7 * 0.8) / 2);
                secondPlane.y = newY;
            }
            
            // 터치 시 자동 연속발사 시작
            keys.Space = true;
            isSpacePressed = true;
            spacePressTime = Date.now();
            isContinuousFire = true;
            console.log('터치 연속발사 시작');
            
            console.log('터치 위치 이동:', newX, newY);
        }
    }, { passive: false });
    
    // 터치 이동 (드래그 중에도 위치 업데이트)
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // 터치한 위치로 플레이어 즉시 이동 (비행기 중심점을 날개폭의 반만큼 오른쪽으로)
        let newX = touchX - player.width / 2 + player.width / 4; // 터치 위치를 플레이어 중심으로 조정하고 날개폭의 반만큼 오른쪽으로 이동
        let newY = touchY - player.height * 0.8; // 비행기 꼬리 부분이 터치 지점에 오도록 조정
        
        // 경계 제한
        const margin = 10;
        const maxY = canvas.height - 100; // 모바일 컨트롤 영역 고려
        
        newX = Math.max(-player.width / 2.5, Math.min(canvas.width - player.width / 2, newX));
        newY = Math.max(margin, Math.min(maxY, newY));
        
        // 플레이어 위치 업데이트
        player.x = newX;
        player.y = newY;
        
        // 두 번째 비행기도 함께 이동
        if (hasSecondPlane) {
            secondPlane.x = newX + (canvas.width / 2 - 60) - (canvas.width / 2 - (240 * 0.7 * 0.7 * 0.8) / 2);
            secondPlane.y = newY;
        }
        
    }, { passive: false });
    
    // 터치 종료
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        // 터치 종료 시 연속발사 중지
        if (gameStarted && !isGameOver && !isStartScreen) {
            keys.Space = false;
            isSpacePressed = false;
            lastReleaseTime = Date.now();
            isContinuousFire = false;
            console.log('터치 연속발사 중지');
        }
        
        console.log('터치 종료');
    }, { passive: false });
}

// ... existing code ...

function drawAirplane(x, y, width, height, color, isEnemy = false) {
    ctx.save();
    if (!isEnemy) {
        // 플레이어: 이미지가 있으면 사용, 없으면 도형으로 그리기
        if (gameImages.player) {
            ctx.drawImage(gameImages.player, x, y, width, height);
        } else {
            // 이미지가 없을 때 도형으로 그리기
            ctx.fillStyle = color || '#00ff00';
            ctx.fillRect(x, y, width, height);
        }
    } else {
        // 적: 이미지가 있으면 사용, 없으면 도형으로 그리기
        if (gameImages.enemyPlane) {
            ctx.translate(x + width/2, y + height/2);
            ctx.scale(1, -1); // 아래로 향하도록 뒤집기
            ctx.drawImage(gameImages.enemyPlane, -width/2, -height/2, width, height);
        } else {
            // 이미지가 없을 때 도형으로 그리기
            ctx.fillStyle = color || '#ff0000';
            ctx.fillRect(x, y, width, height);
        }
    }
    ctx.restore();
}
// ... existing code ...

// High Score Reset Confirmation Modal
function showResetConfirmModal(onResult) {
    const modal = document.getElementById('reset-confirm-modal');
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-message">최고 점수를 리셋하시겠습니까?</div>
        <div class="modal-buttons">
          <button class="modal-btn yes">예</button>
          <button class="modal-btn no">아니요</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    // Focus trap for accessibility (optional)
    const yesBtn = modal.querySelector('.modal-btn.yes');
    const noBtn = modal.querySelector('.modal-btn.no');
    function close(result) {
        modal.style.display = 'none';
        modal.innerHTML = '';
        if (onResult) onResult(result);
    }
    yesBtn.addEventListener('click', () => close(true));
    noBtn.addEventListener('click', () => close(false));
    // ESC key closes as 'no'
    function escHandler(e) {
      if (e.key === 'Escape') {
        close(false);
        document.removeEventListener('keydown', escHandler);
      }
    }
    document.addEventListener('keydown', escHandler);
    // Prevent background scroll/touch
    modal.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    // Focus default
    yesBtn.focus();
}