<p align="center">
  <img src="https://raw.githubusercontent.com/kisalnelaka/thenet/main/logo.png" width="120" alt="TheNet Logo" />
</p>

<h1 align="center">TheNet</h1>

<p align="center">
  <img src="https://raw.githubusercontent.com/kisalnelaka/thenet/main/preview.png" width="100%" alt="TheNet Preview" />
</p>

<p align="center">
  <strong>A premium, high-performance local Wi-Fi file explorer.</strong><br />
  Browse, download, and upload files from your phone directly using your laptop's browser.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Express-5.0-blue?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## ✨ Features

- 💎 **Premium UI**: Stunning glassmorphic design with a midnight-cyber aesthetic.
- ⚡ **Lightning Fast**: Optimized for local network speed and minimal latency.
- 📂 **Full Explorer**: Desktop-class browsing of your phone's file system.
- 📤 **Drag & Drop**: Seamlessly upload files from your laptop to your phone.
- 🖼️ **Smart Previews**: Integrated previews for images, videos, and documents.
- 🛡️ **Safe & Local**: Your data never leaves your home Wi-Fi network.

## 🚀 Getting Started

### 1. Laptop Setup
Clone the repository and build the production assets:

```bash
git clone https://github.com/yourusername/thenet.git
cd thenet
npm install
npm run build
```

### 2. Mobile Server Setup (Android/iOS)
To run the server on your phone, you'll need a terminal emulator like **Termux** (Android).

1. Install Node.js: `pkg install nodejs`
2. Grant storage access: `termux-setup-storage`
3. Navigate to the project and start the engine:
   ```bash
   node server.js
   ```

### 3. Connect & Browse
The terminal will display your local IP address:
`💻 Laptop: Connect to http://192.168.1.5:3000`

Simply open that URL on your laptop's browser and enjoy.

## 🛠️ Tech Stack

- **Frontend**: React, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express 5, Multer.
- **Styling**: Modern CSS Variables, Glassmorphism.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for the Developer Community
</p>
