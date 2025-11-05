import { API_BASE } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Gallery script started.");

    const galleryGrid = document.getElementById('photo-grid');
    const galleryTitle = document.getElementById('gallery-title');

    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    
    if (!category) {
        galleryTitle.textContent = 'All Photos';
        if (galleryGrid) {
            galleryGrid.innerHTML = '<p class="error-message">No category selected. Please go back and pick a category.</p>';
        }
        return;
    }

    galleryTitle.textContent = `${category} Photography`;

    try {
        const response = await fetch(`${API_BASE}/api/photos/category/${category}`);
        
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        // FIX: The response from the server IS the array of photos.
        const photos = await response.json();

        if (photos.length === 0) {
            if (galleryGrid) galleryGrid.innerHTML = `
                <div class="gallery-empty-state">
                    <h3>No Photos Found</h3>
                    <p>There are currently no photos in the "${category}" category.</p>
                </div>`;
            return;
        }

        if (galleryGrid) {
            galleryGrid.innerHTML = photos.map(photo => `
                <a href="photographer.html?id=${photo.photographer._id}" class="photo-card">
                    <img src="${photo.imageUrl}" alt="${photo.title}">
                    <div class="photographer-overlay">
                        <img src="${photo.photographer.profilePictureUrl || 'https://i.pravatar.cc/150'}" alt="${photo.photographer.name}">
                        <div class="photographer-overlay-info">
                            <h4>${photo.photographer.name}</h4>
                            <p>${photo.photographer.location || 'Location not set'}</p>
                        </div>
                    </div>
                </a>
            `).join('');
        }

    } catch (error) {
        console.error('A critical error occurred:', error);
        if (galleryGrid) galleryGrid.innerHTML = `<p class="error-message">Sorry, could not load photos. Please try again later.</p>`;
    }
});