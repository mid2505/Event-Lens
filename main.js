// This file contains code that runs on ALL pages

document.addEventListener('DOMContentLoaded', () => {
    // --- THEME SWITCHER ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    function applyTheme(theme) {
        body.classList.toggle('light-mode', theme === 'light');
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'ri-moon-line' : 'ri-sun-line';
        }
        localStorage.setItem('theme', theme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            applyTheme(body.classList.contains('light-mode') ? 'dark' : 'light');
        });
    }
    
    applyTheme(localStorage.getItem('theme') || 'dark');
});