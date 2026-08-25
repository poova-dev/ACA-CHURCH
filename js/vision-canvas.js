/**
 * ACA Church PKT — Cinematic "Our Vision" Canvas Engine
 * Preloads and controls the 541-frame sequence of the Sacred Bible opening & Vision 01 reveal
 */

const VISION_TOTAL_FRAMES = 541;
const visionFrameImages = new Array(VISION_TOTAL_FRAMES);
let visionLoadedCount = 0;

const visionCanvas = document.getElementById('vision-canvas');
const visionCtx = visionCanvas ? visionCanvas.getContext('2d') : null;
const visionScrollTrack = document.getElementById('vision-scroll-track');
const visionLoadingBar = document.getElementById('vision-loading-bar');
const visionLoadingContainer = document.getElementById('vision-loading-container');
const visionScene1Prompt = document.getElementById('visionScene1Prompt');
const visionPageOverlay = document.getElementById('visionPageOverlay');
const visionStatusText = document.getElementById('visionStatusText');
const visionScrubber = document.getElementById('visionFrameScrubber');
const visionPlayIcon = document.getElementById('visionPlayIcon');
const visionPlayText = document.getElementById('visionPlayText');

function getVisionFramePath(index) {
    const numStr = String(index + 1).padStart(3, '0');
    return `vision_frames/frame_${numStr}.jpg`;
}

