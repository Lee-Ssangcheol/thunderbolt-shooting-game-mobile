// 게임 상수 정의
const SPECIAL_WEAPON_MAX_CHARGE = 1000;  // 특수무기 최대 충전량
const SPECIAL_WEAPON_CHARGE_RATE = 10;   // 특수무기 충전 속도
const SPECIAL_WEAPON_MAX_STOCK = 5;      // 특수무기 최대 보유 개수
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
    // 모바일 컨트롤 상태 안내는 더 이상 표시하지 않음
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
        
        // 시작 화면에서 버튼을 누르면 바로 게임 화면으로 전환
        if (isStartScreen) {
            isStartScreen = false;
            gameStarted = false; // 화면 터치 대기 상태
            console.log('모바일에서 게임 화면으로 전환 (터치 대기)');            
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
            gameStarted = false; // 화면 터치 대기 상태            
            console.log('게임 오버 후 게임 화면으로 전환 (터치 대기)');            
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
            gameStarted = false; // 화면 터치 대기 상태
            console.log('모바일에서 게임 화면으로 전환 (터치 대기)');            
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
            gameStarted = false; // 화면 터치 대기 상태
            console.log('게임 오버 후 게임 화면으로 전환 (터치 대기)');            
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
const warningSound = new Audio();  // 목숨 감소 경고음

// 사운드 파일 경로 설정
shootSound.src = 'sounds/shoot.mp3';
explosionSound.src = 'sounds/explosion.mp3';
collisionSound.src = 'sounds/collision.mp3';
levelUpSound.src = 'sounds/levelup.mp3';
warningSound.src = 'sounds/warning.mp3';

// 볼륨 제한 함수 (종이비행기용과 동일)
function clampVolume(volume) {
    return Math.max(0, Math.min(1, volume));
}

// 전역 볼륨 변수 (종이비행기용과 동일)
let globalVolume = 1.0; // 기본 볼륨 100%
let isMuted = false;

// 전역 볼륨 적용 함수 (종이비행기용과 동일)
function applyGlobalVolume() {
    if (isMuted) {
        if (shootSound) shootSound.volume = 0;
        if (explosionSound) explosionSound.volume = 0;
        if (collisionSound) collisionSound.volume = 0;
        if (levelUpSound) levelUpSound.volume = 0;
        if (warningSound) warningSound.volume = 0;
    } else {
        if (shootSound) shootSound.volume = clampVolume(1.0 * globalVolume);
        if (explosionSound) explosionSound.volume = clampVolume(1.0 * globalVolume);
        if (collisionSound) collisionSound.volume = clampVolume(1.0 * globalVolume);
        if (levelUpSound) levelUpSound.volume = clampVolume(1.0 * globalVolume);
        if (warningSound) warningSound.volume = clampVolume(1.0 * globalVolume);
    }
}

// 안전한 사운드 재생 함수 (종이비행기용과 동일)
function safePlaySound(soundElement, volume = null) {
    if (!soundElement) {
        return; // 사운드 요소가 없으면 재생하지 않음
    }
    
    try {
        if (volume !== null) {
            soundElement.volume = clampVolume(volume);
            applyGlobalVolume();
        }
        soundElement.currentTime = 0;
        soundElement.play().catch(error => {
            console.log('사운드 재생 실패:', error);
        });
    } catch (error) {
        console.log('사운드 재생 중 오류:', error);
    }
}

// 폭발 효과음 재생을 위한 전용 함수 (중복 재생 방지)
let lastExplosionSoundTime = 0;
const explosionSoundCooldown = 200; // 200ms 쿨다운

function playExplosionSoundSafe(volume = 1.0, isBoss = false) {
    if (!explosionSound) return;
    
    const currentTime = Date.now();
    if (currentTime - lastExplosionSoundTime < explosionSoundCooldown) {
        return; // 쿨다운 중이면 재생하지 않음
    }
    
    try {
        explosionSound.currentTime = 0;
        explosionSound.volume = clampVolume(volume);
        explosionSound.play().catch(error => {
            console.log('폭발음 재생 실패:', error);
        });
        lastExplosionSoundTime = currentTime;
    } catch (error) {
        console.log('폭발음 재생 중 오류:', error);
    }
}

// 사운드 설정 (종이비행기용과 동일한 볼륨 설정)
applyGlobalVolume();

// 충돌 사운드 길이 제어
collisionSound.addEventListener('loadedmetadata', () => {
    // 사운드 길이를 0.8초로 제한
    collisionSound.duration = Math.min(collisionSound.duration, 0.8);
});

// 플레이어 우주선
const player = {
    x: canvas.width / 2 - (240 * 0.7 * 0.7 * 0.8 * 0.9) / 2, // 중앙 정렬 (90% 크기에 맞춤)
    y: canvas.height - 100, // 모바일 컨트롤 영역을 고려하여 더 위로 배치 (120에서 100으로 조정)
    width: 240 * 0.7 * 0.7 * 0.8 * 0.9,   // 폭을 80%에서 90%로 추가 축소
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
let levelUpScore = 1500;  // 레벨업에 필요한 점수
let score = 0;           // 현재 점수
let highScore = 0;       // 최고 점수 (초기값 0으로 설정)
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
let specialWeaponStock = 0;  // 특수무기 보유 개수
let enemySpawnRate = 2000;  // 적 생성 주기 (ms)
let enemySpeed = 2 * mobileSpeedMultiplier;  // 적 이동 속도

// 보호막 헬리콥터 파괴 관련 변수 추가
let shieldedHelicopterDestroyed = 0;  // 보호막 헬리콥터 파괴 수 (1대마다 목숨 추가)
let livesAddedFromHelicopters = 0;    // 헬리콥터 파괴로 추가된 목숨 수

// 목숨 추가 메시지 표시 관련 변수
let lifeAddedMessage = '';
let lifeAddedMessageTimer = 0;
// 목숨 감소 경고 플래시 타이밍
let lifeWarningFlashEndTime = 0;
const LIFE_ADDED_MESSAGE_DURATION = 3000; // 3초간 표시

// 통합된 목숨 증가 함수
function addLives(amount, reason, enemy = null) {
    console.log(`🎉 목숨 ${amount}개 추가 시작: ${reason}`, {
        before: maxLives,
        amount: amount,
        reason: reason,
        enemyId: enemy ? enemy.id : 'N/A',
        enemyLifeAdded: enemy ? enemy.lifeAdded : 'N/A',
        timestamp: new Date().toISOString()
    });
    
    maxLives += amount;
    
    // 목숨 추가 메시지 설정
    lifeAddedMessage = `🎉 ${reason}! 목숨 ${amount}개 추가됨! 🎉`;
    lifeAddedMessageTimer = Date.now();
    
    // 목숨 추가 효과음 재생 (보스/보호막 헬리콥터 파괴 시 폭발 효과음, 그 외 레벨업 효과음)
    if (reason.includes('보스') || reason.includes('보호막 헬리콥터')) {
        // 보스나 보호막 헬리콥터 파괴 시 폭발 효과음 (볼륨 2배)
        playExplosionSoundSafe(1.0, true);
    } else {
        // 일반 목숨 추가 시 레벨업 효과음
        safePlay(levelUpSound);
    }
    
    console.log(`🎉 목숨 추가 완료: ${maxLives}개 (${amount}개 증가) - ${reason}`, {
        after: maxLives,
        increase: amount,
        reason: reason,
        timestamp: new Date().toISOString()
    });
}

// 보스 패턴 상수는 아래에서 정의됨

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
    },
    6: {
        enemySpeed: 3.5,
        enemySpawnRate: 0.8,
        maxEnemies: 9,
        enemyHealth: 6,
        patternChance: 0.8,
        fireInterval: 1000,
        bombDropChance: 0.7,
        bulletSpeed: 9,
        specialPatternChance: 0.6
    },
    7: {
        enemySpeed: 4,        // 레벨7에서 속도 제한 시작
        enemySpawnRate: 0.85,
        maxEnemies: 10,
        enemyHealth: 7,
        patternChance: 0.85,
        fireInterval: 800,
        bombDropChance: 0.75,
        bulletSpeed: 10,      // 총알 속도 제한
        specialPatternChance: 0.7
    },
    8: {
        enemySpeed: 4,        // 속도 제한 (4로 고정)
        enemySpawnRate: 0.85, // 레벨 7과 동일하게 제한
        maxEnemies: 10,       // 레벨 7과 동일하게 제한
        enemyHealth: 7,       // 레벨 7과 동일하게 제한
        patternChance: 0.85,  // 레벨 7과 동일하게 제한
        fireInterval: 800,    // 레벨 7과 동일하게 제한
        bombDropChance: 0.75, // 레벨 7과 동일하게 제한
        bulletSpeed: 10,      // 총알 속도 제한 (10으로 고정)
        specialPatternChance: 0.7 // 레벨 7과 동일하게 제한
    },
    9: {
        enemySpeed: 4,        // 속도 제한 (4로 고정)
        enemySpawnRate: 0.85, // 레벨 7과 동일하게 제한
        maxEnemies: 10,       // 레벨 7과 동일하게 제한
        enemyHealth: 7,       // 레벨 7과 동일하게 제한
        patternChance: 0.85,  // 레벨 7과 동일하게 제한
        fireInterval: 800,    // 레벨 7과 동일하게 제한
        bombDropChance: 0.75, // 레벨 7과 동일하게 제한
        bulletSpeed: 10,      // 총알 속도 제한 (10으로 고정)
        specialPatternChance: 0.7 // 레벨 7과 동일하게 제한
    },
    10: {
        enemySpeed: 4,        // 속도 제한 (4로 고정)
        enemySpawnRate: 0.85, // 레벨 7과 동일하게 제한
        maxEnemies: 10,       // 레벨 7과 동일하게 제한
        enemyHealth: 7,       // 레벨 7과 동일하게 제한
        patternChance: 0.85,  // 레벨 7과 동일하게 제한
        fireInterval: 800,    // 레벨 7과 동일하게 제한
        bombDropChance: 0.75, // 레벨 7과 동일하게 제한
        bulletSpeed: 10,      // 총알 속도 제한 (10으로 고정)
        specialPatternChance: 0.7 // 레벨 7과 동일하게 제한
    },
    11: {
        enemySpeed: 4,        // 속도 제한 (4로 고정)
        enemySpawnRate: 0.85, // 레벨 7과 동일하게 제한
        maxEnemies: 10,       // 레벨 7과 동일하게 제한
        enemyHealth: 7,       // 레벨 7과 동일하게 제한
        patternChance: 0.85,  // 레벨 7과 동일하게 제한
        fireInterval: 800,    // 레벨 7과 동일하게 제한
        bombDropChance: 0.75, // 레벨 7과 동일하게 제한
        bulletSpeed: 10,      // 총알 속도 제한 (10으로 고정)
        specialPatternChance: 0.7 // 레벨 7과 동일하게 제한
    },
    12: {
        enemySpeed: 4,        // 속도 제한 (4로 고정)
        enemySpawnRate: 0.85, // 레벨 7과 동일하게 제한
        maxEnemies: 10,       // 레벨 7과 동일하게 제한
        enemyHealth: 7,       // 레벨 7과 동일하게 제한
        patternChance: 0.85,  // 레벨 7과 동일하게 제한
        fireInterval: 800,    // 레벨 7과 동일하게 제한
        bombDropChance: 0.75, // 레벨 7과 동일하게 제한
        bulletSpeed: 10,      // 총알 속도 제한 (10으로 고정)
        specialPatternChance: 0.7 // 레벨 7과 동일하게 제한
    },
    13: {
        enemySpeed: 4,        // 속도 제한 (4로 고정)
        enemySpawnRate: 0.85, // 레벨 7과 동일하게 제한
        maxEnemies: 10,       // 레벨 7과 동일하게 제한
        enemyHealth: 7,       // 레벨 7과 동일하게 제한
        patternChance: 0.85,  // 레벨 7과 동일하게 제한
        fireInterval: 800,    // 레벨 7과 동일하게 제한
        bombDropChance: 0.75, // 레벨 7과 동일하게 제한
        bulletSpeed: 10,      // 총알 속도 제한 (10으로 고정)
        specialPatternChance: 0.7 // 레벨 7과 동일하게 제한
    },
    14: {
        enemySpeed: 4,        // 속도 제한 (4로 고정)
        enemySpawnRate: 0.85, // 레벨 7과 동일하게 제한
        maxEnemies: 10,       // 레벨 7과 동일하게 제한
        enemyHealth: 7,       // 레벨 7과 동일하게 제한
        patternChance: 0.85,  // 레벨 7과 동일하게 제한
        fireInterval: 800,    // 레벨 7과 동일하게 제한
        bombDropChance: 0.75, // 레벨 7과 동일하게 제한
        bulletSpeed: 10,      // 총알 속도 제한 (10으로 고정)
        specialPatternChance: 0.7 // 레벨 7과 동일하게 제한
    },
    15: {
        enemySpeed: 4,        // 속도 제한 (4로 고정)
        enemySpawnRate: 0.85, // 레벨 7과 동일하게 제한
        maxEnemies: 10,       // 레벨 7과 동일하게 제한
        enemyHealth: 7,       // 레벨 7과 동일하게 제한
        patternChance: 0.85,  // 레벨 7과 동일하게 제한
        fireInterval: 800,    // 레벨 7과 동일하게 제한
        bombDropChance: 0.75, // 레벨 7과 동일하게 제한
        bulletSpeed: 10,      // 총알 속도 제한 (10으로 고정)
        specialPatternChance: 0.7 // 레벨 7과 동일하게 제한
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
                // localStorage에 저장
                await saveHighScoreDirectly(highScore, 'ScoreManager.save');
            }
        } catch (error) {
            console.error('점수 저장 실패:', error);
        }
    },

    async getHighScore() {
        try {
            // localStorage에서 로드
            return await loadHighScore();
        } catch (error) {
            console.error('최고 점수 로드 실패:', error);
            return 0;
        }
    },

    async reset() {
        try {
            // localStorage 초기화
            localStorage.removeItem('ThunderboltHighScore');
            localStorage.removeItem('ThunderboltHighScore_backup');
            localStorage.removeItem('ThunderboltHighScore_timestamp');
            sessionStorage.removeItem('ThunderboltCurrentHighScore');
            
            score = 0;
            levelScore = 0;
            scoreForSpread = 0;
            gameLevel = 1;
            levelUpScore = 1500; // 레벨업 기준 점수 초기화
            
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
        levelUpScore = 1500; // 레벨업 기준 점수 초기화
        scoreForSpread = 0;
        gameStarted = false; // 화면 터치 대기 상태
        isStartScreen = true;
        
        // 모든 투사체 및 폭발물 완전 초기화
        bullets = [];
        enemies = [];
        explosions = [];
        bombs = [];
        dynamites = [];
        helicopterBullets = [];
        bossBullets = [];
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
        
        // 보호막 헬리콥터 관련 변수 초기화
        shieldedHelicopterDestroyed = 0;
        livesAddedFromHelicopters = 0;
        
        // 목숨 추가 메시지 관련 변수 초기화
        lifeAddedMessage = '';
        lifeAddedMessageTimer = 0;
        
        // 특수무기 관련 상태 초기화
        specialWeaponCharged = false;
        specialWeaponCharge = 0;
        specialWeaponStock = 0;  // 특수무기 보유 개수 초기화
        
        // 보스 관련 상태 초기화
        bossActive = false;
        isBossActive = false;
        bossHealth = 0;
        bossDestroyed = false;
        lastBossSpawnTime = Date.now();
        
        // 플레이어 초기 위치 설정
        player.x = canvas.width / 2 - (240 * 0.7 * 0.7 * 0.8 * 0.9) / 2;
        player.y = canvas.height - 100; // 모바일 컨트롤 영역을 고려하여 더 위로 배치 (120에서 100으로 조정)
        secondPlane.x = canvas.width / 2 - 60;
        secondPlane.y = canvas.height - 100; // 모바일 컨트롤 영역을 고려하여 더 위로 배치
        
        // 적 생성 타이머 초기화 - 즉시 적들이 생성되도록
        lastEnemySpawnTime = 0;
        lastHelicopterSpawnTime = 0;
        
        // 파워업 상태 초기화
        window.cooldownCompletedTime = 0; // 추가 비행기 쿨다운 완료 시간 초기화
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
    secondPlaneTimer = 0; // 두 번째 비행기 타이머 초기화
    
    // 특수무기 관련 상태 초기화
    specialWeaponCharged = false;
    specialWeaponCharge = 0;
    specialWeaponStock = 0;  // 특수무기 보유 개수 초기화
    
    // 두 번째 비행기 관련 전역 변수도 초기화
    if (window.lastSecondPlaneScore) {
        window.lastSecondPlaneScore = 0;
    }
    
    // 두 번째 비행기 소멸 플래그 초기화
    if (window.secondPlaneExpired) {
        window.secondPlaneExpired = false;
    }
    if (window.secondPlaneExpireTime) {
        window.secondPlaneExpireTime = null;
    }
    
    // 전역 변수 강제 초기화 (안전장치)
    window.lastSecondPlaneScore = 0;
    window.secondPlaneExpired = false;
    window.secondPlaneExpireTime = null;
    
    // 추가 비행기 상태 고정 변수 초기화
    window.secondPlaneAcquired = false;
    window.secondPlaneAcquireTime = null;
    
    // 두 번째 비행기 쿨다운 상태 초기화
    isSecondPlaneOnCooldown = false;
    secondPlaneCooldownTimer = 0;
    
    
    // 로그 타이머 초기화
    if (window.lastBlockLogTime) {
        window.lastBlockLogTime = 0;
    }
    
    // 두 번째 비행기 소멸 플래그 완전 초기화
    if (window.secondPlaneExpired) {
        window.secondPlaneExpired = false;
    }
    if (window.secondPlaneExpireTime) {
        window.secondPlaneExpireTime = null;
    }
    
    // 모든 투사체 및 폭발물 완전 초기화
    enemies = [];
    bullets = [];
    explosions = [];
    bombs = [];
    dynamites = [];
    helicopterBullets = [];
    bossBullets = [];
    enemyBullets = [];
    collisionEffects = [];
    
    // 보스 관련 상태 완전 초기화
    bossActive = false;
    isBossActive = false;
    bossHealth = 0;
    bossDestroyed = false;
    bossPattern = 0;
    bossTimer = 0;
    lastBossSpawnTime = Date.now();
    
    // 보호막 헬리콥터 관련 변수 초기화
    shieldedHelicopterDestroyed = 0;
    livesAddedFromHelicopters = 0;
    
    // 목숨 추가 메시지 관련 변수 초기화
    lifeAddedMessage = '';
    lifeAddedMessageTimer = 0;
    
    // 플레이어 위치 초기화
    player.x = canvas.width / 2 - (240 * 0.7 * 0.7 * 0.8 * 0.9) / 2;
    player.y = canvas.height - 100; // 모바일 컨트롤 영역을 고려하여 더 위로 배치
    secondPlane.x = canvas.width / 2 - 60;
    secondPlane.y = canvas.height - 120; // 모바일 컨트롤 영역을 고려하여 더 위로 배치
    gameOverStartTime = null;
    
    // 현재 점수만 초기화 (최고 점수는 유지)
    score = 0;
    levelScore = 0;
    scoreForSpread = 0;
    gameLevel = 1;
            levelUpScore = 1500; // 레벨업 기준 점수 초기화
    
    // 특수무기 관련 상태 초기화
    specialWeaponCharged = false;
    specialWeaponCharge = 0;
    specialWeaponStock = 0;  // 특수무기 보유 개수 초기화
    
    // 파워업 상태 초기화
    window.cooldownCompletedTime = 0; // 추가 비행기 쿨다운 완료 시간 초기화
    hasShield = false;
    damageMultiplier = 1;
    fireRateMultiplier = 1;
    
    // 보스 관련 상태 초기화
    bossActive = false;
    bossHealth = 0;
    bossDestroyed = false;
    lastBossSpawnTime = Date.now();
    
    // 시작 화면으로 돌아가지 않고 바로 게임 화면으로 전환 (터치 대기)
    isStartScreen = false;
    gameStarted = false; // 화면 터치 대기 상태
    
    // ... 나머지 초기화 코드는 동일 ...
    
    console.log('게임 재시작 완료 - 현재 최고 점수:', highScore);
}

// 적 생성 함수 수정 - 화면 상단에서 등장하도록 개선
function createEnemy(forceType = null) {
    // 레벨 5 이상일 때는 레벨 5의 난이도로 고정 (모든 속성 증가 제한)
    let currentDifficulty;
    if (gameLevel <= 4) {
        currentDifficulty = difficultySettings[gameLevel] || difficultySettings[1];
    } else {
        // 레벨 5 이상: 모든 속성을 레벨 5와 동일하게 고정 (증가 제한)
        currentDifficulty = difficultySettings[5];
        
        console.log(`createEnemy - 레벨 ${gameLevel}: 레벨 5 난이도로 고정 (속도: ${currentDifficulty.enemySpeed}, 적 수: ${currentDifficulty.maxEnemies}, 생성률: ${currentDifficulty.enemySpawnRate})`);
    }
    
    // 강제 타입이 지정된 경우 해당 타입으로 생성, 그렇지 않으면 기존 로직 사용
    if (forceType) {
        if (forceType === 'PLANE') {
            // 일반 비행기 강제 생성
            const enemy = {
                x: Math.random() * (canvas.width - 72), // 72 크기에 맞게 여백 조정
                y: -72,  // 화면 상단에서 시작 (72 크기에 맞게 조정)
                width: 72,  // 원래 크기로 복구
                height: 72, // 원래 크기로 복구
                speed: currentDifficulty.enemySpeed,
                type: ENEMY_TYPES.PLANE,
                health: currentDifficulty.enemyHealth,
                score: gameLevel <= 4 ? 10 : 12, // 일반 비행기: 레벨 4 이하 10점, 레벨 5 이상 12점 (제한)
                isElite: Math.random() < (gameLevel <= 4 ? (0.05 + (gameLevel * 0.02)) : 0.15), // 레벨 5 이상에서는 엘리트 확률 제한
                specialAbility: Math.random() < (gameLevel <= 4 ? (0.1 + (gameLevel * 0.03)) : 0.25) ? getRandomSpecialAbility() : null, // 레벨 5 이상에서는 특수 능력 확률 제한
                hasShield: false, // 일반 비행기는 보호막 없음
                canFire: false, // 초기에는 발사 불가능
                    lastFireTime: Date.now() - (gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval), // 즉시 발사 가능하도록 설정
                fireInterval: currentDifficulty.fireInterval,
                entryStartTime: Date.now(), // 진입 시작 시간 추가
                entryDelay: 1000 + Math.random() * 2000,
                canDropBomb: Math.random() < currentDifficulty.bombDropChance,
                lastBombDrop: 0,
                bombDropInterval: 3000,
                bombCount: 3,
                bulletCount: 3,
                bulletSpeed: currentDifficulty.bulletSpeed
            };

            // 엘리트 적 보너스 (레벨 5 이상에서는 제한)
            if (enemy.isElite) {
                // 레벨 5 이상에서는 체력 증가 제한
                if (gameLevel <= 4) {
                    enemy.health *= (1.5 + (gameLevel * 0.2));
                    enemy.speed *= 1.2;
                } else {
                    enemy.health *= 1.5; // 레벨 5 이상에서는 기본 보너스만
                }
                // 엘리트 보너스 점수 비활성화
                // enemy.score *= 2;
            }

            enemies.push(enemy);
            console.log('강제 일반 비행기 생성됨:', enemy);
            return;
        } else if (forceType === 'HELICOPTER') {
            // 현재 보호막 헬리콥터 수 확인 (보스 제외)
            const currentShieldedHelicopters = enemies.filter(enemy => 
                (enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) && 
                enemy.hasShield && !enemy.isShieldBroken && !enemy.isBoss
            ).length;
            
            // 현재 일반 비행기 수 확인 (보스 제외)
            const currentNormalPlanes = enemies.filter(enemy => 
                enemy.type === ENEMY_TYPES.PLANE && !enemy.isBoss
            ).length;
            
            const totalEnemies = currentShieldedHelicopters + currentNormalPlanes;
            
            // 6대 제한 체크 (보스 제외)
            if (totalEnemies >= 6) {
                console.log(`강제 헬리콥터 생성 제한: 현재 총 적 수 ${totalEnemies}/6으로 인해 생성 불가`);
                return;
            }
            
            // 보호막 헬리콥터 강제 생성
            const isHelicopter2 = Math.random() < 0.5;  // 50% 확률로 helicopter2 생성
            
            // 화면을 4개 구역으로 나누어 헬리콥터들이 겹치지 않도록 위치 조정
            const screenWidth = canvas.width;
            const screenHeight = canvas.height;
            const zoneWidth = screenWidth / 4;
            const zoneHeight = screenHeight / 4;
            
            // 현재 생성되는 헬리콥터의 구역을 랜덤하게 선택
            const zoneX = Math.floor(Math.random() * 4);
            const zoneY = Math.floor(Math.random() * 4);
            
            // 선택된 구역 내에서 랜덤한 위치 계산 (구역 경계를 벗어나지 않도록)
            const x = Math.max(0, Math.min(screenWidth - 48, zoneX * zoneWidth + Math.random() * (zoneWidth - 48)));
            const y = -48 - Math.random() * 150; // 화면 상단에서 0-150px 높이 차이
            
            if (isHelicopter2) {
                // 헬리콥터2(오렌지계열) 생성
                const enemy = {
                    x: x,
                    y: y,  // 화면 상단에서 시작 (높이 차이 있음)
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
                    lastFireTime: Date.now() - (gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval), // 즉시 발사 가능하도록 설정
                    fireInterval: gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval, // 레벨 10 이상에서는 기본 발사 간격 유지
                    fireCooldown: gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval, // 헬리콥터 전용 발사 간격
                    bulletSpeed: currentDifficulty.bulletSpeed,
                    health: currentDifficulty.enemyHealth,
                    score: gameLevel <= 10 ? 20 : 25, // 헬리콥터2: 레벨 10 이하 20점, 레벨 10 이상 25점
                    isElite: Math.random() < (gameLevel <= 10 ? (0.05 + (gameLevel * 0.02)) : 0.25), // 레벨 10 이상에서는 엘리트 확률 제한
                    specialAbility: Math.random() < (gameLevel <= 10 ? (0.1 + (gameLevel * 0.03)) : 0.4) ? getRandomSpecialAbility() : null, // 레벨 10 이상에서는 특수 능력 확률 제한
                    // 보호막 시스템 추가
                    hasShield: true,
                    shieldHealth: 100, // 100발 맞으면 파괴
                    shieldHitCount: 0,
                    shieldColor: '#FFA500', // 헬리콥터2(오렌지계열) 보호막 색상
                    isShieldBroken: false,
                    lifeAddedFromHelicopter: false, // 목숨 추가 플래그 초기화
                };

                // 엘리트 적 보너스 (속도, 발사 간격, 체력은 제한)
                if (enemy.isElite) {
                    // 레벨 10 이상에서는 체력 증가 제한
                    if (gameLevel <= 10) {
                        enemy.health *= (1.5 + (gameLevel * 0.2));
                        enemy.speed *= 1.2;
                        enemy.bulletSpeed *= 1.2;
                        enemy.fireInterval *= 0.8;
                    } else {
                        enemy.health *= 1.5; // 레벨 10 이상에서는 기본 보너스만
                    }
                    // 엘리트 보너스 점수 비활성화
                    // enemy.score *= 2;
                }

                enemies.push(enemy);
                console.log('강제 헬리콥터2(오렌지계열) 생성됨:', enemy);
                return;
            } else {
                // 헬리콥터1(블루계열) 생성
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
                    canFire: true,
                    lastFireTime: Date.now() - (gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval), // 즉시 발사 가능하도록 설정
                    fireInterval: gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval, // 레벨 10 이상에서는 기본 발사 간격 유지
                    fireCooldown: gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval, // 헬리콥터 전용 발사 간격
                    bulletSpeed: currentDifficulty.bulletSpeed,
                    health: currentDifficulty.enemyHealth,
                    score: gameLevel <= 10 ? 20 : 25, // 헬리콥터1: 레벨 10 이하 20점, 레벨 10 이상 25점
                    isElite: Math.random() < (gameLevel <= 10 ? (0.05 + (gameLevel * 0.02)) : 0.25), // 레벨 10 이상에서는 엘리트 확률 제한
                    specialAbility: Math.random() < (gameLevel <= 10 ? (0.1 + (gameLevel * 0.03)) : 0.4) ? getRandomSpecialAbility() : null, // 레벨 10 이상에서는 특수 능력 확률 제한
                    // 보호막 시스템 추가
                    hasShield: true,
                    shieldHealth: 100, // 100발 맞으면 파괴
                    shieldHitCount: 0,
                    shieldColor: '#008B8B', // 헬리콥터1(블루계열) 보호막 색상
                    isShieldBroken: false,
                    lifeAddedFromHelicopter: false, // 목숨 추가 플래그 초기화
                };

                // 엘리트 적 보너스 (속도, 발사 간격, 체력은 제한)
                if (helicopter.isElite) {
                    // 레벨 10 이상에서는 체력 증가 제한
                    if (gameLevel <= 10) {
                        helicopter.health *= (1.5 + (gameLevel * 0.2));
                        helicopter.speed *= 1.2;
                        helicopter.bulletSpeed *= 1.2;
                        helicopter.fireInterval *= 0.8;
                    } else {
                        helicopter.health *= 1.5; // 레벨 10 이상에서는 기본 보너스만
                    }
                    // 엘리트 보너스 점수 비활성화
                    // helicopter.score *= 2;
                }

                enemies.push(helicopter);
                console.log('강제 헬리콥터1(블루계열) 생성됨:', helicopter);
                return;
            }
        }
    }
    
    // 기존 로직: 강제 타입이 지정되지 않은 경우
    // 헬리콥터 출현 비율을 레벨에 따라 조정 (레벨 10 이상에서는 제한)
    const helicopterChance = gameLevel <= 10 ? (0.3 + (gameLevel * 0.05)) : 0.8;
    const isHelicopter = Math.random() < helicopterChance;
    
    if (!isBossActive && isHelicopter) {
        // 현재 보호막 헬리콥터 수 확인 (보스 제외)
        const currentShieldedHelicopters = enemies.filter(enemy => 
            (enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) && 
            enemy.hasShield && !enemy.isShieldBroken && !enemy.isBoss
        ).length;
        
        // 현재 일반 비행기 수 확인 (보스 제외)
        const currentNormalPlanes = enemies.filter(enemy => 
            enemy.type === ENEMY_TYPES.PLANE && !enemy.isBoss
        ).length;
        
        const totalEnemies = currentShieldedHelicopters + currentNormalPlanes;
        
        // 6대 제한 체크 (보스 제외)
        if (totalEnemies >= 6) {
            console.log(`일반 헬리콥터 생성 제한: 현재 총 적 수 ${totalEnemies}/6으로 인해 생성 불가`);
            return;
        }
        // 화면을 4개 구역으로 나누어 헬리콥터들이 겹치지 않도록 위치 조정
        const screenWidth = canvas.width;
        const screenHeight = canvas.height;
        const zoneWidth = screenWidth / 4;
        const zoneHeight = screenHeight / 4;
        
        // 현재 생성되는 헬리콥터의 구역을 랜덤하게 선택
        const zoneX = Math.floor(Math.random() * 4);
        const zoneY = Math.floor(Math.random() * 4);
        
        // 선택된 구역 내에서 랜덤한 위치 계산 (구역 경계를 벗어나지 않도록)
        const x = Math.max(0, Math.min(screenWidth - 48, zoneX * zoneWidth + Math.random() * (zoneWidth - 48)));
        const y = -48 - Math.random() * 150; // 화면 상단에서 0-150px 높이 차이
        
        // 일반 헬리콥터와 helicopter2 중에서 선택
        const isHelicopter2 = Math.random() < 0.5;  // 50% 확률로 helicopter2 생성
        
        if (isHelicopter2) {
            // 헬리콥터2(오렌지계열) 생성
            const enemy = {
                x: x,
                y: y,  // 화면 상단에서 시작 (높이 차이 있음)
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
                    lastFireTime: Date.now() - (gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval), // 즉시 발사 가능하도록 설정
                fireInterval: gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval, // 레벨 10 이상에서는 기본 발사 간격 유지
                bulletSpeed: currentDifficulty.bulletSpeed,
                health: currentDifficulty.enemyHealth,
                score: gameLevel <= 10 ? 50 * gameLevel : 500, // 헬리콥터2: 레벨 10 이상에서는 점수 제한
                isElite: Math.random() < (gameLevel <= 10 ? (0.05 + (gameLevel * 0.02)) : 0.25), // 레벨 10 이상에서는 엘리트 확률 제한
                specialAbility: Math.random() < (gameLevel <= 10 ? (0.1 + (gameLevel * 0.03)) : 0.4) ? getRandomSpecialAbility() : null, // 레벨 10 이상에서는 특수 능력 확률 제한
                // 보호막 시스템 추가
                hasShield: true,
                shieldHealth: 100, // 100발 맞으면 파괴
                shieldHitCount: 0,
                shieldColor: '#FFA500', // 헬리콥터2(오렌지계열) 보호막 색상
                isShieldBroken: false,
                lifeAddedFromHelicopter: false, // 목숨 추가 플래그 초기화
            };

            // 엘리트 적 보너스 (속도, 발사 간격, 체력은 제한)
            if (enemy.isElite) {
                // 레벨 10 이상에서는 체력 증가 제한
                if (gameLevel <= 10) {
                    enemy.health *= (1.5 + (gameLevel * 0.2));
                    enemy.speed *= 1.2;
                    enemy.bulletSpeed *= 1.2;
                    enemy.fireInterval *= 0.8;
                } else {
                    enemy.health *= 1.5; // 레벨 10 이상에서는 기본 보너스만
                }
                // 엘리트 보너스 점수 비활성화
                // enemy.score *= 2;
            }

            enemies.push(enemy);
            console.log('헬리콥터2(오렌지계열) 생성됨:', enemy);
            return;
        } else {
                            // 헬리콥터1(블루계열) 생성
            const helicopter = {
                x: x,
                y: y,  // 화면 상단에서 시작 (높이 차이 있음)
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
                canFire: true,
                    lastFireTime: Date.now() - (gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval), // 즉시 발사 가능하도록 설정
                fireInterval: gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval,
                bulletSpeed: currentDifficulty.bulletSpeed,
                health: currentDifficulty.enemyHealth,
                score: gameLevel <= 10 ? 20 : 25, // 헬리콥터1: 레벨 10 이하 20점, 레벨 10 이상 25점
                isElite: Math.random() < (gameLevel <= 10 ? (0.05 + (gameLevel * 0.02)) : 0.25),
                specialAbility: Math.random() < (gameLevel <= 10 ? (0.1 + (gameLevel * 0.03)) : 0.4) ? getRandomSpecialAbility() : null,
                // 보호막 시스템 추가
                hasShield: true,
                shieldHealth: 100,
                shieldHitCount: 0,
                shieldColor: '#008B8B', // 헬리콥터1(블루계열) 보호막 색상
                isShieldBroken: false,
                lifeAddedFromHelicopter: false, // 목숨 추가 플래그 초기화
            };

            // 엘리트 헬리콥터 보너스 (속도는 제한)
            if (helicopter.isElite) {
                helicopter.health *= (1.5 + (gameLevel * 0.2));
                // 레벨 10 이상에서는 속도 증가 제한
                if (gameLevel <= 10) {
                    helicopter.speed *= 1.2;
                    helicopter.bulletSpeed *= 1.2;
                }
                // 엘리트 보너스 점수 비활성화
                // helicopter.score *= 2;
                helicopter.bombDropInterval *= 0.8;
            }

            enemies.push(helicopter);
            console.log('강제 헬리콥터1(블루계열) 생성됨:', helicopter);
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
        canFire: false, // 초기에는 발사 불가능
                    lastFireTime: Date.now() - (gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval), // 즉시 발사 가능하도록 설정
        fireInterval: currentDifficulty.fireInterval,
        entryStartTime: Date.now(), // 진입 시작 시간 추가
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
        score: gameLevel <= 10 ? 10 : 20, // 일반 비행기: 레벨 10 이하 10점, 레벨 10 이상 20점
        isElite: Math.random() < (gameLevel <= 10 ? (0.05 + (gameLevel * 0.02)) : 0.25), // 레벨 10 이상에서는 엘리트 확률 제한
        specialAbility: Math.random() < (gameLevel <= 10 ? (0.1 + (gameLevel * 0.03)) : 0.4) ? getRandomSpecialAbility() : null, // 레벨 10 이상에서는 특수 능력 확률 제한
    };

    // 엘리트 적 보너스 (속도, 발사 간격, 체력은 제한)
    if (enemy.isElite) {
        // 레벨 10 이상에서는 체력 증가 제한
        if (gameLevel <= 10) {
            enemy.health *= (1.5 + (gameLevel * 0.2));
            enemy.speed *= 1.2;
            enemy.bulletSpeed *= 1.2;
            enemy.fireInterval *= 0.8;
        } else {
            enemy.health *= 1.5; // 레벨 10 이상에서는 기본 보너스만
        }
        // 엘리트 보너스 점수 비활성화
        // enemy.score *= 2;
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
            // 플레이어 충돌 시 경고음 재생
            safePlay(warningSound);
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
            // entryStartTime이 설정되지 않은 경우 현재 시간으로 설정
            if (!enemy.entryStartTime) {
                enemy.entryStartTime = currentTime;
            }
            
            // 비행기가 화면에 진입한 후 일정 시간이 지나면 발사 가능하도록 설정
            if (!enemy.canFire && enemy.y >= 0) {
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

// 적 비행기 총알 발사 함수 (미사일 제거, 총알 2발씩 발사)
function fireEnemyBullet(enemy) {
    // 현재 화면에 있는 총알 개수 제한 (성능 최적화)
    if (enemyBullets.length > 20) {
        console.log('적 총알 개수 제한: 20개로 제한됨');
        return; // 총알이 너무 많으면 발사 중단
    }
    
    // 미사일 발사 제거, 총알만 2발씩 발사
    const leftX = enemy.x + enemy.width * 0.18;
    const rightX = enemy.x + enemy.width * 0.82;
    const bulletY = enemy.y + enemy.height;
    
    // 왼쪽 총알 발사
    enemyBullets.push({
        x: leftX,
        y: bulletY,
        width: 8,
        height: 18,
        speed: enemy.bulletSpeed
    });
    
    // 오른쪽 총알 발사
    enemyBullets.push({
        x: rightX,
        y: bulletY,
        width: 8,
        height: 18,
        speed: enemy.bulletSpeed
    });
}

// 미사일 궤적 그리기 함수
function drawMissileTrail(missile) {
    // 위쪽(0 라디안)으로 향하도록
    drawTaurusMissile(ctx, missile.x, missile.y, missile.width, missile.height, 0);
}

// 적 비행기 미사일 처리 함수 (비활성화 - 미사일 발사 제거됨)
function handleEnemyMissiles() {
    // 미사일 발사가 제거되었으므로 이 함수는 비활성화됨
    // 적 비행기는 이제 총알만 2발씩 발사함
    return;
}

// 적 위치 업데이트 함수 수정
function updateEnemyPosition(enemy, options = {}) {
    if (!enemy) return;
    
    // 🚨 보스는 별도의 움직임 로직을 사용하므로 여기서는 위치 변경하지 않음
    if (enemy.isBoss) {
        // 보스의 경우 로터 회전만 업데이트하고 위치는 변경하지 않음
        if (typeof enemy.rotorAngle !== 'undefined' && typeof enemy.rotorSpeed !== 'undefined') {
            enemy.rotorAngle += enemy.rotorSpeed;
        }
        return; // 보스의 위치 변경은 별도 로직에서 처리
    }

    const currentTime = Date.now();
    const deltaTime = currentTime - enemy.lastUpdateTime;
    enemy.lastUpdateTime = currentTime;
    
    // 레벨 5 이상일 때는 레벨 5의 난이도로 고정 (모든 속성 증가 제한)
    let currentDifficulty;
    if (gameLevel <= 4) {
        currentDifficulty = difficultySettings[gameLevel] || difficultySettings[1];
    } else {
        // 레벨 5 이상: 모든 속성을 레벨 5와 동일하게 고정 (증가 제한)
        currentDifficulty = difficultySettings[5];
    }

    // 헬리콥터 처리 (보스 포함)
    if (enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) {
        // 헬리콥터 특수 움직임 (보스 포함 모든 헬리콥터의 로터 회전)
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
        
        // 헬리콥터 총알 발사 (보스가 아닌 경우에만)
        if (!enemy.isBoss) {
            if (!enemy.fireCooldown) enemy.fireCooldown = gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval; // 헬리콥터 전용 발사 간격
            if (!enemy.lastFireTime) enemy.lastFireTime = Date.now() - enemy.fireCooldown; // 즉시 발사 가능하도록 설정
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
                    isBossBullet: false
                });
                enemy.lastFireTime = currentTime;
                enemy.fireCooldown = gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval; // 헬리콥터 전용 발사 간격으로 재설정
                if (options) options.helicopterFiredThisFrame = true;
            }
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

// 데미지 텍스트 표시 함수
function drawDamageText(x, y, damage) {
    const damageText = {
        x: x,
        y: y,
        damage: damage,
        life: 60, // 60프레임 동안 표시
        alpha: 1.0,
        offsetY: 0
    };
    
    // 데미지 텍스트 배열에 추가
    if (!window.damageTexts) {
        window.damageTexts = [];
    }
    window.damageTexts.push(damageText);
}

// 충돌 처리 함수 수정
function handleCollision() {
    // 상단 효과 무시 영역 체크
    if (player.y < TOP_EFFECT_ZONE) {
        return;
    }
    
    // 플레이어 충돌 시 경고음 재생
    safePlay(warningSound);
    try {
        if (hasShield) {
            hasShield = false;
            return;
        }
        
        const currentTime = Date.now();
        const livesBefore = maxLives - collisionCount;
        collisionCount++;
        flashTimer = flashDuration;
        
        // 목숨 감소 시 추가 경고음 (중복 방지)
        const livesAfter = Math.max(0, maxLives - collisionCount);
        if (livesAfter < livesBefore) {
            // 경고 플래시: 2000ms 동안 깜빡임 효과
            lifeWarningFlashEndTime = Date.now() + 2000;
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
        
        // 적 비행기 총알 발사 처리 (게임 루프에서 직접 호출)
        handleEnemyPlaneBullets();
        
        // 보스 체크 및 생성 - 게임이 시작된 후에만 보스 생성
        const currentTime = Date.now();
        if (gameStarted && !bossActive) {
            const timeSinceLastBoss = currentTime - lastBossSpawnTime;
            if (timeSinceLastBoss >= BOSS_SETTINGS.SPAWN_INTERVAL) {
                createBoss();
            }
        } else if (bossActive) {
            // 보스가 존재하는 경우 보스 패턴 처리 (호출 빈도 제한)
            const boss = enemies.find(enemy => enemy.isBoss);
            if (boss && boss.health > 0 && typeof boss === 'object' && !bossDestroyed) {
                // 🚨 보스 활발한 움직임 로직 - 보호막 헬리콥터 수준의 활발한 움직임
                if (!boss.moveTimer) boss.moveTimer = currentTime;
                if (!boss.hoverTimer) boss.hoverTimer = 0;
                if (!boss.hoverDirection) boss.hoverDirection = 1;
                if (!boss.hoverHeight) boss.hoverHeight = 150;
                
                // 보호막 헬리콥터와 동일한 움직임 패턴 적용
                boss.hoverTimer += 16; // 약 60fps 기준 deltaTime
                
                // 호버링 효과 (보호막 헬리콥터와 동일)
                const hoverOffset = Math.sin(boss.hoverTimer * 0.002) * 40; // 진폭 증가 (30 → 40)
                
                // 좌우 움직임 (보호막 헬리콥터와 동일)
                const horizontalSpeed = Math.sin(boss.hoverTimer * 0.001) * 4; // 속도 증가 (3 → 4)
                boss.x += horizontalSpeed;
                
                // 상하 움직임 (보호막 헬리콥터와 동일)
                if (boss.y < boss.hoverHeight) {
                    boss.y += 2 * 1.2; // 상승 속도 증가
                } else {
                    // 호버링 중 고도 변화
                    const verticalSpeed = Math.cos(boss.hoverTimer * 0.001) * 3; // 속도 증가 (2 → 3)
                    boss.y = boss.hoverHeight + hoverOffset + verticalSpeed;
                }
                
                // 급격한 방향 전환 (보호막 헬리콥터와 동일)
                if (Math.random() < 0.008) { // 확률 증가 (0.005 → 0.008)
                    boss.hoverDirection *= -1;
                    boss.hoverHeight = Math.random() * 200 + 100;
                }
                
                // 화면 경계 체크 및 안전한 위치 설정
                const minX = 50;
                const maxX = canvas.width - boss.width - 50;
                const minY = 120;
                const maxY = canvas.height - boss.height - 200;
                
                boss.x = Math.max(minX, Math.min(maxX, boss.x));
                boss.y = Math.max(minY, Math.min(maxY, boss.y));
                
                // 보스 객체가 유효한지 추가 검증
                try {
                    // 호출 빈도 제한: 100ms마다만 실행 (10fps로 제한) - 패턴만 제한
                    if (!boss.lastPatternCheck || currentTime - boss.lastPatternCheck >= 100) {
                        boss.lastPatternCheck = currentTime;
                        handleBossPattern(boss);
                    }
                } catch (error) {
                    console.error('보스 패턴 처리 중 오류:', error, boss);
                    // 오류 발생 시 보스 상태 초기화
                    bossActive = false;
                    bossHealth = 0;
                    bossDestroyed = false;
                }
            } else {
                // 보스가 enemies 배열에서 제거되었거나 유효하지 않은 경우 상태 초기화
                console.log('보스가 제거되었거나 유효하지 않음 - 상태 초기화 및 적 생성 제한');
                bossActive = false;
                bossHealth = 0;
                bossDestroyed = false;
                
                // 보스 파괴 후 적 생성 제한 강화
                lastEnemySpawnTime = Date.now();
                lastHelicopterSpawnTime = Date.now();
                
                // 보스 상태 완전 초기화 강제 실행
                if (bossDestroyed) {
                    console.log('보스 파괴 상태 감지 - 강제 초기화 실행');
                    resetBossState();
                }
            }
        }
        
        // 헬리콥터 생성 체크 (게임 루프에서 직접 호출)
        if (gameStarted && !isBossActive && currentTime - lastHelicopterSpawnTime >= MIN_HELICOPTER_SPAWN_INTERVAL) {
            // 현재 보호막 헬리콥터 수 확인 (보스 제외)
            const currentShieldedHelicopters = enemies.filter(enemy => 
                (enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) && 
                enemy.hasShield && !enemy.isShieldBroken && !enemy.isBoss
            ).length;
            
            // 현재 일반 비행기 수 확인 (보스 제외)
            const currentNormalPlanes = enemies.filter(enemy => 
                enemy.type === ENEMY_TYPES.PLANE && !enemy.isBoss
            ).length;
            
            const totalEnemies = currentShieldedHelicopters + currentNormalPlanes;
            
            // 6대 제한 체크 (보스 제외)
            if (totalEnemies < 6) {
                // 레벨에 따라 헬리콥터 생성 확률 증가
                let spawnChance = 0.8; // 기본 80% 확률
                if (gameLevel >= 5) spawnChance = 0.9; // 레벨 5 이상: 90%
                if (gameLevel >= 10) spawnChance = 0.95; // 레벨 10 이상: 95%
                
                if (Math.random() < spawnChance) {
                    // 남은 공간에 맞춰 헬리콥터 수 조정
                    const maxHelicoptersToSpawn = Math.min(6 - totalEnemies, 4); // 최대 4대까지 생성 가능
                    const helicopterCount = Math.min(Math.floor(Math.random() * 3) + 2, maxHelicoptersToSpawn); // 2, 3, 4 중 랜덤하되 제한 내에서
                    
                    for (let i = 0; i < helicopterCount; i++) {
                        // 약간의 시간차를 두고 생성하여 자연스럽게 등장
                        setTimeout(() => {
                            createEnemy('HELICOPTER');
                        }, i * 150); // 150ms 간격으로 생성 (더 빠르게)
                    }
                    
                    lastHelicopterSpawnTime = currentTime;
                    console.log(`${helicopterCount}대의 헬리콥터 생성됨 (레벨 ${gameLevel}, 확률: ${Math.round(spawnChance * 100)}%) - 현재 총 적 수: ${totalEnemies + helicopterCount}/6 - 시간:`, new Date(currentTime).toLocaleTimeString());
                }
            } else {
                console.log(`헬리콥터 생성 제한: 현재 총 적 수 ${totalEnemies}/6으로 인해 생성 불가`);
            }
        }

        // 보스 총알 정리 (보스가 파괴된 후 남은 총알 제거)
        if (bossDestroyed || !bossActive) {
            bullets = bullets.filter(bullet => !bullet.isBossBullet);
            console.log('보스 파괴 후 남은 보스 총알 정리 완료');
        }
        
        // 총알 이동 및 충돌 체크
        handleBullets();


        // 두 번째 비행기 처리 (매 프레임마다 점수 조건 확인)
        handleSecondPlane();
        
        // 두 번째 비행기 타이머 관리 (매 프레임마다 업데이트)
        updateSecondPlaneTimer();
        
        // 추가 타이머 검증 (매 프레임마다)
        if (hasSecondPlane && secondPlaneTimer > 0) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - secondPlaneTimer;
            
                    // 타이머가 정상적으로 작동하는지 확인
        if (elapsedTime >= 0 && elapsedTime < 10000) {
            // 타이머가 정상 작동 중
            const remainingTime = Math.max(0, Math.ceil((10000 - elapsedTime) / 1000));
            if (remainingTime <= 3) { // 3초 이하일 때만 로그
                console.log(`프레임별 타이머 확인: ${remainingTime}초 남음 (경과: ${elapsedTime}ms)`);
            }
        }
        }
        
        // 추가 안전장치: 타이머가 멈춰있을 경우 강제 업데이트
        if (hasSecondPlane && secondPlaneTimer > 0) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - secondPlaneTimer;
            
            // 10초 정확히 경과했을 때만 강제 처리 (타이머가 멈춰있는 경우)
            if (elapsedTime >= 10000) {
                console.warn(`레벨 ${gameLevel}에서 타이머 강제 업데이트: 10초 경과하여 즉시 처리`);
                hasSecondPlane = false;
                secondPlaneTimer = 0;
                // 20초 쿨다운 시작
                isSecondPlaneOnCooldown = true;
                secondPlaneCooldownTimer = currentTime;
                showSecondPlaneMessage('추가 비행기 소멸!', 'red');
                console.log('두 번째 비행기 강제 소멸 - 20초 쿨다운 시작');
            }
            
            // 타이머가 8초 이상에서 멈춰있는 경우 경고
            if (elapsedTime >= 8000 && elapsedTime < 10000) {
                console.warn(`타이머 경고: ${elapsedTime}ms 경과했지만 아직 10초에 도달하지 않음`);
            }
        }

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
        console.error('오류 스택:', error.stack);
        console.error('오류 발생 위치:', error.fileName, error.lineNumber);
        
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
    // 레벨 5 이상일 때는 레벨 5의 난이도로 고정 (모든 속성 증가 제한)
    let currentDifficulty;
    if (gameLevel <= 4) {
        currentDifficulty = difficultySettings[gameLevel] || difficultySettings[1];
    } else {
        // 레벨 5 이상: 모든 속성을 레벨 5와 동일하게 고정 (증가 제한)
        currentDifficulty = difficultySettings[5];
        
        // 성능 보호: 이 로그는 2초에 한 번만 출력
        if (!window.__lastEnemiesLogTime || currentTime - window.__lastEnemiesLogTime > 2000) {
            console.log(`handleEnemies - 레벨 ${gameLevel}: 레벨 5 난이도로 고정 (속도: ${currentDifficulty.enemySpeed}, 적 수: ${currentDifficulty.maxEnemies}, 생성률: ${currentDifficulty.enemySpawnRate})`);
            window.__lastEnemiesLogTime = currentTime;
        }
    }
    
    // 보스 존재 여부 체크 - 더 정확한 체크
    const bossExists = enemies.some(enemy => enemy.isBoss);
    
    // 보스 상태 동기화
    if (bossExists && !isBossActive) {
        isBossActive = true;
        bossActive = true;
        console.log('enemies 배열에서 보스 발견, 상태 동기화');
    } else if (!bossExists && isBossActive) {
        // enemies 배열에 보스가 없는데 상태가 활성화되어 있으면 초기화
        console.log('enemies 배열에 보스가 없는데 상태가 활성화되어 있음, 상태 초기화');
        resetBossState();
    }
    
    // 보스 생성 조건 추가 - 게임이 시작된 후에만 보스 생성
    if (gameStarted && score >= 2000 * gameLevel && !isBossActive && !bossExists) {
        console.log('보스 생성 조건 충족, 보스 생성 시도');
        createBoss();
    }
    
    if (isSnakePatternActive) {
        handleSnakePattern();
    }
    
    // 적 생성 로직 개선 - 게임이 시작되고 터치 후에만 적들이 생성되도록
    // 적 비행기와 보호막 헬리콥터 합하여 최대 6대 제한 (보스 제외), 일반 비행기 최소 4대, 보호막 헬리콥터 기본 2대 보장
    const currentShieldedHelicopters = enemies.filter(enemy => 
        (enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) && 
        enemy.hasShield && !enemy.isShieldBroken && !enemy.isBoss
    ).length;
    
    const currentNormalPlanes = enemies.filter(enemy => 
        enemy.type === ENEMY_TYPES.PLANE && !enemy.isBoss
    ).length;
    
    const totalEnemies = currentShieldedHelicopters + currentNormalPlanes;
    
    // 생성 조건 체크
    const canCreateEnemy = gameStarted && 
        currentTime - lastEnemySpawnTime >= MIN_ENEMY_SPAWN_INTERVAL &&
        Math.random() < currentDifficulty.enemySpawnRate * 0.3 && // 생성 확률을 30%로 더 줄임
        enemies.length < currentDifficulty.maxEnemies &&
        !isGameOver;
    
    // 적 생성 조건: 일반 비행기 최소 4대, 보호막 헬리콥터 기본 2대 최대 4대, 총합 6대 제한 (보스 제외)
    if (canCreateEnemy) {
        let shouldCreate = false;
        let createType = '';
        
        // 일반 비행기가 4대 미만이면 우선 생성
        if (currentNormalPlanes < 4) {
            shouldCreate = true;
            createType = 'PLANE';
        }
        // 보호막 헬리콥터가 2대 미만이면 우선 생성
        else if (currentShieldedHelicopters < 2) {
            shouldCreate = true;
            createType = 'HELICOPTER';
        }
        // 보호막 헬리콥터가 4대 미만이고 총합이 6대 미만이면 생성 가능
        else if (currentShieldedHelicopters < 4 && totalEnemies < 6) {
            shouldCreate = true;
            createType = 'HELICOPTER';
        }
        
        if (shouldCreate) {
            createEnemy(createType);
            lastEnemySpawnTime = currentTime;
            console.log('새로운 적 생성됨 (보호막 헬리콥터: ' + currentShieldedHelicopters + ', 일반 비행기: ' + currentNormalPlanes + ', 총: ' + totalEnemies + '/6) - 생성 타입: ' + createType);
        }
    }
    
    // 헬리콥터 생성은 게임 루프에서 처리하므로 여기서는 제거
    // 중복 생성 방지를 위해 주석 처리
    
    let helicopterFiredThisFrame = false;
    enemies = enemies.filter(enemy => {
        // 보스가 파괴된 경우 즉시 제거
        if (enemy.isBoss && (bossDestroyed || enemy.health <= 0)) {
            console.log('handleEnemies: 보스 파괴됨 - 즉시 제거');
            return false;
        }
        
        updateEnemyPosition(enemy, {helicopterFiredThisFrame});
        drawEnemy(enemy);
        return checkEnemyCollisions(enemy);
    });
    // 적 비행기 총알 발사는 게임 루프에서 처리하므로 여기서는 제거
    // handleEnemyPlaneBullets();
    handleEnemyBullets();
    handleHelicopterBullets();
    handleBossBullets();
}

// 뱀 패턴 처리 함수 수정
function handleSnakePattern() {
    if (!gameStarted) return; // gameStarted 체크로 변경
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
                        // 일반 적 파괴 시 발사음 재생 (헬리콥터 제외)
                        if (!(enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2)) {
                            safePlay(shootSound);
                        }
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
            console.log('총알과 적 충돌 감지:', {
                bulletType: bullet.isSpecial ? '특수무기' : (bullet.isSpread && bullet.isBossBullet ? '보스 확산탄' : '일반총알'),
                enemyType: enemy.type,
                enemyHealth: enemy.health,
                isBoss: enemy.isBoss
            });
            
            // 보스인 경우 체력 감소
            if (enemy.isBoss) {
                console.log('🎯 보스 충돌 감지됨!', {
                    bulletType: bullet.isSpecial ? '특수무기' : '일반총알',
                    enemyHealth: enemy.health,
                    enemyHitCount: enemy.hitCount,
                    bossHealth: bossHealth,
                    bossDestroyed: bossDestroyed
                });
                
                const currentTime = Date.now();
                
                // 무적 상태 해제됨 (즉시 공격 가능)
                // 무적 상태 체크 로직 제거됨
                
                // 특수 무기인 경우 즉시 파괴
                if (bullet.isSpecial) {
                    console.log('💥 특수무기로 보스 파괴 시작!', {
                        enemyHealth: enemy.health,
                        enemyHitCount: enemy.hitCount,
                        bossHealth: bossHealth,
                        bossDestroyed: bossDestroyed,
                        enemyLifeAdded: enemy.lifeAdded
                    });
                    
                    // 보스 상태 즉시 정리 (체력을 확실히 0으로 설정하여 이중 파괴 방지)
                    enemy.health = 0;
                    bossHealth = 0;
                    bossDestroyed = true;
                    enemy.isBeingHit = false; // 피격 상태 즉시 해제
                    
                    console.log('보스 체력 0으로 설정 완료 (특수무기) - 이중 파괴 방지:', {
                        enemyHealth: enemy.health,
                        bossHealth: bossHealth,
                        bossDestroyed: bossDestroyed
                    });
                    
                    updateScore(getBossScore());
                    
                    // 보스 파괴 시 목숨 1개 추가 (중복 방지)
                    if (!enemy.lifeAdded) {
                        console.log('🎯 보스 파괴 목숨 추가 시작 (특수무기):', {
                            beforeLives: maxLives,
                            enemyLifeAdded: enemy.lifeAdded,
                            bossDestroyed: bossDestroyed
                        });
                        addLives(1, '보스 파괴 (특수무기)', enemy);
                        enemy.lifeAdded = true; // 목숨 추가 플래그 설정
                        console.log('보스 파괴! 목숨 1개 추가됨 (특수무기)');
                    } else {
                        console.log('보스 파괴되었지만 이미 목숨이 추가됨 (특수무기)');
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
                    
                    // 보스 상태 즉시 완전 초기화 (지연 없음)
                    resetBossState();
                    
                    // 보스 파괴 후 적 생성 제한 활성화
                    lastEnemySpawnTime = Date.now();
                    lastHelicopterSpawnTime = Date.now();
                    
                    return false;
                }
                
                // 일반 총알인 경우
                enemy.hitCount++;
                console.log('보스 총알 맞은 횟수:', enemy.hitCount);
                
                // 피격 상태 설정 (시간 기반 관리) - 보스 동작 방해 방지
                enemy.isBeingHit = true;
                enemy.lastHitTime = currentTime;
                enemy.hitDuration = 100; // 100ms로 단축하여 보스 동작 방해 최소화
                
                // 보스가 맞았을 때 시각 효과 추가
                explosions.push(new Explosion(
                    bullet.x,
                    bullet.y,
                    false
                ));
                
                // 체력 감소 (일반 총알은 100의 데미지) - 동기화 보장
                const damage = 100;
                const newHealth = Math.max(0, enemy.health - damage);
                enemy.health = newHealth;
                bossHealth = newHealth;
                
                
                // 보스 피격 시 발사음만 재생
                safePlay(shootSound);
                
                // hitCount 조건을 먼저 체크하여 즉시 파괴 (체력과 독립적으로 작동)
                const requiredHitCount = calculateBossHitCount(bossHealth);
                console.log('🔍 보스 hitCount 체크:', {
                    currentHitCount: enemy.hitCount,
                    requiredHitCount: requiredHitCount,
                    bossHealth: bossHealth,
                    gameLevel: gameLevel,
                    willDestroy: enemy.hitCount >= requiredHitCount
                });
                
                if (enemy.hitCount >= requiredHitCount) {
                    console.log('💥 hitCount 조건으로 보스 파괴 시작!', {
                        enemyHealth: enemy.health,
                        enemyHitCount: enemy.hitCount,
                        requiredHitCount: requiredHitCount,
                        bossHealth: bossHealth,
                        bossDestroyed: bossDestroyed,
                        enemyLifeAdded: enemy.lifeAdded
                    });
                    
                    // 보스 상태 즉시 정리 (체력을 확실히 0으로 설정하여 이중 파괴 방지)
                    enemy.health = 0;
                    bossHealth = 0;
                    bossDestroyed = true;
                    enemy.isBeingHit = false;
                    
                    console.log('보스 체력 0으로 설정 완료 - 이중 파괴 방지:', {
                        enemyHealth: enemy.health,
                        bossHealth: bossHealth,
                        bossDestroyed: bossDestroyed
                    });
                    
                    // 점수 추가
                    updateScore(getBossScore());
                    
                    // 보스 파괴 시 목숨 1개 추가 (중복 방지)
                    if (!enemy.lifeAdded) {
                        console.log('🎯 보스 파괴 목숨 추가 시작 (hitCount 기반):', {
                            beforeLives: maxLives,
                            enemyLifeAdded: enemy.lifeAdded,
                            bossDestroyed: bossDestroyed,
                            hitCount: enemy.hitCount,
                            requiredHitCount: requiredHitCount
                        });
                        addLives(1, '보스 파괴 (hitCount 기반)', enemy);
                        enemy.lifeAdded = true; // 목숨 추가 플래그 설정
                        console.log('보스 파괴! 목숨 1개 추가됨 (hitCount 기반)');
                    } else {
                        console.log('보스 파괴되었지만 이미 목숨이 추가됨 (hitCount 기반)');
                    }
                    
                    // 폭발 효과
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
                    
                    // 보스 상태 즉시 완전 초기화
                    resetBossState();
                    
                    // 보스 파괴 후 적 생성 제한 활성화
                    lastEnemySpawnTime = Date.now();
                    lastHelicopterSpawnTime = Date.now();
                    
                    return false;
                }
                
                // 체력이 0이 되면 보스 파괴 (최소 체류 시간 체크 - hitCount 기반 파괴가 우선)
                if (enemy.health <= 0 && !bossDestroyed) {
                    console.log('💥 체력 조건으로 보스 파괴 시작!', {
                        enemyHealth: enemy.health,
                        enemyHitCount: enemy.hitCount,
                        bossHealth: bossHealth,
                        bossDestroyed: bossDestroyed,
                        enemyLifeAdded: enemy.lifeAdded
                    });
                    
                    // 보스 체류 시간 체크 제거 - 체력이 0이 되면 즉시 파괴
                    console.log('보스 파괴 조건 체크 (체력 기반):', {
                        health: enemy.health,
                        hitCount: enemy.hitCount,
                        bossDestroyed: bossDestroyed,
                        note: '체력이 0이 되면 즉시 파괴됨 (hitCount 조건과 중복 방지)'
                    });
                    
                    // 보스 즉시 파괴 (체력 기반)
                    console.log('⏰ 보스 파괴됨 - 체력 소진:', {
                        health: enemy.health,
                        hitCount: enemy.hitCount,
                        note: '체력이 0이 되어 즉시 파괴됨'
                    });
                    
                    // 보스 상태 즉시 정리 (체력을 확실히 0으로 설정하여 이중 파괴 방지)
                    enemy.health = 0;
                    bossHealth = 0;
                    bossDestroyed = true;
                    enemy.isBeingHit = false;
                    
                    console.log('보스 체력 0으로 설정 완료 (체력 기반) - 이중 파괴 방지:', {
                        enemyHealth: enemy.health,
                        bossHealth: bossHealth,
                        bossDestroyed: bossDestroyed
                    });
                    
                    // 점수 추가
                    updateScore(getBossScore());
                    
                    // 보스 파괴 시 목숨 1개 추가 (중복 방지)
                    if (!enemy.lifeAdded) {
                        console.log('🎯 보스 파괴 목숨 추가 시작 (체력 기반):', {
                            beforeLives: maxLives,
                            enemyLifeAdded: enemy.lifeAdded,
                            bossDestroyed: bossDestroyed,
                            health: enemy.health
                        });
                        addLives(1, '보스 파괴 (체력 기반)', enemy);
                        enemy.lifeAdded = true; // 목숨 추가 플래그 설정
                        console.log('보스 파괴! 목숨 1개 추가됨 (체력 기반)');
                    } else {
                        console.log('보스 파괴되었지만 이미 목숨이 추가됨 (체력 기반)');
                    }
                    
                    // 폭발 효과
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
                    
                    // 보스 상태 즉시 완전 초기화
                    resetBossState();
                    
                    // 보스 파괴 후 적 생성 제한 활성화
                    lastEnemySpawnTime = Date.now();
                    lastHelicopterSpawnTime = Date.now();
                    
                    return false;
                }
                
                // 보스가 파괴되지 않은 상태에서는 점수 부여하지 않음
                isHit = true;
                return false;
            } else if ((enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) && enemy.hasShield && !enemy.isShieldBroken) {
                // 헬리콥터1(블루계열) 또는 헬리콥터2(오렌지계열) 보호막 처리
                enemy.shieldHitCount++;
                const helicopterType = enemy.type === ENEMY_TYPES.HELICOPTER ? "헬리콥터1(블루)" : "헬리콥터2(오렌지)";
                console.log(`${helicopterType} 보호막 피격: ${enemy.shieldHitCount}/${enemy.shieldHealth}`);
                
                // 보호막 피격 시 발사음만 재생
                safePlay(shootSound);
                
                // 보호막 피격 시각 효과
                explosions.push(new Explosion(
                    bullet.x,
                    bullet.y,
                    false
                ));
                
                // 보호막이 파괴되면 헬리콥터도 함께 파괴
                if (enemy.shieldHitCount >= enemy.shieldHealth) {
                    enemy.isShieldBroken = true;
                    console.log(`${helicopterType} 보호막 파괴됨 - 헬리콥터 완전 파괴`);
                    
                    // 보호막 헬리콥터 파괴 카운터 증가
                    shieldedHelicopterDestroyed++;
                    
                    // 1대 파괴할 때마다 목숨 1개 추가 (중복 방지)
                    if (!enemy.lifeAddedFromHelicopter) {
                        addLives(1, `보호막 헬리콥터 파괴`, enemy);
                        livesAddedFromHelicopters++;
                        enemy.lifeAddedFromHelicopter = true; // 목숨 추가 플래그 설정
                        console.log(`보호막 헬리콥터 파괴! 목숨 1개 추가됨. (총 파괴: ${shieldedHelicopterDestroyed}대)`);
                    } else {
                        console.log(`보호막 헬리콥터 파괴되었지만 이미 목숨이 추가됨. (총 파괴: ${shieldedHelicopterDestroyed}대)`);
                    }
                    
                    // 보호막 파괴 시 보스와 동일한 큰 폭발 효과
                    explosions.push(new Explosion(
                        enemy.x + enemy.width/2,
                        enemy.y + enemy.height/2,
                        true
                    ));
                    
                    // 보호막 파괴 시 보스와 동일한 추가 폭발 효과 (8개)
                    for (let i = 0; i < 8; i++) {
                        const angle = (Math.PI * 2 / 8) * i;
                        const distance = 50;
                        explosions.push(new Explosion(
                            enemy.x + enemy.width/2 + Math.cos(angle) * distance,
                            enemy.y + enemy.height/2 + Math.sin(angle) * distance,
                            false
                        ));
                    }
                    
                    // 보호막 파괴 시 폭발음만 재생 (볼륨 2배)
                    playExplosionSoundSafe(1.0, true);
                    
                    // 점수 부여
                    updateScore(enemy.score);
                    
                    // 헬리콥터 완전 파괴로 enemies 배열에서 제거
                    isHit = true;
                }
            } else {
                // 일반 적 처치 (특수무기 포함)
                console.log('일반 적 파괴됨:', {
                    type: enemy.type,
                    isSpecial: bullet.isSpecial,
                    bulletSize: `${bullet.width}x${bullet.height}`
                });
                
                // 특수무기인 경우 즉시 파괴 + 더 큰 폭발 효과
                if (bullet.isSpecial) {
                    console.log(`특수무기로 적 즉시 파괴!`);
                    
                    // 데미지 텍스트 표시
                    const damage = 500; // 특수무기 500
                    drawDamageText(enemy.x + enemy.width/2, enemy.y + enemy.height/2, damage);
                    
                    // 적 즉시 파괴
                    enemy.health = 0;
                    
                    // 큰 폭발 효과
                    explosions.push(new Explosion(
                        enemy.x + enemy.width/2,
                        enemy.y + enemy.height/2,
                        true // 큰 폭발
                    ));
                    
                    // 추가 폭발 효과 (특수무기용)
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI * 2 / 6) * i;
                        const distance = 30;
                        explosions.push(new Explosion(
                            enemy.x + enemy.width/2 + Math.cos(angle) * distance,
                            enemy.y + enemy.height/2 + Math.sin(angle) * distance,
                            false
                        ));
                    }
                    
                    // 특수무기로 일반 비행기 파괴 시 발사음 재생
                    safePlay(shootSound);
                } else {
                    // 일반 총알인 경우 기본 폭발 효과
                    explosions.push(new Explosion(
                        enemy.x + enemy.width/2,
                        enemy.y + enemy.height/2
                    ));
                    
                    // 일반 총알로 헬리콥터 파괴 시 폭발음, 일반 비행기 파괴 시 발사음
                    if (enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) {
                        // 헬리콥터 파괴 시 폭발음 (볼륨 2배)
                        playExplosionSoundSafe(1.0, true);
                    } else {
                        // 일반 비행기 파괴 시 발사음
                        safePlay(shootSound);
                    }
                }
                
                updateScore(enemy.score);
                isHit = true; // 일반 적만 파괴
            }
            
            // 보호막 헬리콥터는 보호막이 파괴될 때까지 enemies 배열에 유지
            if (!((enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) && enemy.hasShield && !enemy.isShieldBroken)) {
                return false;
            }
        }
        return true;
    });

    // 보스의 피격 상태 업데이트
    if (enemy.isBoss && enemy.isBeingHit) {
        const currentTime = Date.now();
        const timeSinceLastHit = currentTime - enemy.lastHitTime;
        
        // 1초 이상 피격이 없으면 피격 상태 해제
        if (timeSinceLastHit > 1000) {
            enemy.isBeingHit = false;
        }
    }

    // 보스가 파괴된 경우 enemies 배열에서 즉시 제거
    if (enemy.isBoss && (bossDestroyed || enemy.health <= 0)) {
        console.log('보스 파괴됨 - enemies 배열에서 즉시 제거');
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
        
        // 두 번째 비행기 발사
        if (hasSecondPlane) {
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
    if (specialWeaponCharged && keys.KeyB && specialWeaponStock > 0) {  // KeyN을 KeyB로 변경, 보유 개수 확인 추가
        // 특수 무기 발사 (90도 범위 내에서 24개 발사, 상단 전체 커버)
        // 상단 방향은 -135도(왼쪽 위)에서 -45도(오른쪽 위)까지
        const startAngle = -135 * (Math.PI / 180); // -135도 시작
        const endAngle = -45 * (Math.PI / 180);    // -45도 끝 (총 90도 범위)
        const angleStep = (endAngle - startAngle) / 23; // 24개 총알을 위한 각도 간격
        
        for (let i = 0; i < 24; i++) { // 24발 발사
            const angle = startAngle + (i * angleStep);
            const bullet = {
                x: player.x + player.width/2,
                y: player.y,
                width: 12,  // 확산탄과 동일한 크기
                height: 32, // 확산탄과 동일한 크기
                speed: 12,  // 속도 최적화
                angle: angle,
                isSpecial: true,
                life: 100,  // 총알 지속 시간 최적화
                trail: []   // 꼬리 효과를 위한 배열
            };
            bullets.push(bullet);
        }
        
        // 두 번째 비행기가 있을 경우 추가 발사 (90도 범위 내에서 24개 발사, 상단 전체 커버)
        if (hasSecondPlane) {
            const startAngle = -135 * (Math.PI / 180); // -135도 시작
            const endAngle = -45 * (Math.PI / 180);    // -45도 끝 (총 90도 범위)
            const angleStep = (endAngle - startAngle) / 23; // 24개 총알을 위한 각도 간격
            
            for (let i = 0; i < 24; i++) { // 24발 발사
                const angle = startAngle + (i * angleStep);
                const bullet = {
                    x: secondPlane.x + secondPlane.width/2,
                    y: secondPlane.y,
                    width: 12,  // 확산탄과 동일한 크기
                    height: 32, // 확산탄과 동일한 크기
                    speed: 12,  // 속도 최적화
                    angle: angle,
                    isSpecial: true,
                    life: 100,  // 총알 지속 시간 최적화
                    trail: []
                };
                bullets.push(bullet);
            }
        }
        
        // 특수무기 사용 시 보유 개수 감소
        specialWeaponStock--;
        console.log(`특수무기 사용! 남은 보유 개수: ${specialWeaponStock}`);
        
        // 특수무기 사용 후 충전량 초기화 (추가 특수무기 획득을 위한 충전 시작)
        specialWeaponCharge = 0;
        
        // 보유 개수가 0이 되면 충전 상태 해제
        if (specialWeaponStock <= 0) {
            specialWeaponCharged = false;
        }
        
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

    // 점수와 레벨 표시 - 문자 크기 통일 및 줄간격 정리
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial'; // 모든 텍스트를 16px로 통일
    ctx.textAlign = 'left';
    
    // 줄 간격 표준화
    let y = 25;
    const lineHeight = 25;
    
    // 기본 정보 (표준 줄간격 적용)
    ctx.fillText(`점수: ${score}`, 20, y); y += lineHeight;
    ctx.fillText(`레벨: ${gameLevel} (${getDifficultyName(gameLevel)})`, 20, y); y += lineHeight;
    ctx.fillText(`다음 레벨까지: ${levelUpScore - levelScore}`, 20, y); y += lineHeight;
    ctx.fillText(`(레벨${gameLevel}→${gameLevel + 1}: ${levelUpScore}점)`, 20, y); y += lineHeight;
    ctx.fillText(`최고 점수: ${highScore}`, 20, y); y += lineHeight;
    
    
    // 보호막 헬리콥터 관련 UI 안내 제거
    
    // 추가 비행기 정보 (30px 간격) - 전체 과정 순서대로 표시
    if (!hasSecondPlane && !isSecondPlaneOnCooldown) {
        // 1단계: 다음 추가 비행기까지 점수 획득 또는 디스카운트
        const nextPlaneScore = Math.ceil(score / 1000) * 1000;
        
        // 추가 비행기 소멸 후 점수 디스카운트 표시
        if (window.cooldownCompletedTime && window.cooldownCompletedTime > 0) {
            const timeSinceCooldown = Date.now() - window.cooldownCompletedTime;
            const discountSeconds = Math.floor(timeSinceCooldown / 1000);
            const discountedScore = Math.max(0, 500 - (discountSeconds * 5)); // 500점부터 1초당 5점씩 디스카운트
            
            console.log('=== 디스카운트 상태 확인 ===');
            console.log('cooldownCompletedTime:', window.cooldownCompletedTime);
            console.log('timeSinceCooldown:', timeSinceCooldown, 'ms');
            console.log('discountSeconds:', discountSeconds);
            console.log('discountedScore:', discountedScore);
            
            if (discountedScore > 0) {
                ctx.fillStyle = '#00FFFF'; // 청록색으로 디스카운트 표시
                ctx.fillText(`다음 추가 비행기까지: ${discountedScore}점`, 20, y);
                y += lineHeight;
                console.log(`디스카운트 진행 중: ${discountedScore}점 남음 (${discountSeconds}초 경과)`);
            } else {
                ctx.fillStyle = '#00FF00'; // 초록색으로 무료 획득 표시
                ctx.fillText(`다음 추가 비행기까지: 무료 획득!`, 20, y);
                y += lineHeight;
                console.log(`디스카운트 완료: 무료 획득 가능!`);
                
                // 디스카운트 완료 후 무료 획득 처리
                if (!hasSecondPlane && !isSecondPlaneOnCooldown) {
                    console.log('=== 디스카운트 완료 - 무료 추가 비행기 획득! ===');
                    console.log('획득 전 상태:', {
                        hasSecondPlane,
                        isSecondPlaneOnCooldown,
                        cooldownCompletedTime: window.cooldownCompletedTime
                    });
                    
                    hasSecondPlane = true;
                    secondPlane.x = player.x - 60;
                    secondPlane.y = player.y;
                    secondPlaneTimer = Date.now();
                    window.lastSecondPlaneScore = Math.ceil(score / 1000) * 1000;
                    
                    // 상태 고정 변수 설정
                    window.secondPlaneAcquired = true;
                    window.secondPlaneAcquireTime = Date.now();
                    
                    // 획득 메시지 표시
                    showSecondPlaneMessage('무료 추가 비행기 획득!', 'yellow');
                    
                    // 디스카운트 완료 시간 초기화
                    window.cooldownCompletedTime = 0;
                    
                    console.log('획득 후 상태:', {
                        hasSecondPlane,
                        secondPlaneTimer,
                        isSecondPlaneOnCooldown,
                        cooldownCompletedTime: window.cooldownCompletedTime
                    });
                    console.log('=== 무료 획득 완료 ===');
                }
            }
        } else {
            ctx.fillStyle = 'white';
            ctx.fillText(`다음 추가 비행기까지: ${nextPlaneScore - score}점`, 20, y);
            y += lineHeight;
            console.log('디스카운트 비활성화 상태 - cooldownCompletedTime:', window.cooldownCompletedTime);
        }
    } else if (hasSecondPlane && secondPlaneTimer > 0) {
        // 2단계: 추가 비행기 활성화 (10초)
        const elapsedTime = Date.now() - secondPlaneTimer;
        const remainingTime = Math.max(0, Math.ceil((10000 - elapsedTime) / 1000));
        
        if (elapsedTime >= 10000) {
            ctx.fillStyle = '#FF0000';
            ctx.fillText(`추가 비행기 만료됨`, 20, y);
            y += lineHeight;
        } else {
            ctx.fillStyle = '#00FF00';
            ctx.fillText(`추가 비행기 활성화: ${remainingTime}초 남음`, 20, y);
            y += lineHeight;
        }
    } else if (isSecondPlaneOnCooldown && secondPlaneCooldownTimer > 0) {
        // 3단계: 추가 비행기 쿨다운 (20초)
        const cooldownElapsed = Date.now() - secondPlaneCooldownTimer;
        const remainingCooldown = Math.max(0, Math.ceil((20000 - cooldownElapsed) / 1000));
        ctx.fillStyle = '#FF8800';
        ctx.fillText(`추가 비행기 쿨다운: ${remainingCooldown}초`, 20, y);
        
        // 진행률 바를 텍스트 바로 아래에 표시
        const barY = y + 5;
        
        console.log('=== 쿨다운 상태 표시 ===');
        console.log('쿨다운 진행 중:', {
            cooldownElapsed,
            remainingCooldown,
            secondPlaneCooldownTimer
        });
        
        // 쿨다운 진행률 표시
        const progress = Math.min(1, cooldownElapsed / 20000);
        const barWidth = 200;
        const barHeight = 4;
        ctx.fillStyle = '#444444';
        ctx.fillRect(20, barY, barWidth, barHeight);
        ctx.fillStyle = '#FF8800';
        ctx.fillRect(20, barY, barWidth * progress, barHeight);
        
        // 바까지 반영하여 줄간격 증가
        y += lineHeight + 10;
    } else if (hasSecondPlane) {
        // 오류 상태 표시
        ctx.fillStyle = '#FFAA00';
        ctx.fillText(`추가 비행기 상태 오류`, 20, y);
        y += lineHeight;
    }
    
    // 디버깅: 현재 상태 로그 (콘솔에서 확인)
    if (window.debugSecondPlaneState) {
        console.log('UI 상태:', {
            hasSecondPlane,
            secondPlaneTimer,
            isSecondPlaneOnCooldown,
            secondPlaneCooldownTimer,
            cooldownCompletedTime: window.cooldownCompletedTime
        });
    }
    
    // 디버깅 모드 활성화 (F12 콘솔에서 확인)
    window.debugSecondPlaneState = true;
    
    // 디버깅: 수동으로 쿨다운 완료 테스트 (F12 콘솔에서 테스트)
    window.testCooldownComplete = function() {
        console.log('=== 수동 쿨다운 완료 테스트 ===');
        console.log('테스트 전 상태:', {
            isSecondPlaneOnCooldown,
            secondPlaneCooldownTimer,
            cooldownCompletedTime: window.cooldownCompletedTime
        });
        
        // 쿨다운 상태 강제 완료
        isSecondPlaneOnCooldown = false;
        secondPlaneCooldownTimer = 0;
        window.cooldownCompletedTime = Date.now();
        
        console.log('테스트 후 상태:', {
            isSecondPlaneOnCooldown,
            secondPlaneCooldownTimer,
            cooldownCompletedTime: window.cooldownCompletedTime
        });
        console.log('이제 디스카운트가 시작되어야 합니다.');
    };
    
    // 디버깅: 현재 상태 확인 (F12 콘솔에서 테스트)
    window.checkSecondPlaneState = function() {
        console.log('=== 현재 추가 비행기 상태 ===');
        console.log('기본 상태:', {
            hasSecondPlane,
            secondPlaneTimer,
            isSecondPlaneOnCooldown,
            secondPlaneCooldownTimer
        });
        console.log('전역 변수:', {
            cooldownCompletedTime: window.cooldownCompletedTime,
            lastSecondPlaneScore: window.lastSecondPlaneScore,
            secondPlaneAcquired: window.secondPlaneAcquired
        });
        
        if (window.cooldownCompletedTime && window.cooldownCompletedTime > 0) {
            const timeSinceCooldown = Date.now() - window.cooldownCompletedTime;
            const discountSeconds = Math.floor(timeSinceCooldown / 1000);
            const discountedScore = Math.max(0, 500 - (discountSeconds * 5));
            console.log('디스카운트 정보:', {
                timeSinceCooldown,
                discountSeconds,
                discountedScore
            });
        }
    };
    
    // 남은 목숨 표시 (경고 플래시 시 반전 효과)
    const nowForLife = Date.now();
    const isLifeWarningActive = nowForLife < lifeWarningFlashEndTime;
    const shouldBlinkOn = isLifeWarningActive && Math.floor((lifeWarningFlashEndTime - nowForLife) / 200) % 2 === 0;
    if (shouldBlinkOn) {
        // 경고 활성 시: 노란 배경 / 빨간 텍스트
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(15, y - 18, 220, 26);
        ctx.fillStyle = '#FF0000';
    } else {
        ctx.fillStyle = 'red';
    }
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`남은 목숨: ${maxLives - collisionCount}`, 20, y);
    
    // 제작자 정보 표시 (25px 간격으로 정리)
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('제작/저작권자:Lee.SS.C', canvas.width - 20, canvas.height - 30); 

    // 특수 무기 게이지 표시 (상단으로 이동, 표준 줄간격 근처에 배치)
    if (!specialWeaponCharged) {
        const barWidth = 200;
        const barHeight = 20;
        const barY = y + lineHeight; // "남은 목숨"과 동일한 줄 간격만큼 띄움
        
        // 게이지 바 배경
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(20, barY, barWidth, barHeight);
        
        // 게이지 바
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.fillRect(20, barY, (specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * barWidth, barHeight);
        
        // 게이지 바 위에 텍스트 표시
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        const percentText = `특수 무기 : ${Math.floor((specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 100)}% (보유: ${specialWeaponStock}/${SPECIAL_WEAPON_MAX_STOCK}개)`;
        ctx.fillText(percentText, 120, barY + 15);
        
        // 줄 간격 진행
        y += lineHeight + 10;
        ctx.textAlign = 'left';
    } else if (specialWeaponStock > 0) {
        // 특수무기가 충전되어 있고 보유 개수가 있을 때 - 추가 특수무기 획득을 위한 게이지 표시
        const barWidth = 200;
        const barHeight = 20;
        const barY = y + lineHeight; // "남은 목숨"과 동일한 줄 간격만큼 띄움
        
        // 게이지 바 배경
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(20, barY, barWidth, barHeight);
        
        // 게이지 바 (현재 충전량 표시)
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.fillRect(20, barY, (specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * barWidth, barHeight);
        
        // 게이지 바 위에 텍스트 표시
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        const percentText = `특수 무기 : ${Math.floor((specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 100)}% (보유: ${specialWeaponStock}/${SPECIAL_WEAPON_MAX_STOCK}개)`;
        ctx.fillText(percentText, 120, barY + 15);
        
        // 깜빡이는 효과를 위한 시간 계산
        const blinkSpeed = 500; // 깜빡임 속도 (밀리초)
        const currentTime = Date.now();
        const isBlinking = Math.floor(currentTime / blinkSpeed) % 2 === 0;
        
        // 준비 완료 메시지 배경
        ctx.fillStyle = isBlinking ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 0, 0.1)';
        ctx.fillRect(20, barY + 25, 300, 30);
        
        // 텍스트 색상 설정 (깜박임 효과) - 녹청색으로 변경
        ctx.fillStyle = isBlinking ? '#00FFFF' : 'rgba(0, 255, 255, 0.5)';
        ctx.font = 'bold 15px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('아래 [특수무기]버튼을 터치하세요.', 25, barY + 45);
        
        // 줄 간격 진행
        y += lineHeight + 35;
        ctx.textAlign = 'left';
    } else {
        // 깜빡이는 효과를 위한 시간 계산
        const blinkSpeed = 500; // 깜빡임 속도 (밀리초)
        const currentTime = Date.now();
        const isRed = Math.floor(currentTime / blinkSpeed) % 2 === 0;
        
        const barWidth = 200;
        const barHeight = 20;
        const barY = y + lineHeight; // 동일 줄 간격 적용
        
        // 배경색 설정 (게이지 바)
        ctx.fillStyle = isRed ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 255, 0.3)';
        ctx.fillRect(20, barY, barWidth, barHeight);
        
        // 테두리 효과
        ctx.strokeStyle = isRed ? 'red' : 'cyan';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, barY, barWidth, barHeight);
        
        // 게이지 바 위에 텍스트 표시
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        const percentText = `특수 무기 : ${Math.floor((specialWeaponCharge / SPECIAL_WEAPON_MAX_CHARGE) * 100)}% (보유: ${specialWeaponStock}/${SPECIAL_WEAPON_MAX_STOCK}개)`;
        ctx.fillText(percentText, 120, barY + 15);
        
        // 준비 완료 메시지 배경
        ctx.fillStyle = isRed ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 255, 0.2)';
        ctx.fillRect(20, barY + 25, 300, 30);
        
        // 텍스트 색상 설정
        ctx.fillStyle = isRed ? 'red' : 'cyan';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('특수무기 발사(알파벳 "B"키 클릭)', 25, barY + 45);
        
        // 줄 간격 진행
        y += lineHeight + 40;
    }
    
    // 보스 체력 표시 개선
    if (bossActive) {
        // 디버깅 정보 추가
        console.log('보스 체력 표시:', {
            bossActive: bossActive,
            bossHealth: bossHealth,
            BOSS_SETTINGS_HEALTH: BOSS_SETTINGS.HEALTH,
            healthPercentage: bossHealth / BOSS_SETTINGS.HEALTH
        });
        
        // 체력바 배경 (체력 7500 기준으로 조정)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width/2 - 100, 20, 200, 20);
        
        // 체력바 테두리
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width/2 - 100, 20, 200, 20);
        
        // 체력바 (동적으로 계산된 체력 기준)
        const maxBossHealth = calculateBossHealth();
        const healthPercentage = bossHealth / maxBossHealth;
        let healthColor;
        if (healthPercentage > 0.7) healthColor = 'rgba(0, 255, 0, 0.9)';      // 초록색 (70% 이상)
        else if (healthPercentage > 0.5) healthColor = 'rgba(0, 255, 255, 0.9)'; // 청록색 (50-70%)
        else if (healthPercentage > 0.3) healthColor = 'rgba(255, 255, 0, 0.9)'; // 노란색 (30-50%)
        else if (healthPercentage > 0.1) healthColor = 'rgba(255, 165, 0, 0.9)'; // 주황색 (10-30%)
        else healthColor = 'rgba(255, 0, 0, 0.9)';                              // 빨간색 (10% 미만)
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(canvas.width/2 - 100, 20, healthPercentage * 200, 20);
        
        // 체력 수치 (동적으로 계산된 체력 기준)
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`보스 체력: ${Math.ceil(bossHealth)}/${maxBossHealth}`, canvas.width/2, 35);
        
        // 페이즈 표시 (동적으로 계산된 임계값 사용)
        const phaseThresholds = calculateBossPhaseThresholds(maxBossHealth);
        const currentPhase = phaseThresholds.findIndex(
            threshold => bossHealth > threshold.health
        );
        if (currentPhase >= 0) {
            ctx.fillText(`페이즈 ${currentPhase + 1}`, canvas.width/2, 60);
        }
        
    }
    
    // 데미지 텍스트 그리기
    if (window.damageTexts && window.damageTexts.length > 0) {
        window.damageTexts = window.damageTexts.filter(damageText => {
            if (damageText.life <= 0) return false;
            
            // 데미지 텍스트 스타일 설정
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            
            // 일반 총알 데미지: 흰색
            ctx.fillStyle = `rgba(255, 255, 255, ${damageText.alpha})`;
            
            // 데미지 텍스트 그리기
            ctx.fillText(`${damageText.damage}`, damageText.x, damageText.y - damageText.offsetY);
            
            // 애니메이션 업데이트
            damageText.life--;
            damageText.alpha = Math.max(0, damageText.life / 60);
            damageText.offsetY += 0.5; // 위로 올라가는 효과
            
            return true;
        });
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
    const names = ['초급', '중급', '고급', '전문가', '마스터', '엘리트', '레전드', '미스터리', '카오스', '절대자'];
    
    if (level <= names.length) {
        return names[level - 1];
    } else {
        // 레벨 10 이상일 때는 동적 이름 생성
        const extraLevel = level - names.length;
        if (extraLevel <= 10) {
            return `절대자+${extraLevel}`;
        } else if (extraLevel <= 20) {
            return `신화+${extraLevel - 10}`;
        } else if (extraLevel <= 30) {
            return `전설+${extraLevel - 20}`;
        } else {
            return `무한+${extraLevel - 30}`;
        }
    }
}

