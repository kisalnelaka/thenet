<p align="center">
  <img src="https://raw.githubusercontent.com/kisalnelaka/thenet/main/logo.png" width="120" alt="TheNet Logo" />
</p>

<h1 align="center">TheNet: Ultimate Edition</h1>

<p align="center">
  <img src="https://raw.githubusercontent.com/kisalnelaka/thenet/main/preview.png" width="100%" alt="TheNet Preview" />
</p>

<p align="center">
  <strong>A premium, cross-platform local network command and control system.</strong><br />
  A high-performance personal cloud mesh designed for seamless file synchronization, media streaming, and system monitoring.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Express-5.0-blue?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## System Capabilities

TheNet Ultimate Edition provides an integrated ecosystem for managing data and system resources across a local area network. It functions as a decentralized mesh network where any connected device can serve as a controller or a data node.

### Core Features

*   **Integrated Media Suite**: Stream high-definition video and audio directly in the dashboard using the built-in media player.
*   **In-Browser Code Editor**: Modify text-based files including JavaScript, Python, and Markdown directly through the web interface with full save capabilities.
*   **Batch Operations**: Select multiple files or entire directories to download as a single compressed ZIP archive.
*   **Real-Time System Vitals**: Monitor battery levels, CPU load, and RAM utilization of any connected device through the Node Vitals panel.
*   **Clipboard Synchronization**: A dedicated clipboard bridge allows for the instantaneous transfer of text data between all nodes in the network.
*   **Advanced Discovery**: Automatic identification of network nodes including hardware hostnames, local IP addresses, and operating system platforms.
*   **Glassmorphic Design**: A premium user interface optimized for responsiveness and aesthetic excellence.

## Technical Configuration

### Desktop Installation

To deploy the system on a workstation, ensure Node.js is installed and execute the following commands:

```bash
git clone https://github.com/kisalnelaka/thenet.git
cd thenet
npm install
npm run build
node server.js
```

### Mobile Installation (Android)

Deployment on Android requires a terminal environment such as Termux:

1. Install Node.js: `pkg install nodejs`
2. Grant storage access: `termux-setup-storage`
3. Navigate to the project directory and install dependencies: `npm install`
4. Initialize the server: `node server.js`

## Network Infrastructure

TheNet operates as a decentralized system. To connect multiple devices:
1. Activate the server on each target device.
2. Note the local IP address provided in the terminal (e.g., `http://192.168.1.5:3000`).
3. Use the Mesh Nodes panel in the dashboard to integrate the new IP addresses.
4. Access the Windows, Linux, or Android node by selecting it from the sidebar.

## Security and Standards

*   **Architecture**: Built on Node.js 25 and Express 5 for maximum stability and performance.
*   **Data Sovereignty**: All data remains strictly within the local network. No external cloud services are utilized.
*   **Compatibility**: Universal support for all modern web browsers and major operating systems.

## License

This project is licensed under the MIT License. Detailed information is available in the LICENSE file.
