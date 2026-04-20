<p align="center">
  <img src="https://raw.githubusercontent.com/kisalnelaka/thenet/main/logo.png" width="120" alt="TheNet Logo" />
</p>

<h1 align="center">TheNet</h1>

<p align="center">
  <img src="https://raw.githubusercontent.com/kisalnelaka/thenet/main/preview.png" width="100%" alt="TheNet Preview" />
</p>

<p align="center">
  <strong>A premium local wireless file management system.</strong><br />
  Designed for high-performance file synchronization and exploration across local network devices.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Express-5.0-blue?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## Technical Specifications

TheNet provides a centralized dashboard for managing multiple devices on a single local area network. It leverages modern web technologies to deliver a desktop-class experience directly within the browser.

### Core Capabilities

*   Centralized Control: Manage multiple connected devices including mobile phones and desktop workstations from a single interface.
*   Cross-Platform Support: Full compatibility with Windows, Linux, macOS, and Android.
*   High-Performance Transfers: Optimized for local Wi-Fi speeds with minimal overhead.
*   Intuitive Exploration: Advanced file navigation with sorting by name, size, and modification date.
*   Secure Local Architecture: Data remains within the local network with no external cloud dependency.

## Installation and Setup

### Desktop Configuration

To initialize the project on a workstation, execute the following commands in order:

```bash
git clone https://github.com/kisalnelaka/thenet.git
cd thenet
npm install
npm run build
```

### Mobile Configuration

For Android devices, a terminal environment such as Termux is required:

1. Install Node.js using the package manager: `pkg install nodejs`
2. Configure storage permissions: `termux-setup-storage`
3. Initialize the server: `node server.js`

## Network Integration

The server automatically identifies the local IP address upon startup. The dashboard will be accessible via the provided network address. For example: `http://192.168.1.5:3000`

To integrate additional devices:
1. Ensure the server is active on the target device.
2. Select the Add Device option in the dashboard sidebar.
3. Input the IP address of the target device to establish a persistent connection.

## Development Stack

*   Frontend Architecture: React 19, Framer Motion, Lucide Icons.
*   Backend Infrastructure: Node.js, Express 5, Multer.
*   Design System: Custom CSS with Glassmorphic design principles.

## License

This software is distributed under the MIT License. Refer to the LICENSE file for more information.
