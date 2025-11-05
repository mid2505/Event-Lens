document.getElementById('upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const statusDiv = document.getElementById('status');

    statusDiv.textContent = 'Uploading... Please wait.';
    statusDiv.style.color = 'blue';

    try {
        const response = await fetch('http://localhost:5001/api/upload', {
            method: 'POST',
            body: formData, // No 'Content-Type' header needed, browser sets it for FormData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Upload failed');
        }

        statusDiv.textContent = `Success! Image uploaded. URL: ${result.imageUrl}`;
        statusDiv.style.color = 'green';
        form.reset();

    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.style.color = 'red';
        console.error('Upload error:', error);
    }
});