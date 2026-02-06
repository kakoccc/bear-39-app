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

function showBotResponse(id, text, images = [], buttonHtml = '') {
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

    // Clear previous images
    responseImages.innerHTML = '';
    if (images.length > 0) {
        images.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = 'Изображение';
            img.onclick = () => openImageModal(imgSrc);
            responseImages.appendChild(img);
        });
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
    const text = `<p>🏆 <strong>Наша философия</strong></p>
    <p>Мы не просто качаем мышцы. Мы создаем сообщество, где каждый, от новичка до профессионала, находит свой путь к здоровью и уверенности. Ваш результат — наша общая цель!</p>`;
    showBotResponse('philosophy', text);
}

function showTopTrainers() {
    const text = `<p>🏅 <strong>Топовые тренеры</strong></p>
    <p>Все наши тренеры — сертифицированные профессионалы с победным опытом в спорте и более 5 лет практики. Мы растем вместе с вами!</p>`;
    const buttonHtml = '<button class="btn btn-primary" onclick="switchTab(\'trainers\')"><i class="fa-solid fa-users"></i> Посмотреть всех тренеров</button>';
    showBotResponse('trainers', text, [], buttonHtml);
}

function showEquipment() {
    const text = `<p>💎 <strong>Премиум-оснащение</strong></p>
    <p>Тренируйтесь на профессиональном оборудовании в комфортной атмосфере.</p>`;
    const images = ['images/services.png'];
    showBotResponse('equipment', text, images);
}

function showCommunity() {
    const text = `<p>🤝 <strong>Атмосфера и комьюнити</strong></p>
    <p>У нас вы найдете не просто зал, а команду единомышленников. Регулярные внутриклубные соревнования, мастер-классы и совместные мероприятия — мы за живое общение!</p>`;
    const images = ['images/schedule.png'];
    showBotResponse('community', text, images);
}
