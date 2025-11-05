import { API_BASE } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const photographerId = params.get('id');

    if (!photographerId) {
        document.body.innerHTML = '<h1>Photographer not found.</h1>';
        return;
    }

    // --- DOM Elements ---
    const bookBtn = document.getElementById('book-now-btn');
    const bookingModal = document.getElementById('booking-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const bookingForm = document.getElementById('booking-form');
    const bookingErrorMsg = document.getElementById('booking-error-message');

    // --- Fetch and Display Photographer Data ---
    async function loadPhotographerData() {
        try {
            const response = await fetch(`${API_BASE}/api/photographers/${photographerId}`);
            if (!response.ok) throw new Error('Photographer not found.');
            
            const { details, photos } = await response.json();

            document.getElementById('photographer-name').textContent = details.name;
            document.getElementById('photographer-location').textContent = details.location || 'Location not specified';
            document.getElementById('photographer-avatar').src = details.profilePictureUrl || 'https://i.pravatar.cc/150';
            document.getElementById('photographer-about').textContent = details.about || 'No bio available.';
            
            const specialtiesContainer = document.getElementById('photographer-specialties');
            if (details.specialties && details.specialties.length > 0) {
                specialtiesContainer.innerHTML = details.specialties.map(s => `<span class="specialty-tag">${s}</span>`).join('');
            } else {
                specialtiesContainer.innerHTML = '<p>N/A</p>';
            }

            const galleryGrid = document.getElementById('photographer-gallery');
            if (photos.length > 0) {
                galleryGrid.innerHTML = photos.map(p => 
                    `<div class="photo-card"><img src="${p.imageUrl}" alt="${p.title || 'Photo'}"></div>`
                ).join('');
            } else {
                galleryGrid.innerHTML = '<p>This photographer has not uploaded any photos yet.</p>';
            }
        } catch (error) {
            document.body.innerHTML = `<h1>Error: ${error.message}</h1>`;
        }
    }

    // --- Modal Logic ---
    function showModal() {
        bookingModal.classList.remove('hidden');
    }

    function hideModal() {
        bookingModal.classList.add('hidden');
        bookingForm.reset();
        bookingErrorMsg.textContent = '';
    }

    // --- Booking Form Submission ---
    async function handleBookingSubmit(e) {
        e.preventDefault();
        bookingErrorMsg.textContent = '';

        const eventDate = bookingForm.querySelector('#event-date').value;
        const message = bookingForm.querySelector('#event-message').value;

        try {
            const response = await fetch(`${API_BASE}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photographerId, eventDate, message }),
                credentials: 'include'
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Booking failed.');
            }

            alert('Booking request sent successfully!');
            hideModal();
        } catch (error) {
            bookingErrorMsg.textContent = error.message;
        }
    }

    // --- Event Listeners ---
    bookBtn.addEventListener('click', showModal);
    closeModalBtn.addEventListener('click', hideModal);
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) hideModal();
    });
    bookingForm.addEventListener('submit', handleBookingSubmit);

    loadPhotographerData();
});
