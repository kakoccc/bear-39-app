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
let currentModalImages = [];
let currentModalIndex = 0;

// Swipe logic
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) {
            // Swipe Right -> Previous
            changeModalSlide(-1);
        } else {
            // Swipe Left -> Next
            changeModalSlide(1);
        }
    }
}

function openImageModal(source, images = []) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const docBody = document.body; // To disable scroll
    const prevBtn = document.querySelector('.modal-nav-btn.prev');
    const nextBtn = document.querySelector('.modal-nav-btn.next');

    // Reset state
    currentModalImages = [];
    currentModalIndex = 0;

    if (Array.isArray(images) && images.length > 0) {
        // Gallery Mode
        currentModalImages = images;
        currentModalIndex = (typeof source === 'number') ? source : 0;

        // Show/Hide buttons based on array length
        if (currentModalImages.length > 1) {
            prevBtn.style.display = "flex";
            nextBtn.style.display = "flex";
        } else {
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
        }

        modalImg.classList.add('loading');
        modalImg.src = currentModalImages[currentModalIndex];
    } else {
        // Single Image Mode
        currentModalImages = [source];
        currentModalIndex = 0;
        modalImg.classList.add('loading');
        modalImg.src = source;

        // Hide buttons
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
    }

    modal.style.display = "flex";

    // Swipe listeners
    modal.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    modalImg.onload = function () {
        this.classList.remove('loading');
    };

    modalImg.onerror = function () {
        this.classList.remove('loading');
        this.src = 'https://placehold.co/600x800?text=IMAGE+NOT+FOUND';
    };

    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

function changeModalSlide(direction) {
    if (currentModalImages.length <= 1) return;

    currentModalIndex += direction;
    if (currentModalIndex < 0) currentModalIndex = currentModalImages.length - 1;
    if (currentModalIndex >= currentModalImages.length) currentModalIndex = 0;

    const modalImg = document.getElementById("modalImage");

    // Smooth transition using 'loading' class
    modalImg.classList.add('loading');

    // Wait for opacity transition to finish (or just long enough) before changing src
    setTimeout(() => {
        modalImg.src = currentModalImages[currentModalIndex];
    }, 250);
}

function closeImageModal() {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none";
    // document.body.style.overflow = '';
}

// Bot Response Functions
let activeResponseId = null;

