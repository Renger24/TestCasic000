// js/main.js — логика главной страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Главная страница загружена!");

    // Можно добавить анимации, баннеры, события и т.д.
    // Например, плавное появление контента:
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = 0;
        container.style.transform = 'translateY(20px)';
        container.style.transition = 'all 0.6s ease';

        setTimeout(() => {
            container.style.opacity = 1;
            container.style.transform = 'translateY(0)';
        }, 300);
    }
});