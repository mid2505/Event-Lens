document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            errorMessage.textContent = data.msg;
            errorMessage.style.display = 'block';
        } else {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'home.html';
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
});