function hideBotResponse() {
    const responseArea = document.getElementById('botResponse');

    // Add hiding class to trigger animation
    responseArea.classList.add('hiding');

    // Wait for animation to finish (match CSS duration 0.3s)
    setTimeout(() => {
        responseArea.style.display = 'none';
        responseArea.classList.remove('hiding');
        activeResponseId = null;
    }, 300);

    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Global variables for slider
let currentSlideIndex = 0;
let currentSlideImages = [];

function showBotResponse(id, text, media = [], buttonHtml = '', mediaType = 'image') {
    const responseArea = document.getElementById('botResponse');
    const responseText = document.getElementById('responseText');
    const responseImages = document.getElementById('responseImages');
    const responseButton = document.getElementById('responseButton');

    // Toggle logic: if clicking the same button and it's visible, hide it
    if (activeResponseId === id && responseArea.style.display === 'block') {
        hideBotResponse();
        return;
    }

    activeResponseId = id;
    responseText.innerHTML = text;

    // Clear previous images/video
    responseImages.innerHTML = '';

    if (media.length > 0) {
        if (mediaType === 'video') {
            const video = document.createElement('video');
            video.src = media[0];
            video.controls = true;
            video.style.width = '100%';
            video.style.borderRadius = 'var(--radius-md)';
            video.style.marginTop = '10px';
            responseImages.appendChild(video);
        } else if (mediaType === 'slider') {
            // Slider Logic
            currentSlideIndex = 0;
            currentSlideImages = media;

            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';
            sliderContainer.style.position = 'relative';
            sliderContainer.style.marginTop = '10px';

            // Image Element
            const img = document.createElement('img');
            img.id = 'sliderImage';
            img.src = currentSlideImages[0];
            img.style.width = '100%';
            img.style.borderRadius = 'var(--radius-md)';
            img.onclick = () => openImageModal(currentSlideIndex, currentSlideImages);

            // Controls - REMOVED per user request
            // Only counter remains

            // Counter
            const counter = document.createElement('div');
            counter.id = 'sliderCounter';
            // Validating count
            const validImagesCount = currentSlideImages.length;
            counter.innerText = `1 / ${validImagesCount}`;
            counter.className = 'slider-counter';

            sliderContainer.appendChild(img);
            if (validImagesCount > 1) {
                sliderContainer.appendChild(counter);
            }

            responseImages.appendChild(sliderContainer);
        } else {
            // Images
            media.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = 'Изображение';
                img.onclick = () => openImageModal(imgSrc);
                responseImages.appendChild(img);
            });
        }
    }

    responseButton.innerHTML = buttonHtml;

    responseArea.style.display = 'block';

    // Scroll to response
    setTimeout(() => {
        responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

function showPhilosophy() {
    const text = `<h3 style="font-family: var(--font-heading); text-transform: uppercase; margin-bottom: 12px; font-size: 18px; display: flex; align-items: center; gap: 8px; color: var(--color-text);">
        <i class="fa-solid fa-crown" style="color: var(--color-primary);"></i> Наша философия
    </h3>
    <p style="font-family: var(--font-body); font-size: 14px; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 0;">Мы создаем сообщество, где каждый, от новичка до профессионала, находит свой путь к здоровью и уверенности. Ваш результат
наша общая цель!</p>`;
    const video = ['images/video/приветствие.mp4'];
    showBotResponse('philosophy', text, video, '', 'video');
}

function showTopTrainers() {
    const text = `<h3 style="font-family: var(--font-heading); text-transform: uppercase; margin-bottom: 12px; font-size: 18px; display: flex; align-items: center; gap: 8px; color: var(--color-text);">
        <i class="fa-solid fa-star" style="color: var(--color-primary);"></i> Топовые тренеры
    </h3>
    <p style="font-family: var(--font-body); font-size: 14px; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 16px;">Все наши тренеры — сертифицированные профессионалы с победным опытом в спорте и более 5 лет практики. Мы растем вместе с вами!</p>`;
    const buttonHtml = '<button class="btn btn-primary" onclick="switchTab(\'trainers\')" style="font-family: var(--font-heading);"><i class="fa-solid fa-users"></i> Посмотреть всех тренеров</button>';
    showBotResponse('trainers', text, [], buttonHtml);
}

function showEquipment() {
    const text = `<h3 style="font-family: var(--font-heading); text-transform: uppercase; margin-bottom: 12px; font-size: 18px; display: flex; align-items: center; gap: 8px; color: var(--color-text);">
        <i class="fa-solid fa-chart-pie" style="color: var(--color-primary);"></i> Зал в цифрах
    </h3>
    <p style="font-family: var(--font-body); font-size: 14px; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 16px;">Наш тренажерный зал укомплектован современным оборудованием для достижения любых спортивных целей. Мы создали идеальные условия для эффективных и комфортных тренировок.</p>
    <div class="hide-scrollbar" style="display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 2px; -webkit-overflow-scrolling: touch;">
        <div class="card" style="margin-bottom: 0; padding: 20px 16px; text-align: center; flex: 0 0 140px; scroll-snap-align: center; display: flex; flex-direction: column; justify-content: center;">
            <i class="fa-solid fa-dumbbell" style="font-size: 28px; color: var(--color-primary); margin-bottom: 12px; filter: drop-shadow(0 0 8px var(--color-primary-glow));"></i>
            <div style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; margin-bottom: 4px; color: var(--color-text);">50+</div>
            <div style="font-family: var(--font-body); font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Тренажеров</div>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 20px 16px; text-align: center; flex: 0 0 140px; scroll-snap-align: center; display: flex; flex-direction: column; justify-content: center;">
            <i class="fa-solid fa-weight-hanging" style="font-size: 28px; color: var(--color-primary); margin-bottom: 12px; filter: drop-shadow(0 0 8px var(--color-primary-glow));"></i>
            <div style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; margin-bottom: 4px; color: var(--color-text);">1000 кг</div>
            <div style="font-family: var(--font-body); font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Свободный вес</div>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 20px 16px; text-align: center; flex: 0 0 140px; scroll-snap-align: center; display: flex; flex-direction: column; justify-content: center;">
            <i class="fa-solid fa-person-running" style="font-size: 28px; color: var(--color-primary); margin-bottom: 12px; filter: drop-shadow(0 0 8px var(--color-primary-glow));"></i>
            <div style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; margin-bottom: 4px; color: var(--color-text);">100 м²</div>
            <div style="font-family: var(--font-body); font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Зона кроссфита</div>
        </div>
        <div class="card" style="margin-bottom: 0; padding: 20px 16px; text-align: center; flex: 0 0 140px; scroll-snap-align: center; display: flex; flex-direction: column; justify-content: center;">
            <i class="fa-solid fa-temperature-arrow-down" style="font-size: 28px; color: var(--color-primary); margin-bottom: 12px; filter: drop-shadow(0 0 8px var(--color-primary-glow));"></i>
            <div style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; margin-bottom: 4px; color: var(--color-text);">22°C</div>
            <div style="font-family: var(--font-body); font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Климат-контроль</div>
        </div>
    </div>`;
    showBotResponse('equipment', text, [], '');
}

function showCommunity() {
    const text = `<h3 style="font-family: var(--font-heading); text-transform: uppercase; margin-bottom: 12px; font-size: 18px; display: flex; align-items: center; gap: 8px; color: var(--color-text);">
        <i class="fa-solid fa-mug-hot" style="color: var(--color-primary);"></i> Наш быт и комфорт
    </h3>
    <p style="font-family: var(--font-body); font-size: 14px; color: var(--color-text-muted); margin-bottom: 16px; line-height: 1.5;">Продумана каждая мелочь, чтобы тебе было комфортно.</p>
    
    <div class="hide-scrollbar" style="display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 2px; -webkit-overflow-scrolling: touch;">
        <div class="card" style="margin-bottom: 0; padding: 24px 16px; text-align: center; flex: 0 0 160px; scroll-snap-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(249, 115, 22, 0.1); display: flex; align-items: center; justify-content: center; color: var(--color-primary); font-size: 24px; margin-bottom: 16px; box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);">
                <i class="fa-solid fa-gamepad"></i>
            </div>
            <div style="font-family: var(--font-heading); font-weight: 700; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text);">Зона с PS4</div>
            <div style="font-family: var(--font-body); font-size: 12px; color: var(--color-text-muted); line-height: 1.4;">Расслабься после жесткой тренировки</div>
        </div>
        
        <div class="card" style="margin-bottom: 0; padding: 24px 16px; text-align: center; flex: 0 0 160px; scroll-snap-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(249, 115, 22, 0.1); display: flex; align-items: center; justify-content: center; color: var(--color-primary); font-size: 24px; margin-bottom: 16px; box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);">
                <i class="fa-solid fa-battery-full"></i>
            </div>
            <div style="font-family: var(--font-heading); font-weight: 700; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text);">Зарядки</div>
            <div style="font-family: var(--font-body); font-size: 12px; color: var(--color-text-muted); line-height: 1.4;">Твои девайсы всегда на связи</div>
        </div>
        
        <div class="card" style="margin-bottom: 0; padding: 24px 16px; text-align: center; flex: 0 0 160px; scroll-snap-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(249, 115, 22, 0.1); display: flex; align-items: center; justify-content: center; color: var(--color-primary); font-size: 24px; margin-bottom: 16px; box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);">
                <i class="fa-solid fa-music"></i>
            </div>
            <div style="font-family: var(--font-heading); font-weight: 700; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text);">Алиса</div>
            <div style="font-family: var(--font-body); font-size: 12px; color: var(--color-text-muted); line-height: 1.4;">Умная колонка с твоими треками</div>
        </div>
        
        <div class="card" style="margin-bottom: 0; padding: 24px 16px; text-align: center; flex: 0 0 160px; scroll-snap-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(249, 115, 22, 0.1); display: flex; align-items: center; justify-content: center; color: var(--color-primary); font-size: 24px; margin-bottom: 16px; box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);">
                <i class="fa-solid fa-shower"></i>
            </div>
            <div style="font-family: var(--font-heading); font-weight: 700; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text);">Душевые</div>
            <div style="font-family: var(--font-body); font-size: 12px; color: var(--color-text-muted); line-height: 1.4;">Безупречная чистота — наш стандарт</div>
        </div>
    </div>`;
    showBotResponse('community', text, [], '');
}

function makeCall(phoneNumber) {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    }

    if (window.Telegram && window.Telegram.WebApp) {
        // Очищаем номер и кодируем его для URL
        const cleanNum = phoneNumber.replace(/[^0-9+]/g, '');
        const redirectUrl = 'https://kakoccc.github.io/bear-39-app/call.html?num=' + encodeURIComponent(cleanNum);

        // Открываем внешнюю страницу, которая и сделает звонок
        window.Telegram.WebApp.openLink(redirectUrl);
    }
}
