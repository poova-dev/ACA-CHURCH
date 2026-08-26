/**
 * ACA Church PKT — Vision Canvas Engine v2.0
 * Premium scroll-driven Bible animation (300 frames)
 * Phase 1: Intro text fades in over closed Bible
 * Phase 2: Bible opens with smooth transition
 * Phase 3: Vision content reveals on open Bible with professional typography
 */

const VISION_TOTAL_FRAMES = 300;
const visionFrameImages = new Array(VISION_TOTAL_FRAMES);
let visionLoadedCount = 0;

const visionCanvas = document.getElementById('vision-canvas');
const visionCtx = visionCanvas ? visionCanvas.getContext('2d') : null;
const visionScrollTrack = document.getElementById('vision-scroll-track');
const visionLoadingBar = document.getElementById('vision-loading-bar');
const visionLoadingContainer = document.getElementById('vision-loading-container');

// Text overlay elements
const visionIntroOverlay = document.getElementById('visionIntroOverlay');
const visionContentOverlay = document.getElementById('visionContentOverlay');
const visionContentItems = document.querySelectorAll('.vision-reveal-item');

function getVisionFramePath(index) {
    const numStr = String(index + 1).padStart(3, '0');
    return `vision_frames/frame_${numStr}.jpg`;
}

function resizeVisionCanvas() {
    if (!visionCanvas || !visionCtx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = visionCanvas.clientWidth || window.innerWidth;
    const h = visionCanvas.clientHeight || window.innerHeight;
    visionCanvas.width = w * dpr;
    visionCanvas.height = h * dpr;
    visionCtx.scale(dpr, dpr);
    visionLastFrame = -1;
    renderVisionFrame(visionCurrentProgress);
}

function preloadVisionFrame(index) {
    return new Promise((resolve) => {
        if (index >= VISION_TOTAL_FRAMES) { resolve(null); return; }
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
    // Priority 1: Key milestone frames
    const milestones = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 299];
    await Promise.all(milestones.map(m => preloadVisionFrame(m)));
    renderVisionFrame(0);

    // Priority 2: Load all frames in small batches
    for (let i = 0; i < VISION_TOTAL_FRAMES; i += 10) {
        const batch = [];
        for (let j = i; j < Math.min(i + 10, VISION_TOTAL_FRAMES); j++) {
            batch.push(preloadVisionFrame(j));
        }
        await Promise.all(batch);
        await new Promise(r => setTimeout(r, 10));
    }
}

let visionTargetProgress = 0;
let visionCurrentProgress = 0;
let visionIsAnimating = false;
let visionLastFrame = -1;

// Easing: smooth cubic interpolation
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function renderVisionFrame(prog) {
    if (!visionCtx) return;
    let frameIdx = Math.round(prog * (VISION_TOTAL_FRAMES - 1));
    frameIdx = Math.max(0, Math.min(VISION_TOTAL_FRAMES - 1, frameIdx));

    if (frameIdx !== visionLastFrame) {
        visionLastFrame = frameIdx;
        let img = visionFrameImages[frameIdx];
        if (!img) {
            // Fallback: find nearest loaded frame
            for (let d = 1; d < VISION_TOTAL_FRAMES; d++) {
                if (frameIdx - d >= 0 && visionFrameImages[frameIdx - d]) { img = visionFrameImages[frameIdx - d]; break; }
                if (frameIdx + d < VISION_TOTAL_FRAMES && visionFrameImages[frameIdx + d]) { img = visionFrameImages[frameIdx + d]; break; }
            }
        }
        const w = visionCanvas.clientWidth || window.innerWidth;
        const h = visionCanvas.clientHeight || window.innerHeight;
        if (img) drawCover(visionCtx, img, w, h);
    }

    // === PHASE 1: INTRO TEXT (frames 0–80) ===
    // Text fades in at 10%, peaks at 40%, fades out by frame 80
    if (visionIntroOverlay) {
        if (frameIdx <= 80) {
            const fadeIn = Math.min(1, frameIdx / 25);       // 0→1 over first 25 frames
            const fadeOut = Math.max(0, 1 - (frameIdx - 55) / 25); // 1→0 from frame 55–80
            const opacity = Math.min(fadeIn, fadeOut);
            const translateY = (1 - easeOutCubic(fadeIn)) * 40;  // Slide up on enter
            
            visionIntroOverlay.style.opacity = opacity.toFixed(3);
            visionIntroOverlay.style.transform = `translateY(${translateY.toFixed(1)}px)`;
            visionIntroOverlay.style.pointerEvents = opacity > 0.3 ? 'auto' : 'none';
            visionIntroOverlay.style.display = '';
        } else {
            visionIntroOverlay.style.opacity = '0';
            visionIntroOverlay.style.display = 'none';
        }
    }

    // === PHASE 2: BIBLE OPENING (frames 60–200) ===
    // No overlays — just the Bible frame animation plays

    // === PHASE 3: VISION CONTENT (frames 200–300) ===
    if (visionContentOverlay) {
        if (frameIdx >= 180) {
            const revealStart = 180;
            const revealEnd = 240;
            const rawProgress = Math.min(1, Math.max(0, (frameIdx - revealStart) / (revealEnd - revealStart)));
            const easedProgress = easeOutCubic(rawProgress);
            
            visionContentOverlay.style.opacity = easedProgress.toFixed(3);
            visionContentOverlay.style.transform = `translateY(${((1 - easedProgress) * 30).toFixed(1)}px)`;
            visionContentOverlay.style.filter = `blur(${((1 - easedProgress) * 6).toFixed(1)}px)`;
            visionContentOverlay.style.pointerEvents = easedProgress > 0.5 ? 'auto' : 'none';

            // Staggered reveal of individual vision items
            if (visionContentItems.length > 0) {
                visionContentItems.forEach((item, idx) => {
                    const itemDelay = idx * 12;  // 12-frame stagger
                    const itemStart = revealStart + 20 + itemDelay;
                    const itemProg = Math.min(1, Math.max(0, (frameIdx - itemStart) / 30));
                    const itemEased = easeOutCubic(itemProg);
                    
                    item.style.opacity = itemEased.toFixed(3);
                    item.style.transform = `translateY(${((1 - itemEased) * 24).toFixed(1)}px)`;
                });
            }
        } else {
            visionContentOverlay.style.opacity = '0';
            visionContentOverlay.style.transform = 'translateY(30px)';
            visionContentOverlay.style.filter = 'blur(6px)';
            visionContentOverlay.style.pointerEvents = 'none';
            
            if (visionContentItems.length > 0) {
                visionContentItems.forEach(item => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(24px)';
                });
            }
        }
    }
}

function visionAnimationLoop() {
    if (!visionScrollTrack) return;
    const rect = visionScrollTrack.getBoundingClientRect();
    const maxScroll = rect.height - window.innerHeight;
    visionTargetProgress = maxScroll > 0 ? Math.max(0, Math.min(1, -rect.top / maxScroll)) : 0;

    const diff = visionTargetProgress - visionCurrentProgress;
    if (Math.abs(diff) > 0.0001) {
        visionCurrentProgress += diff * 0.14; // Smooth interpolation
        renderVisionFrame(visionCurrentProgress);
        requestAnimationFrame(visionAnimationLoop);
    } else {
        visionCurrentProgress = visionTargetProgress;
        renderVisionFrame(visionCurrentProgress);
        visionIsAnimating = false;
    }
}

function onVisionScroll() {
    if (!visionIsAnimating) {
        visionIsAnimating = true;
        requestAnimationFrame(visionAnimationLoop);
    }
}
