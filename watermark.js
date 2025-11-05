document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('watermarkForm');
    const fileInput = document.getElementById('imageFile');
    const fileInfo = document.getElementById('fileInfo');
    const originalImage = document.getElementById('originalImage');
    const watermarkedImage = document.getElementById('watermarkedImage');
    const previewSection = document.getElementById('previewSection');
    const downloadSection = document.getElementById('downloadSection');
    const downloadLink = document.getElementById('downloadLink');
    const message = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const loader = document.getElementById('loader');
    const opacitySlider = document.getElementById('opacity');
    const fontSizeSlider = document.getElementById('fontSize');
    const opacityValue = document.getElementById('opacityValue');
    const fontSizeValue = document.getElementById('fontSizeValue');

    // Update slider value displays
    opacitySlider.addEventListener('input', function() {
        opacityValue.textContent = this.value;
    });

    fontSizeSlider.addEventListener('input', function() {
        fontSizeValue.textContent = this.value;
    });

    // Handle file selection
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            fileInfo.innerHTML = `
                <div class="file-details">
                    <strong>${file.name}</strong><br>
                    <small>Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
            `;

            // Show original image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                originalImage.src = e.target.result;
                originalImage.style.display = 'block';
            };
            reader.readAsDataURL(file);
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
        submitBtn.disabled = true;
        loader.style.display = 'inline-block';

        const formData = new FormData();
        formData.append('image', file);
        formData.append('watermarkText', document.getElementById('watermarkText').value);
        formData.append('position', document.getElementById('position').value);
        formData.append('opacity', document.getElementById('opacity').value);
        formData.append('fontSize', document.getElementById('fontSize').value);

        try {
            // CORRECTED FETCH URL - THIS WAS THE PROBLEM
            const response = await fetch('http://localhost:5001/api/watermark', {
                method: 'POST',
                body: formData
            });

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Check if response has content
            const responseText = await response.text();
            if (!responseText) {
                throw new Error('Empty response from server');
            }

            // Parse JSON
            const result = JSON.parse(responseText);

            if (result.success) {
                // Show watermarked image
                watermarkedImage.src = result.downloadUrl;
                watermarkedImage.style.display = 'block';
                
                // Setup download link
                downloadLink.href = result.downloadUrl;
                downloadLink.download = result.filename;
                
                // Show preview section
                previewSection.style.display = 'block';
                downloadSection.style.display = 'block';
                
                showMessage('Watermark applied successfully!', 'success');
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }

        } catch (error) {
            console.error('Error:', error);
            showMessage(`Error: ${error.message}`, 'error');
        } finally {
            // Hide loading state
            submitBtn.disabled = false;
            loader.style.display = 'none';
        }
    });

    function showMessage(text, type) {
        message.textContent = text;
        message.className = `message ${type}`;
        message.style.display = 'block';
        
        setTimeout(() => {
            message.style.display = 'none';
        }, 5000);
    }
});