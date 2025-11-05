document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const form = document.getElementById('watermarkForm');
    const fileInput = document.getElementById('imageFile');
    const fileInfo = document.getElementById('fileInfo');
    const submitBtn = document.getElementById('submitBtn');
    const loader = document.getElementById('loader');
    const previewSection = document.getElementById('previewSection');
    const originalImage = document.getElementById('originalImage');
    const watermarkedImage = document.getElementById('watermarkedImage');
    const downloadSection = document.getElementById('downloadSection');
    const downloadLink = document.getElementById('downloadLink');
    const message = document.getElementById('message');
    
    // Range input elements
    const opacityRange = document.getElementById('opacity');
    const opacityValue = document.getElementById('opacityValue');
    const fontSizeRange = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');

    // Update range input displays
    opacityRange.addEventListener('input', function() {
        opacityValue.textContent = this.value;
    });

    fontSizeRange.addEventListener('input', function() {
        fontSizeValue.textContent = this.value;
    });

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Display file info
            fileInfo.innerHTML = `
                <strong>Selected:</strong> ${file.name}<br>
                <strong>Size:</strong> ${(file.size / (1024 * 1024)).toFixed(2)} MB<br>
                <strong>Type:</strong> ${file.type}
            `;
            fileInfo.classList.add('show');

            // Show original image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                originalImage.src = e.target.result;
                previewSection.classList.add('show');
                
                // Hide watermarked image and download section
                watermarkedImage.style.display = 'none';
                downloadSection.classList.remove('show');
            };
            reader.readAsDataURL(file);
        } else {
            fileInfo.classList.remove('show');
            previewSection.classList.remove('show');
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const file = fileInput.files[0];
        if (!file) {
            showMessage('Please select an image file first.', 'error');
            return;
        }

        // Show loading state
        setLoadingState(true);
        hideMessage();

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('watermarkText', document.getElementById('watermarkText').value);
            formData.append('position', document.getElementById('position').value);
            formData.append('opacity', document.getElementById('opacity').value);
            formData.append('fontSize', document.getElementById('fontSize').value);

            const response = await fetch('/api/watermark', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Show watermarked image
                watermarkedImage.src = result.watermarkedImage;
                watermarkedImage.style.display = 'block';
                
                // Set up download link
                downloadLink.href = result.watermarkedImage;
                downloadLink.download = `watermarked-${result.originalFilename}`;
                downloadSection.classList.add('show');

                showMessage('Watermark applied successfully!', 'success');
            } else {
                throw new Error(result.error || 'Failed to apply watermark');
            }

        } catch (error) {
            console.error('Error:', error);
            showMessage(error.message, 'error');
        } finally {
            setLoadingState(false);
        }
    });

    // Utility functions
    function setLoadingState(loading) {
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = `message ${type}`;
        message.style.display = 'block';
        
        // Auto hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(hideMessage, 5000);
        }
    }

    function hideMessage() {
        message.style.display = 'none';
        message.className = 'message';
    }

    // Handle drag and drop
    const fileLabel = document.querySelector('.file-label');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileLabel.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        fileLabel.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileLabel.addEventListener(eventName, unhighlight, false);
    });

    fileLabel.addEventListener('drop', handleDrop, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        fileLabel.style.background = 'linear-gradient(45deg, #764ba2, #667eea)';
        fileLabel.style.transform = 'scale(1.05)';
    }

    function unhighlight(e) {
        fileLabel.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        fileLabel.style.transform = 'scale(1)';
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    // Real-time preview updates (optional enhancement)
    const watermarkInputs = ['watermarkText', 'position', 'opacity', 'fontSize'];
    watermarkInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', debounce(updatePreview, 500));
        }
    });

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function updatePreview() {
        // This could be enhanced to show live preview
        // For now, it just updates the display values
        if (fileInput.files[0] && watermarkedImage.src) {
            // You could implement a client-side preview here
            console.log('Preview update triggered');
        }
    }
});
