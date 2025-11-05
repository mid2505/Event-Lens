// Mallesh Kumar - Registration Module
// Date: 3/11/2025
import { API_BASE } from './config.js';

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    try {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        // On success, redirect to the login page
        alert('Registration successful! Please log in.');
        window.location.href = 'login.html';
    } catch (error) {
        errorMessage.textContent = error.message || 'Registration failed. Please try again.';
    }
});
