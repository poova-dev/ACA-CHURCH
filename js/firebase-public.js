/**
 * ACA Church PKT — Public Site Firestore Live Hydration Engine
 * Connects index.html and gallery.html to Firestore content with instant fallback to static HTML.
 */

window.PUBLIC_FIREBASE_CONFIG = {
    apiKey: "AIzaSy_TODO_REPLACE_WITH_YOUR_FIREBASE_API_KEY",
    authDomain: "aca-church-pkt.firebaseapp.com",
    projectId: "aca-church-pkt",
    storageBucket: "aca-church-pkt.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

(function () {
    let db = null;

    function initPublicFirestore() {
        try {
            if (typeof firebase === 'undefined') return;

            if (!firebase.apps.length) {
                firebase.initializeApp(window.PUBLIC_FIREBASE_CONFIG);
            }
            db = firebase.firestore();

            // Expose globally for prayer.js
            window.acaFirestoreDb = db;

            // Hydrate Site Sections asynchronously
            hydrateSiteContent();
            hydrateVisionItems();
            hydratePrayerCategories();
            hydrateGalleryImages();
        } catch (err) {
            console.info("ACA Church PKT: Using built-in static content (Firestore offline or unconfigured).", err);
        }
    }

    // 1. Hydrate Site Content (Hero, About, Founder, Contact, Service Times)
    async function hydrateSiteContent() {
        if (!db) return;
        try {
            const snap = await db.collection('site_content').get();
            snap.forEach(doc => {
                const data = doc.data();
                if (doc.id === 'hero' && data) {
                    // Update Hero Badge
                    const badge = document.querySelector('#hero-welcome-badge span');
                    if (badge && data.badgeText) {
                        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-2"></span>${data.badgeText}`;
                    }
                    // Update Floating Tamil Scripture
                    const container = document.getElementById('hero-scripture-container');
                    if (container && data.scriptureText) {
                        const lines = data.scriptureText.split('\n').filter(Boolean);
                        const linesHtml = lines.map((l, i) => `
                            <${i === 0 ? 'h1' : 'p'} class="font-tamil font-extrabold text-2xl sm:text-4xl md:text-6xl lg:text-7xl text-white tracking-wide leading-tight sm:leading-snug scripture-glow">
                                ${l}
                            </${i === 0 ? 'h1' : 'p'}>
                        `).join('');
                        
                        const linesBox = container.querySelector('.space-y-1');
                        if (linesBox) linesBox.innerHTML = linesHtml;
                    }
                    // Update Hero Scripture Ref
                    const refEl = container ? container.querySelector('.verse-glow') : null;
                    if (refEl && data.scriptureRef) {
                        refEl.textContent = data.scriptureRef;
                    }
                }

                if (doc.id === 'about' && data) {
                    const aboutSec = document.getElementById('about');
                    if (aboutSec) {
                        if (data.heading) {
                            const h2 = aboutSec.querySelector('h2');
                            if (h2) h2.textContent = data.heading;
                        }
                        if (data.body) {
                            const bodyBox = aboutSec.querySelector('.space-y-3');
                            if (bodyBox) {
                                const paragraphs = data.body.split('\n\n').filter(Boolean);
                                bodyBox.innerHTML = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
                            }
                        }
                    }
                }

                if (doc.id === 'founder' && data) {
                    const pastorSec = document.getElementById('pastor');
                    if (pastorSec) {
                        if (data.quote) {
                            const quoteEl = pastorSec.querySelector('blockquote');
                            if (quoteEl) quoteEl.textContent = `"${data.quote.replace(/^"|"$/g, '')}"`;
                        }
                        if (data.photoUrl) {
                            const pastorImgs = pastorSec.querySelectorAll('img');
                            pastorImgs.forEach(img => img.src = data.photoUrl);
                        }
                    }
                }

                if (doc.id === 'contact' && data) {
                    // Update Footer Contact info
                    const footer = document.getElementById('contact');
                    if (footer) {
                        // Phone
                        if (data.phone) {
                            const phoneEls = footer.querySelectorAll('a[href^="tel:"]');
                            phoneEls.forEach(el => { el.href = `tel:${data.phone.replace(/[^0-9+]/g, '')}`; el.textContent = data.phone; });
                        }
                        // Email
                        if (data.email) {
                            const emailEls = footer.querySelectorAll('a[href^="mailto:"]');
                            emailEls.forEach(el => { el.href = `mailto:${data.email}`; el.textContent = data.email; });
                        }
                    }
                }
            });
        } catch (e) {
            console.warn("Error hydrating site content:", e);
        }
    }

    // 2. Hydrate Vision Items (Bible Animation Overlay)
    async function hydrateVisionItems() {
        if (!db) return;
        try {
            const snap = await db.collection('vision_items').orderBy('order', 'asc').get();
            if (snap.empty) return;

            const items = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));

            const grid = document.querySelector('#visionContentOverlay .grid');
            if (grid && items.length > 0) {
                grid.innerHTML = items.map((item, idx) => {
                    const isFullWidth = idx === items.length - 1 && items.length % 2 !== 0;
                    return `
                        <div class="vision-reveal-item ${isFullWidth ? 'md:col-span-2' : ''} p-4 sm:p-5 rounded-xl bg-white/[0.04] border border-amber-300/15 hover:border-amber-400/40 transition-all duration-500 group"
                            style="opacity: 0; transform: translateY(24px);">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 rounded-full bg-amber-400/15 border border-amber-400/35 flex-shrink-0 flex items-center justify-center text-amber-300 font-cinzel font-bold text-base group-hover:bg-amber-400/25 transition-colors">
                                    ${idx + 1}
                                </div>
                                <div>
                                    <h3 class="font-serif text-lg sm:text-xl md:text-2xl text-white font-semibold tracking-wide leading-snug mb-1">
                                        ${item.title || ''}
                                    </h3>
                                    ${item.titleTamil ? `
                                        <p class="font-tamil text-amber-200/80 text-xs sm:text-sm font-medium">
                                            ${item.titleTamil}
                                        </p>
                                    ` : ''}
                                    ${item.verse ? `
                                        <p class="text-amber-400/60 text-[10px] uppercase font-mono mt-1">
                                            ${item.verse}
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (e) {
            console.warn("Error hydrating vision items:", e);
        }
    }

    // 3. Hydrate Prayer Categories & Chips
    async function hydratePrayerCategories() {
        if (!db) return;
        try {
            const snap = await db.collection('prayer_categories').orderBy('order', 'asc').get();
            if (snap.empty) return;

            const cats = [];
            snap.forEach(doc => cats.push({ id: doc.id, ...doc.data() }));

            // Hydrate Marquee Cards
            const marqueeTrack = document.querySelector('.marquee-track');
            if (marqueeTrack && cats.length > 0) {
                marqueeTrack.innerHTML = cats.map(cat => `
                    <div class="prayer-card-lux w-[310px] sm:w-[360px] md:w-[390px] p-6 sm:p-7 rounded-3xl flex flex-col justify-between overflow-hidden shadow-lg group shrink-0">
                        <div class="relative">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-center text-brand-gold text-xl group-hover:scale-110 group-hover:rotate-6 group-hover:bg-brand-gold group-hover:text-brand-base transition-all duration-500 shadow-sm">
                                    <i class="fa-solid ${cat.icon || 'fa-hands-praying'}"></i>
                                </div>
                                ${cat.time ? `
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[10px] uppercase tracking-wider font-bold backdrop-blur-sm">
                                        <i class="fa-regular fa-clock text-[9px]"></i>
                                        <span>${cat.time}</span>
                                    </span>
                                ` : ''}
                            </div>
                            <div class="flex items-center justify-between mb-1">
                                <h3 class="font-serif text-2xl text-brand-ink group-hover:text-brand-gold transition-colors duration-300 font-bold">
                                    ${cat.title || 'Prayer'}
                                </h3>
                                ${cat.frequency ? `
                                    <span class="text-[9px] px-2 py-0.5 rounded-full bg-brand-frame text-brand-beige/80 uppercase font-semibold">${cat.frequency}</span>
                                ` : ''}
                            </div>
                            <span class="font-tamil text-xs text-brand-gold block mb-2.5 font-medium">${cat.titleTamil || ''}</span>
                            <p class="text-brand-beige/75 font-light text-xs sm:text-[13px] mb-5 leading-relaxed">${cat.description || ''}</p>
                        </div>
                        <a href="#request" onclick="selectPrayerCategory('${cat.title}')"
                            class="inline-flex items-center justify-between w-full pt-3.5 border-t border-brand-line/80 group/btn text-[10.5px] uppercase tracking-[0.2em] font-bold text-brand-gold hover:text-brand-ink transition-colors cursor-pointer">
                            <span>Request This Prayer</span>
                            <div class="w-7 h-7 rounded-full bg-brand-gold/15 group-hover/btn:bg-brand-gold group-hover/btn:text-brand-base flex items-center justify-center transition-all duration-300 group-hover/btn:translate-x-1">
                                <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </div>
                        </a>
                    </div>
                `).join('');
            }

            // Hydrate Category Chips on Prayer Form
            const chipsContainer = document.getElementById('prayerCategoryChips');
            const selectContainer = document.getElementById('categorySelect');
            if (chipsContainer && cats.length > 0) {
                chipsContainer.innerHTML = cats.map((cat, idx) => `
                    <button type="button" data-cat="${cat.title}" onclick="setCategoryChip('${cat.title}')"
                        class="prayer-chip ${idx === 0 ? 'active' : ''} flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border border-brand-line bg-brand-base/60 text-left cursor-pointer hover:border-brand-gold/60">
                        <div class="w-7 h-7 rounded-lg bg-brand-gold/15 text-brand-gold flex items-center justify-center text-xs shrink-0">
                            <i class="fa-solid ${cat.icon || 'fa-hands-praying'}"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs font-bold leading-tight text-brand-ink truncate">${cat.title}</div>
                            <div class="text-[9.5px] text-brand-gold font-tamil leading-tight">${cat.titleTamil || ''}</div>
                        </div>
                    </button>
                `).join('');

                if (selectContainer) {
                    selectContainer.innerHTML = cats.map(c => `<option value="${c.title}">${c.title}</option>`).join('');
                }
            }
        } catch (e) {
            console.warn("Error hydrating prayer categories:", e);
        }
    }

    // 4. Hydrate Gallery Images
    async function hydrateGalleryImages() {
        if (!db) return;
        try {
            const snap = await db.collection('gallery_images').orderBy('order', 'asc').get();
            if (snap.empty) return;

            const imgs = [];
            snap.forEach(doc => imgs.push({ id: doc.id, ...doc.data() }));

            const grid = document.getElementById('galleryGrid');
            if (grid && imgs.length > 0) {
                grid.innerHTML = imgs.map(img => `
                    <div class="gallery-card group" data-category="${img.category || 'worship'}">
                        <div class="gallery-item relative overflow-hidden rounded-2xl border border-brand-line bg-brand-surface h-[320px] sm:h-[380px] shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
                            data-src="${img.url}"
                            data-title="${img.caption || 'Moments of Grace'}"
                            data-category="${(img.category || 'worship').toUpperCase()}">
                            <img src="${img.url}" alt="${img.caption || 'Church Gallery'}"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                            <div class="absolute top-4 left-4">
                                <span class="px-3 py-1 rounded-full bg-brand-gold text-brand-base text-[9.5px] font-black uppercase tracking-wider">${img.category || 'worship'}</span>
                            </div>
                            <div class="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                                <div>
                                    <h3 class="font-serif text-xl sm:text-2xl text-white font-bold mb-0.5 drop-shadow">${img.caption || 'Moments of Grace'}</h3>
                                    <p class="text-xs text-brand-gold-bright/90 drop-shadow-sm font-medium tracking-wide">Apostolic Christian Assembly</p>
                                </div>
                                <div class="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-base transition-colors shrink-0 shadow-lg">
                                    <i class="fa-solid fa-expand text-xs"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (e) {
            console.warn("Error hydrating gallery images:", e);
        }
    }

    // Run on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPublicFirestore);
    } else {
        initPublicFirestore();
    }
})();
