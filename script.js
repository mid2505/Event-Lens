import { API_BASE } from './config.js';

// --- SINGLE, CONSOLIDATED DOMCONTENTLOADED LISTENER ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const authLinksContainer = document.getElementById('auth-links');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Theme Switcher Logic ---
    const applyTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            if (themeIcon) themeIcon.className = 'ri-moon-line';
        } else {
            document.body.classList.remove('light-mode');
            if (themeIcon) themeIcon.className = 'ri-sun-line';
        }
    };

    // Toggle theme when button is clicked
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            let theme = 'dark';
            if (document.body.classList.contains('light-mode')) {
                theme = 'light';
                if (themeIcon) themeIcon.className = 'ri-moon-line';
            } else {
                if (themeIcon) themeIcon.className = 'ri-sun-line';
            }
            localStorage.setItem('theme', theme);
        });
    }

    // Apply theme on initial load
    applyTheme();

    // --- Logout Logic ---
    function logout() {
        fetch(`${API_BASE}/api/logout`, { 
            method: 'POST', // It's good practice to use POST for actions that change state
            credentials: 'include' 
        })
        .then(response => {
            if (response.ok) {
                // Clear any user data from localStorage if you stored it there
                localStorage.removeItem('user'); 
                window.location.href = 'login.html'; // Redirect to login
            } else {
                throw new Error('Logout failed.');
            }
        })
        .catch(err => {
            console.error('Logout error:', err);
            alert('Could not log out. Please try again.');
        });
    }

    // Attach the event listener programmatically
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // --- INITIALIZATION CALLS (in a predictable order) ---
    loadCategories();
});

function initPageAnimations() {
    const path = window.location.pathname;
    const isHomePage = path.endsWith('/') || path.endsWith('index.html') || path === '/';

    if (isHomePage) {
        const hasSeenAnimation = sessionStorage.getItem('hasSeenHomeAnimation');
        if (!hasSeenAnimation) {
            const loaderTl = gsap.timeline();
            loaderTl.from(".loader-text", { y: 100, duration: 1, stagger: 0.2, ease: "power3.out" })
            .to(".loader-text", { opacity: 0, y: -100, duration: 0.8, stagger: 0.2, ease: "power2.in" }, "+=0.5")
            .to("#loader", { y: "-100%", duration: 1.2, ease: "power3.inOut" })
            .to("#main-content", { opacity: 1, visibility: 'visible', duration: 0.1 }, "-=0.8")
            .to(".hero-title-line span", { y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }, "-=0.5")
            .from(".hero-subtitle", { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" }, "-=0.5")
            .from("nav", { y: -50, opacity: 0, duration: 1, ease: "power3.out" }, "<");
            sessionStorage.setItem('hasSeenHomeAnimation', 'true');
        } else {
            gsap.set("#loader", { display: 'none' });
            gsap.set("#main-content", { opacity: 1, visibility: 'visible' });
            gsap.set(".hero-title-line span", { y: 0 });
            gsap.from("nav", { y: -50, opacity: 0, duration: 0.6, ease: "power3.out" });
        }
    } else {
        gsap.set("#loader", { display: 'none' });
        gsap.set("#main-content", { opacity: 1, visibility: 'visible' });
        gsap.from("nav", { y: -50, opacity: 0, duration: 1, ease: "power3.out" });
    }
}

function initScrollTriggers() {
    gsap.utils.toArray('.reveal-text').forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 50 }, {
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
            opacity: 1, y: 0, duration: 1, ease: "power3.out"
        });
    });
    if (document.querySelector(".category-grid")) {
        gsap.from(".category-card", { scrollTrigger: { trigger: ".category-grid", start: "top 85%" }, opacity: 0, y: 100, duration: 0.8, stagger: 0.1, ease: "power3.out" });
    }
    if (document.querySelector(".steps-container")) {
        gsap.from(".step-card", { scrollTrigger: { trigger: ".steps-container", start: "top 85%" }, opacity: 0, y: 100, duration: 0.8, stagger: 0.2, ease: "power3.out" });
    }
    if (document.querySelector(".contact-form")) {
        gsap.from(".contact-form .form-group, .contact-form .submit-btn", { scrollTrigger: { trigger: ".contact-form", start: "top 80%" }, opacity: 0, y: 50, duration: 0.8, stagger: 0.1, ease: "power3.out" });
    }
    if (document.querySelector(".gallery-grid")) {
        gsap.from(".photo-card", { scrollTrigger: { trigger: ".gallery-grid", start: "top 85%" }, opacity: 0, y: 100, duration: 0.8, stagger: 0.1, ease: "power3.out" });
    }
    if (document.querySelector(".portfolio-grid")) {
        gsap.from(".portfolio-item", { scrollTrigger: { trigger: ".portfolio-grid", start: "top 85%" }, opacity: 0, y: 50, duration: 0.6, stagger: 0.1, ease: "power3.out" });
    }
}

function loadCategories() {
    const categories = [
        { name: 'Wedding', imageUrl: './category images/wedding.jpg' }, { name: 'Portrait', imageUrl: './category images/portrait.jpg' },
        { name: 'Sports', imageUrl: './category images/sports.jpg' }, { name: 'Travel', imageUrl: './category images/travel.jpg' },
        { name: 'Food', imageUrl: './category images/food.jpg' }, { name: 'Advertising', imageUrl: './category images/advertising.jpg' },
        { name: 'Cosmic', imageUrl: './category images/cosmic.jpg' }, { name: 'Cooking', imageUrl: './category images/cooking.jpg' }
    ];
    const categoryGrid = document.querySelector('.category-grid');
    if (categoryGrid) {
        categoryGrid.innerHTML = '';
        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.style.cursor = 'pointer';
            categoryCard.innerHTML = `<img src="${category.imageUrl}" alt="${category.name}" loading="lazy"><div class="category-name">${category.name}</div>`;
            categoryCard.addEventListener('click', () => { window.location.href = `gallery.html?category=${category.name}`; });
            categoryGrid.appendChild(categoryCard);
        });
    }
}

// --- WINDOW LOAD LISTENER (for animations after all assets load) ---
window.addEventListener('load', () => {
    initPageAnimations();
    setTimeout(initScrollTriggers, 100);
});
