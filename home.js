document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // If no token, redirect to login page
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
        document.getElementById('username').textContent = user.username;
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
});