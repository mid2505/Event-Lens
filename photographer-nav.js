document.addEventListener('DOMContentLoaded', () => {
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // This script is only for photographer pages. It assumes the user is a photographer.
    if (dashboardBtn && logoutBtn) {
        // 1. Unconditionally make the buttons visible.
        dashboardBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'inline-block';

        // 2. Unconditionally set the dashboard link to the photographer's dashboard.
        dashboardBtn.href = 'photographer-dashboard.html';

        // 3. Unconditionally add the logout functionality.
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            localStorage.removeItem('homePageUrl');
            window.location.href = 'login.html';
        });
    }
});