// 키 이벤트 리스너 수정
document.addEventListener('keydown', (e) => {
    if (e.code in keys) {
        keys[e.code] = true;
        
        // 시작 화면에서 스페이스바를 누르면 게임 화면으로 전환
        if (isStartScreen && e.code === 'Space') {
            isStartScreen = false;
            gameStarted = false; // 화면 터치 대기 상태
            console.log('모바일에서 게임 시작 준비 - 화면 터치 대기');
            // 모바일에서 게임 시작 시 전체화면 모드 활성화
            if (isMobile) {
                setTimeout(() => {
                    reactivateFullscreen();
                }, 100);
            }
            // 데스크탑에서는 바로 gameStarted 해제
            if (!isMobile && !gameStarted) {
                gameStarted = true;
                console.log('데스크탑에서 게임 시작됨');
            }
            return;
        }
        
        // 게임 오버 화면에서 스페이스바를 누르면 게임 재시작
        if (isGameOver && e.code === 'Space') {
            restartGame();
            gameStarted = false; // 화면 터치 대기 상태
            console.log('게임 오버 후 게임 시작 준비 - 화면 터치 대기');
            // 모바일에서 게임 재시작 시 전체화면 모드 활성화
            if (isMobile) {
                setTimeout(() => {
                    reactivateFullscreen();
                }, 100);
            }
            // 데스크탑에서는 바로 gameStarted 해제
            if (!isMobile && !gameStarted) {
                gameStarted = true;
                console.log('데스크탑에서 게임 재시작됨');
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
            
            // 게임 오버 시 폭발 효과음 (볼륨 2배)
            playExplosionSoundSafe(1.0, true);
            
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
    const prevScore = score;
    score += points;
    
    
    levelScore += points;

    // 특수 무기 게이지 증가
    if (!specialWeaponCharged) {
        specialWeaponCharge += points;
        if (specialWeaponCharge >= SPECIAL_WEAPON_MAX_CHARGE) {
            specialWeaponCharged = true;
            specialWeaponCharge = SPECIAL_WEAPON_MAX_CHARGE;
            if (specialWeaponStock < SPECIAL_WEAPON_MAX_STOCK) {
                specialWeaponStock++; // 특수무기 보유 개수 증가
                console.log(`특수무기 충전 완료! 보유 개수: ${specialWeaponStock}`);
            } else {
                console.log(`특수무기 최대 보유 개수 도달 (${SPECIAL_WEAPON_MAX_STOCK}개) - 추가 획득 불가`);
            }
        }
    } else {
        // 이미 충전된 상태에서 - 추가 특수무기 획득을 위한 충전 진행
        console.log(`특수무기 충전 상태 확인 - specialWeaponCharge: ${specialWeaponCharge}, SPECIAL_WEAPON_MAX_CHARGE: ${SPECIAL_WEAPON_MAX_CHARGE}, specialWeaponStock: ${specialWeaponStock}`);
        
        // 현재 충전량이 최대값에 도달하지 않은 경우에만 충전 진행
        if (specialWeaponCharge < SPECIAL_WEAPON_MAX_CHARGE) {
            specialWeaponCharge += points;
            console.log(`특수무기 충전 진행 - 추가된 점수: ${points}, 새로운 충전량: ${specialWeaponCharge}`);
            if (specialWeaponCharge >= SPECIAL_WEAPON_MAX_CHARGE) {
                if (specialWeaponStock < SPECIAL_WEAPON_MAX_STOCK) {
                    specialWeaponStock++; // 특수무기 보유 개수 추가 증가
                    specialWeaponCharge = SPECIAL_WEAPON_MAX_CHARGE;
                    console.log(`특수무기 추가 획득! 보유 개수: ${specialWeaponStock}`);
                } else {
                    specialWeaponCharge = SPECIAL_WEAPON_MAX_CHARGE;
                    console.log(`특수무기 최대 보유 개수 도달 (${SPECIAL_WEAPON_MAX_STOCK}개) - 추가 획득 불가`);
                }
            }
        } else {
            // 충전량이 이미 최대값에 도달한 경우 - 추가 특수무기 획득을 위해 충전량 초기화 후 재충전
            console.log(`특수무기 충전량이 이미 최대값에 도달함 - 추가 특수무기 획득을 위해 충전량 초기화`);
            specialWeaponCharge = points; // 현재 점수로 충전 시작
            console.log(`특수무기 재충전 시작 - 초기 충전량: ${specialWeaponCharge}`);
            if (specialWeaponCharge >= SPECIAL_WEAPON_MAX_CHARGE) {
                if (specialWeaponStock < SPECIAL_WEAPON_MAX_STOCK) {
                    specialWeaponStock++; // 특수무기 보유 개수 추가 증가
                    specialWeaponCharge = SPECIAL_WEAPON_MAX_CHARGE;
                    console.log(`특수무기 추가 획득! 보유 개수: ${specialWeaponStock}`);
                } else {
                    specialWeaponCharge = SPECIAL_WEAPON_MAX_CHARGE;
                    console.log(`특수무기 최대 보유 개수 도달 (${SPECIAL_WEAPON_MAX_STOCK}개) - 추가 획득 불가`);
                }
            }
        }
    }

    // 최고 점수 즉시 업데이트 및 저장
    if (score > highScore) {
        highScore = score;
        saveHighScoreDirectly(highScore, 'updateScore');
    }

    // 추가 비행기 구간 진입 체크 - 자동 활성화 제거
    // 플레이어가 직접 점수를 모아야 함
}

// 두 번째 비행기 처리 함수 수정 - 획득/소멸만 담당
function handleSecondPlane(forceAppear = false) {
    try {
        const currentTime = Date.now(); // 현재 시간을 함수 시작 시 정의
        
        // 전역 변수 초기화
        if (!window.lastSecondPlaneScore) window.lastSecondPlaneScore = 0;
        
            // 강제 등장이 아니고, 이미 두 번째 비행기가 있거나 타이머가 활성화된 상태면 획득하지 않음
    // 단, 강제 등장인 경우에는 쿨다운을 무시
    if (!forceAppear && (hasSecondPlane || secondPlaneTimer > 0 || isSecondPlaneOnCooldown)) {
        // 획득 차단 로그는 2초마다만 출력 (성능 최적화)
        if (!window.lastBlockLogTime || currentTime - window.lastBlockLogTime >= 2000) {
            console.log(`두 번째 비행기 획득 차단: 강제등장=${forceAppear}, 활성화=${hasSecondPlane}, 타이머=${secondPlaneTimer}, 쿨다운=${isSecondPlaneOnCooldown}, 점수=${score}`);
            window.lastBlockLogTime = currentTime;
        }
        return;
    }
    
    // 추가 안전장치: 점수 조건이 충족되어도 추가 비행기가 활성화된 상태에서는 절대 획득하지 않음
    if (hasSecondPlane || secondPlaneTimer > 0) {
        console.log(`점수 조건 충족되었지만 추가 비행기 활성화 중 - 획득 차단`);
        return;
    }
    
    // 쿨다운 완료 후 디스카운트 단계에서는 자동 획득 방지
    if (window.cooldownCompletedTime && window.cooldownCompletedTime > 0) {
        console.log(`쿨다운 완료 후 디스카운트 단계 - 자동 획득 차단`);
        return;
    }
    
            // 다음 임계값 계산
        const nextThreshold = Math.ceil(score / 1000) * 1000;
    
    // 쿨다운 진행 중에는 추가 비행기 획득 불가
    if (isSecondPlaneOnCooldown) {
        console.log(`쿨다운 진행 중 - 추가 비행기 획득 불가: 점수=${score}, 임계값=${nextThreshold}`);
        return;
    }
    
    // 디스카운트 단계에서는 점수 조건이 충족되어도 자동 획득하지 않음
    // (디스카운트가 완료될 때까지 대기)
    if (window.cooldownCompletedTime && window.cooldownCompletedTime > 0) {
        const timeSinceCooldown = Date.now() - window.cooldownCompletedTime;
        const discountSeconds = Math.floor(timeSinceCooldown / 1000);
        const discountedScore = Math.max(0, 500 - (discountSeconds * 5));
        
        if (discountedScore > 0) {
            console.log(`디스카운트 진행 중 - 자동 획득 차단: ${discountedScore}점 남음 (${discountSeconds}초 경과)`);
            return;
        }
    }
    
    const shouldGetPlane = score >= 1000 && score >= (window.lastSecondPlaneScore || 0) + 1000;
    
    if (shouldGetPlane) {
        // 두 번째 비행기 획득
        hasSecondPlane = true;
        secondPlane.x = player.x - 60;
        secondPlane.y = player.y;
        secondPlaneTimer = Date.now();
        window.lastSecondPlaneScore = nextThreshold;
        
        // 쿨다운 상태 초기화 (새로운 추가 비행기 획득 시)
        isSecondPlaneOnCooldown = false;
        secondPlaneCooldownTimer = 0;
        
        // 추가 안전장치: 획득 후 상태 완전 고정
        window.secondPlaneAcquired = true;
        window.secondPlaneAcquireTime = currentTime;
        
        console.log(`두 번째 비행기 획득 - 타이머 시작: 점수=${score}, 임계값=${nextThreshold}, 강제등장=${forceAppear}, 타이머값=${secondPlaneTimer}`);
        console.log(`상태 고정: 추가 비행기 활성화 중에는 절대 재획득 불가`);
        console.log(`획득 후 상태: hasSecondPlane=${hasSecondPlane}, secondPlaneTimer=${secondPlaneTimer}, isSecondPlaneOnCooldown=${isSecondPlaneOnCooldown}`);
        
        // 획득 메시지 표시 (한 번만)
        showSecondPlaneMessage('추가 비행기 획득!', 'yellow');
    } else {
        console.log(`점수 조건 미충족: 현재점수=${score}, 필요점수=${(window.lastSecondPlaneScore || 0) + 2000}, nextThreshold=${nextThreshold}`);
    }
    } catch (error) {
        console.error('두 번째 비행기 처리 중 오류 발생:', error);
        console.error('오류 스택:', error.stack);
    }
}

// 두 번째 비행기 타이머 관리 함수 - 완전히 재설계
function updateSecondPlaneTimer() {
    try {
        const currentTime = Date.now();
    
    // 추가 비행기 활성화 중에는 절대 재획득하지 않도록 강제 차단
    if (hasSecondPlane || secondPlaneTimer > 0) {
        // 점수 조건이 충족되어도 추가 비행기 활성화 중에는 획득 차단
        const nextThreshold = Math.floor(score / 2000) * 2000;
        if (score >= nextThreshold && score >= (window.lastSecondPlaneScore || 0) + 2000) {
            console.log(`타이머 업데이트 중 점수 조건 충족 감지 - 추가 비행기 활성화 중이므로 획득 차단`);
        }
    }
    
    // 두 번째 비행기가 활성화되어 있고 타이머가 유효한 경우에만 처리
    if (hasSecondPlane && secondPlaneTimer > 0) {
        const elapsedTime = currentTime - secondPlaneTimer;
        
        // 타이머가 비정상적인 값이면 강제 초기화
        if (elapsedTime < 0 || elapsedTime > 15000) {
            console.warn('두 번째 비행기 타이머 비정상 값 감지:', {
                elapsedTime: elapsedTime,
                timestamp: secondPlaneTimer,
                currentTime: currentTime
            });
            
            // 상태 강제 초기화
            hasSecondPlane = false;
            secondPlaneTimer = 0;
            return;
        }
        
        // 명확한 타이머 로직 - 정확히 10초(10000ms) 경과 시 즉시 소멸
        if (elapsedTime >= 10000) {
            console.log(`두 번째 비행기 타이머 만료: 경과 ${elapsedTime}ms`);
            
            // 상태 즉시 초기화
            hasSecondPlane = false;
            secondPlaneTimer = 0;
            
            // 20초 쿨다운 시작
            isSecondPlaneOnCooldown = true;
            secondPlaneCooldownTimer = currentTime;
            
            // 소멸 메시지 표시
            showSecondPlaneMessage('추가 비행기 소멸!', 'red');
            
            console.log('두 번째 비행기 소멸 완료 - 20초 쿨다운 시작');
            return;
        }
        
        // 디버깅: 타이머 상태 로그 (1초마다)
        if (Math.floor(elapsedTime / 1000) !== Math.floor((elapsedTime - 16) / 1000) && elapsedTime > 0) {
            const remainingTime = Math.max(0, Math.ceil((10000 - elapsedTime) / 1000));
            console.log(`두 번째 비행기 타이머: ${remainingTime}초 남음 (경과: ${elapsedTime}ms)`);
            
            // 타이머 검증 로그 (남은 시간이 5초 이하일 때만 상세 로그)
            if (remainingTime <= 5) {
                console.log(`타이머 상세 정보: 현재시간=${currentTime}, 타이머값=${secondPlaneTimer}, 경과시간=${elapsedTime}ms`);
            }
        }
        
        // 실시간 타이머 상태 확인 (매 프레임마다)
        const remainingTime = Math.max(0, Math.ceil((10000 - elapsedTime) / 1000));
        if (remainingTime <= 8) { // 8초 이하일 때 상세 로그
            console.log(`실시간 타이머: ${remainingTime}초 남음, 경과: ${elapsedTime}ms, 현재시간: ${currentTime}, 타이머값: ${secondPlaneTimer}`);
        }
    }
    
    // 쿨다운 타이머 관리
    if (isSecondPlaneOnCooldown) {
        const cooldownElapsed = currentTime - secondPlaneCooldownTimer;
        
        // 쿨다운 진행 상황 로그 (5초마다)
        if (Math.floor(cooldownElapsed / 5000) !== Math.floor((cooldownElapsed - 16) / 5000) && cooldownElapsed > 0) {
            const remainingCooldown = Math.max(0, Math.ceil((20000 - cooldownElapsed) / 1000));
            console.log(`쿨다운 진행 중: ${remainingCooldown}초 남음 (경과: ${cooldownElapsed}ms)`);
        }
        
        if (cooldownElapsed >= 20000) { // 20초 쿨다운
            console.log('=== 쿨다운 완료 감지 ===');
            console.log('쿨다운 경과 시간:', cooldownElapsed, 'ms');
            console.log('쿨다운 완료 전 상태:', {
                isSecondPlaneOnCooldown,
                secondPlaneCooldownTimer,
                cooldownCompletedTime: window.cooldownCompletedTime
            });
            
            isSecondPlaneOnCooldown = false;
            secondPlaneCooldownTimer = 0;
            window.cooldownCompletedTime = currentTime; // 쿨다운 완료 시점 기록
            
            console.log('쿨다운 완료 후 상태:', {
                isSecondPlaneOnCooldown,
                secondPlaneCooldownTimer,
                cooldownCompletedTime: window.cooldownCompletedTime
            });
            console.log('두 번째 비행기 쿨다운 완료 (20초) - 이제 디스카운트 시작');
            console.log('디스카운트 시작 시점:', new Date(currentTime).toLocaleTimeString());
            console.log('=== 쿨다운 완료 처리 완료 ===');
        }
    }
    
    // 상태 일관성 검증 및 복구
    if (hasSecondPlane && secondPlaneTimer === 0) {
        console.warn('상태 불일치 감지: hasSecondPlane=true, secondPlaneTimer=0 - 복구');
        hasSecondPlane = false;
    }
    
    if (!hasSecondPlane && secondPlaneTimer > 0) {
        console.warn('상태 불일치 감지: hasSecondPlane=false, secondPlaneTimer>0 - 복구');
        secondPlaneTimer = 0;
    }
    
    // 쿨다운 상태 검증
    if (isSecondPlaneOnCooldown && secondPlaneCooldownTimer === 0) {
        console.warn('쿨다운 상태 불일치 감지: isSecondPlaneOnCooldown=true, secondPlaneCooldownTimer=0 - 복구');
        isSecondPlaneOnCooldown = false;
    }
    
    if (!isSecondPlaneOnCooldown && secondPlaneCooldownTimer > 0) {
        console.warn('쿨다운 상태 불일치 감지: isSecondPlaneOnCooldown=false, secondPlaneCooldownTimer>0 - 복구');
        secondPlaneCooldownTimer = 0;
    }
    
    // 타이머 강제 동기화 (타이머가 멈춰있을 경우)
    if (hasSecondPlane && secondPlaneTimer > 0) {
        const forceCheckTime = Date.now();
        const forceElapsed = forceCheckTime - secondPlaneTimer;
        
        // 10초 이상 경과했는데 아직 활성화되어 있다면 강제 정리
        if (forceElapsed >= 10000) {
            console.error(`타이머 강제 동기화: ${forceElapsed}ms 경과하여 상태 강제 정리`);
            hasSecondPlane = false;
            secondPlaneTimer = 0;
            // 20초 쿨다운 시작
            isSecondPlaneOnCooldown = true;
            secondPlaneCooldownTimer = forceCheckTime;
            showSecondPlaneMessage('추가 비행기 소멸!', 'red');
            console.log('강제 소멸 완료 - 20초 쿨다운 시작');
        }
    }
    } catch (error) {
        console.error('두 번째 비행기 타이머 업데이트 중 오류 발생:', error);
        console.error('오류 스택:', error.stack);
    }
}

// 두 번째 비행기 메시지 표시 함수 (중복 표시 방지)
let secondPlaneMessageTimer = 0;
let secondPlaneMessage = '';
let secondPlaneCooldownTimer = 0; // 추가 비행기 쿨다운 타이머
let isSecondPlaneOnCooldown = false; // 추가 비행기 쿨다운 상태
function showSecondPlaneMessage(message, color) {
    const currentTime = Date.now();
    
    // 메시지가 변경되었거나 처음 표시되는 경우에만 타이머 리셋
    if (secondPlaneMessage !== message) {
        secondPlaneMessage = message;
        secondPlaneMessageTimer = currentTime;
    }
    
    // 3초간만 메시지 표시
    if (currentTime - secondPlaneMessageTimer < 3000) {
        ctx.fillStyle = color;
        ctx.font = '40px Arial';
        ctx.fillText(message, canvas.width/2 - 150, canvas.height/2);
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
            // 보스 총알 처리 - 패턴별 이동 방식 적용
            const props = bullet.patternProperties;
            
            // 패턴별 이동 방식
            switch(props.movementType) {
                case 'linear':
                    // 직선 이동
                    bullet.x += Math.cos(bullet.angle) * bullet.speed;
                    bullet.y += Math.sin(bullet.angle) * bullet.speed;
                    break;
                    
                case 'spiral':
                    // 나선형 이동
                    const spiralRadius = 2;
                    const spiralSpeed = 0.1;
                    bullet.spiralAngle = bullet.spiralAngle || 0;
                    bullet.spiralAngle += spiralSpeed;
                    bullet.x += Math.cos(bullet.angle) * bullet.speed + Math.cos(bullet.spiralAngle) * spiralRadius;
                    bullet.y += Math.sin(bullet.angle) * bullet.speed + Math.sin(bullet.spiralAngle) * spiralRadius;
                    break;
                    
                case 'wave':
                    // 파도형 이동
                    const waveAmplitude = 3;
                    const waveFrequency = 0.05;
                    bullet.waveOffset = bullet.waveOffset || 0;
                    bullet.waveOffset += waveFrequency;
                    bullet.x += Math.cos(bullet.angle) * bullet.speed + Math.sin(bullet.waveOffset) * waveAmplitude;
                    bullet.y += Math.sin(bullet.angle) * bullet.speed;
                    break;
                    
                case 'homing':
                    // 유도 이동 (플레이어 방향으로 약간씩 조정)
                    const targetX = player.x + player.width/2;
                    const targetY = player.y + player.height/2;
                    const currentAngle = Math.atan2(bullet.y - targetY, bullet.x - targetX);
                    const angleDiff = (currentAngle - bullet.angle + Math.PI) % (2 * Math.PI) - Math.PI;
                    bullet.angle += angleDiff * 0.1; // 부드럽게 방향 조정
                    bullet.x += Math.cos(bullet.angle) * bullet.speed;
                    bullet.y += Math.sin(bullet.angle) * bullet.speed;
                    break;
                    
                case 'chaotic':
                    // 혼돈형 이동 (랜덤한 방향 변화)
                    bullet.chaosTimer = bullet.chaosTimer || 0;
                    bullet.chaosTimer++;
                    if (bullet.chaosTimer % 10 === 0) {
                        bullet.angle += (Math.random() - 0.5) * 0.3;
                    }
                    bullet.x += Math.cos(bullet.angle) * bullet.speed;
                    bullet.y += Math.sin(bullet.angle) * bullet.speed;
                    break;
                    
                case 'vortex':
                    // 소용돌이형 이동
                    const vortexRadius = 4;
                    const vortexSpeed = 0.15;
                    bullet.vortexAngle = bullet.vortexAngle || 0;
                    bullet.vortexAngle += vortexSpeed;
                    bullet.x += Math.cos(bullet.angle) * bullet.speed + Math.cos(bullet.vortexAngle) * vortexRadius;
                    bullet.y += Math.sin(bullet.angle) * bullet.speed + Math.sin(bullet.vortexAngle) * vortexRadius;
                    break;
                    
                default:
                    // 기본 직선 이동
                    bullet.x += Math.cos(bullet.angle) * bullet.speed;
                    bullet.y += Math.sin(bullet.angle) * bullet.speed;
            }
            
                    // 회전 효과 - 패턴별 속도 적용
        bullet.rotation += props.rotationSpeed;
        
        // 패턴별 추가 효과
        if (props.movementType === 'spiral') {
            // 나선형: 총알 자체도 회전
            bullet.rotation += 0.05;
        } else if (props.movementType === 'vortex') {
            // 소용돌이형: 빠른 회전
            bullet.rotation += 0.1;
        }
            
            // 꼬리 효과 업데이트 - 패턴별 길이 적용
            bullet.trail.unshift({x: bullet.x, y: bullet.y});
            if (bullet.trail.length > props.trailLength) bullet.trail.pop();
            
            // 총알 그리기
            ctx.save();
            ctx.translate(bullet.x, bullet.y);
            ctx.rotate(bullet.rotation);
            
            // 총알 본체 - 패턴별 색상 및 펄스 효과 적용
            const bulletColor = bullet.color || '#FF0000';
            const rgbColor = hexToRgb(bulletColor);
            
            // 펄스 효과 계산
            let pulseScale = 1;
            if (props.pulseEffect) {
                pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.2;
            }
            
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, (bullet.width/2) * pulseScale);
            gradient.addColorStop(0, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.8)`);
            gradient.addColorStop(1, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, (bullet.width/2) * pulseScale, 0, Math.PI * 2);
            ctx.fill();
            
            // 총알 꼬리 - 패턴별 색상 및 효과 적용
            bullet.trail.forEach((pos, index) => {
                const alpha = 1 - (index / bullet.trail.length);
                const trailSize = bullet.width/2 * (1 - index/bullet.trail.length) * pulseScale;
                
                // 패턴별 꼬리 효과
                if (props.movementType === 'spiral' || props.movementType === 'vortex') {
                    // 나선형/소용돌이형: 회전하는 꼬리
                    const trailRotation = bullet.rotation + index * 0.2;
                    ctx.save();
                    ctx.translate(pos.x - bullet.x, pos.y - bullet.y);
                    ctx.rotate(trailRotation);
                    ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${alpha * 0.6})`;
                    ctx.beginPath();
                    ctx.arc(0, 0, trailSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else if (props.movementType === 'wave') {
                    // 파도형: 물결 모양 꼬리
                    const waveOffset = Math.sin(index * 0.5 + Date.now() * 0.01) * 2;
                    ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${alpha * 0.7})`;
                    ctx.beginPath();
                    ctx.arc(pos.x - bullet.x + waveOffset, pos.y - bullet.y, trailSize, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // 기본 꼬리
                    ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${alpha * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(pos.x - bullet.x, pos.y - bullet.y, trailSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            
            // 총알 주변에 빛나는 효과 - 패턴별 색상 및 크기 적용
            const glowSize = bullet.width * (props.pulseEffect ? pulseScale : 1);
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            glowGradient.addColorStop(0, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.3)`);
            glowGradient.addColorStop(1, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0)`);
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
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
            // 특수 무기 총알 처리 (상단 방향으로 발사)
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            
            // 꼬리 효과 추가
            bullet.trail.unshift({x: bullet.x, y: bullet.y});
            if (bullet.trail.length > 5) bullet.trail.pop();
            
            // 총알 그리기 (청록색 원형, 더 큰 크기로 시각적 효과 향상)
            ctx.fillStyle = '#00ffff';
            
            // 원형 특수무기 총알 그리기 (확산탄과 동일한 크기)
            const bulletRadius = bullet.width/2; // 원본 크기 (확산탄과 동일)
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // 꼬리 그리기 (원형, 원본 크기)
            bullet.trail.forEach((pos, index) => {
                const alpha = 1 - (index / bullet.trail.length);
                const trailSize = bullet.width/2 * (1 - index/bullet.trail.length);
                ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, trailSize, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // 총알 주변에 빛나는 효과 (원형, 원본 크기)
            const gradient = ctx.createRadialGradient(
                bullet.x, bullet.y, 0,
                bullet.x, bullet.y, bullet.width
            );
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.width, 0, Math.PI * 2);
            ctx.fill();
            
            // 총알 지속 시간 감소
            bullet.life--;
            if (bullet.life <= 0) return false;
            
            // 특수무기 충돌 감지는 기존 충돌 감지 시스템에서 처리됨
            // 여기서는 총알만 제거하지 않고 계속 이동하도록 함
        } else {
            // 일반 총알 이동
            bullet.y -= bullet.speed;
            ctx.fillStyle = 'yellow';
            
            // 원형 일반 총알 그리기 (1.5배 크기)
            const bulletRadius = bullet.width/2 * 1.5; // 1.5배 크기
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2);
            ctx.fill();
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

// 보스 점수 계산 함수
function getBossScore() {
    return gameLevel <= 10 ? 25 : 30; // 보스 헬리콥터 파괴 시 점수
}

// 보스 관련 상수 추가
const BOSS_SETTINGS = {
    BASE_HEALTH: 3000,     // 기본 체력 3000에서 시작
    HEALTH_PER_LEVEL: 1000, // 레벨당 체력 증가량 1000
    MAX_HEALTH: 7000,      // 최대 체력 7000
    DAMAGE: 50,          // 보스 총알 데미지
    SPEED: 2.0,         // 보스 이동 속도를 2.0으로 조정 (적당한 속도)
    BULLET_SPEED: 4,    // 보스 총알 속도를 3에서 4로 증가
    PATTERN_INTERVAL: 1500,  // 1.5초 간격으로 패턴 발사
    SPAWN_INTERVAL: 5000,   // 보스 출현 간격 5초로 설정
    // MIN_STAY_TIME 제거 - 보스는 체력이 0이 되면 즉시 파괴됨
    // 페이즈 임계값은 동적으로 계산됨
};

// 보스 패턴 상수 - 지정된 14개 패턴만 포함
const BOSS_PATTERNS = {
    SNOWFLAKE_SHOT: 'snowflake_shot',  // 눈 결정체 - 흰색
    PINWHEEL_SHOT: 'pinwheel_shot',    // 바람개비 - 청녹색 (#90EE90)
    TRIANGLE_SHOT: 'triangle_shot',    // 삼각형 - 밝은 라임그린 (#32CD32)
    RECTANGLE_SHOT: 'rectangle_shot',  // 정사각형 - 연두색 (#ADFF2F)
    PENTAGON_SHOT: 'pentagon_shot',    // 오각형 - 노란색 (#FFFF00)
    HEXAGON_SHOT: 'hexagon_shot',      // 육각형 - 밝은 회색 (#D3D3D3)
    OCTAGON_SHOT: 'octagon_shot',      // 팔각형 - 밝은 골드 (#FFD700)
    CIRCLE_SHOT: 'circle_shot',        // 원형 - 청녹색 (#20B2AA)
    CROSS_SHOT: 'cross_shot',          // 십자 - 밝은 빨간색 (#FF4500)
    HEART_SHOT: 'heart_shot',          // 하트 - 밝은 핫핑크 (#FF69B4)
    STAR_SHOT: 'star_shot',            // 별 - 노란색
    FLOWER_SHOT: 'flower_shot',        // 꽃 - 밝은 딥핑크 (#FF1493)
    GEAR_SHOT: 'gear_shot',            // 기어 - 하얀색 (#FFFFFF)
    MOON_SHOT: 'moon_shot'             // 달 - 노란색 (#FFD700)
};

// 게임 상태 변수에 추가
let lastBossSpawnTime = Date.now();  // 마지막 보스 출현 시간을 현재 시간으로 초기화

// 보스별 랜덤 확산탄 모양 테마 선택 함수
function getRandomBulletShapeTheme() {
    const shapeThemes = [
        'geometric',    // 기하학적 모양 (원형, 사각형, 삼각형, 다이아몬드, 오각형)
        'organic',      // 유기적 모양 (하트, 별, 꽃, 눈 결정체, 달)
        'mechanical',   // 기계적 모양 (톱니바퀴, 바람개비, 팔각형, 육각형)
        'spiral',       // 나선형 모양 (나선, 바람개비, 톱니바퀴)
        'mixed'         // 혼합 모양 (모든 모양 랜덤)
    ];
    
    const selectedTheme = shapeThemes[Math.floor(Math.random() * shapeThemes.length)];
    console.log('🎨 보스 확산탄 모양 테마 선택:', selectedTheme);
    return selectedTheme;
}

// 테마에 따른 모양 매핑 함수
function getShapeByTheme(patternType, theme) {
    const themeShapes = {
        'geometric': {
            'basic': 'circle',
            'circle_shot': 'circle',
            'cross_shot': 'rectangle',
            'spiral_shot': 'diamond',
            'diamond_shot': 'diamond',
            'random_spread': 'circle',
            'triple_wave': 'triangle',
            'windmill_shot': 'pentagon',
            'gear_shot': 'octagon',
            'heart_shot': 'circle',
            'star_shot': 'star',
            'flower_shot': 'hexagon',
            'ice_shot': 'hexagon',
            'burst_shot': 'octagon',
            'snowflake_shot': 'circle',
            'moon_shot': 'circle',
            'rectangle_shot': 'rectangle',
            'pentagon_shot': 'pentagon'
        },
        'organic': {
            'basic': 'heart',
            'circle_shot': 'star',
            'cross_shot': 'flower',
            'spiral_shot': 'snowflake',
            'diamond_shot': 'moon',
            'random_spread': 'heart',
            'triple_wave': 'star',
            'windmill_shot': 'flower',
            'gear_shot': 'snowflake',
            'heart_shot': 'heart',
            'star_shot': 'star',
            'flower_shot': 'flower',
            'ice_shot': 'snowflake',
            'burst_shot': 'star',
            'snowflake_shot': 'snowflake',
            'moon_shot': 'moon',
            'rectangle_shot': 'heart',
            'pentagon_shot': 'star'
        },
        'mechanical': {
            'basic': 'gear',
            'circle_shot': 'windmill',
            'cross_shot': 'octagon',
            'spiral_shot': 'gear',
            'diamond_shot': 'hexagon',
            'random_spread': 'windmill',
            'triple_wave': 'octagon',
            'windmill_shot': 'windmill',
            'gear_shot': 'gear',
            'heart_shot': 'hexagon',
            'star_shot': 'octagon',
            'flower_shot': 'gear',
            'ice_shot': 'hexagon',
            'burst_shot': 'octagon',
            'snowflake_shot': 'gear',
            'moon_shot': 'windmill',
            'rectangle_shot': 'octagon',
            'pentagon_shot': 'gear'
        },
        'spiral': {
            'basic': 'spiral',
            'circle_shot': 'spiral',
            'cross_shot': 'windmill',
            'spiral_shot': 'spiral',
            'diamond_shot': 'spiral',
            'random_spread': 'spiral',
            'triple_wave': 'spiral',
            'windmill_shot': 'windmill',
            'gear_shot': 'gear',
            'heart_shot': 'spiral',
            'star_shot': 'spiral',
            'flower_shot': 'spiral',
            'ice_shot': 'spiral',
            'burst_shot': 'spiral',
            'snowflake_shot': 'spiral',
            'moon_shot': 'spiral',
            'rectangle_shot': 'spiral',
            'pentagon_shot': 'spiral'
        },
        'mixed': {
            'basic': 'circle',
            'circle_shot': 'star',
            'cross_shot': 'rectangle',
            'spiral_shot': 'spiral',
            'diamond_shot': 'diamond',
            'random_spread': 'heart',
            'triple_wave': 'triangle',
            'windmill_shot': 'windmill',
            'gear_shot': 'gear',
            'heart_shot': 'heart',
            'star_shot': 'star',
            'flower_shot': 'flower',
            'ice_shot': 'hexagon',
            'burst_shot': 'octagon',
            'snowflake_shot': 'snowflake',
            'moon_shot': 'moon',
            'rectangle_shot': 'rectangle',
            'pentagon_shot': 'pentagon'
        }
    };
    
    return themeShapes[theme]?.[patternType] || 'circle';
}

// 테마 무관 전체 패턴 랜덤 선택 함수 (모든 패턴 골고루 선택)
function selectPatternByTheme(boss) {
    // 모든 사용 가능한 패턴 정의
    const allPatterns = [
        'snowflake_shot',  // 눈 결정체 - 흰색
        'pinwheel_shot',   // 바람개비 - 청녹색 (#90EE90)
        'triangle_shot',    // 삼각형 - 밝은 라임그린 (#32CD32)
        'rectangle_shot',  // 정사각형 - 연두색 (#ADFF2F)
        'pentagon_shot',   // 오각형 - 주황색 (#FFA500)
        'hexagon_shot',    // 육각형 - 밝은 회색 (#D3D3D3)
        'octagon_shot',    // 팔각형 - 밝은 골드 (#FFD700)
        'circle_shot',     // 원형 - 청녹색 (#20B2AA)
        'cross_shot',      // 십자 - 밝은 빨간색 (#FF4500)
        'heart_shot',      // 하트 - 밝은 핫핑크 (#FF69B4)
        'star_shot',       // 별 - 노란색
        'flower_shot',     // 꽃 - 밝은 딥핑크 (#FF1493)
        'gear_shot',       // 기어 - 은색 (#C0C0C0)
        'moon_shot'        // 달 - 카키색 (#F0E68C)
    ];
    
    // 보스의 패턴 배열 초기화 (테마 무관)
    if (!boss.allPatterns) {
        boss.allPatterns = [...allPatterns];
        boss.currentPatternIndex = 0;
        boss.patternCycleCount = 0;
        
        // 패턴 배열 셔플 (Fisher-Yates)
        for (let i = boss.allPatterns.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [boss.allPatterns[i], boss.allPatterns[j]] = [boss.allPatterns[j], boss.allPatterns[i]];
        }
        
        console.log('🎲 전체 패턴 배열 초기화 (테마 무관):', {
            theme: boss.bulletShapeTheme,
            patterns: boss.allPatterns,
            totalPatterns: boss.allPatterns.length,
            note: '모든 패턴이 랜덤 순서로 배치됨'
        });
    }
    
    // 순차적으로 패턴 선택 (모든 패턴을 골고루 발사)
    const selectedPattern = boss.allPatterns[boss.currentPatternIndex];
    boss.currentPatternIndex++;
    
    // 모든 패턴을 한 번씩 발사했으면 다시 셔플
    if (boss.currentPatternIndex >= boss.allPatterns.length) {
        boss.currentPatternIndex = 0;
        boss.patternCycleCount++;
        
        // 패턴 배열 재셔플
        for (let i = boss.allPatterns.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [boss.allPatterns[i], boss.allPatterns[j]] = [boss.allPatterns[j], boss.allPatterns[i]];
        }
        
                console.log('🔄 전체 패턴 사이클 완료, 재셔플:', {
                    theme: boss.bulletShapeTheme,
                    cycleCount: boss.patternCycleCount,
                    newOrder: boss.allPatterns,
                    note: '14개 패턴 모두 발사 완료, 새로운 랜덤 순서로 재시작'
                });
    }
    
    boss.shapeChangeCount++;
    
    console.log('🎯 패턴 선택:', {
        selectedPattern: selectedPattern,
        index: boss.currentPatternIndex - 1,
        remaining: boss.allPatterns.length - boss.currentPatternIndex,
        cycle: boss.patternCycleCount,
        theme: boss.bulletShapeTheme,
        totalPatterns: boss.allPatterns.length,
        note: '18개 패턴 모두 한번씩 랜덤으로 발사됨'
    });
    
    return selectedPattern;
}

// 보스 체력을 5000으로 고정하는 함수
function calculateBossHealth() {
    const fixedHealth = 5000; // 보스 체력을 5000으로 고정
    
    console.log('보스 체력 고정:', {
        gameLevel: gameLevel,
        fixedHealth: fixedHealth,
        note: '모든 레벨에서 보스 체력 5000으로 고정'
    });
    
    return fixedHealth;
}

// 보스 페이즈 임계값을 동적으로 계산하는 함수
function calculateBossPhaseThresholds(bossHealth) {
    return [
        { health: Math.floor(bossHealth * 0.75), speed: 2.5, bulletSpeed: 5 },    // 속도 증가 (75%)
        { health: Math.floor(bossHealth * 0.50), speed: 3.0, bulletSpeed: 6 },    // 속도 증가 (50%)
        { health: Math.floor(bossHealth * 0.25), speed: 3.5, bulletSpeed: 7 }     // 속도 증가 (25%)
    ];
}

// 보스 파괴에 필요한 hitCount를 동적으로 계산하는 함수
function calculateBossHitCount(bossHealth) {
    // 게임 레벨에 따른 비선형적 난이도 증가 적용
    const baseHitCount = 60; // 기본 60발로 증가 (레벨 1에서도 도전적)
    
    // 레벨별 난이도 계수 (비선형적 증가)
    let levelMultiplier;
    if (gameLevel <= 1) {
        levelMultiplier = 1.0; // 레벨 1: 기본 난이도
    } else if (gameLevel <= 3) {
        levelMultiplier = 1.5 + (gameLevel - 1) * 0.3; // 레벨 2-3: 점진적 증가
    } else if (gameLevel <= 5) {
        levelMultiplier = 2.2 + (gameLevel - 3) * 0.4; // 레벨 4-5: 급격한 증가
    } else {
        levelMultiplier = 3.0 + (gameLevel - 5) * 0.5; // 레벨 6+: 극한 난이도
    }
    
    // 체력과 레벨을 모두 고려한 hitCount 계산
    const healthMultiplier = bossHealth / BOSS_SETTINGS.BASE_HEALTH; // 체력 비율
    const calculatedHitCount = Math.floor(baseHitCount * levelMultiplier * healthMultiplier);
    
    // 최소 60발, 최대 150발로 제한 (극한 난이도 지원)
    const finalHitCount = Math.max(60, Math.min(150, calculatedHitCount));
    
    // 패턴 발사 보장을 위한 초기 지연 시간 적용
    const bossSpawnTime = Date.now();
    const timeSinceSpawn = bossSpawnTime - lastBossSpawnTime;
    const minPatternTime = 5000; // 최소 5초간 패턴 발사 보장
    
    // 초기 5초 동안은 hit 카운트 요구량을 50% 증가시켜 패턴 발사 시간 확보
    let adjustedHitCount = finalHitCount;
    if (timeSinceSpawn < minPatternTime) {
        const timeBonus = 1.0 + (minPatternTime - timeSinceSpawn) / minPatternTime * 0.5;
        adjustedHitCount = Math.floor(finalHitCount * timeBonus);
        console.log('⏰ 초기 패턴 발사 보장을 위한 hit 카운트 조정:', {
            timeSinceSpawn: timeSinceSpawn,
            minPatternTime: minPatternTime,
            originalHitCount: finalHitCount,
            adjustedHitCount: adjustedHitCount,
            timeBonus: timeBonus
        });
    }
    
    console.log('보스 hitCount 계산 (비선형적 난이도 증가 + 패턴 발사 보장):', {
        bossHealth: bossHealth,
        gameLevel: gameLevel,
        baseHitCount: baseHitCount,
        levelMultiplier: levelMultiplier,
        healthMultiplier: healthMultiplier,
        calculatedHitCount: calculatedHitCount,
        finalHitCount: finalHitCount,
        adjustedHitCount: adjustedHitCount,
        timeSinceSpawn: timeSinceSpawn
    });
    
    return adjustedHitCount;
}

// 보스 생성 함수 수정
function createBoss() {
    console.log('🎮 보스 헬리콥터 생성 함수 호출됨', {
        bossActive: bossActive,
        isBossActive: isBossActive,
        currentTime: new Date().toISOString(),
        enemiesCount: enemies.length
    });
    
    // 이미 보스가 존재하는 경우 - 더 엄격한 체크
    if (bossActive || isBossActive) {
        console.log('❌ 보스가 이미 존재하여 생성하지 않음', {
            bossActive: bossActive,
            isBossActive: isBossActive
        });
        return;
    }
    
    // enemies 배열에서 보스 존재 여부도 체크
    const existingBoss = enemies.find(enemy => enemy.isBoss);
    if (existingBoss) {
        console.log('❌ enemies 배열에 보스가 이미 존재하여 생성하지 않음', {
            existingBossId: existingBoss.id,
            existingBossHealth: existingBoss.health
        });
        return;
    }
    
    const currentTime = Date.now();
    const timeSinceLastBoss = currentTime - lastBossSpawnTime;
    
    // 시간 체크 (더 자주 등장하도록 개선)
    if (timeSinceLastBoss < BOSS_SETTINGS.SPAWN_INTERVAL) {
        console.log('보스 생성 시간이 되지 않음:', {
            timeSinceLastBoss,
            requiredInterval: BOSS_SETTINGS.SPAWN_INTERVAL,
            remainingTime: BOSS_SETTINGS.SPAWN_INTERVAL - timeSinceLastBoss
        });
        return;
    }
    
    // 10초 내외 랜덤화: 10~14초 사이에서 등장
    const randomJitter = Math.floor(Math.random() * 5000); // 0~4999ms
    const adjustedSpawnInterval = 10000 + randomJitter;
    
    if (timeSinceLastBoss < adjustedSpawnInterval) {
        console.log('레벨 기반 보스 생성 시간 조정:', {
            timeSinceLastBoss,
            adjustedSpawnInterval,
            gameLevel
        });
        return;
    }
    
    console.log('🎮 보스 헬리콥터 생성 시작:', {
        currentTime,
        lastBossSpawnTime,
        timeSinceLastBoss
    });
    
    // 보스 상태 초기화
    bossActive = true;
    isBossActive = true; // 보스 활성화 상태 설정
    
    console.log('✅ 보스 상태 초기화 완료:', {
        bossActive: bossActive,
        isBossActive: isBossActive
    });
    
    // 레벨에 따라 동적으로 보스 체력 계산
    const calculatedBossHealth = calculateBossHealth();
    bossHealth = calculatedBossHealth;
    
    bossPattern = 0;
    bossTimer = currentTime;
    lastBossSpawnTime = currentTime; // 보스 생성 시간 기록
    bossDestroyed = false;
    
    console.log('보스 상태 초기화 완료:', {
        bossActive,
        isBossActive,
        bossHealth,
        lastBossSpawnTime: new Date(lastBossSpawnTime).toLocaleTimeString()
    });
    
    // 보스 헬리콥터 객체 생성 (완전히 안정적인 초기 위치)
    const boss = {
        x: canvas.width / 2 - 34,        // 화면 중앙에 고정 (랜덤 제거)
        y: 150,                          // 고정 높이에서 시작 (랜덤 제거)
        width: 68,
        height: 68,
        speed: 0.5,                      // 부드러운 움직임 속도 (떨림 방지)
        pattern: BOSS_PATTERNS.CIRCLE_SHOT,
        angle: 0,
        movePhase: 1,                    // 움직임 활성화 (떨림 방지 움직임용)
        targetX: canvas.width / 2 - 34,  // 목표 위치도 중앙
        targetY: 150,                    // 목표 높이도 고정
        phase: 0,
        patternTimer: currentTime,       // 즉시 첫 번째 공격 시작
        lastShot: currentTime - 2000,    // 과거 시간으로 설정하여 즉시 발사 가능
        patternAngle: 0,                 // 나선 패턴용 각도 초기화
        bulletSpeed: BOSS_SETTINGS.BULLET_SPEED,
        isBoss: true,
        health: calculatedBossHealth,    // 레벨에 따라 동적으로 계산된 체력
        
        // 🎨 보스별 고유 확산탄 모양 설정
        bulletShapeTheme: getRandomBulletShapeTheme(), // 랜덤 모양 테마 선택
        shapeChangeCount: 0,              // 모양 변화 카운터
        // 🚨 모든 랜덤 요소 제거 (떨림 현상 근본 해결)
        // randomOffsetX: 0,              // 랜덤 오프셋 제거
        // randomOffsetY: 0,              // 랜덤 오프셋 제거
        // randomAngle: 0,                // 랜덤 각도 제거
        // randomSpeed: 0,                // 랜덤 속도 제거
        lastUpdateTime: currentTime,
        hitCount: 0,
        totalHitTime: 0,
        lastHitTime: null,
        isBeingHit: false,
        hitDuration: null,               // 피격 상태 지속 시간
        isInvulnerable: false,           // 무적 상태 해제 (즉시 공격 가능)
        invulnerableTimer: null,         // 무적 타이머 해제
        invulnerableDuration: 0,         // 무적 시간 0초
        lifeAdded: false,                // 목숨 추가 플래그 초기화
        type: ENEMY_TYPES.HELICOPTER,
        rotorAngle: 0,
        rotorSpeed: 0.2,                // 보스 메인 로터 속도
        hoverHeight: 150,                // 호버 높이 고정
        hoverTimer: 0,
        hoverDirection: 1,
        canDropBomb: true,
        lastBombDrop: 0,
        bombDropInterval: 3000,
        // 새로운 패턴에 필요한 속성들 추가
        vortexAngle: 0,                  // 소용돌이형 패턴용 각도
        pulsePhase: 0,                   // 맥박형 패턴용 페이즈
        rainbowPhase: 0,                 // 무지개형 패턴용 페이즈
        meteorPhase: 0,                  // 유성형 패턴용 페이즈
        // 패턴 순환 시스템
        patternRotationCounter: 0,       // 패턴 순환 카운터
        patternTimer: currentTime,       // 패턴 타이머를 생성 시간으로 초기화
        // 보스 체류 시간 관리
        spawnTime: currentTime,          // 생성 시간 기록
        // 보스 체류 시간 제한 제거
        // minStayTime: BOSS_SETTINGS.MIN_STAY_TIME,  // 최소 체류 시간 제거
        staticMode: false,               // 부드러운 움직임 모드 (떨림 방지 + 자연스러운 움직임)
        timer: currentTime,              // 움직임 타이머 (떨림 방지 움직임용)
        // 파괴 조건: 동적으로 계산된 hitCount만큼 명중 또는 10초 경과
    };
    
    // 보스 추가
    enemies.push(boss);
    console.log('🎉 보스 생성 완료! enemies 배열에 추가됨:', {
        bossId: boss.id,
        bossHealth: boss.health,
        bossHitCount: boss.hitCount,
        enemiesCount: enemies.length,
        bossActive: bossActive,
        isBossActive: isBossActive,
        bulletShapeTheme: boss.bulletShapeTheme,
        shapeChangeCount: boss.shapeChangeCount,
        lifeAdded: boss.lifeAdded,
        note: '보스가 성공적으로 생성되어 게임에 등장함'
    });
    
            // 🚨 보스 생성 직후 완벽하게 중앙에 고정 (더욱 엄격한 안전한 위치 설정)
        const safeMinX = 40;
        const safeMaxX = canvas.width - boss.width - 40;
        const safeMinY = 100;
        const safeMaxY = canvas.height - boss.height - 200;
        
        boss.x = Math.max(safeMinX, Math.min(safeMaxX, canvas.width / 2 - boss.width / 2));
        boss.y = Math.max(safeMinY, Math.min(safeMaxY, 150));
        boss.centerX = boss.x;  // 중앙 기준점 설정
        boss.hoverHeight = boss.y;  // 호버 높이 설정
        
        // 🚨 단순한 움직임 설정 - 즉시 움직임 시작
        boss.moveTimer = currentTime;  // 움직임 타이머 즉시 시작
        boss.moveDirection = 1;  // 움직임 방향 설정
        boss.moveSpeed = 2;  // 움직임 속도 설정
    
            console.log('🎯 보스 단순 움직임 모드로 생성됨:', {
            x: Math.round(boss.x),
            y: Math.round(boss.y),
            moveTimer: boss.moveTimer,
            moveDirection: boss.moveDirection,
            moveSpeed: boss.moveSpeed,
            status: '단순하고 확실한 움직임 - 매 프레임 움직임'
        });
    
        // 스폰 즉시 1회 패턴 발사 (테마 무관)
        try {
            // 테마 무관 첫 패턴 선택
            const firstPattern = selectPatternByTheme(boss);
            
            console.log('🚀 보스 스폰 즉시 패턴 발사 (테마 무관):', { 
                selectedPattern: firstPattern,
                theme: boss.bulletShapeTheme,
                note: '모든 패턴이 랜덤으로 골고루 선택됨'
            });
            
            switch (firstPattern) {
            case 'snowflake_shot':
                bossFireSnowflakeShot(boss);
                break;
            case 'pinwheel_shot':
                bossFirePinwheelShot(boss);
                break;
            case 'triangle_shot':
                bossFireTriangleShot(boss);
                break;
            case 'rectangle_shot':
                bossFireRectangleShot(boss);
                break;
            case 'pentagon_shot':
                bossFirePentagonShot(boss);
                break;
            case 'hexagon_shot':
                bossFireHexagonShot(boss);
                break;
            case 'octagon_shot':
                bossFireOctagonShot(boss);
                break;
            case 'circle_shot':
                bossFireCircleShot(boss);
                break;
            case 'cross_shot':
                bossFireCrossShot(boss);
                break;
            case 'heart_shot':
                bossFireHeartShot(boss);
                break;
            case 'star_shot':
                bossFireStarShot(boss);
                break;
            case 'flower_shot':
                bossFireFlowerShot(boss);
                break;
            case 'gear_shot':
                bossFireGearShot(boss);
                break;
            case 'moon_shot':
                bossFireMoonShot(boss);
                break;
            default:
                bossFireSnowflakeShot(boss);
                break;
        }
        // 다음 1초 주기를 위해 타이머 리셋
        boss.patternTimer = Date.now();
    } catch (e) {
        console.error('보스 스폰 즉시 발사 실패', e);
    }
    
    // 무적 상태 해제됨 (즉시 공격 가능)
    console.log('🛡️ 보스 무적 상태 해제됨 (즉시 공격 가능)');
    
    console.log('🚁 보스 헬리콥터 생성 완료:', {
        boss: boss,
        bossHealth: bossHealth,
        patternInterval: BOSS_SETTINGS.PATTERN_INTERVAL,
        phaseThresholds: BOSS_SETTINGS.PHASE_THRESHOLDS
    });
}

// 보스 상태 초기화 함수 강화
function resetBossState() {
    console.log('보스 상태 초기화 시작');
    
    // 모든 보스 관련 상태 변수 완전 초기화
    bossActive = false;
    isBossActive = false;
    bossHealth = 0;
    bossDestroyed = false;
    bossPattern = 0;
    bossTimer = 0;
    
    // 보스 생성 시간 리셋 (다음 보스 출현까지 대기)
    lastBossSpawnTime = Date.now();
    
    // enemies 배열에서 보스 완전 제거
    enemies = enemies.filter(enemy => !enemy.isBoss);
    
    // 보스 관련 모든 타이머와 상태 완전 정리 (전역 변수 참조 제거)
    // boss 변수는 함수 스코프 내에서만 유효하므로 전역 참조 제거
    
    // 보스의 lifeAdded 플래그도 초기화 (혹시 남아있는 경우)
    const remainingBoss = enemies.find(enemy => enemy.isBoss);
    if (remainingBoss) {
        remainingBoss.lifeAdded = false;
        console.log('남아있는 보스의 lifeAdded 플래그 초기화됨');
    }
    
    console.log('보스 상태 완전 초기화 완료:', {
        bossActive,
        isBossActive,
        bossHealth,
        bossDestroyed,
        enemiesCount: enemies.length,
        lastBossSpawnTime: new Date(lastBossSpawnTime).toLocaleTimeString()
    });
}

// 보스 패턴 처리 함수 수정
function handleBossPattern(boss) {
    // 보스 객체 유효성 검증 (더 엄격하게)
    if (!boss || typeof boss !== 'object' || boss.health <= 0 || bossDestroyed || !bossActive) {
        console.warn('handleBossPattern: 유효하지 않은 보스 상태', {
            boss: boss,
            bossDestroyed: bossDestroyed,
            bossActive: bossActive,
            health: boss ? boss.health : 'N/A'
        });
        return;
    }
    
    // 보스 상태 복구 시도 (비정상 상태 감지 시)
    if (boss && boss.health > 0 && !bossDestroyed && bossActive) {
        // 패턴 타이머가 없으면 복구
        if (!boss.patternTimer) {
            boss.patternTimer = Date.now();
            // 성능 보호: 디버그 로그 스로틀(2초)
            if (!window.__lastBossDebugLogTime || Date.now() - window.__lastBossDebugLogTime > 2000) {
                console.log('🔧 보스 패턴 타이머 복구됨');
                window.__lastBossDebugLogTime = Date.now();
            }
        }
        
        // 패턴 순환 카운터가 없으면 복구
        if (typeof boss.patternRotationCounter === 'undefined') {
            boss.patternRotationCounter = 0;
            // 성능 보호: 디버그 로그 스로틀(2초)
            if (!window.__lastBossDebugLogTime || Date.now() - window.__lastBossDebugLogTime > 2000) {
                console.log('🔧 보스 패턴 순환 카운터 복구됨');
                window.__lastBossDebugLogTime = Date.now();
            }
        }
    }
    
    const currentTime = Date.now();
    
    // 무적 상태 해제됨 (즉시 공격 가능)
    // 무적 상태 자동 해제 로직 제거됨
    
    // 피격 상태 자동 해제 (시간 기반) - 더 적극적으로 처리
    if (boss.isBeingHit && boss.lastHitTime && boss.hitDuration) {
        if (currentTime - boss.lastHitTime >= boss.hitDuration) {
            boss.isBeingHit = false;
            boss.lastHitTime = null;
            boss.hitDuration = null;
            console.log('🔓 보스 피격 상태 해제됨');
        }
    }
    
    // 추가 안전장치: 피격 상태가 너무 오래 지속되면 강제 해제
    if (boss.isBeingHit && boss.lastHitTime && currentTime - boss.lastHitTime > 500) {
        console.warn('⚠️ 보스 피격 상태 강제 해제 (500ms 초과)');
        boss.isBeingHit = false;
        boss.lastHitTime = null;
        boss.hitDuration = null;
    }
    
    // 디버깅: 함수 호출 확인
    console.log('handleBossPattern 함수 호출됨', {
        boss: boss,
        currentTime: currentTime,
        patternTimer: boss.patternTimer,
        patternInterval: BOSS_SETTINGS.PATTERN_INTERVAL,
        timeDiff: currentTime - boss.patternTimer,
        isBeingHit: boss.isBeingHit
    });
    
    // 보스 페이즈 체크 및 업데이트 (동적으로 계산된 임계값 사용)
    const phaseThresholds = calculateBossPhaseThresholds(bossHealth);
    const currentPhase = phaseThresholds.findIndex(
        threshold => bossHealth > threshold.health
    );
    
    if (currentPhase !== boss.phase) {
        boss.phase = currentPhase;
        if (currentPhase >= 0) {
            const phaseSettings = phaseThresholds[currentPhase];
            // 속성 존재 여부 확인 후 설정
            if (phaseSettings && typeof phaseSettings.speed !== 'undefined') {
                boss.speed = phaseSettings.speed;
            }
            if (phaseSettings && typeof phaseSettings.bulletSpeed !== 'undefined') {
                boss.bulletSpeed = phaseSettings.bulletSpeed;
            }
            
            // 페이즈 변경 시 화면에 메시지 표시
            ctx.fillStyle = 'red';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`보스 페이즈 ${currentPhase + 1}!`, canvas.width/2, canvas.height/2);
        }
    }
    
    // 로터 회전 업데이트 (헬리콥터1과 동일하게 매 프레임마다)
    if (typeof boss.rotorAngle !== 'undefined' && typeof boss.rotorSpeed !== 'undefined') {
        boss.rotorAngle += boss.rotorSpeed;
    }
    
    // 🚨 보스 안전한 위치 설정 함수 (절대 화면을 벗어나지 않음) - 강화된 안전장치
    function setBossSafePosition(boss, newX, newY) {
        // 더욱 엄격한 경계 설정
        const minX = 40;  // 여백 증가
        const maxX = canvas.width - boss.width - 40;
        const minY = 100; // 여백 증가
        const maxY = canvas.height - boss.height - 200;
        
        // 이전 위치 저장 (복구용)
        const prevX = boss.x;
        const prevY = boss.y;
        
        // 안전한 위치로 설정
        boss.x = Math.max(minX, Math.min(maxX, newX));
        boss.y = Math.max(minY, Math.min(maxY, newY));
        
        // 정밀도 조정
        boss.x = Math.round(boss.x * 1000) / 1000;
        boss.y = Math.round(boss.y * 1000) / 1000;
        
        // 위치 변경 로그 (디버깅용)
        if (Math.abs(boss.x - prevX) > 0.1 || Math.abs(boss.y - prevY) > 0.1) {
            console.log('🔧 보스 위치 변경:', {
                prevX: Math.round(prevX),
                prevY: Math.round(prevY),
                newX: Math.round(newX),
                newY: Math.round(newY),
                finalX: Math.round(boss.x),
                finalY: Math.round(boss.y),
                minX: minX,
                maxX: maxX,
                minY: minY,
                maxY: maxY,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height
            });
        }
        
        return { x: boss.x, y: boss.y };
    }
    
    // 보스 이동 패턴 (완전히 안전한 화면 내 움직임)
    if (boss.movePhase === 0) {
        // 초기 진입 - 화면 중앙으로 진입 (안전한 위치 설정 함수 사용)
        if (typeof boss.speed !== 'undefined') {
            const newY = boss.y + boss.speed * 0.6;
            setBossSafePosition(boss, boss.x, newY);
        }
        
        // 화면 중앙으로 수렴하는 진입 경로 (안전한 위치 설정 함수 사용)
        const targetX = canvas.width / 2 - boss.width / 2;
        const dx = targetX - boss.x;
        const newX = boss.x + dx * 0.02;
        setBossSafePosition(boss, newX, boss.y);
        
        if (typeof boss.hoverHeight !== 'undefined' && boss.y >= boss.hoverHeight) {
            boss.movePhase = 1;
            boss.timer = currentTime;
            boss.centerX = Math.max(40, Math.min(canvas.width - boss.width - 40, canvas.width / 2 - boss.width / 2)); // 안전한 중앙 기준점 설정
            console.log('🚁 보스 중앙 호버링 시작 - 활발한 역동적 패턴 준비', {
                centerX: boss.centerX,
                hoverHeight: boss.hoverHeight,
                currentX: boss.x,
                currentY: boss.y,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                movePhase: boss.movePhase,
                staticMode: boss.staticMode
            });
            
            // 중앙 도달 후 자동 발사 비활성화 (랜덤 스케줄러로만 발사)
            boss.patternTimer = currentTime;
            console.log('🎯 보스 중앙 도달 - 활발한 움직임 시작');
        }
        
        // 기존 복잡한 움직임 로직 제거됨 - 단순한 움직임만 사용
        
        // 보스 움직임 로직은 메인 게임 루프로 이동됨 (매 프레임 실행)
        
        // 기존 복잡한 움직임 패턴 제거됨 - 단순한 움직임 로직만 사용
        
        // 보스 위치 모니터링 및 안전장치 (1초마다) - 실시간 경계 체크 강화
        if (!boss.lastPositionLog || currentTime - boss.lastPositionLog > 1000) {
            const isOutOfBounds = boss.x < 40 || boss.x > canvas.width - boss.width - 40 || 
                                 boss.y < 100 || boss.y > canvas.height - boss.height - 200;
            
            console.log('📍 보스 실시간 위치 모니터링 (1초마다):', {
                x: Math.round(boss.x),
                y: Math.round(boss.y),
                centerX: Math.round(boss.centerX || 0),
                hoverHeight: Math.round(boss.hoverHeight || 0),
                phase: boss.phase,
                movePhase: boss.movePhase,
                movementDirection: boss.movementDirection || 0,
                isOutOfBounds: isOutOfBounds,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                bossWidth: boss.width,
                bossHeight: boss.height,
                minX: 40,
                maxX: canvas.width - boss.width - 40,
                minY: 100,
                maxY: canvas.height - boss.height - 200,
                safetyStatus: isOutOfBounds ? '⚠️ 경계 벗어남' : '✅ 안전'
            });
            
            // 경계를 벗어났을 때 즉시 강제로 화면 내로 이동 (안전한 위치 설정 함수 사용)
            if (isOutOfBounds) {
                console.log('🚨 보스가 화면을 벗어남 - 즉시 강제 복구 실행');
                setBossSafePosition(boss, boss.x, boss.y);
                
                // 복구 후 로그
                console.log('✅ 보스 위치 복구 완료:', {
                    recoveredX: Math.round(boss.x),
                    recoveredY: Math.round(boss.y)
                });
            }
            
            boss.lastPositionLog = currentTime;
        }
        
        
        // 폭탄 투하
        if (typeof boss.canDropBomb !== 'undefined' && typeof boss.lastBombDrop !== 'undefined' && 
            typeof boss.bombDropInterval !== 'undefined' && 
            boss.canDropBomb && currentTime - boss.lastBombDrop >= boss.bombDropInterval) {
            boss.lastBombDrop = currentTime;
            createBomb(boss);
        }
    }
    
    // 공격 패턴 - BOSS_SETTINGS.PATTERN_INTERVAL 사용
    const baseInterval = BOSS_SETTINGS.PATTERN_INTERVAL;
    const adjustedInterval = baseInterval;
    
    // 패턴 타이머 초기화 보장
    if (!boss.patternTimer) {
        boss.patternTimer = currentTime;
        if (!window.__lastBossTimerInitLog || currentTime - window.__lastBossTimerInitLog > 2000) {
            console.log('⏰ 보스 패턴 타이머 초기화됨');
            window.__lastBossTimerInitLog = currentTime;
        }
    }
    
    // 디버깅: 패턴 타이머 상태 확인 (2초 스로틀)
    const timeSinceLastPattern = currentTime - boss.patternTimer;
    if (!window.__lastBossTimerLogTime || currentTime - window.__lastBossTimerLogTime > 2000) {
        console.log('🔍 보스 패턴 타이머 상태:', {
            currentTime: currentTime,
            patternTimer: boss.patternTimer,
            timeSinceLastPattern: timeSinceLastPattern,
            adjustedInterval: adjustedInterval,
            baseInterval: baseInterval,
            bossPhase: boss.phase,
            remainingTime: Math.max(0, adjustedInterval - timeSinceLastPattern)
        });
        window.__lastBossTimerLogTime = currentTime;
    }
    
    if (currentTime - boss.patternTimer >= adjustedInterval) {
        boss.patternTimer = currentTime;
        
        // 🎨 테마 무관 패턴 선택 시스템 (모든 패턴 골고루 선택)
        const selectedPattern = selectPatternByTheme(boss);
        
        console.log('🎨 14개 패턴 랜덤 선택:', {
            pattern: selectedPattern,
            theme: boss.bulletShapeTheme,
            shapeChangeCount: boss.shapeChangeCount,
            allPatterns: boss.allPatterns,
            currentIndex: boss.currentPatternIndex,
            note: '14개 패턴 모두 한번씩 랜덤으로 발사됨'
        });

        try {
            switch (selectedPattern) {
                case 'snowflake_shot':
                    bossFireSnowflakeShot(boss);
                    break;
                case 'pinwheel_shot':
                    bossFirePinwheelShot(boss);
                    break;
                case 'triangle_shot':
                    bossFireTriangleShot(boss);
                    break;
                case 'rectangle_shot':
                    bossFireRectangleShot(boss);
                    break;
                case 'pentagon_shot':
                    bossFirePentagonShot(boss);
                    break;
                case 'hexagon_shot':
                    bossFireHexagonShot(boss);
                    break;
                case 'octagon_shot':
                    bossFireOctagonShot(boss);
                    break;
                case 'circle_shot':
                    bossFireCircleShot(boss);
                    break;
                case 'cross_shot':
                    bossFireCrossShot(boss);
                    break;
                case 'heart_shot':
                    bossFireHeartShot(boss);
                    break;
                case 'star_shot':
                    bossFireStarShot(boss);
                    break;
                case 'flower_shot':
                    bossFireFlowerShot(boss);
                    break;
                case 'gear_shot':
                    bossFireGearShot(boss);
                    break;
                case 'moon_shot':
                    bossFireMoonShot(boss);
                    break;
                default:
                    bossFireSnowflakeShot(boss);
                    break;
            }
            
            // 추가로 보호막 헬리콥터와 동일한 총알 발사 (플레이어 추적)
            const bossX = boss.x + boss.width/2;
            const bossY = boss.y + boss.height/2;
            
            // 플레이어 위치 계산하여 추적 발사
            const playerX = player.x + player.width/2;
            const playerY = player.y + player.height/2;
            
            // 보스에서 플레이어로의 각도 계산
            const angleToPlayer = Math.atan2(playerY - bossY, playerX - bossX);
            
            // 플레이어를 향해 총알 발사
            createHelicopterBullet(boss, angleToPlayer);
            
        } catch (error) {
            console.error('❌ 패턴 실행 실패, 기본 확산탄으로 폴백', { selectedPattern, error });
            bossFireSpreadShot(boss);
        }
    }
}

// 패턴별 특수 속성 반환 함수
function getPatternProperties(patternType) {
    switch(patternType) {
        case 'snowflake_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.05,
                trailLength: 3,
                pulseEffect: false
            };
        case 'pinwheel_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.1,
                trailLength: 4,
                pulseEffect: false
            };
        case 'triangle_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.08,
                trailLength: 3,
                pulseEffect: false
            };
        case 'rectangle_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.06,
                trailLength: 2,
                pulseEffect: false
            };
        case 'pentagon_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.07,
                trailLength: 3,
                pulseEffect: false
            };
        case 'hexagon_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.05,
                trailLength: 3,
                pulseEffect: false
            };
        case 'octagon_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.08,
                trailLength: 4,
                pulseEffect: false
            };
        case 'circle_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.05,
                trailLength: 3,
                pulseEffect: false
            };
        case 'cross_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.1,
                trailLength: 5,
                pulseEffect: false
            };
        case 'heart_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.06,
                trailLength: 4,
                pulseEffect: true
            };
        case 'star_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.08,
                trailLength: 4,
                pulseEffect: false
            };
        case 'flower_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.07,
                trailLength: 5,
                pulseEffect: true
            };
        case 'gear_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.1,
                trailLength: 3,
                pulseEffect: false
            };
        case 'moon_shot':
            return {
                movementType: 'linear',
                rotationSpeed: 0.06,
                trailLength: 4,
                pulseEffect: false
            };
        default:
            return {
                movementType: 'linear',
                rotationSpeed: 0.05,
                trailLength: 3,
                pulseEffect: false
            };
    }
}

// 보스 총알 생성 함수 수정 - 패턴별 색상 구분
function createBossBullet(boss, angle, patternType = 'spread', customSpeed = null, customColor = null) {
    // 보스 객체 유효성 검증 (더 엄격하게)
    if (!boss || typeof boss !== 'object' || boss.health <= 0 || bossDestroyed || !bossActive) {
        console.warn('createBossBullet: 유효하지 않은 보스 상태', {
            boss: boss,
            bossDestroyed: bossDestroyed,
            bossActive: bossActive,
            health: boss ? boss.health : 'N/A'
        });
        return null;
    }
    
    // 필수 속성 확인 및 기본값 설정
    if (typeof boss.bulletSpeed === 'undefined') {
        console.warn('createBossBullet: boss.bulletSpeed가 정의되지 않음, 기본값 사용');
        boss.bulletSpeed = BOSS_SETTINGS.BULLET_SPEED;
    }
    
    // 패턴별 색상 설정
    let bulletColor = '#FF0000'; // 기본 빨간색
    let bulletSize = 12;
    
    switch(patternType) {
        case 'snowflake_shot':
            bulletColor = '#FFFFFF'; // 눈 결정체 - 흰색
            bulletSize = 12;
            break;
        case 'pinwheel_shot':
            bulletColor = '#90EE90'; // 바람개비 - 청녹색
            bulletSize = 12;
            break;
        case 'triangle_shot':
            bulletColor = '#32CD32'; // 삼각형 - 밝은 라임그린
            bulletSize = 10;
            break;
        case 'rectangle_shot':
            bulletColor = '#ADFF2F'; // 정사각형 - 연두색
            bulletSize = 10;
            break;
        case 'pentagon_shot':
            bulletColor = '#FFA500'; // 오각형 - 주황색 (구분)
            bulletSize = 11;
            break;
        case 'hexagon_shot':
            bulletColor = '#D3D3D3'; // 육각형 - 밝은 회색
            bulletSize = 10;
            break;
        case 'octagon_shot':
            bulletColor = '#FFD700'; // 팔각형 - 밝은 골드
            bulletSize = 11;
            break;
        case 'circle_shot':
            bulletColor = '#20B2AA'; // 원형 - 청녹색
            bulletSize = 10;
            break;
        case 'cross_shot':
            bulletColor = '#FF4500'; // 십자 - 밝은 빨간색
            bulletSize = 12;
            break;
        case 'heart_shot':
            bulletColor = '#FF69B4'; // 하트 - 밝은 핫핑크
            bulletSize = 13;
            break;
        case 'star_shot':
            bulletColor = '#FFFF00'; // 별 - 노란색
            bulletSize = 12;
            break;
        case 'flower_shot':
            bulletColor = '#FF1493'; // 꽃 - 밝은 딥핑크
            bulletSize = 14;
            break;
        case 'gear_shot':
            bulletColor = '#C0C0C0'; // 기어 - 은색 (구분)
            bulletSize = 11;
            break;
        case 'moon_shot':
            bulletColor = '#F0E68C'; // 달 - 카키색 (구분)
            bulletSize = 13;
            break;
        default:
            bulletColor = '#FFFFFF'; // 기본 흰색
            bulletSize = 10;
    }
    
    console.log('🎯 보스 총알 생성:', { 
        patternType, 
        bulletColor, 
        bulletSize, 
        shape: getBulletShape(patternType, 'normal', boss),
        bossId: boss.id 
    });
    
    const bullet = {
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        width: bulletSize,
        height: bulletSize,
        speed: customSpeed || boss.bulletSpeed,
        angle: angle,
        isBossBullet: true,
        isSpread: patternType === 'spread', // 확산탄 패턴일 때만 true
        isSpecial: patternType === 'special', // 특수무기 패턴일 때만 true
        damage: patternType === 'special' ? BOSS_SETTINGS.DAMAGE * 2 : BOSS_SETTINGS.DAMAGE, // 특수무기는 2배 데미지
        trail: [], // 총알 꼬리 효과를 위한 배열
        glow: 1, // 빛나는 효과를 위한 값
        rotation: 0, // 회전 효과를 위한 값
        rotationSpeed: 0.1, // 회전 속도
        patternType: patternType, // 패턴 타입 저장
        color: bulletColor, // switch 문에서 설정한 색상 사용
        shape: getBulletShape(patternType, 'normal', boss), // 패턴별 모양 저장 (보스 테마 적용)
        // 패턴별 특수 속성 추가
        patternProperties: getPatternProperties(patternType),
        // 패턴별 이동을 위한 변수들 초기화
        spiralAngle: 0,
        waveOffset: 0,
        vortexAngle: 0,
        chaosTimer: 0
    };
    bossBullets.push(bullet); // 보스 총알 배열에 추가
}

// 레벨업 체크
function checkLevelUp() {
    if (levelScore >= levelUpScore) { // 레벨 제한 제거 - 무한 레벨업 가능
        safePlay(levelUpSound);
        gameLevel++;
        levelScore = 0;
        levelUpScore = 1500 + (gameLevel - 1) * 1000; // 레벨업 기준 점수 계산
        
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
let fireDelay = 600;  // 기본 발사 딜레이를 600에서 400으로 줄임
let continuousFireDelay = 50;  // 연속 발사 딜레이를 50에서 30으로 줄임
let bulletSpeed = 10;  // 총알 속도를 5에서 7로 증가
let baseBulletSize = 5.0;  // 기본 총알 크기 (1.5배 증가)
let isContinuousFire = false;  // 연속 발사 상태
let canFire = true;  // 발사 가능 상태 추가
let lastReleaseTime = 0;  // 마지막 스페이스바 해제 시간
let singleShotCooldown = 500;  // 단발 발사 쿨다운 시간 (더 길게)
let minPressDuration = 200;  // 연속 발사로 전환되는 최소 누름 시간
let minReleaseDuration = 100;  // 단발 발사를 위한 최소 해제 시간

// 총알 크기 계산 함수 수정 (레벨/점수 증가 제한)
function calculateBulletSize() {
    // 레벨 1의 기본 크기로 고정 (증가 제한)
    return baseBulletSize;
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

// 헬리콥터 생성 함수 수정 - 헬리콥터1과 헬리콥터2를 랜덤으로 생성
function createHelicopter() {
    // 현재 보호막 헬리콥터 수 확인 (보스 제외)
    const currentShieldedHelicopters = enemies.filter(enemy => 
        (enemy.type === ENEMY_TYPES.HELICOPTER || enemy.type === ENEMY_TYPES.HELICOPTER2) && 
        enemy.hasShield && !enemy.isShieldBroken && !enemy.isBoss
    ).length;
    
    // 현재 일반 비행기 수 확인 (보스 제외)
    const currentNormalPlanes = enemies.filter(enemy => 
        enemy.type === ENEMY_TYPES.PLANE && !enemy.isBoss
    ).length;
    
    const totalEnemies = currentShieldedHelicopters + currentNormalPlanes;
    
    // 6대 제한 체크 (보스 제외)
    if (totalEnemies >= 6) {
        console.log(`createHelicopter 함수 제한: 현재 총 적 수 ${totalEnemies}/6으로 인해 생성 불가`);
        return null;
    }
    
    // 레벨 10 이상에서는 속도 증가 제한
    let helicopterSpeed = 2;
    if (gameLevel <= 10) {
        helicopterSpeed = 2 + (gameLevel - 1) * 0.1; // 레벨당 0.1씩 증가
    } else {
        helicopterSpeed = 2 + (10 - 1) * 0.1; // 레벨 10에서 멈춤
    }
    
    // 50% 확률로 헬리콥터1 또는 헬리콥터2 선택
    const isHelicopter2 = Math.random() < 0.5;
    const helicopterType = isHelicopter2 ? ENEMY_TYPES.HELICOPTER2 : ENEMY_TYPES.HELICOPTER;
    
    // 헬리콥터2는 더 빠르고 강력하게 설정
    const speedMultiplier = isHelicopter2 ? 1.2 : 0.8;
    const healthMultiplier = isHelicopter2 ? 1.5 : 1.0;
    const scoreMultiplier = isHelicopter2 ? 1.2 : 1.0;
    
    const helicopter = {
        x: Math.random() * (canvas.width - 48), // 40 * 1.2 = 48
        y: -48,  // 화면 상단에서 시작
        width: 48, // 40 * 1.2 = 48
        height: 48, // 40 * 1.2 = 48
        speed: helicopterSpeed * speedMultiplier, // 타입에 따른 속도 조정
        type: helicopterType,
        rotorAngle: 0,
        rotorSpeed: 0.2,
        hoverHeight: Math.random() * 200 + 100,
        hoverTimer: 0,
        hoverDirection: 1,
        canDropBomb: Math.random() < 0.4,  // 40% 확률로 폭탄 투하 가능
        lastBombDrop: 0,
        bombDropInterval: 2000 + Math.random() * 3000,
        // 헬리콥터 총알 발사를 위한 속성 추가
        canFire: true,
                    lastFireTime: Date.now() - (gameLevel <= 10 ? currentDifficulty.fireInterval * 0.5 : currentDifficulty.fireInterval), // 즉시 발사 가능하도록 설정
        fireInterval: 2000 + Math.random() * 2000, // 2-4초 간격으로 총알 발사
        bulletSpeed: 3,
        health: 100 * healthMultiplier,
        score: Math.floor(50 * gameLevel * scoreMultiplier),
        // 보호막 시스템 추가
        hasShield: true,
        shieldHealth: 100, // 100발 맞으면 파괴
        shieldHitCount: 0,
        shieldColor: isHelicopter2 ? '#FFA500' : '#20B2AA', // 타입에 따른 색상
        isShieldBroken: false,
        lifeAddedFromHelicopter: false, // 목숨 추가 플래그 초기화
    };
    
    enemies.push(helicopter);
    console.log(`${isHelicopter2 ? '헬리콥터2(오렌지)' : '헬리콥터1(블루)'} 생성됨 - 타입: ${helicopterType}`);
    return helicopter; // 헬리콥터 객체 반환
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

    // 1. 메인 로터 (4개 블레이드, 세로로 길게, 끝에 흰색 포인트, 투명도 효과)
    ctx.save();
    
    // 보스인 경우 잔상효과 추가 (회전속도 50% 감소로 인한 부드러운 회전 + 강화된 그림자/잔상)
    if (isBoss) {
        // 그림자 효과 (정적 그림자)
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // 그림자 로터 (고정된 위치)
        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate(i * Math.PI/2);
            ctx.beginPath();
            ctx.moveTo(0, -height*0.55);
            ctx.lineTo(0, height*0.55);
            ctx.lineWidth = width*0.12;
            ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        
        // 잔상 로터들 (이전 각도들) - 회전속도 50% 감소로 더 부드러운 잔상
        for (let trail = 1; trail <= 6; trail++) { // 4개에서 6개로 증가하여 더 부드러운 효과
            const trailAngle = rotorAngle - (trail * 0.05); // 각도 간격을 0.08에서 0.05로 줄여서 더 부드럽게
            ctx.save();
            ctx.rotate(trailAngle);
            
            // 잔상 블레이드들
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.rotate(i * Math.PI/2);
                
                // 잔상 블레이드 본체 (투명도 점진적 감소)
                ctx.beginPath();
                ctx.moveTo(0, -height*0.55);
                ctx.lineTo(0, height*0.55);
                ctx.lineWidth = width*0.10;
                
                // 잔상별로 다른 색상과 투명도 (오렌지 계열)
                const alpha = 0.4 - (trail * 0.06);
                const colorIndex = trail % 3;
                let trailColor;
                switch(colorIndex) {
                    case 0: trailColor = `rgba(255,69,0,${alpha})`; break; // 빨간 오렌지
                    case 1: trailColor = `rgba(255,140,0,${alpha})`; break; // 다크 오렌지
                    case 2: trailColor = `rgba(255,165,0,${alpha})`; break; // 오렌지
                }
                
                ctx.strokeStyle = trailColor;
                ctx.shadowColor = `rgba(255,140,0,${alpha * 0.8})`;
                ctx.shadowBlur = 10 + trail * 3; // 그림자 블러를 점진적으로 증가
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // 잔상 블레이드 끝 강조 (원형)
                ctx.beginPath();
                ctx.arc(0, height*0.55, width*0.06, 0, Math.PI*2);
                ctx.arc(0, -height*0.55, width*0.06, 0, Math.PI*2);
                ctx.fillStyle = `rgba(255,140,0,${alpha * 1.2})`;
                ctx.globalAlpha = alpha * 1.5;
                ctx.fill();
                ctx.globalAlpha = 1.0;
                
                // 잔상 블레이드 끝 포인트 (더 작은 원)
                ctx.beginPath();
                ctx.arc(0, height*0.55, width*0.025, 0, Math.PI*2);
                ctx.arc(0, -height*0.55, width*0.025, 0, Math.PI*2);
                ctx.fillStyle = `rgba(255,215,0,${alpha * 1.3})`;
                ctx.globalAlpha = alpha * 1.6;
                ctx.fill();
                ctx.globalAlpha = 1.0;
                
                ctx.restore();
            }
            ctx.restore();
        }
    }
    
    // 메인 로터 회전 적용
    ctx.rotate(rotorAngle);
    for (let i = 0; i < 4; i++) {
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

    // 7. 테일로터 (4개 블레이드, 꼬리 끝)
    ctx.save();
    ctx.translate(0, height*0.98);
    
    // 보스인 경우 테일로터 잔상효과 추가 (부드러운 회전을 위한 강화된 잔상)
    if (isBoss) {
        // 잔상 테일로터들 (이전 각도들) - 부드러운 회전을 위해 더 많은 잔상과 강화된 효과
        for (let trail = 1; trail <= 3; trail++) { // 1개에서 3개로 증가
            const trailAngle = (rotorAngle * 2) - (trail * 0.12); // 각도 간격을 0.2에서 0.12로 줄여서 더 부드럽게
            ctx.save();
            ctx.rotate(trailAngle);
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.rotate(i * Math.PI/2);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, height*0.08);
                ctx.lineWidth = 3;
                ctx.strokeStyle = `rgba(255,140,0,${0.3 - trail * 0.08})`; // 투명도를 높여서 더 선명하게
                ctx.shadowColor = `rgba(255,165,0,${0.25 - trail * 0.06})`; // 그림자 색상 추가
                ctx.shadowBlur = 6 + trail * 1.5; // 그림자 블러를 점진적으로 증가
                ctx.stroke();
                ctx.shadowBlur = 0;
                // 잔상 테일로터 끝 포인트 - 투명도 증가
                ctx.beginPath();
                ctx.arc(0, height*0.08, width*0.012, 0, Math.PI*2);
                ctx.fillStyle = `rgba(255,215,0,${0.4 - trail * 0.08})`;
                ctx.globalAlpha = 0.5 - trail * 0.08;
                ctx.fill();
                ctx.globalAlpha = 1.0;
                ctx.restore();
            }
            ctx.restore();
        }
    }
    
    // 메인 테일로터 회전 적용
    ctx.rotate(rotorAngle * 2);
    for (let i = 0; i < 4; i++) {
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

    // 10. 보호막 효과 (헬리콥터에 보호막이 있고 파괴되지 않았을 때만)
    const enemy = enemies.find(e => e.x === x && e.y === y && (e.type === ENEMY_TYPES.HELICOPTER || e.type === ENEMY_TYPES.HELICOPTER2));
    if (enemy && enemy.hasShield && !enemy.isShieldBroken) {
        // 보호막 그라데이션 효과
        const shieldRadius = Math.max(width, height) * 0.8;
        const shieldGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shieldRadius);
        
        // 보호막 색상 설정 (헬리콥터1: 블루, 헬리콥터2: 오렌지)
        const shieldColor = enemy.shieldColor || (enemy.type === ENEMY_TYPES.HELICOPTER2 ? '#FFA500' : '#008B8B');
        
        shieldGradient.addColorStop(0, `${shieldColor}40`); // 중앙 (투명도 25%)
        shieldGradient.addColorStop(0.5, `${shieldColor}20`); // 중간 (투명도 12%)
        shieldGradient.addColorStop(1, `${shieldColor}00`); // 바깥쪽 (투명도 0%)
        
        ctx.fillStyle = shieldGradient;
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 보호막 테두리 효과
        ctx.strokeStyle = `${shieldColor}80`; // 투명도 50%
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 보호막 내구도 표시 (파이 형태)
        const shieldHealthRatio = enemy.shieldHitCount / enemy.shieldHealth;
        const remainingAngle = (1 - shieldHealthRatio) * Math.PI * 2;
        
        if (remainingAngle > 0) {
            ctx.fillStyle = `${shieldColor}60`; // 투명도 37%
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, shieldRadius * 0.7, 0, remainingAngle);
            ctx.closePath();
            ctx.fill();
        }
    }

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
let bossBullets = []; // 보스 총알 전용 배열

// 총알 색상 결정 함수
function getBulletColor(pattern, bulletType) {
    const colorMap = {
        // 지정된 14개 패턴만 유지
        'snowflake_shot': '#FFFFFF',     // 눈 결정체 - 흰색
        'pinwheel_shot': '#90EE90',      // 바람개비 - 청녹색
        'triangle_shot': '#32CD32',      // 삼각형 - 밝은 라임그린
        'rectangle_shot': '#ADFF2F',      // 정사각형 - 연두색
        'pentagon_shot': '#FFA500',      // 오각형 - 주황색 (구분)
        'hexagon_shot': '#D3D3D3',       // 육각형 - 밝은 회색
        'octagon_shot': '#FFD700',       // 팔각형 - 밝은 골드
        'circle_shot': '#20B2AA',        // 원형 - 청녹색
        'cross_shot': '#FF4500',         // 십자 - 밝은 빨간색
        'heart_shot': '#FF69B4',         // 하트 - 밝은 핫핑크
        'star_shot': '#FFFF00',          // 별 - 노란색
        'flower_shot': '#FF1493',        // 꽃 - 밝은 딥핑크
        'gear_shot': '#C0C0C0',         // 기어 - 은색 (구분)
        'moon_shot': '#F0E68C',         // 달 - 카키색 (구분)
        'normal': '#FF0000'              // 기본 빨간색
    };
    return colorMap[pattern] || colorMap[bulletType] || '#FF0000';
}

// 총알 모양 결정 함수
function getBulletShape(pattern, bulletType, boss = null) {
    // 테마 기반 모양 선택 비활성화 - 각 패턴이 고유한 모양을 가지도록 함
    // if (boss && boss.bulletShapeTheme) {
    //     const themeShape = getShapeByTheme(pattern, boss.bulletShapeTheme);
    //     console.log('🎨 테마 기반 모양 선택:', { pattern, theme: boss.bulletShapeTheme, shape: themeShape });
    //     return themeShape;
    // }
    
    // 기본 모양 매핑 (테마가 없을 때) - 지정된 14개 패턴만 유지
    const shapeMap = {
        'snowflake_shot': 'snowflake',   // 눈 결정체
        'pinwheel_shot': 'pinwheel',     // 바람개비
        'triangle_shot': 'triangle',     // 삼각형
        'rectangle_shot': 'rectangle',   // 정사각형
        'pentagon_shot': 'pentagon',     // 오각형
        'hexagon_shot': 'hexagon',       // 육각형
        'octagon_shot': 'octagon',       // 팔각형
        'circle_shot': 'circle',         // 원형
        'cross_shot': 'cross',           // 십자
        'heart_shot': 'heart',           // 하트
        'star_shot': 'star',             // 별
        'flower_shot': 'flower',         // 꽃
        'gear_shot': 'gear',             // 기어
        'moon_shot': 'moon',             // 달
        'normal': 'rectangle'            // 기본 사각형
    };
    return shapeMap[pattern] || shapeMap[bulletType] || 'rectangle';
}

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

// 하트 모양 그리기
function drawHeart(bullet) {
    const size = bullet.width;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size, size * 0.2, 0, size);
    ctx.bezierCurveTo(size, size * 0.2, size * 0.5, -size * 0.3, 0, size * 0.3);
    ctx.fill();
    ctx.stroke();
}

// 별 모양 그리기
function drawStar(bullet) {
    const size = bullet.width;
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 꽃 모양 그리기
function drawFlower(bullet) {
    const size = bullet.width;
    const petals = 6;
    
    ctx.beginPath();
    for (let i = 0; i < petals; i++) {
        const angle = (i * Math.PI * 2) / petals;
        const x = Math.cos(angle) * size * 0.5;
        const y = Math.sin(angle) * size * 0.5;
        ctx.ellipse(x, y, size * 0.2, size * 0.4, angle, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();
    
    // 중앙 원
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
}

// 나비 모양 그리기
function drawButterfly(bullet) {
    const size = bullet.width;
    
    // 왼쪽 날개
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, -size * 0.2, size * 0.4, size * 0.6, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 오른쪽 날개
    ctx.beginPath();
    ctx.ellipse(size * 0.3, -size * 0.2, size * 0.4, size * 0.6, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 아래 날개들
    ctx.beginPath();
    ctx.ellipse(-size * 0.2, size * 0.3, size * 0.3, size * 0.4, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(size * 0.2, size * 0.3, size * 0.3, size * 0.4, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 몸통
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.1, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#8B4513';
    ctx.fill();
}

// 나선 모양 그리기
function drawSpiral(bullet) {
    const size = bullet.width;
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
    const size = bullet.width;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

// 불꽃놀이 모양 그리기
function drawFirework(bullet) {
    const size = bullet.width;
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
    const size = bullet.width;
    
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
    const size = bullet.width;
    ctx.fillRect(-size, -size, bullet.width * 2, bullet.height * 2);
    ctx.strokeRect(-size, -size, bullet.width * 2, bullet.height * 2);
}

// 삼각형 모양 그리기
function drawTriangle(bullet) {
    const size = bullet.width;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-size * 0.866, size * 0.5);
    ctx.lineTo(size * 0.866, size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 다이아몬드 모양 그리기
function drawDiamond(bullet) {
    const size = bullet.width;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 육각형 모양 그리기
function drawHexagon(bullet) {
    const size = bullet.width;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 팔각형 모양 그리기
function drawOctagon(bullet) {
    const size = bullet.width;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 오각형 모양 그리기
function drawPentagon(bullet) {
    const size = bullet.width;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 눈 결정체 모양 그리기
function drawSnowflake(bullet) {
    const size = bullet.width;
    ctx.beginPath();
    
    // 눈 결정체의 6방향 가지
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const x1 = Math.cos(angle) * size * 0.3;
        const y1 = Math.sin(angle) * size * 0.3;
        const x2 = Math.cos(angle) * size * 0.8;
        const y2 = Math.sin(angle) * size * 0.8;
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        
        // 각 가지에서 작은 가지들
        const perpAngle1 = angle + Math.PI / 3;
        const perpAngle2 = angle - Math.PI / 3;
        const branchX1 = x2 + Math.cos(perpAngle1) * size * 0.2;
        const branchY1 = y2 + Math.sin(perpAngle1) * size * 0.2;
        const branchX2 = x2 + Math.cos(perpAngle2) * size * 0.2;
        const branchY2 = y2 + Math.sin(perpAngle2) * size * 0.2;
        
        ctx.moveTo(x2, y2);
        ctx.lineTo(branchX1, branchY1);
        ctx.moveTo(x2, y2);
        ctx.lineTo(branchX2, branchY2);
    }
    
    ctx.stroke();
}

// 바람개비 모양 그리기 (실제 바람개비와 동일하게)
function drawPinwheel(bullet) {
    const size = bullet.width;
    
    // 바람개비의 4개 날개 - 실제 바람개비처럼 삼각형 날개로 그리기
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4;
        
        ctx.beginPath();
        
        // 각 날개를 삼각형으로 그리기 (실제 바람개비처럼)
        // 중심점에서 시작하여 바깥쪽으로 퍼지는 삼각형
        const centerX = 0;
        const centerY = 0;
        
        // 날개의 끝점 (바깥쪽)
        const endX = Math.cos(angle) * size * 0.7;
        const endY = Math.sin(angle) * size * 0.7;
        
        // 날개의 좌측 끝점 (삼각형의 한 변)
        const leftAngle = angle - Math.PI / 8; // 22.5도
        const leftX = Math.cos(leftAngle) * size * 0.6;
        const leftY = Math.sin(leftAngle) * size * 0.6;
        
        // 날개의 우측 끝점 (삼각형의 다른 변)
        const rightAngle = angle + Math.PI / 8; // 22.5도
        const rightX = Math.cos(rightAngle) * size * 0.6;
        const rightY = Math.sin(rightAngle) * size * 0.6;
        
        // 삼각형 날개 그리기
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(leftX, leftY);
        ctx.lineTo(endX, endY);
        ctx.lineTo(rightX, rightY);
        ctx.closePath();
        
        // 날개 채우기
        ctx.fill();
        
        // 날개 테두리
        ctx.stroke();
    }
    
    // 중심에 원형 고정 장치 그리기 (실제 바람개비처럼)
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); // 중심 원
    ctx.fill();
    
    // 중심 원의 테두리
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    ctx.strokeStyle = bullet.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 중심에 작은 버튼 모양 (흰색 버튼)
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
}

// 십자 모양 그리기
function drawCross(bullet) {
    const size = bullet.width;
    ctx.beginPath();
    
    // 십자를 더 두껍고 명확하게 그리기
    const thickness = size * 0.4; // 십자 두께를 더 두껍게 (기존 0.25에서 0.4로)
    
    // 세로선 (위아래) - 더 두껍게
    ctx.moveTo(-thickness/2, -size * 0.8);
    ctx.lineTo(thickness/2, -size * 0.8);
    ctx.lineTo(thickness/2, size * 0.8);
    ctx.lineTo(-thickness/2, size * 0.8);
    ctx.closePath();
    
    // 가로선 (좌우) - 더 두껍게
    ctx.moveTo(-size * 0.8, -thickness/2);
    ctx.lineTo(size * 0.8, -thickness/2);
    ctx.lineTo(size * 0.8, thickness/2);
    ctx.lineTo(-size * 0.8, thickness/2);
    ctx.closePath();
    
    ctx.fill();
}

// 기어 모양 그리기
function drawGear(bullet) {
    const size = bullet.width;
    ctx.beginPath();
    
    // 기어의 외곽 톱니
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
        const angle1 = (Math.PI * 2 * i) / teeth;
        const angle2 = (Math.PI * 2 * (i + 0.5)) / teeth;
        const angle3 = (Math.PI * 2 * (i + 1)) / teeth;
        
        const x1 = Math.cos(angle1) * size * 0.6;
        const y1 = Math.sin(angle1) * size * 0.6;
        const x2 = Math.cos(angle2) * size * 0.8;
        const y2 = Math.sin(angle2) * size * 0.8;
        const x3 = Math.cos(angle3) * size * 0.6;
        const y3 = Math.sin(angle3) * size * 0.6;
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
    }
    
    // 중심 원
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    
    ctx.stroke();
}

// 달 모양 그리기
function drawMoon(bullet) {
    const size = bullet.width;
    ctx.beginPath();
    
    // 초승달 모양
    ctx.arc(0, 0, size * 0.8, Math.PI * 0.3, Math.PI * 1.7);
    ctx.arc(size * 0.3, 0, size * 0.6, Math.PI * 0.3, Math.PI * 1.7);
    
    ctx.fill();
    ctx.stroke();
}


// 보스 총알 그리기 함수
function drawBossBullet(bullet) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    
    // 회전 효과 적용
    if (bullet.rotation) {
        ctx.rotate(bullet.rotation);
    }
    
    ctx.fillStyle = bullet.color;
    ctx.strokeStyle = bullet.color;
    ctx.lineWidth = 2;
    
    switch (bullet.shape) {
        case 'snowflake':
            drawSnowflake(bullet);
            break;
        case 'pinwheel':
            drawPinwheel(bullet);
            break;
        case 'triangle':
            drawTriangle(bullet);
            break;
        case 'rectangle':
            drawRectangle(bullet);
            break;
        case 'pentagon':
            drawPentagon(bullet);
            break;
        case 'hexagon':
            drawHexagon(bullet);
            break;
        case 'octagon':
            drawOctagon(bullet);
            break;
        case 'circle':
            drawCircle(bullet);
            break;
        case 'cross':
            drawCross(bullet);
            break;
        case 'heart':
            drawHeart(bullet);
            break;
        case 'star':
            drawStar(bullet);
            break;
        case 'flower':
            drawFlower(bullet);
            break;
        case 'gear':
            drawGear(bullet);
            break;
        case 'moon':
            drawMoon(bullet);
            break;
        default:
            drawRectangle(bullet);
    }
    
    ctx.restore();
}

// 보스 총알 이동 및 충돌 처리
function handleBossBullets() {
    bossBullets = bossBullets.filter(bullet => {
        // 다이나믹한 움직임 추가
        const currentTime = Date.now();
        
        // 회전 효과
        if (!bullet.rotationSpeed) bullet.rotationSpeed = 0.05 + Math.random() * 0.1;
        bullet.rotation += bullet.rotationSpeed;
        
        // 펄스 효과 (크기 변화)
        if (!bullet.pulsePhase) bullet.pulsePhase = Math.random() * Math.PI * 2;
        bullet.pulsePhase += 0.1;
        const pulseScale = 1 + Math.sin(bullet.pulsePhase) * 0.2;
        
        // 지그재그 움직임 (특정 패턴에만 적용)
        if (bullet.patternType === 'wave_shot' || bullet.patternType === 'triple_wave') {
            if (!bullet.waveOffset) bullet.waveOffset = 0;
            bullet.waveOffset += 0.1;
            const waveAmplitude = 20;
            const waveOffset = Math.sin(bullet.waveOffset) * waveAmplitude;
            
            // 기본 이동
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            
            // 지그재그 추가
            bullet.x += Math.cos(bullet.angle + Math.PI/2) * waveOffset * 0.1;
        } else {
            // 기본 이동
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
        }
        
        // 총알 그리기 (펄스 효과 적용)
        const originalWidth = bullet.width;
        bullet.width *= pulseScale;
        drawBossBullet(bullet);
        bullet.width = originalWidth;
        
        // 보스 총알은 플레이어 총알에 파괴되지 않음 (제거됨)
        
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
const MIN_HELICOPTER_SPAWN_INTERVAL = 3000; // 3초(3000ms)로 더 단축
let isBossActive = false; // 보스 활성화 상태 추적





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

// 16진수 색상을 RGB로 변환하는 함수
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r: 255, g: 0, b: 0}; // 기본값: 빨간색
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

// 사운드 play 함수 예외처리 래퍼 (종이비행기용과 동일한 방식으로 변경)
function safePlay(audio) {
    return safePlaySound(audio);
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
        <input type="range" min="0" max="100" value="100" id="sfx-volume" style="flex: 1; min-width: 120px; max-width: 200px;"> 
        <span id="volume-value" style="min-width: 40px; text-align:right;">100%</span>
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
            
            // 전역 볼륨 업데이트 (종이비행기용과 동일한 방식)
            globalVolume = volume;
            applyGlobalVolume();
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

// 통합된 총알 생성 함수 (PC/모바일 공통)
function createUnifiedBullet() {
    // 일반 총알 발사 (레벨 1 수준으로 제한)
    const bullet = {
        x: player.x + player.width / 2,
        y: player.y,
        width: 4,   // 통일된 크기
        height: 8,  // 통일된 크기
        speed: 6,   // 통일된 속도
        damage: 100,
        isBossBullet: false,
        isSpecial: false
    };
    bullets.push(bullet);
    
    // 두 번째 비행기 발사 (레벨 1 수준으로 제한)
    if (hasSecondPlane) {
        const bullet = {
            x: secondPlane.x + secondPlane.width / 2,
            y: secondPlane.y,
            width: 4,   // 통일된 크기
            height: 8,  // 통일된 크기
            speed: 6,   // 통일된 속도
            damage: 100,
            isBossBullet: false,
            isSpecial: false
        };
        bullets.push(bullet);
    }
}

// 통합된 총알 발사 함수 (PC/모바일 공통)
function fireBullet() {
    if (!canFire || !gameStarted || isGameOver) return;
    
    const currentTime = Date.now();
    if (currentTime - lastFireTime < fireDelay) return;
    
    // 통합된 총알 생성 (레벨 1 수준으로 제한)
    createUnifiedBullet();
    
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

        // 터치 대기 상태에서 첫 터치 시 게임 시작
        if (!gameStarted && !isStartScreen && !isGameOver) {
            gameStarted = true;
            console.log('터치로 게임 시작됨');
        }
        
        // 게임 진행 중일 때만 플레이어 이동
        if (gameStarted && !isGameOver && !isStartScreen) {
            // 터치한 위치에서 플레이어가 적절한 거리에 오도록 조정 (꼬리끝에서 18.15픽셀 거리)
            let adjustedTouchY = touchY - 18.15; // 꼬리끝에서 터치점까지 18.15픽셀 거리
            let newX = touchX - player.width / 2 + player.width / 4; // 터치 위치를 플레이어 중심으로 조정하고 날개폭의 반만큼 오른쪽으로 이동
            let newY = adjustedTouchY - player.height * 0.5; // 비행기 꼬리 날개가 터치점에서 적절한 거리에 오도록
            
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
                secondPlane.x = newX + (canvas.width / 2 - 60) - (canvas.width / 2 - (240 * 0.7 * 0.7 * 0.8 * 0.9) / 2);
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
        
        // 터치한 위치에서 플레이어가 적절한 거리에 오도록 조정 (꼬리끝에서 18.15픽셀 거리)
        let adjustedTouchY = touchY - 18.15; // 꼬리끝에서 터치점까지 18.15픽셀 거리
        let newX = touchX - player.width / 2 + player.width / 4; // 터치 위치를 플레이어 중심으로 조정하고 날개폭의 반만큼 오른쪽으로 이동
        let newY = adjustedTouchY - player.height * 0.5; // 비행기 꼬리 날개가 터치점에서 적절한 거리에 오도록
        
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
            secondPlane.x = newX + (canvas.width / 2 - 60) - (canvas.width / 2 - (240 * 0.7 * 0.7 * 0.8 * 0.9) / 2);
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

// 보스용 헬리콥터 총알 생성 함수
function createHelicopterBullet(boss, angle) {
    const bullet = {
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        angle: angle,
        speed: 7,
        width: 36,
        height: 8,
        isBossBullet: true
    };
    helicopterBullets.push(bullet);
}

// 새로운 보스 패턴 함수들 - 지정된 14개 패턴만 유지
function bossFireSnowflakeShot(boss) {
    console.log('❄️ 눈 결정체 패턴 발사:', { bossId: boss.id, color: '#FFFFFF' });
    // 눈 결정체 패턴 - 흰색 (다층 발사)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 다층 원형 패턴 - 내부와 외부 원으로 구성된 눈 결정체 모양 (난이도 추가 증가)
    // 내부 원 (작은 원) - 속도 추가 증가
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        createBossBullet(boss, angle, 'snowflake_shot', 7); // 속도 5 → 7로 증가
    }
    
    // 외부 원 (큰 원) - 지연 발사, 속도 추가 증가
    setTimeout(() => {
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4 + Math.PI / 4; // 45도 회전된 위치
            createBossBullet(boss, angle, 'snowflake_shot', 8); // 속도 6 → 8로 증가
        }
    }, 100); // 지연 시간 150ms → 100ms로 단축
    
    // 추가 중간 원 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + Math.PI / 8; // 22.5도 회전된 위치
            createBossBullet(boss, angle, 'snowflake_shot', 6);
        }
    }, 200);
}

function bossFirePinwheelShot(boss) {
    console.log('🌀 바람개비 패턴 발사:', { bossId: boss.id, color: '#90EE90' });
    // 바람개비 패턴 - 청녹색 (#90EE90) (나선형 발사)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 진짜 나선형 패턴 - 바람개비처럼 회전하는 나선 (난이도 추가 증가)
    for (let layer = 0; layer < 5; layer++) { // 층 수 4 → 5로 증가
        setTimeout(() => {
            for (let i = 0; i < 4; i++) {
                const baseAngle = (Math.PI * 2 * i) / 4;
                const spiralOffset = layer * Math.PI / 4; // 각 층마다 45도씩 회전
                const angle = baseAngle + spiralOffset;
                const speed = 5 + layer * 1.0; // 속도 추가 증가 (4 → 5, 0.8 → 1.0)
                createBossBullet(boss, angle, 'pinwheel_shot', speed);
            }
        }, layer * 80); // 간격 100ms → 80ms로 단축
    }
    
    // 추가 역방향 나선 (난이도 증가)
    setTimeout(() => {
        for (let layer = 0; layer < 3; layer++) {
            setTimeout(() => {
                for (let i = 0; i < 4; i++) {
                    const baseAngle = (Math.PI * 2 * i) / 4;
                    const spiralOffset = -layer * Math.PI / 4; // 역방향 회전
                    const angle = baseAngle + spiralOffset;
                    const speed = 6 + layer * 0.5;
                    createBossBullet(boss, angle, 'pinwheel_shot', speed);
                }
            }, layer * 80);
        }
    }, 400);
}

function bossFireTriangleShot(boss) {
    console.log('🔺 삼각형 패턴 발사:', { bossId: boss.id, color: '#32CD32' });
    // 삼각형 패턴 - 밝은 라임그린 (#32CD32) (파동형 발사)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 삼각형 모양 패턴 - 정삼각형의 세 꼭짓점 방향으로 발사 (난이도 추가 증가)
    for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 * i) / 3; // 0, 120, 240도
        createBossBullet(boss, angle, 'triangle_shot', 8); // 속도 6 → 8로 증가
    }
    
    // 삼각형 중심에서 추가 발사 (지연) - 속도 추가 증가
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 * i) / 3 + Math.PI / 3; // 60도 회전된 위치
            createBossBullet(boss, angle, 'triangle_shot', 7); // 속도 5 → 7로 증가
        }
    }, 100); // 지연 시간 150ms → 100ms로 단축
    
    // 추가 레이어 발사 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 * i) / 3 + Math.PI / 6; // 30도 회전된 위치
            createBossBullet(boss, angle, 'triangle_shot', 6); // 속도 4 → 6으로 증가
        }
    }, 200); // 지연 시간 300ms → 200ms로 단축
    
    // 추가 복합 패턴 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6; // 6방향 발사
            createBossBullet(boss, angle, 'triangle_shot', 5);
        }
    }, 300);
}

function bossFireRectangleShot(boss) {
    console.log('🟩 정사각형 패턴 발사:', { bossId: boss.id, color: '#ADFF2F' });
    // 정사각형 패턴 - 연두색 (#ADFF2F) (회전형 발사)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 사각형 모양 패턴 - 정사각형의 네 꼭짓점 방향으로 발사 (난이도 증가)
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4; // 0, 90, 180, 270도
        createBossBullet(boss, angle, 'rectangle_shot', 6); // 속도 4 → 6으로 증가
    }
    
    // 사각형 중심에서 추가 발사 (지연) - 속도 증가
    setTimeout(() => {
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4 + Math.PI / 4; // 45도 회전된 위치
            createBossBullet(boss, angle, 'rectangle_shot', 5); // 속도 3 → 5로 증가
        }
    }, 150); // 지연 시간 200ms → 150ms로 단축
    
    // 추가 레이어 발사 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4 + Math.PI / 8; // 22.5도 회전된 위치
            createBossBullet(boss, angle, 'rectangle_shot', 4);
        }
    }, 300);
}

function bossFirePentagonShot(boss) {
    console.log('🟠 오각형 패턴 발사:', { bossId: boss.id, color: '#FFA500' });
    // 오각형 패턴 - 주황색 (#FFA500) (폭발형 발사)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 오각형 모양 패턴 - 정오각형의 다섯 꼭짓점 방향으로 발사 (난이도 증가)
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5; // 0, 72, 144, 216, 288도
        createBossBullet(boss, angle, 'pentagon_shot', 6); // 속도 4 → 6으로 증가
    }
    
    // 오각형 중심에서 추가 발사 (지연) - 속도 증가
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 + Math.PI / 5; // 36도 회전된 위치
            createBossBullet(boss, angle, 'pentagon_shot', 5); // 속도 3 → 5로 증가
        }
    }, 150); // 지연 시간 200ms → 150ms로 단축
    
    // 추가 레이어 발사 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 + Math.PI / 10; // 18도 회전된 위치
            createBossBullet(boss, angle, 'pentagon_shot', 4);
        }
    }, 300);
}

function bossFireHexagonShot(boss) {
    console.log('⬡ 육각형 패턴 발사:', { bossId: boss.id, color: '#D3D3D3' });
    // 육각형 패턴 - 밝은 회색 (#D3D3D3) (회전 확산형)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 육각형 모양 패턴 - 정육각형의 여섯 꼭짓점 방향으로 발사 (난이도 증가)
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6; // 0, 60, 120, 180, 240, 300도
        createBossBullet(boss, angle, 'hexagon_shot', 6); // 속도 4 → 6으로 증가
    }
    
    // 육각형 중심에서 추가 발사 (지연) - 속도 증가
    setTimeout(() => {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 + Math.PI / 6; // 30도 회전된 위치
            createBossBullet(boss, angle, 'hexagon_shot', 5); // 속도 3 → 5로 증가
        }
    }, 150); // 지연 시간 200ms → 150ms로 단축
    
    // 추가 레이어 발사 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 + Math.PI / 12; // 15도 회전된 위치
            createBossBullet(boss, angle, 'hexagon_shot', 4);
        }
    }, 300);
}

function bossFireOctagonShot(boss) {
    console.log('🟡 팔각형 패턴 발사:', { bossId: boss.id, color: '#FFD700' });
    // 팔각형 패턴 - 밝은 골드 (#FFD700) (나선 회전형)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 나선 회전형 패턴 - 방향 변화가 있는 나선 발사 - 총알 개수 10개로 수정
    for (let spiral = 0; spiral < 1; spiral++) {
        setTimeout(() => {
            for (let i = 0; i < 10; i++) {
                const baseAngle = (Math.PI * 2 * i) / 10;
                // 나선 회전과 방향 변화
                const spiralOffset = (spiral * Math.PI) / 10;
                const directionOffset = Math.cos(i * Math.PI / 5) * 0.3; // 방향 변화
                const angle = baseAngle + spiralOffset + directionOffset;
                
                // 단순화된 속도
                const speed = 2 + (spiral * 0.5) + (i * 0.1);
                
                createBossBullet(boss, angle, 'octagon_shot', speed);
            }
        }, spiral * 120);
    }
}

function bossFireCircleShot(boss) {
    console.log('🔵 원형 패턴 발사:', { bossId: boss.id, color: '#20B2AA' });
    // 원형 패턴 - 청녹색 (#20B2AA) (원형 파동형)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 원형 파동형 패턴 - 방향 변화가 있는 원형 발사 - 총알 개수 10개로 수정
    for (let wave = 0; wave < 1; wave++) {
        setTimeout(() => {
            for (let i = 0; i < 10; i++) {
                const baseAngle = (Math.PI * 2 * i) / 10;
                // 원형 파동과 방향 변화
                const waveOffset = Math.sin(wave * Math.PI / 1) * 0.3;
                const directionOffset = Math.sin(i * Math.PI / 5) * 0.4; // 방향 변화
                const angle = baseAngle + waveOffset + directionOffset;
                
                // 단순화된 속도
                const speed = 3 + (wave * 0.5);
                
                createBossBullet(boss, angle, 'circle_shot', speed);
            }
        }, wave * 150);
    }
}

function bossFireCrossShot(boss) {
    console.log('❌ 십자 패턴 발사:', { bossId: boss.id, color: '#FF4500' });
    // 십자 패턴 - 밝은 빨간색 (#FF4500) (교차 확산형 발사)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 십자 모양 패턴 - 십자의 네 방향으로 발사 (난이도 추가 증가)
    for (let burst = 0; burst < 4; burst++) { // 버스트 수 3 → 4로 증가
        setTimeout(() => {
            // 십자 방향 (상하좌우) - 속도 추가 증가
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 * i) / 4; // 0, 90, 180, 270도
                createBossBullet(boss, angle, 'cross_shot', 8); // 속도 6 → 8로 증가
            }
            
            // 대각선 방향 (지연 발사) - 속도 추가 증가
            setTimeout(() => {
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI * 2 * i) / 4 + Math.PI / 4; // 45도 회전된 위치
                    createBossBullet(boss, angle, 'cross_shot', 7); // 속도 5 → 7로 증가
                }
            }, 80); // 지연 시간 100ms → 80ms로 단축
        }, burst * 200); // 간격 250ms → 200ms로 단축
    }
    
    // 추가 복합 십자 패턴 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8; // 8방향 발사
            createBossBullet(boss, angle, 'cross_shot', 6);
        }
    }, 800);
}

function bossFireHeartShot(boss) {
    console.log('💖 하트 패턴 발사:', { bossId: boss.id, color: '#FF69B4' });
    // 하트 패턴 - 밝은 핫핑크 (#FF69B4) (하트 모양 확산)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 하트 모양 패턴 - 하트의 특징적인 곡선을 따라 발사 (난이도 추가 증가)
    // 하트의 상단 곡선 부분 - 속도 추가 증가
    for (let i = 0; i < 3; i++) {
        const angle = Math.PI + (i - 1) * Math.PI / 4; // 하트 상단 곡선
        createBossBullet(boss, angle, 'heart_shot', 8); // 속도 6 → 8로 증가
    }
    
    // 하트의 하단 뾰족한 부분 - 속도 추가 증가
    setTimeout(() => {
        for (let i = 0; i < 2; i++) {
            const angle = Math.PI / 2 + i * Math.PI; // 하트 하단 뾰족한 부분
            createBossBullet(boss, angle, 'heart_shot', 7); // 속도 5 → 7로 증가
        }
    }, 100); // 지연 시간 150ms → 100ms로 단축
    
    // 하트의 측면 부분 - 속도 추가 증가
    setTimeout(() => {
        for (let i = 0; i < 2; i++) {
            const angle = Math.PI / 4 + i * Math.PI / 2; // 하트 측면
            createBossBullet(boss, angle, 'heart_shot', 7); // 속도 5 → 7로 증가
        }
    }, 200); // 지연 시간 300ms → 200ms로 단축
    
    // 추가 레이어 발사 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            const angle = Math.PI + (i - 1) * Math.PI / 6; // 하트 중간 부분
            createBossBullet(boss, angle, 'heart_shot', 6); // 속도 4 → 6으로 증가
        }
    }, 350); // 지연 시간 450ms → 350ms로 단축
    
    // 추가 복합 하트 패턴 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6; // 6방향 발사
            createBossBullet(boss, angle, 'heart_shot', 5);
        }
    }, 500);
}

function bossFireStarShot(boss) {
    console.log('⭐ 별 패턴 발사:', { bossId: boss.id, color: '#FFFF00' });
    // 별 패턴 - 노란색 (별 모양 확산)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    // 별 모양 패턴 - 오각별의 다섯 꼭짓점과 다섯 곡선 중심으로 발사 (난이도 추가 증가)
    // 별의 외부 꼭짓점 (5개) - 속도 추가 증가
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5; // 0, 72, 144, 216, 288도
        createBossBullet(boss, angle, 'star_shot', 8); // 속도 6 → 8로 증가
    }
    
    // 별의 내부 곡선 중심 (5개) - 지연 발사, 속도 추가 증가
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 + Math.PI / 5; // 36도 회전된 위치
            createBossBullet(boss, angle, 'star_shot', 7); // 속도 5 → 7로 증가
        }
    }, 100); // 지연 시간 150ms → 100ms로 단축
    
    // 추가 레이어 발사 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 + Math.PI / 10; // 18도 회전된 위치
            createBossBullet(boss, angle, 'star_shot', 6); // 속도 4 → 6으로 증가
        }
    }, 200); // 지연 시간 300ms → 200ms로 단축
    
    // 추가 복합 별 패턴 (난이도 증가)
    setTimeout(() => {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10; // 10방향 발사
            createBossBullet(boss, angle, 'star_shot', 5);
        }
    }, 400);
}

function bossFireFlowerShot(boss) {
    // 꽃 패턴 - 밝은 딥핑크 (#FF1493)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    for (let i = 0; i < 10; i++) { // 총알 개수 10개로 수정
        const angle = (Math.PI * 2 * i) / 10;
        createBossBullet(boss, angle, 'flower_shot');
    }
}

function bossFireGearShot(boss) {
    console.log('⚙️ 기어 패턴 발사:', { bossId: boss.id, color: '#C0C0C0' });
    // 기어 패턴 - 은색 (#C0C0C0)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    for (let i = 0; i < 10; i++) { // 총알 개수 10개로 수정
        const angle = (Math.PI * 2 * i) / 10;
        createBossBullet(boss, angle, 'gear_shot');
    }
}

function bossFireMoonShot(boss) {
    console.log('🌙 달 패턴 발사:', { bossId: boss.id, color: '#F0E68C' });
    // 달 패턴 - 카키색 (#F0E68C)
    const bossX = boss.x + boss.width/2;
    const bossY = boss.y + boss.height/2;
    
    for (let i = 0; i < 10; i++) { // 총알 개수 10개로 수정
        const angle = (Math.PI * 2 * i) / 10;
        createBossBullet(boss, angle, 'moon_shot');
    }
}