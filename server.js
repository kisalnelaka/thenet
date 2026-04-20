import express from 'express';
import archiver from 'archiver';
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

// Device Identity (Can be customized via ENV)
const DEVICE_NAME = process.env.DEVICE_NAME || os.hostname() || 'Unknown Device';
const DEVICE_TYPE = process.platform === 'android' ? 'mobile' : 'desktop';
const OS_PLATFORM = process.platform;

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

// API: List files with enhanced metadata
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
        path: filePath,
        extension: file.isDirectory() ? '' : path.extname(file.name).slice(1)
      };
    });
    res.json({ currentPath, files: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get device identity
app.get('/api/identity', (req, res) => {
  res.json({
    name: DEVICE_NAME,
    type: DEVICE_TYPE,
    platform: OS_PLATFORM,
    ip: getLocalIP(),
    port: PORT
  });
});

// API: Get storage stats
app.get('/api/storage', (req, res) => {
  try {
    const stats = fs.statfsSync(ROOT_DIR);
    const total = stats.blocks * stats.bsize;
    const free = stats.bfree * stats.bsize;
    const used = total - free;
    res.json({
      total,
      used,
      percentage: Math.round((used / total) * 100)
    });
  } catch (e) {
    res.json({ total: 1024*1024*1024, used: 500*1024*1024, percentage: 50 });
  }
});

// API: Stream Preview (Images/Video)
app.get('/api/preview', (req, res) => {
  const filePath = req.query.path;
  if (!filePath || !fs.existsSync(filePath)) return res.status(404).send('Not found');
  res.sendFile(filePath);
});

// API: Delete File
app.delete('/api/delete', (req, res) => {
  const filePath = req.query.path;
  if (!filePath || !fs.existsSync(filePath)) return res.status(404).send('Not found');
  try {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      fs.rmSync(filePath, { recursive: true });
    } else {
      fs.unlinkSync(filePath);
    }
    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// API: Get Recent Files
app.get('/api/recent', (req, res) => {
  const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of list) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        // Skip hidden folders and node_modules
        if (!file.name.startsWith('.') && file.name !== 'node_modules') {
           try { results = results.concat(walk(filePath)); } catch(e) {}
        }
      } else {
        const stats = fs.statSync(filePath);
        results.push({
          name: file.name,
          path: filePath,
          modified: stats.mtime,
          size: stats.size,
          isDirectory: false
        });
      }
    }
    return results;
  };

  try {
    const allFiles = walk(ROOT_DIR);
    const recent = allFiles
      .sort((a, b) => b.modified - a.modified)
      .slice(0, 50);
    res.json({ files: recent });
  } catch (e) {
    res.status(500).json({ error: e.message });
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

// API: ZIP Download (Batch or Folders)
app.post('/api/zip', (req, res) => {
  const { paths } = req.body;
  if (!paths || !paths.length) return res.status(400).send('No paths provided');

  const archive = archiver('zip', { zlib: { level: 9 } });
  res.attachment('thenet_archive.zip');
  archive.pipe(res);

  paths.forEach(p => {
    if (fs.existsSync(p)) {
      const stats = fs.statSync(p);
      if (stats.isDirectory()) {
        archive.directory(p, path.basename(p));
      } else {
        archive.file(p, { name: path.basename(p) });
      }
    }
  });

  archive.finalize();
});

// API: Get Extended System Vitals
app.get('/api/vitals', (req, res) => {
  res.json({
    battery: {
      level: 85, // Mocked for desktop, real for Termux would need termux-battery-status
      status: 'Charging'
    },
    cpu: {
      load: Math.round(os.loadavg()[0] * 10),
      temp: 42
    },
    ram: {
      used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024),
      total: Math.round(os.totalmem() / 1024 / 1024 / 1024)
    }
  });
});

// API: Clipboard Bridge
let clipboard = "";
app.get('/api/clipboard', (req, res) => res.json({ text: clipboard }));
app.post('/api/clipboard', (req, res) => {
  clipboard = req.body.text;
  res.json({ success: true });
});

// API: Text Editor
app.get('/api/text', (req, res) => {
  const filePath = req.query.path;
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
  res.send(fs.readFileSync(filePath, 'utf-8'));
});

app.post('/api/text', (req, res) => {
  const { path: filePath, content } = req.body;
  fs.writeFileSync(filePath, content, 'utf-8');
  res.json({ success: true });
});

// Serve the UI for all other routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 TheNet Node is active!`);
  console.log(`📡 Control Hub: http://${getLocalIP()}:${PORT}`);
  console.log(`------------------------------------------\n`);
});