function resizeVisionCanvas() {
    if (!visionCanvas || !visionCtx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    visionCanvas.width = window.innerWidth * dpr;
    visionCanvas.height = window.innerHeight * dpr;
    visionCtx.scale(dpr, dpr);
    renderVisionFrame(visionCurrentProgress);
}

function preloadVisionFrame(index) {
    return new Promise((resolve) => {
        if (visionFrameImages[index]) {
            resolve(visionFrameImages[index]);
            return;
        }
        const img = new Image();
        img.src = getVisionFramePath(index);
        img.onload = () => {
            visionFrameImages[index] = img;
            visionLoadedCount++;
            if (visionLoadingBar) {
                const pct = Math.min(100, Math.round((visionLoadedCount / VISION_TOTAL_FRAMES) * 100));
                visionLoadingBar.style.width = pct + '%';
            }
            if (visionLoadedCount >= VISION_TOTAL_FRAMES && visionLoadingContainer) {
                setTimeout(() => {
                    visionLoadingContainer.style.opacity = '0';
                    setTimeout(() => { visionLoadingContainer.style.display = 'none'; }, 700);
                }, 300);
            }
            if (index === 0) renderVisionFrame(0);
            resolve(img);
        };
        img.onerror = () => resolve(null);
    });
}

async function initVisionLoader() {
    // Priority 1: Key milestone frames first for immediate interaction
    const milestones = [0, 60, 120, 180, 240, 280, 300, 350, 420, 500, 540];
    const initP = milestones.map(m => preloadVisionFrame(m));
    await Promise.all(initP);
    renderVisionFrame(0);

    // Priority 2: Preload initial 1-300 frames (Scenes 1-4)
    for (let i = 0; i <= 310; i += 10) {
        const batch = [];
        for (let j = i; j < Math.min(i + 10, 310); j++) {
            batch.push(preloadVisionFrame(j));
        }
        await Promise.all(batch);
        await new Promise(r => setTimeout(r, 15));
    }

    // Priority 3: Preload remaining frames (311-540)
    for (let i = 311; i < VISION_TOTAL_FRAMES; i += 15) {
        const batch = [];
        for (let j = i; j < Math.min(i + 15, VISION_TOTAL_FRAMES); j++) {
            batch.push(preloadVisionFrame(j));
        }
        await Promise.all(batch);
        await new Promise(r => setTimeout(r, 20));
    }
}

let visionTargetProgress = 0;
let visionCurrentProgress = 0;
let visionIsAnimating = false;
let visionLastFrame = -1;
let isAutoPlaying = false;

function renderVisionFrame(prog) {
    if (!visionCtx) return;
    let frameIdx = Math.round(prog * (VISION_TOTAL_FRAMES - 1));
    frameIdx = Math.max(0, Math.min(VISION_TOTAL_FRAMES - 1, frameIdx));

    if (visionScrubber && document.activeElement !== visionScrubber) {
        visionScrubber.value = frameIdx;
    }

    if (frameIdx !== visionLastFrame) {
        visionLastFrame = frameIdx;
        let img = visionFrameImages[frameIdx];
        if (!img) {
            for (let d = 1; d < VISION_TOTAL_FRAMES; d++) {
                if (frameIdx - d >= 0 && visionFrameImages[frameIdx - d]) { img = visionFrameImages[frameIdx - d]; break; }
                if (frameIdx + d < VISION_TOTAL_FRAMES && visionFrameImages[frameIdx + d]) { img = visionFrameImages[frameIdx + d]; break; }
            }
        }
        if (img) drawCover(visionCtx, img, window.innerWidth, window.innerHeight);
    }

    let activeScene = 1;
    if (frameIdx < 60) {
        activeScene = 1;
        if (visionStatusText) visionStatusText.textContent = "Scene 1: Closed Holy Bible";
        if (visionScene1Prompt) {
            visionScene1Prompt.style.opacity = '1';
            visionScene1Prompt.style.transform = 'translateY(0)';
            visionScene1Prompt.style.pointerEvents = 'auto';
        }
        if (visionPageOverlay) {
            visionPageOverlay.style.opacity = '0';
            visionPageOverlay.style.transform = 'translateY(24px)';
            visionPageOverlay.style.filter = 'blur(4px)';
            visionPageOverlay.style.pointerEvents = 'none';
        }
    } else if (frameIdx < 220) {
        activeScene = 2;
        const openPct = Math.round(((frameIdx - 60) / 160) * 100);
        if (visionStatusText) visionStatusText.textContent = `Scene 2: Bible Opening (${openPct}%)`;
        if (visionScene1Prompt) {
            const fade = Math.max(0, 1 - (frameIdx - 60) / 40);
            visionScene1Prompt.style.opacity = fade.toFixed(2);
            visionScene1Prompt.style.transform = `translateY(${-20 * (1 - fade)}px)`;
            visionScene1Prompt.style.pointerEvents = 'none';
        }
        if (visionPageOverlay) {
            visionPageOverlay.style.opacity = '0';
            visionPageOverlay.style.transform = 'translateY(24px)';
            visionPageOverlay.style.filter = 'blur(4px)';
            visionPageOverlay.style.pointerEvents = 'none';
        }
    } else if (frameIdx < 275) {
        activeScene = 3;
        if (visionStatusText) visionStatusText.textContent = "Scene 3: Heavenly Light on Open Pages";
        if (visionScene1Prompt) visionScene1Prompt.style.opacity = '0';
        
        // Gradual subtle reveal of printed page
        const revealProg = Math.min(1, Math.max(0, (frameIdx - 220) / 55));
        if (visionPageOverlay) {
            visionPageOverlay.style.opacity = (revealProg * 0.7).toFixed(2);
            visionPageOverlay.style.transform = `translateY(${(24 * (1 - revealProg)).toFixed(1)}px)`;
            visionPageOverlay.style.filter = `blur(${(4 * (1 - revealProg)).toFixed(1)}px)`;
            visionPageOverlay.style.pointerEvents = revealProg > 0.6 ? 'auto' : 'none';
        }
    } else {
        activeScene = frameIdx >= 330 ? 5 : 4;
        if (visionStatusText) visionStatusText.textContent = activeScene === 5 ? "Scene 5: Vision 01 & 4 Pillars Covenant" : "Scene 4: Vision 01 Printed Page Reveal";
        if (visionScene1Prompt) visionScene1Prompt.style.opacity = '0';
        
        if (visionPageOverlay) {
            visionPageOverlay.style.opacity = '1';
            visionPageOverlay.style.transform = 'translateY(0)';
            visionPageOverlay.style.filter = 'blur(0)';
            visionPageOverlay.style.pointerEvents = 'auto';
        }
    }

    // Update Scene Navigation Pills
    const pills = document.querySelectorAll('.vision-scene-pill');
    pills.forEach(pill => {
        const sc = parseInt(pill.getAttribute('data-scene'), 10);
        if (sc === activeScene) {
            pill.classList.add('bg-amber-400', 'text-black', 'shadow-md');
            pill.classList.remove('text-amber-100/70');
        } else {
            pill.classList.remove('bg-amber-400', 'text-black', 'shadow-md');
            pill.classList.add('text-amber-100/70');
        }
    });
}

function visionAnimationLoop() {
    if (!visionScrollTrack || isAutoPlaying) return;
    const rect = visionScrollTrack.getBoundingClientRect();
    const maxScroll = rect.height - window.innerHeight;
    visionTargetProgress = maxScroll > 0 ? Math.max(0, Math.min(1, -rect.top / maxScroll)) : 0;

    const diff = visionTargetProgress - visionCurrentProgress;
    if (Math.abs(diff) > 0.0001) {
        visionCurrentProgress += diff * 0.16;
        renderVisionFrame(visionCurrentProgress);
        requestAnimationFrame(visionAnimationLoop);
    } else {
        visionCurrentProgress = visionTargetProgress;
        renderVisionFrame(visionCurrentProgress);
        visionIsAnimating = false;
    }
}

function onVisionScroll() {
    if (!visionIsAnimating && !isAutoPlaying) {
        visionIsAnimating = true;
        requestAnimationFrame(visionAnimationLoop);
    }
}

// Global Vision Engine Controller API
window.visionEngine = {
    jumpToScene(sceneNumber) {
        this.pause();
        let targetFrame = 0;
        if (sceneNumber === 1) targetFrame = 0;
        else if (sceneNumber === 2) targetFrame = 140;
        else if (sceneNumber === 3) targetFrame = 250;
        else if (sceneNumber === 4) targetFrame = 285;
        else if (sceneNumber === 5) targetFrame = 340;

        visionTargetProgress = targetFrame / (VISION_TOTAL_FRAMES - 1);
        visionCurrentProgress = visionTargetProgress;
        renderVisionFrame(visionCurrentProgress);

        if (visionScrollTrack) {
            const rect = visionScrollTrack.getBoundingClientRect();
            if (rect.top > 100 || rect.bottom < window.innerHeight - 100) {
                visionScrollTrack.scrollIntoView({ behavior: 'smooth' });
            }
        }
    },

    onScrub(frameVal) {
        this.pause();
        const frame = parseInt(frameVal, 10);
        visionTargetProgress = frame / (VISION_TOTAL_FRAMES - 1);
        visionCurrentProgress = visionTargetProgress;
        renderVisionFrame(visionCurrentProgress);
    },

    togglePlay() {
        if (isAutoPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    play() {
        isAutoPlaying = true;
        if (visionPlayIcon) visionPlayIcon.className = "fa-solid fa-pause text-[10px]";
        if (visionPlayText) visionPlayText.textContent = "Pause";

        if (visionCurrentProgress >= 0.98) {
            visionCurrentProgress = 0;
        }

        const startTime = performance.now();
        const startProg = visionCurrentProgress;
        const totalDuration = 12000; // 12 seconds for full cinematic majesty

        function step(timestamp) {
            if (!isAutoPlaying) return;
            const elapsed = timestamp - startTime;
            const p = Math.min(1, startProg + (elapsed / totalDuration));
            visionCurrentProgress = p;
            renderVisionFrame(visionCurrentProgress);

            if (p < 1) {
                requestAnimationFrame(step);
            } else {
                visionEngine.pause();
            }
        }
        requestAnimationFrame(step);
    },

    pause() {
        isAutoPlaying = false;
        if (visionPlayIcon) visionPlayIcon.className = "fa-solid fa-play text-[10px]";
        if (visionPlayText) visionPlayText.textContent = "Cinematic Play";
    },

    replay() {
        this.pause();
        visionCurrentProgress = 0;
        renderVisionFrame(0);
        setTimeout(() => this.play(), 200);
    },

    pledgePrayer() {
        const btn = document.getElementById('visionPledgeBtn');
        const btnText = document.getElementById('visionPledgeBtnText');
        const countElem = document.getElementById('visionPledgeCount');
        const isPledged = localStorage.getItem('aca_vision_pledged') === 'true';

        let current = parseInt(localStorage.getItem('aca_vision_pledge_count') || '152', 10);

        if (!isPledged) {
            current += 1;
            localStorage.setItem('aca_vision_pledge_count', current.toString());
            localStorage.setItem('aca_vision_pledged', 'true');
            
            if (btn && btnText) {
                btnText.textContent = "Amen! Covenant Confirmed";
                btn.className = "inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.18em] shadow-xl shadow-emerald-500/25";
            }
        } else {
            if (btn && btnText) {
                btnText.textContent = "Amen! Already Standing in Faith";
            }
        }

        if (countElem) {
            countElem.textContent = `${current}+`;
        }
    }
};
