const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/watermarked', express.static('watermarked'));

// Serve static files from the main project directory
app.use(express.static(path.join(__dirname, '../')));

// Create directories if they don't exist
const createDirectories = () => {
  const dirs = ['uploads', 'watermarked', 'public'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle image upload and watermarking
app.post('/api/watermark', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const { watermarkText, position, opacity, fontSize } = req.body;
    
    // Default values
    const text = watermarkText || 'WATERMARK';
    const pos = position || 'bottom-right';
    const alpha = parseFloat(opacity) || 0.7;
    const size = parseInt(fontSize) || 48;

    const inputPath = req.file.path;
    const outputFilename = 'watermarked-' + req.file.filename;
    const outputPath = path.join('watermarked', outputFilename);

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;

    // Calculate position
    const padding = 30;
    const textWidth = text.length * size * 0.6;
    
    let left, top;
    switch (pos) {
      case 'top-left':
        left = padding;
        top = padding + size;
        break;
      case 'top-right':
        left = width - textWidth - padding;
        top = padding + size;
        break;
      case 'bottom-left':
        left = padding;
        top = height - padding;
        break;
      case 'bottom-right':
        left = width - textWidth - padding;
        top = height - padding;
        break;
      case 'center':
        left = (width - textWidth) / 2;
        top = (height + size) / 2;
        break;
      default:
        left = width - textWidth - padding;
        top = height - padding;
    }

    // Create a repeating diagonal watermark pattern across the entire image
    const patternWidth = width;
    const patternHeight = height;
    
    // Create multiple diagonal watermarks
    let svgPattern = `<svg width="${patternWidth}" height="${patternHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add multiple diagonal watermarks across the image
    const stepX = 300;
    const stepY = 200;
    
    for (let x = -200; x < width + 200; x += stepX) {
      for (let y = -100; y < height + 100; y += stepY) {
        svgPattern += `
          <text x="${x}" y="${y}" 
                font-size="${size * 0.7}" 
                fill="rgba(255,255,255,${alpha * 0.3})" 
                stroke="rgba(0,0,0,${alpha * 0.2})" 
                stroke-width="1"
                transform="rotate(-45 ${x} ${y})"
                style="font-family: Arial, sans-serif; font-weight: bold;">
            ${text}
          </text>`;
      }
    }
    
    // Add the main watermark
    svgPattern += `
      <text x="${left}" y="${top}" 
            font-size="${size}" 
            fill="rgba(255,255,255,${alpha})" 
            stroke="rgba(0,0,0,${alpha * 0.8})" 
            stroke-width="2"
            style="font-family: Arial, sans-serif; font-weight: bold;">
        ${text}
      </text>
    </svg>`;

    // Apply the watermark pattern
    await sharp(inputPath)
      .composite([
        {
          input: Buffer.from(svgPattern),
          top: 0,
          left: 0
        }
      ])
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    // Clean up uploaded file
    fs.unlinkSync(inputPath);

    res.json({
      success: true,
      message: `Professional watermark applied: "${text}"`,
      watermarkedImage: `/watermarked/${outputFilename}`,
      originalFilename: req.file.originalname
    });

  } catch (error) {
    console.error('Error applying watermark:', error);
    res.status(500).json({ error: 'Failed to apply watermark: ' + error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});