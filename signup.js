document.getElementById('signup-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            errorMessage.textContent = data.msg;
            errorMessage.style.display = 'block';
        } else {
            alert('Signup successful! Redirecting to login page.');
            window.location.href = 'login.html';
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
});