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
    // Map tabId to index
    const tabIndex = {
        'home': 0,
        'schedule': 1,
        'trainers': 2,
        'payment': 3,
        'info': 4
    };
    
    if (tabIndex[tabId] !== undefined) {
        navItems[tabIndex[tabId]].classList.add('active');
    }
}
