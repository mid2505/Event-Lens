console.log("login.js loaded");
import { API_BASE } from './config.js';

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // keep sessions
        });

        const raw = await response.text();
        console.log("RAW response from server:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (err) {
            throw new Error("Server did not return valid JSON. Got: " + raw);
        }

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Redirect based on role
        if (data.user.role === 'photographer') {
            window.location.href = 'photographer-home.html';
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        document.getElementById('error-message').textContent = error.message;
    }
});
