/**
 * ACA Church PKT — Prayer Request Interactive Logic & Animations
 * Handles category chips, marquee card deep-linking, character counter, submission, and reset
 */

// Set Active Category Chip
function setCategoryChip(category) {
    const chips = document.querySelectorAll('.prayer-chip');
    chips.forEach(chip => {
        if (chip.getAttribute('data-cat') === category) {
            chip.classList.add('active');
            chip.setAttribute('aria-pressed', 'true');
        } else {
            chip.classList.remove('active');
            chip.setAttribute('aria-pressed', 'false');
        }
    });

    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
        categorySelect.value = category;
    }
}

// Deep-link from Marquee Prayer Cards with Smooth Scroll & Pulse
function selectPrayerCategory(category) {
    setCategoryChip(category);
    const formCard = document.getElementById('prayerFormCard');
    const requestSection = document.getElementById('request');

    if (requestSection) {
        requestSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (formCard) {
        formCard.classList.remove('highlight-form-pulse');
        // Force reflow
        void formCard.offsetWidth;
        formCard.classList.add('highlight-form-pulse');
    }

    // Focus on prayer input after scrolling
    setTimeout(() => {
        const requestInput = document.getElementById('requestInput');
        if (requestInput) requestInput.focus();
    }, 600);
}

// Live Character Counter for Prayer Request Input
const requestInput = document.getElementById('requestInput');
const prayerCharCount = document.getElementById('prayerCharCount');
if (requestInput && prayerCharCount) {
    requestInput.addEventListener('input', () => {
        const len = requestInput.value.length;
        prayerCharCount.textContent = `${len} / 500`;
        if (len >= 450) {
            prayerCharCount.classList.add('text-amber-500', 'font-bold');
        } else {
            prayerCharCount.classList.remove('text-amber-500', 'font-bold');
        }
    });
}

// Prayer Request Form Submission with Animation
const prayerForm = document.getElementById('prayerForm');
const formSuccessNotice = document.getElementById('formSuccessNotice');
const prayerSubmitBtn = document.getElementById('prayerSubmitBtn');
const prayerSubmitBtnText = document.getElementById('prayerSubmitBtnText');
const prayerSubmitIcon = document.getElementById('prayerSubmitIcon');

if (prayerForm) {
    prayerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Animated loading state
        if (prayerSubmitBtn && prayerSubmitBtnText && prayerSubmitIcon) {
            prayerSubmitBtn.disabled = true;
            prayerSubmitBtn.classList.add('opacity-80', 'cursor-not-allowed');
            prayerSubmitIcon.className = "fa-solid fa-circle-notch fa-spin text-xs";
            prayerSubmitBtnText.textContent = "Lifting in Prayer...";
        }

        // Simulate brief realistic network latency
        setTimeout(() => {
            prayerForm.classList.add('hidden');

            if (formSuccessNotice) {
                formSuccessNotice.classList.remove('hidden');
                formSuccessNotice.classList.add('flex');
            }

            // Reset submit button state
            if (prayerSubmitBtn && prayerSubmitBtnText && prayerSubmitIcon) {
                prayerSubmitBtn.disabled = false;
                prayerSubmitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
                prayerSubmitIcon.className = "fa-solid fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform";
                prayerSubmitBtnText.textContent = "SEND PRAYER REQUEST";
            }

            // Scroll into view of success card
            const formCard = document.getElementById('prayerFormCard');
            if (formCard) {
                formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 800);
    });
}

// Reset Prayer Form for another submission
function resetPrayerForm() {
    if (prayerForm) {
        prayerForm.reset();
        prayerForm.classList.remove('hidden');
    }
    if (formSuccessNotice) {
        formSuccessNotice.classList.add('hidden');
        formSuccessNotice.classList.remove('flex');
    }
    if (prayerCharCount) {
        prayerCharCount.textContent = "0 / 500";
    }
    setCategoryChip('Healing');
    const nameInput = document.getElementById('nameInput');
    if (nameInput) nameInput.focus();
}

// Expose functions globally for inline HTML onclick handlers
window.setCategoryChip = setCategoryChip;
window.selectPrayerCategory = selectPrayerCategory;
window.resetPrayerForm = resetPrayerForm;
