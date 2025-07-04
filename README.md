# WebRTC File Transfer System

A WebRTC-based P2P file transfer application built with Nuxt 3 and Nuxt UI 3.

## 🚀 Key Features

- **P2P File Transfer**: Direct peer-to-peer file transfer using WebRTC
- **Real-time Progress**: Monitor file transfer progress in real time
- **QR Code Connection**: Easily connect peers via QR codes
- **Toast Notifications**: User-friendly notification system
- **Modern UI**: Responsive design with Nuxt UI 3 and Tailwind CSS
- **Type Safety**: Type-safe code implemented with TypeScript
- **Connection Management**: Supports multiple peer connections

## 🛠 Tech Stack

- **Framework**: Nuxt 3
- **UI Library**: Nuxt UI 3
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Communication**: WebRTC API
- **QR Code**: qrcode, jsqr libraries

## 📋 Requirements

- Node.js 18 or higher
- Latest web browser (WebRTC supported)

## ⚙️ Installation & Usage

Install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
```

Start development server:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### 1. Setting Up Peer Connection

**Method 1: Manual Input**
1. Copy your peer ID and share it with your partner
2. Enter your partner's peer ID and name
3. Click the "Connect Peer" button to attempt connection

**Method 2: Using QR Code**
1. Click the QR code button to generate a QR code for your peer ID
2. Your partner scans the QR code to automatically input your peer ID
3. Or use the QR scan button to scan your partner's QR code

4. A green indicator will appear when the connection is successful

### 2. Sending Files
1. Select the recipient from the connected peers list
2. Click the "Select File" button to choose a file to send
3. Click the "Send File" button
4. File transfer starts once the recipient accepts

### 3. Receiving Files
1. You will receive a notification when a file transfer request arrives
2. Click "Accept" or "Decline"
3. If accepted, the file transfer starts and progress is displayed

## 🏗 Project Structure

```
├── components/
│   ├── FileTransfer.vue           # File transfer component
│   ├── PeerConnection.vue         # Peer connection management component
│   └── FileTransferProgress.vue   # Transfer progress component
├── composables/
│   └── useWebRTC.ts              # WebRTC logic management
├── types/
│   └── webrtc.ts                 # TypeScript type definitions
├── app.vue                       # Main application
└── nuxt.config.ts               # Nuxt configuration
```

## ⚠️ Limitations

- **Signaling Server**: The current demo uses manual peer ID exchange. A signaling server is required for production.
- **NAT/Firewall**: A TURN server may be needed in some network environments.
- **Browser Support**: Works only in modern browsers that support WebRTC.

## 🔧 Development Info

### Build & Deployment

Production build:
```bash
npm run build
```

Preview build:
```bash
npm run preview
```

### Development Tips

1. **Browser DevTools**: Monitor WebRTC connection states and data channel communication.
2. **Network Environment**: Testing on the same network provides more stable connections.
3. **HTTPS Required**: WebRTC works properly only in HTTPS environments for production.

### Possible Additional Features

- Real-time chat
- File encryption/decryption
- Large file transfer optimization
- Simultaneous multi-file transfer
- Transfer history management
- Automated peer discovery
- QR code customization
- Camera switching (front/rear)

## 🤝 Contributing

1. Fork this repository
2. Create a new feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

---

**🎉 Enjoy a modern P2P file transfer system built with Nuxt 3 + WebRTC!**
