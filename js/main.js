/**
 * ACA Church PKT — Main Application Controller
 * Handles initialization, scroll orchestration, sticky navbar, theme toggle, mobile menu, and gallery lightbox
 */

// Scroll listener for both Canvas tracks & Navbar
window.addEventListener('scroll', () => {
    if (typeof onHeroScroll === 'function') onHeroScroll();
    if (typeof onVisionScroll === 'function') onVisionScroll();
    updateNavbarVisibility();
}, { passive: true });

window.addEventListener('resize', () => {
    if (typeof resizeHeroCanvas === 'function') resizeHeroCanvas();
    if (typeof resizeVisionCanvas === 'function') resizeVisionCanvas();
});

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
    if (typeof resizeHeroCanvas === 'function') resizeHeroCanvas();
    if (typeof resizeVisionCanvas === 'function') resizeVisionCanvas();
    if (typeof initHeroLoader === 'function') initHeroLoader();
    if (typeof initVisionLoader === 'function') initVisionLoader();

    // Load saved prayer count
    const savedCount = localStorage.getItem('aca_vision_pledge_count') || '152';
    const countElem = document.getElementById('visionPledgeCount');
    if (countElem) countElem.textContent = `${savedCount}+`;
    if (localStorage.getItem('aca_vision_pledged') === 'true') {
        const btnText = document.getElementById('visionPledgeBtnText');
        const btn = document.getElementById('visionPledgeBtn');
        if (btnText && btn) {
            btnText.textContent = "Amen! Standing in Faith";
            btn.className = "inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.18em] shadow-xl shadow-emerald-500/25";
        }
    }
});

// Reveal animations observer
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up, .reveal-scale').forEach(el => revealObserver.observe(el));

// Navbar Visibility Control
const navbar = document.getElementById('navbar');
const aboutSection = document.getElementById('about');

function updateNavbarVisibility() {
    if (!navbar) return;
    const aboutTop = aboutSection ? aboutSection.getBoundingClientRect().top : 1000;
    if (aboutTop <= window.innerHeight * 0.75 || window.scrollY > 600) {
        navbar.classList.remove('opacity-0', '-translate-y-10', 'pointer-events-none');
        navbar.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
    } else {
        navbar.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        navbar.classList.add('opacity-0', '-translate-y-10', 'pointer-events-none');
    }
}
updateNavbarVisibility();

// Mobile Navigation Drawer Controller
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMobileMenu = document.getElementById('closeMobileMenu');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMobileDrawer() {
    if (mobileMenu) {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileDrawer() {
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
if (closeMobileMenu) closeMobileMenu.addEventListener('click', closeMobileDrawer);
if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', closeMobileDrawer);

mobileLinks.forEach(l => {
    l.addEventListener('click', () => {
        closeMobileDrawer();
    });
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileDrawer();
    }
});

// Theme Toggle (Light / Dark Mode)
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeToggleIcon = document.getElementById('themeToggleIcon');
const mobileThemeToggleBtn = document.getElementById('mobileThemeToggleBtn');
const mobileThemeToggleIcon = document.getElementById('mobileThemeToggleIcon');
const mobileThemeText = document.getElementById('mobileThemeText');

function updateThemeUI(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
        if (themeToggleIcon) themeToggleIcon.className = 'fa-solid fa-sun text-xs';
        if (mobileThemeToggleIcon) mobileThemeToggleIcon.className = 'fa-solid fa-sun text-xs';
        if (mobileThemeText) mobileThemeText.textContent = 'Light Mode';
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggleIcon) themeToggleIcon.className = 'fa-solid fa-moon text-xs';
        if (mobileThemeToggleIcon) mobileThemeToggleIcon.className = 'fa-solid fa-moon text-xs';
        if (mobileThemeText) mobileThemeText.textContent = 'Dark Mode';
    }
}

const storedTheme = localStorage.getItem('aca_theme');
if (storedTheme === 'dark') updateThemeUI(true);
else updateThemeUI(false);

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('aca_theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggleTheme);

// Lightbox for Gallery
const galleryItems = document.querySelectorAll('.gallery-item');
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCategory = document.getElementById('lightboxCategory');
const closeLightbox = document.getElementById('closeLightbox');
const prevLightbox = document.getElementById('prevLightbox');
const nextLightbox = document.getElementById('nextLightbox');

let currentIndex = 0;
const galleryData = Array.from(galleryItems).map(item => ({
    src: item.getAttribute('data-src'),
    title: item.getAttribute('data-title'),
    category: item.getAttribute('data-category')
}));

const openLightbox = (index) => {
    currentIndex = index;
    const data = galleryData[currentIndex];
    if (lightboxImage) lightboxImage.src = data.src;
    if (lightboxTitle) lightboxTitle.textContent = data.title;
    if (lightboxCategory) lightboxCategory.textContent = data.category;
    if (lightboxModal) {
        lightboxModal.classList.remove('hidden');
        lightboxModal.classList.add('flex');
    }
};

galleryItems.forEach((item, idx) => item.addEventListener('click', () => openLightbox(idx)));

if (closeLightbox && lightboxModal) {
    closeLightbox.addEventListener('click', () => {
        lightboxModal.classList.add('hidden');
        lightboxModal.classList.remove('flex');
    });
}
if (prevLightbox) {
    prevLightbox.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
        openLightbox(currentIndex);
    });
}
if (nextLightbox) {
    nextLightbox.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % galleryData.length;
        openLightbox(currentIndex);
    });
}
if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.classList.add('hidden');
            lightboxModal.classList.remove('flex');
        }
    });
}
