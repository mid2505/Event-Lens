import { API_BASE } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const bookingsListContainer = document.getElementById('client-bookings-list');

    async function loadClientBookings() {
        try {
            const response = await fetch(`${API_BASE}/api/bookings/client`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to load your bookings. Please try again later.');
            }

            const bookings = await response.json();
            renderBookings(bookings);

        } catch (error) {
            bookingsListContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
    }

    // --- Rendering Function ---
    function renderBookings(bookings) {
        if (bookings.length === 0) {
            bookingsListContainer.innerHTML = `
                <div class="empty-state">
                    <h3>You haven't made any bookings yet.</h3>
                    <p>Explore our categories and find the perfect photographer for your event!</p>
                    <a href="index.html#categories" class="submit-btn">Find a Photographer</a>
                </div>
            `;
            return;
        }

        bookingsListContainer.innerHTML = bookings.map(booking => `
            <div class="booking-card">
                <div class="booking-photographer-info">
                    <img src="${booking.photographer.profilePictureUrl || 'https://i.pravatar.cc/150'}" alt="${booking.photographer.name}">
                    <span>${booking.photographer.name}</span>
                </div>
                <div class="booking-details">
                    <p><strong>Event Date:</strong> ${new Date(booking.eventDate).toLocaleDateString()}</p>
                </div>
                <div class="booking-status-container">
                    <span class="booking-status status-${booking.status}">${booking.status}</span>
                </div>
            </div>
        `).join('');
    }

    // --- Initial Call ---
    loadClientBookings();
});
