import { API_BASE } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Get references to forms and elements ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // --- PART 1: REGISTRATION PAGE LOGIC ---
    if (registerForm) {
        const roleRadios = registerForm.querySelectorAll('input[name="role"]');
        const photographerFields = document.getElementById('photographer-fields');

        roleRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'photographer') {
                    photographerFields.classList.remove('hidden');
                } else {
                    photographerFields.classList.add('hidden');
                }
            });
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());
            const errorEl = document.getElementById('error-message');
            errorEl.textContent = '';

            if (data.role === 'photographer' && data.specialties) {
                data.specialties = data.specialties.split(',').map(s => s.trim());
            }

            try {
                const response = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Registration failed');
                
                window.location.href = 'login.html';
            } catch (error) {
                errorEl.textContent = error.message;
            }
        });
    }

    // --- PART 2: LOGIN PAGE LOGIC ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[name="email"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;
            const errorEl = document.getElementById('error-message');
            errorEl.textContent = '';

            try {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Login failed');
                
                localStorage.setItem('user', JSON.stringify(data.user));
                const homeUrl = (data.user.role === 'photographer') ? 'photographer-home.html' : 'index.html';
                localStorage.setItem('homePageUrl', homeUrl);
                
                window.location.href = homeUrl;
            } catch (error) {
                errorEl.textContent = error.message;
            }
        });
    }

    // --- PART 3: LOGIC FOR DASHBOARD/LOGOUT BUTTONS ---
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (dashboardBtn && logoutBtn) {
        dashboardBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'inline-block';

        const user = JSON.parse(localStorage.getItem('user'));

        if (user && user.role === 'photographer') {
            dashboardBtn.href = 'photographer-dashboard.html';
        } else {
            dashboardBtn.href = 'dashboard.html';
        }

        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch(`${API_BASE}/logout`, {
                    method: 'GET',
                    credentials: 'include'
                });
            } catch (err) {
                console.warn("Logout request failed, clearing local storage anyway");
            }

            localStorage.removeItem('user');
            localStorage.removeItem('homePageUrl');
            window.location.href = 'login.html';
        });
    }
});
