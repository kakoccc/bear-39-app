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

// Bot Response Functions
let activeResponseId = null;

function hideBotResponse() {
    const responseArea = document.getElementById('botResponse');

    // Add hiding class to trigger animation
    responseArea.classList.add('hiding');

    // Wait for animation to finish (match CSS duration 0.4s)
    setTimeout(() => {
        responseArea.style.display = 'none';
        responseArea.classList.remove('hiding');
        activeResponseId = null;
    }, 400);

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
            img.onclick = () => openImageModal(currentSlideImages[currentSlideIndex]);

            // Controls
            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
            prevBtn.className = 'slider-btn prev';
            prevBtn.onclick = (e) => { e.stopPropagation(); changeSlide(-1); };

            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            nextBtn.className = 'slider-btn next';
            nextBtn.onclick = (e) => { e.stopPropagation(); changeSlide(1); };

            // Counter
            const counter = document.createElement('div');
            counter.id = 'sliderCounter';
            counter.innerText = `1 / ${currentSlideImages.length}`;
            counter.className = 'slider-counter';

            sliderContainer.appendChild(img);
            if (currentSlideImages.length > 1) {
                sliderContainer.appendChild(prevBtn);
                sliderContainer.appendChild(nextBtn);
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

function changeSlide(direction) {
    currentSlideIndex += direction;
    if (currentSlideIndex < 0) currentSlideIndex = currentSlideImages.length - 1;
    if (currentSlideIndex >= currentSlideImages.length) currentSlideIndex = 0;

    const img = document.getElementById('sliderImage');
    const counter = document.getElementById('sliderCounter');

    if (img) img.src = currentSlideImages[currentSlideIndex];
    if (counter) counter.innerText = `${currentSlideIndex + 1} / ${currentSlideImages.length}`;
}

function showPhilosophy() {
    const text = `<p>🏆 <strong>Наша философия</strong></p>
    <p>Мы создаем сообщество, где каждый, от новичка до профессионала, находит свой путь к здоровью и уверенности. Ваш результат
наша общая цель!</p>`
    const video = ['images/video/приветствие.mp4'];
    showBotResponse('philosophy', text, video, '', 'video');
}

function showTopTrainers() {
    const text = `<p>🏅 <strong>Топовые тренеры</strong></p>
    <p>Все наши тренеры — сертифицированные профессионалы с победным опытом в спорте и более 5 лет практики. Мы растем вместе с вами!</p>`;
    const buttonHtml = '<button class="btn btn-primary" onclick="switchTab(\'trainers\')"><i class="fa-solid fa-users"></i> Посмотреть всех тренеров</button>';
    showBotResponse('trainers', text, [], buttonHtml);
}

function showEquipment() {
    const text = `<p>💎 <strong>Оснащение зала</strong></p>
    <p>Тренируйтесь на профессиональном оборудовании.</p>`
    // Use GALLERY_DATA.equipment if available
    const images = (typeof GALLERY_DATA !== 'undefined' && GALLERY_DATA.equipment) ? GALLERY_DATA.equipment : ['images/services.png'];
    showBotResponse('equipment', text, images, '', 'slider');
}

function showCommunity() {
    const text = `<p>🤝 <strong>Комьюнити и Атмосфера — здесь тренируются друзья</strong></p>
    <p>Ты пришел за результатом, а останешься — за атмосферой. Наш зал создан не только для того, чтобы ставить рекорды, но и чтобы чувствовать себя частью команды, приходить с радостью и восстанавливаться с комфортом.
Что делает наше пространство уникальным:
Заряд для тебя и твоих девайсов: Пока ты на тренировке, твой телефон заряжается на нашей многофункциональной станции. Оставаться на связи — обязательно.
Идеальный климат: Мощная система вентиляции обеспечивает свежий воздух, а на часах с температурой ты всегда видишь, что здесь комфортно и безопасно.
Безупречная чистота: После тренировки тебя ждут чистые, ухоженные раздевалки и душевые. Это наш базовый стандарт.
Точка притяжения — зона отдыха: Здесь все самое важное:
Ароматный кофе из нашей кофемашины, чтобы взбодриться или продолжить общение.
Умная колонка «Алиса», которая поставит твой плейлист.
PlayStation и большой телевизор для жарких баталий или просмотра матчей.
Мягкие кресла, где можно расслабиться, поболтать с друзьями или понаблюдать за тренировками.
Безопасная и дружеская среда: Мы внимательно следим за атмосферой в зале. Здесь нет места токсичности. Только поддержка, мотивация и общие цели.
Приходи не просто потренироваться — приходи стать частью нашего комьюнити. Здесь ты найдешь не только тренера, но и единомышленников.</p>`
    const images = (typeof GALLERY_DATA !== 'undefined' && GALLERY_DATA.community) ? GALLERY_DATA.community : ['images/schedule.png'];
    showBotResponse('community', text, images, '', 'slider');
}
