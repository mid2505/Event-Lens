import { API_BASE } from './config.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'Wedding';
    
    // Update page title and breadcrumb
    document.getElementById('category-title').textContent = `${category} Photography`;
    document.getElementById('category-breadcrumb').textContent = `${category} Photography`;
    document.getElementById('category-description').textContent = `Discover talented ${category.toLowerCase()} photographers`;
    
    // Theme handling - apply saved theme immediately
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/photos/category/${category}`);
        if (!response.ok) throw new Error(`Failed to load ${category} photos`);
        const photos = await response.json();
        loadPhotos(photos);
    } catch (err) {
        console.error("Error loading photos:", err);
        const container = document.getElementById('photos-container');
        if (container) {
            container.innerHTML = `<p class="error-message">Sorry, could not load ${category} photos.</p>`;
        }
    }

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    
    updateThemeIcon(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.contains('light-mode');
            const newTheme = isLight ? 'dark' : 'light';
            
            if (newTheme === 'light') {
                document.body.classList.add('light-mode');
            } else {
                document.body.classList.remove('light-mode');
            }
            
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
    
    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
        }
    }
});

function loadPhotos(photos) {
    const container = document.getElementById('photos-container');
    if (!container) {
        console.error('Photos container not found');
        return;
    }
    
    if (!photos || photos.length === 0) {
        container.innerHTML = '<p class="empty-state">No photos found in this category.</p>';
        return;
    }

    container.innerHTML = '';
    
    photos.forEach(photo => {
        const photoCard = document.createElement('div');
        photoCard.className = 'photo-card';
        photoCard.innerHTML = `
            <div class="photo-image">
                <img src="${photo.imageUrl}" alt="Photography work" loading="lazy">
            </div>
            <div class="photo-info">
                <div class="photographer-mini">
                    <img src="${photo.photographer?.profilePictureUrl || 'https://i.pravatar.cc/60'}" 
                         alt="${photo.photographer?.name || 'Photographer'}" class="mini-avatar">
                    <div class="mini-details">
                        <h4>${photo.photographer?.name || 'Unknown Photographer'}</h4>
                        <p class="mini-location">${photo.photographer?.location || 'Location not set'}</p>
                    </div>
                </div>
                <button class="view-profile-btn" onclick="viewProfile('${photo.photographer?._id}')">
                    View Profile
                </button>
            </div>
        `;
        container.appendChild(photoCard);
    });
}

function viewProfile(photographerId) {
    window.location.href = `photographer.html?id=${photographerId}`;
}
