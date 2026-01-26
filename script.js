const tg = window.Telegram.WebApp;

// Init
tg.ready();
tg.expand();
tg.enableClosingConfirmation();

// Theme match (optional override default bg)
// document.documentElement.style.setProperty('--bg-color', tg.backgroundColor);

function switchTab(tabId) {
    // Haptic feedback
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }

    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });

    // Show target content
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
    }

    // Update Nav Icons
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });

    // Find nav item by onclick attribute (simple matching)
    const navItems = document.querySelectorAll('.nav-item');
    // Map tabId to index (Now only 4 tabs)
    const tabIndex = {
        'home': 0,
        'trainers': 1,
        'payment': 2,
        'info': 3
    };

    if (tabIndex[tabId] !== undefined) {
        navItems[tabIndex[tabId]].classList.add('active');
    }
}

// Modal Logic
function openImageModal(imgSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    modal.style.display = "flex";

    // In production, use the actual src. 
    // Here we handle the error/placeholder logic if specific file missing
    modalImg.src = imgSrc;
    modalImg.onerror = function () {
        this.src = 'https://placehold.co/600x800?text=IMAGE+NOT+FOUND';
    };

    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

function closeImageModal() {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none";
}
