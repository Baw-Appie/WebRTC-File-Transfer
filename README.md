> **This project was coded with GitHub Copilot Agent (Claude Sonet 4).**

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

---

# 🇰🇷 한국어 안내

> **이 프로젝트는 GitHub Copilot Agent (Claude Sonet 4)로 코딩되었습니다.**

# WebRTC 파일 전송 시스템

Nuxt 3와 Nuxt UI 3로 구축된 WebRTC 기반 P2P 파일 전송 애플리케이션입니다.

## 🚀 주요 기능

- **P2P 파일 전송**: WebRTC를 통한 직접 피어 투 피어 파일 전송
- **실시간 진행 상황**: 파일 전송 진행 상황을 실시간으로 모니터링
- **QR 코드 연결**: QR 코드로 손쉽게 피어 연결
- **토스트 알림**: 사용자 친화적인 알림 시스템
- **모던 UI**: Nuxt UI 3와 Tailwind CSS 기반 반응형 디자인
- **타입 세이프티**: TypeScript로 구현된 타입 안전 코드
- **연결 관리**: 다중 피어 연결 지원

## 🛠 기술 스택

- **프레임워크**: Nuxt 3
- **UI 라이브러리**: Nuxt UI 3
- **스타일링**: Tailwind CSS
- **언어**: TypeScript
- **통신**: WebRTC API
- **QR 코드**: qrcode, jsqr 라이브러리

## 📋 요구 사항

- Node.js 18 이상
- 최신 웹 브라우저 (WebRTC 지원)

## ⚙️ 설치 및 사용법

의존성 설치:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
```

개발 서버 실행:

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

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 🎯 사용법

### 1. 피어 연결 설정

**방법 1: 수동 입력**
1. 자신의 피어 ID를 복사해 상대방에게 전달
2. 상대방의 피어 ID와 이름 입력
3. "Connect Peer" 버튼 클릭하여 연결 시도

**방법 2: QR 코드 사용**
1. QR 코드 버튼 클릭하여 자신의 피어 ID로 QR 코드 생성
2. 상대방이 QR 코드를 스캔하여 자동 입력
3. 또는 QR 스캔 버튼으로 상대방의 QR 코드 스캔

4. 연결에 성공하면 초록색 표시가 나타남

### 2. 파일 보내기
1. 연결된 피어 목록에서 수신자 선택
2. "Select File" 버튼 클릭 후 파일 선택
3. "Send File" 버튼 클릭
4. 수신자가 수락하면 파일 전송 시작

### 3. 파일 받기
1. 파일 전송 요청이 오면 알림 수신
2. "Accept" 또는 "Decline" 클릭
3. 수락 시 파일 전송이 시작되고 진행 상황 표시

## 🏗 프로젝트 구조

```
├── components/
│   ├── FileTransfer.vue           # 파일 전송 컴포넌트
│   ├── PeerConnection.vue         # 피어 연결 관리 컴포넌트
│   └── FileTransferProgress.vue   # 전송 진행 상황 컴포넌트
├── composables/
│   └── useWebRTC.ts              # WebRTC 로직 관리
├── types/
│   └── webrtc.ts                 # TypeScript 타입 정의
├── app.vue                       # 메인 애플리케이션
└── nuxt.config.ts               # Nuxt 설정
```

## ⚠️ 제한 사항

- **시그널링 서버**: 현재 데모는 수동 피어 ID 교환을 사용합니다. 운영 환경에서는 시그널링 서버가 필요합니다.
- **NAT/방화벽**: 일부 네트워크 환경에서는 TURN 서버가 필요할 수 있습니다.
- **브라우저 지원**: WebRTC를 지원하는 최신 브라우저에서만 동작합니다.

## 🔧 개발 정보

### 빌드 및 배포

프로덕션 빌드:
```bash
npm run build
```

프리뷰 빌드:
```bash
npm run preview
```

### 개발 팁

1. **브라우저 개발자 도구**: WebRTC 연결 상태 및 데이터 채널 통신 모니터링
2. **네트워크 환경**: 동일 네트워크에서 테스트 시 더 안정적인 연결
3. **HTTPS 필수**: 운영 환경에서는 HTTPS에서만 WebRTC가 정상 동작

### 추가 가능 기능

- 실시간 채팅
- 파일 암호화/복호화
- 대용량 파일 전송 최적화
- 동시 다중 파일 전송
- 전송 이력 관리
- 자동 피어 검색
- QR 코드 커스터마이징
- 카메라 전환(전/후면)

## 🤝 기여 방법

1. 저장소 포크
2. 새 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

---

**🎉 Nuxt 3 + WebRTC로 만든 최신 P2P 파일 전송 시스템을 즐겨보세요!**
