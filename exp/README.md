# Digital Image Watermark Tool

A web application for applying digital watermarks to images using HTML, CSS, JavaScript frontend and Node.js backend.

## Features

- 📁 **File Upload**: Support for various image formats (JPEG, PNG, GIF, BMP, WebP)
- 🎨 **Customizable Watermarks**: Add custom text watermarks
- 📍 **Flexible Positioning**: 5 position options (corners and center)
- 🔧 **Adjustable Settings**: Control opacity and font size
- 📥 **Download**: Download watermarked images
- 🖱️ **Drag & Drop**: Easy file upload with drag and drop support
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Sharp** - Image processing library
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure and file upload
- **CSS3** - Styling with modern features
- **JavaScript (ES6+)** - Client-side functionality

## Installation

1. **Clone or download the project**
   ```bash
   cd /path/to/your/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

1. **Upload Image**: Click "Choose Image File" or drag and drop an image
2. **Configure Watermark**:
   - Enter custom watermark text
   - Select position (top-left, top-right, bottom-left, bottom-right, center)
   - Adjust opacity (0.1 to 1.0)
   - Set font size (20px to 100px)
3. **Apply Watermark**: Click "Apply Watermark" button
4. **Download**: Click "Download Watermarked Image" to save the result

## Project Structure

```
exp/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── public/                # Static files
│   ├── index.html         # Main HTML page
│   ├── styles.css         # CSS styling
│   └── script.js          # Client-side JavaScript
├── uploads/               # Temporary uploaded files (auto-created)
├── watermarked/           # Processed images (auto-created)
└── README.md             # This file
```

## API Endpoints

### POST `/api/watermark`
Apply watermark to uploaded image.

**Parameters:**
- `image` (file): Image file to watermark
- `watermarkText` (string): Text to use as watermark
- `position` (string): Position of watermark
- `opacity` (number): Opacity level (0.1-1.0)
- `fontSize` (number): Font size in pixels

**Response:**
```json
{
  "success": true,
  "message": "Watermark applied successfully",
  "watermarkedImage": "/watermarked/filename.jpg",
  "originalFilename": "original.jpg"
}
```

## Configuration

### File Limits
- Maximum file size: 10MB
- Supported formats: JPEG, JPG, PNG, GIF, BMP, WebP

### Watermark Settings
- Text length: Up to 50 characters
- Font size: 20-100 pixels
- Opacity: 0.1-1.0
- Positions: top-left, top-right, bottom-left, bottom-right, center

## Development

### Start in development mode with auto-restart:
```bash
npm run dev
```

### Dependencies
- `express`: Web framework
- `multer`: File upload middleware
- `sharp`: High-performance image processing
- `cors`: Enable cross-origin requests
- `path`: Node.js path utilities

### Dev Dependencies
- `nodemon`: Auto-restart server during development

## Troubleshooting

1. **Port already in use**: Change the PORT in server.js or set environment variable
2. **File upload fails**: Check file size (max 10MB) and format
3. **Sharp installation issues**: Run `npm rebuild sharp`

## Browser Support

- Modern browsers with ES6+ support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - feel free to use this project for learning and development purposes.
