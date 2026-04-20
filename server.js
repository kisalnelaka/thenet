import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import cors from 'cors';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Root directory to explore - on Android/Termux this would be /sdcard
// On Windows for testing, we'll use a local 'files' folder or the user's home
const ROOT_DIR = process.platform === 'android' ? '/sdcard' : path.join(os.homedir(), 'Downloads');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Configure Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetPath = req.query.path || ROOT_DIR;
    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Helper to get local IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// API: List files
app.get('/api/files', (req, res) => {
  const currentPath = req.query.path || ROOT_DIR;
  
  try {
    const files = fs.readdirSync(currentPath, { withFileTypes: true });
    const result = files.map(file => {
      const filePath = path.join(currentPath, file.name);
      let stats;
      try {
        stats = fs.statSync(filePath);
      } catch (e) {
        stats = { size: 0, mtime: new Date() };
      }
      
      return {
        name: file.name,
        isDirectory: file.isDirectory(),
        size: stats.size,
        modified: stats.mtime,
        path: filePath
      };
    });
    res.json({ currentPath, files: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Download file
app.get('/api/download', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).send('Path is required');
  res.download(filePath);
});

// API: Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully' });
});

// Serve the UI for all other routes (Bulletproof version for Express 5/Node 25)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 TheNet Server is active!`);
  console.log(`📱 Phone: Browsing ${ROOT_DIR}`);
  console.log(`💻 Laptop: Connect to http://${getLocalIP()}:${PORT}`);
  console.log(`------------------------------------------\n`);
});
