import { API_BASE } from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Apply saved theme immediately
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
    
    // Get photographer ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const photographerId = urlParams.get('id') || '1';
    
    loadPhotographerProfile(photographerId);
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Theme toggle
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
    
    // Run the function to load all the data when the page opens
    loadPhotographerProfile();

    // --- PROTECT ACTIONS ---
    const bookNowBtn = document.getElementById('book-now-btn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', () => {
            // First, check if the user is authenticated.
            if (requireAuth()) {
                // If they are logged in, proceed with the booking logic.
                // For now, we'll just show an alert.
                alert("Proceeding to booking page!");
                // window.location.href = 'booking.html'; // Future implementation
            }
        });
    }
});

function loadPhotographerProfile(photographerId) {
    // Sample photographer data
    const photographers = {
        '1': {
            name: 'John Smith',
            specialty: 'Wedding Photographer',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            rating: 4.9,
            reviews: 127,
            location: 'New York, NY',
            bio: 'Professional wedding photographer with over 8 years of experience capturing love stories. I specialize in candid moments and artistic compositions that tell your unique story.',
            services: ['Wedding Photography', 'Engagement Sessions', 'Bridal Portraits', 'Reception Coverage'],
            portfolio: [
                'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=300&h=400&fit=crop',
                'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&h=400&fit=crop',
                'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=300&h=400&fit=crop',
                'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=300&h=400&fit=crop',
                'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&h=400&fit=crop',
                'https://images.unsplash.com/photo-1525258947-48a0a7b7a2e2?w=300&h=400&fit=crop'
            ]
        },
        '2': {
            name: 'Sarah Johnson',
            specialty: 'Portrait Photographer',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c2a2?w=150&h=150&fit=crop&crop=face',
            rating: 4.8,
            reviews: 89,
            location: 'Los Angeles, CA',
            bio: 'Creative portrait photographer focused on capturing authentic expressions and personalities. I work with natural light and urban environments to create stunning portraits.',
            services: ['Portrait Photography', 'Headshots', 'Fashion Photography', 'Lifestyle Sessions'],
            portfolio: [
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop',
                'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=400&fit=crop'
            ]
        }
    };
    
    const photographer = photographers[photographerId] || photographers['1'];
    
    // Update profile information
    const elements = {
        avatar: document.getElementById('photographer-avatar'),
        name: document.getElementById('photographer-name'),
        specialty: document.getElementById('photographer-specialty'),
        rating: document.getElementById('photographer-rating'),
        reviews: document.getElementById('photographer-reviews'),
        location: document.getElementById('photographer-location'),
        bio: document.getElementById('photographer-bio'),
        services: document.getElementById('photographer-services')
    };
    
    // Check if elements exist before updating
    if (elements.avatar) elements.avatar.src = photographer.avatar;
    if (elements.name) elements.name.textContent = photographer.name;
    if (elements.specialty) elements.specialty.textContent = photographer.specialty;
    if (elements.rating) elements.rating.textContent = photographer.rating;
    if (elements.reviews) elements.reviews.textContent = `(${photographer.reviews} reviews)`;
    if (elements.location) elements.location.textContent = photographer.location;
    if (elements.bio) elements.bio.textContent = photographer.bio;
    
    // Update services
    if (elements.services) {
        elements.services.innerHTML = '';
        photographer.services.forEach(service => {
            const li = document.createElement('li');
            li.textContent = service;
            elements.services.appendChild(li);
        });
    }
    
    // Load portfolio and reviews
    loadPortfolio(photographer.portfolio);
    loadReviews(photographerId);
}

function loadPortfolio(portfolio) {
    const container = document.getElementById('portfolio-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    portfolio.forEach((imageUrl, index) => {
        const imageCard = document.createElement('div');
        imageCard.className = 'portfolio-item';
        imageCard.innerHTML = `
            <img src="${imageUrl}" alt="Portfolio work ${index + 1}" loading="lazy">
        `;
        container.appendChild(imageCard);
    });
}

function loadReviews(photographerId) {
    // Sample reviews data
    const reviews = [
        {
            name: 'Emily Williams',
            rating: 5,
            date: '2025-01-15',
            comment: 'Absolutely amazing work! John captured our wedding day perfectly. Every moment was beautifully documented.'
        },
        {
            name: 'Michael Brown',
            rating: 5,
            date: '2025-01-10',
            comment: 'Professional, creative, and so easy to work with. The photos exceeded our expectations!'
        },
        {
            name: 'Jessica Davis',
            rating: 4,
            date: '2025-01-05',
            comment: 'Great photographer with an eye for detail. Would definitely recommend for any special event.'
        }
    ];
    
    const container = document.getElementById('reviews-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-header">
                <h4>${review.name}</h4>
                <div class="review-rating">
                    ${'<i class="ri-star-fill"></i>'.repeat(review.rating)}
                    ${'<i class="ri-star-line"></i>'.repeat(5 - review.rating)}
                </div>
                <span class="review-date">${review.date}</span>
            </div>
            <p class="review-comment">${review.comment}</p>
        `;
        container.appendChild(reviewCard);
    });
}
