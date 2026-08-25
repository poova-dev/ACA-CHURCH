/**
 * ACA Church PKT — Hero Canvas Animation Engine
 * Preloads and renders the 192-frame sequence with scroll-scrubbing & overlay transitions
 */

const HERO_TOTAL_FRAMES = 192;
const heroFrameImages = new Array(HERO_TOTAL_FRAMES);
let heroLoadedCount = 0;

const heroCanvas = document.getElementById('hero-canvas');
const heroCtx = heroCanvas ? heroCanvas.getContext('2d') : null;
const heroScrollTrack = document.getElementById('hero-scroll-track');
const heroScripture = document.getElementById('hero-scripture-container');
const heroWelcome = document.getElementById('hero-welcome-badge');
const heroScrollPrompt = document.getElementById('scroll-prompt');
const heroLoadingBar = document.getElementById('loading-bar');
const heroLoadingContainer = document.getElementById('loading-bar-container');

function getHeroFramePath(index) {
    const numStr = String(index + 1).padStart(3, '0');
    return `hero image/frame_${numStr}.jpg`;
}

function resizeHeroCanvas() {
    if (!heroCanvas || !heroCtx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    heroCanvas.width = window.innerWidth * dpr;
    heroCanvas.height = window.innerHeight * dpr;
    heroCtx.scale(dpr, dpr);
    renderHeroFrame(heroCurrentProgress);
}

function preloadHeroFrame(index) {
    return new Promise((resolve) => {
        if (heroFrameImages[index]) {
            resolve(heroFrameImages[index]);
            return;
        }
        const img = new Image();
        img.src = getHeroFramePath(index);
        img.onload = () => {
            heroFrameImages[index] = img;
            heroLoadedCount++;
            if (heroLoadingBar) {
                const pct = Math.min(100, Math.round((heroLoadedCount / HERO_TOTAL_FRAMES) * 100));
                heroLoadingBar.style.width = pct + '%';
            }
            if (heroLoadedCount >= HERO_TOTAL_FRAMES && heroLoadingContainer) {
                setTimeout(() => {
                    heroLoadingContainer.style.opacity = '0';
                    setTimeout(() => { heroLoadingContainer.style.display = 'none'; }, 700);
                }, 300);
            }
            if (index === 0) renderHeroFrame(0);
            resolve(img);
        };
        img.onerror = () => resolve(null);
    });
}

async function initHeroLoader() {
    // Load first 15 immediately
    const initP = [];
    for (let i = 0; i < 15; i++) initP.push(preloadHeroFrame(i));
    await Promise.all(initP);
    renderHeroFrame(0);

    // Load remaining frames asynchronously in batches
    for (let i = 15; i < HERO_TOTAL_FRAMES; i += 12) {
        const batch = [];
        for (let j = i; j < Math.min(i + 12, HERO_TOTAL_FRAMES); j++) {
            batch.push(preloadHeroFrame(j));
        }
        await Promise.all(batch);
        await new Promise(r => setTimeout(r, 20));
    }
}

function drawCover(ctx, img, canvasWidth, canvasHeight) {
    if (!img || !img.complete) return;
    const imgWidth = img.naturalWidth || 1920;
    const imgHeight = img.naturalHeight || 1080;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    let renderWidth, renderHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
        renderWidth = canvasWidth;
        renderHeight = canvasWidth / imgRatio;
        offsetX = 0;
        offsetY = (canvasHeight - renderHeight) / 2;
    } else {
        renderWidth = canvasHeight * imgRatio;
        renderHeight = canvasHeight;
        offsetX = (canvasWidth - renderWidth) / 2;
        offsetY = 0;
    }
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
}

let heroTargetProgress = 0;
let heroCurrentProgress = 0;
let heroIsAnimating = false;
let heroLastFrame = -1;

function renderHeroFrame(prog) {
    if (!heroCtx) return;
    let frameIdx = Math.round(prog * (HERO_TOTAL_FRAMES - 1));
    frameIdx = Math.max(0, Math.min(HERO_TOTAL_FRAMES - 1, frameIdx));

    if (frameIdx !== heroLastFrame) {
        heroLastFrame = frameIdx;
        let img = heroFrameImages[frameIdx];
        if (!img) {
            for (let d = 1; d < HERO_TOTAL_FRAMES; d++) {
                if (frameIdx - d >= 0 && heroFrameImages[frameIdx - d]) { img = heroFrameImages[frameIdx - d]; break; }
                if (frameIdx + d < HERO_TOTAL_FRAMES && heroFrameImages[frameIdx + d]) { img = heroFrameImages[frameIdx + d]; break; }
            }
        }
        if (img) drawCover(heroCtx, img, window.innerWidth, window.innerHeight);
    }

    // Hero Overlays update
    if (prog < 0.18) {
        const fade = 1 - (prog / 0.18);
        if (heroWelcome) {
            heroWelcome.style.opacity = fade.toFixed(3);
            heroWelcome.style.transform = `translateY(${-25 * (1 - fade)}px)`;
        }
        if (heroScrollPrompt) heroScrollPrompt.style.opacity = fade.toFixed(3);
    } else {
        if (heroWelcome) heroWelcome.style.opacity = '0';
        if (heroScrollPrompt) heroScrollPrompt.style.opacity = '0';
    }

    if (prog >= 0.35) {
        const scriptProg = Math.min(1, Math.max(0, (prog - 0.35) / 0.35));
        if (heroScripture) {
            heroScripture.style.opacity = scriptProg.toFixed(3);
            heroScripture.style.transform = `translate3d(0, ${(35 * (1 - scriptProg)).toFixed(1)}px, 0)`;
            heroScripture.style.filter = window.innerWidth >= 768 ? `blur(${(8 * (1 - scriptProg)).toFixed(1)}px)` : 'none';
            heroScripture.style.pointerEvents = scriptProg > 0.5 ? 'auto' : 'none';
        }
    } else if (heroScripture) {
        heroScripture.style.opacity = '0';
        heroScripture.style.transform = 'translate3d(0, 35px, 0)';
        heroScripture.style.filter = 'none';
    }
}

function heroAnimationLoop() {
    if (!heroScrollTrack) return;
    const rect = heroScrollTrack.getBoundingClientRect();
    const maxScroll = rect.height - window.innerHeight;
    heroTargetProgress = maxScroll > 0 ? Math.max(0, Math.min(1, -rect.top / maxScroll)) : 0;

    const diff = heroTargetProgress - heroCurrentProgress;
    if (Math.abs(diff) > 0.0001) {
        heroCurrentProgress += diff * 0.14;
        renderHeroFrame(heroCurrentProgress);
        requestAnimationFrame(heroAnimationLoop);
    } else {
        heroCurrentProgress = heroTargetProgress;
        renderHeroFrame(heroCurrentProgress);
        heroIsAnimating = false;
    }
}

function onHeroScroll() {
    if (!heroIsAnimating) {
        heroIsAnimating = true;
        requestAnimationFrame(heroAnimationLoop);
    }
}
