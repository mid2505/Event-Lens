import { API_BASE } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    let currentUser;
    let userPhotos = [];
    let userBookings = [];

    // --- DOM Element Selectors ---
    const panels = document.querySelectorAll('.dashboard-panel');
    const navItems = document.querySelectorAll('.nav-item');
    const dashboardTitle = document.getElementById('dashboard-title');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const profileForm = document.getElementById('profile-update-form');
    const profilePicInput = document.getElementById('profile-picture-input');
    const profilePicPreview = document.getElementById('profile-picture-preview');

    // --- INITIALIZATION ---
    async function initializeDashboard() {
        try {
            const response = await fetch(`${API_BASE}/api/users/me`, { credentials: 'include' });
            currentUser = await response.json();

            populateUserData(currentUser);
            await loadUserPhotos();
            await loadUserBookings();
        } catch (error) { 
            console.error("Dashboard initialization failed:", error); 
        }
    }

    // --- DATA LOADING & RENDERING ---
    function populateUserData(user) {
        profilePicPreview.src = user.profilePictureUrl || 'https://i.pravatar.cc/150';
        profileForm.querySelectorAll('[data-field]').forEach(p => {
            const field = p.dataset.field;
            p.textContent = field === 'specialties'
                ? (user[field]?.join(', ') || 'N/A')
                : (user[field] || 'N/A');
        });
    }

    async function loadUserPhotos() {
        try {
            // FIX: Added 'credentials: 'include'' to this fetch call
            const response = await fetch(`${API_BASE}/api/photographers/${currentUser._id}`, { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch photos');
            const data = await response.json();
            userPhotos = data.photos;
            renderPortfolioGrid();
        } catch (error) {
            console.error("Failed to load user photos:", error);
        }
    }

    async function loadUserBookings() {
        try {
            const response = await fetch(`${API_BASE}/api/bookings/photographer`, { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch bookings');
            userBookings = await response.json();
            renderBookingsList();
        } catch (error) {
            console.error("Failed to load bookings:", error);
        }
    }

    function renderPortfolioGrid() {
        const grid = document.getElementById('portfolio-management-grid');
        if (!grid) return;
        grid.innerHTML = userPhotos.length > 0
            ? userPhotos.map(photo => `
                <div class="portfolio-thumb" data-id="${photo._id}">
                    <img src="${photo.imageUrl}" alt="${photo.title}">
                    <button class="delete-btn"><i class="ri-delete-bin-line"></i></button>
                </div>`
              ).join('')
            : '<p>You have not uploaded any photos yet.</p>';
    }

    function renderBookingsList() {
        const listEl = document.getElementById('bookings-list');
        if (!listEl) return;
        if (userBookings.length === 0) {
            listEl.innerHTML = '<p>You have no booking requests.</p>';
            return;
        }
        listEl.innerHTML = userBookings.map(booking => `
            <div class="booking-item" data-id="${booking._id}">
                <div class="booking-info">
                    <p class="client-name">${booking.client.name}</p>
                    <p class="event-date">Event on: ${new Date(booking.eventDate).toLocaleDateString()}</p>
                </div>
                <div class="booking-status ${booking.status}">${booking.status}</div>
                <div class="booking-actions">
                    ${booking.status === 'pending' ? `
                        <button class="submit-btn small accept-btn">Accept</button>
                        <button class="cancel-btn decline-btn">Decline</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // --- EVENT LISTENERS ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            panels.forEach(panel => panel.classList.toggle('active', panel.id === targetId));
            dashboardTitle.textContent = item.querySelector('span').textContent;
        });
    });
    
    editProfileBtn.addEventListener('click', () => toggleEditMode(true));
    cancelEditBtn.addEventListener('click', () => toggleEditMode(false));
    
    saveProfileBtn.addEventListener('click', async () => {
        const formData = new FormData();
        formData.append('name', profileForm.querySelector('input[name="name"]').value);
        formData.append('email', profileForm.querySelector('input[name="email"]').value);
        formData.append('location', profileForm.querySelector('input[name="location"]').value);
        formData.append('specialties', profileForm.querySelector('input[name="specialties"]').value);
        formData.append('about', profileForm.querySelector('textarea[name="about"]').value);

        if (profilePicInput.files[0]) {
            formData.append('profilePicture', profilePicInput.files[0]);
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/users/me`, {
                method: 'PATCH',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Update failed');
            }

            const result = await response.json();
            currentUser = result.user;
            populateUserData(currentUser);
            toggleEditMode(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(`Error updating profile: ${error.message}`);
        }
    });

    profilePicInput.addEventListener('change', () => {
        const file = profilePicInput.files[0];
        if (file) profilePicPreview.src = URL.createObjectURL(file);
    });

    document.getElementById('bookings-list').addEventListener('click', async (e) => {
        const bookingItem = e.target.closest('.booking-item');
        if (!bookingItem) return;
        const bookingId = bookingItem.dataset.id;
        let newStatus;
        if (e.target.classList.contains('accept-btn')) newStatus = 'accepted';
        if (e.target.classList.contains('decline-btn')) newStatus = 'declined';
        if (!newStatus) return;
        try {
            const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Action failed');
            const updatedBooking = await response.json();
            const index = userBookings.findIndex(b => b._id === bookingId);
            if (index !== -1) userBookings[index] = updatedBooking;
            renderBookingsList();
        } catch (error) { alert(`Error: ${error.message}`); }
    });

    document.getElementById('photo-upload-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const response = await fetch(`${API_BASE}/api/photos`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Upload failed');
            const newPhoto = await response.json();
            userPhotos.push(newPhoto);
            renderPortfolioGrid();
            e.target.reset();
            alert('Photo uploaded successfully!');
        } catch (error) { alert('Error uploading photo.'); }
    });

    document.getElementById('portfolio-management-grid')?.addEventListener('click', async (e) => {
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            const photoId = deleteButton.closest('.portfolio-thumb').dataset.id;
            if (confirm('Are you sure you want to delete this photo?')) {
                try {
                    const response = await fetch(`${API_BASE}/api/photos/${photoId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Deletion failed');
                    userPhotos = userPhotos.filter(p => p._id !== photoId);
                    renderPortfolioGrid();
                    alert('Photo deleted.');
                } catch (error) {
                    alert('Error deleting photo.');
                }
            }
        }
    });

    document.getElementById('watermark-tool-btn').addEventListener('click', function() {
        // ⚠️ TODO: Replace with deployed watermark tool URL if needed
        window.open('http://localhost:3000', '_blank');
    });

    // --- HELPER FUNCTIONS ---
    function toggleEditMode(isEditing) {
        editProfileBtn.style.display = isEditing ? 'none' : 'block';
        saveProfileBtn.style.display = isEditing ? 'block' : 'none';
        cancelEditBtn.style.display = isEditing ? 'block' : 'none';
        document.querySelector('.edit-overlay').style.display = isEditing ? 'flex' : 'none';
        profileForm.querySelectorAll('[data-field]').forEach(p => p.style.display = isEditing ? 'none' : 'block');
        profileForm.querySelectorAll('input:not([type="file"]), textarea').forEach(input => {
            const field = input.name;
            input.value = field === 'specialties'
                ? (currentUser[field]?.join(', ') || '')
                : (currentUser[field] || '');
            input.style.display = isEditing ? 'block' : 'none';
        });
        if (!isEditing) {
            populateUserData(currentUser);
            if (profilePicInput) profilePicInput.value = "";
        }
    }

    // --- FIX: Add Logout Button Event Listener ---
    const logoutBtn = document.querySelector('.auth-btn[onclick="logout()"]') || document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default behavior
            fetch(`${API_BASE}/api/logout`, { 
                method: 'POST',
                credentials: 'include' 
            })
            .finally(() => {
                // Always redirect to login, regardless of whether the server call succeeded
                localStorage.removeItem('user'); 
                window.location.href = 'login.html';
            });
        });
    }

    initializeDashboard();
});
