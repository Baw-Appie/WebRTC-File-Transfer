import Peer, { type DataConnection } from 'peerjs'
import { v4 as uuidv4 } from 'uuid'
import type { PeerConnection, FileTransferInfo, Message } from '~/types/webrtc'

// 전역 상태 관리
class WebRTCManager extends EventTarget {
  private static instance: WebRTCManager | null = null
  private peer: Peer | null = null
  private localPeerId: string | null = null
  private peers: Map<string, PeerConnection> = new Map()
  private isInitialized: boolean = false
  private fileTransfers: Map<string, FileTransferInfo> = new Map()

  static getInstance(): WebRTCManager {
    if (!WebRTCManager.instance) {
      WebRTCManager.instance = new WebRTCManager()
    }
    return WebRTCManager.instance
  }

  // Getters
  getLocalPeerId(): string | null {
    return this.localPeerId
  }

  getPeers(): PeerConnection[] {
    return Array.from(this.peers.values())
  }

  getIsInitialized(): boolean {
    return this.isInitialized
  }

  getFileTransfers(): FileTransferInfo[] {
    return Array.from(this.fileTransfers.values())
  }

  // 상태 업데이트 메서드들
  private updateLocalPeerId(id: string | null) {
    this.localPeerId = id
    this.dispatchEvent(new CustomEvent('localPeerIdChanged', { detail: id }))
  }

  private updatePeers() {
    this.dispatchEvent(new CustomEvent('peersChanged', { detail: this.getPeers() }))
  }

  private updateIsInitialized(initialized: boolean) {
    this.isInitialized = initialized
    this.dispatchEvent(new CustomEvent('isInitializedChanged', { detail: initialized }))
  }

  private updateFileTransfers() {
    this.dispatchEvent(new CustomEvent('fileTransfersChanged', { detail: this.getFileTransfers() }))
  }

  // WebRTC 초기화
  initializePeer() {
    if (this.peer) {
      console.warn('Peer already initialized.')
      return
    }

    const newPeer = new Peer()

    newPeer.on('open', (id) => {
      console.log('✅ PeerJS connection opened. Local Peer ID:', id)
      this.updateLocalPeerId(id)
      this.updateIsInitialized(true)
    })

    newPeer.on('connection', (conn) => {
      console.log(`🤝 Incoming connection from ${conn.peer}`)
      this.addPeer(conn.peer, conn)
    })

    newPeer.on('error', (err) => {
      console.error('❌ PeerJS error:', err)
      if (err.type === 'peer-unavailable') {
        const unavailablePeerId = err.message.split('Could not connect to peer ')[1]
        if (unavailablePeerId) {
          this.removePeer(unavailablePeerId)
        }
      }
    })

    newPeer.on('disconnected', () => {
      console.warn('🔌 PeerJS disconnected from server. Attempting to reconnect...')
      setTimeout(() => newPeer.reconnect(), 3000)
    })

    this.peer = newPeer
  }

  // 피어 연결
  connectToPeer(peerId: string, peerName?: string): Promise<DataConnection> {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        return reject(new Error('Peer is not initialized.'))
      }
      if (this.peers.has(peerId) && this.peers.get(peerId)?.isConnected) {
        return reject(new Error(`Already connected to peer ${peerId}`))
      }

      console.log(`📞 Attempting to connect to peer: ${peerId}`)
      const conn = this.peer.connect(peerId, { reliable: true })

      conn.on('open', () => {
        console.log(`✅ Connection to ${peerId} established.`)
        this.addPeer(peerId, conn, peerName)
        resolve(conn)
      })

      conn.on('error', (err) => {
        console.error(`❌ Failed to connect to ${peerId}:`, err)
        this.removePeer(peerId)
        reject(err)
      })

      const timeoutId = setTimeout(() => {
        conn.close()
        reject(new Error(`Connection to ${peerId} timed out`))
      }, 10000)

      conn.on('open', () => clearTimeout(timeoutId))
      conn.on('close', () => clearTimeout(timeoutId))
    })
  }

  // 피어 추가
  addPeer(peerId: string, connection: DataConnection, name?: string) {
    if (peerId === this.localPeerId) return

    const newPeerConnection: PeerConnection = {
      id: peerId,
      connection: connection,
      isConnected: true,
      name: name || `피어 ${peerId.slice(0, 6)}`,
    }

    this.peers.set(peerId, newPeerConnection)
    this.updatePeers()

    connection.on('data', (data: any) => {
      this.handleReceivedData(data as Message, peerId)
    })

    connection.on('close', () => {
      console.log(`🚪 Connection to ${peerId} closed.`)
      this.removePeer(peerId)
    })

    connection.on('error', (err: any) => {
      console.error(`❌ Connection error with ${peerId}:`, err)
      this.removePeer(peerId)
    })
  }

  // 피어 제거
  removePeer(peerId: string) {
    const peerConnection = this.peers.get(peerId)
    if (peerConnection) {
      peerConnection.connection.close()
      this.peers.delete(peerId)
      this.updatePeers()
      console.log(`➖ Removed peer: ${peerId}`)
    }
  }

  // 메시지 처리
  private handleReceivedData(message: Message, fromPeerId: string) {
    console.log(`📦 Received data from ${fromPeerId}:`, message.type)

    switch (message.type) {
      case 'file-metadata': {
        const { file, metadata } = message.payload
        const transferId = metadata.transferId || uuidv4()

        const newTransfer: FileTransferInfo = {
          id: transferId,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          progress: 0,
          from: fromPeerId,
          to: this.localPeerId!,
          transferredBytes: 0,
          startTime: Date.now(),
        }
        this.fileTransfers.set(transferId, newTransfer)
        this.updateFileTransfers()
        console.log('📥 Received file metadata, waiting for user confirmation.', newTransfer)
        break
      }
      case 'file-chunk': {
        const { transferId, chunk, isLastChunk } = message.payload
        const transfer = this.fileTransfers.get(transferId)
        if (transfer) {
          if (!transfer.receivedChunks) {
            transfer.receivedChunks = []
          }
          transfer.receivedChunks.push(chunk)
          transfer.transferredBytes += chunk.byteLength
          transfer.progress = (transfer.transferredBytes / transfer.size) * 100

          if (isLastChunk) {
            const fileBlob = new Blob(transfer.receivedChunks, { type: transfer.type })
            transfer.downloadUrl = URL.createObjectURL(fileBlob)
            transfer.status = 'completed'
            transfer.endTime = Date.now()
            console.log(`✅ File transfer ${transferId} completed. Blob URL created.`)
            transfer.receivedChunks = [] // Clear chunks from memory
          }
          this.updateFileTransfers()
        }
        break
      }
      case 'file-transfer-accepted': {
        const { transferId } = message.payload
        const transfer = this.fileTransfers.get(transferId)
        if (transfer) {
          console.log(`👍 Peer accepted transfer ${transferId}. Starting chunk upload.`)
          this.startSendingFileChunks(transferId)
        }
        break
      }
      case 'file-transfer-rejected': {
        const { transferId } = message.payload
        const transfer = this.fileTransfers.get(transferId)
        if (transfer) {
          transfer.status = 'rejected'
          this.updateFileTransfers()
        }
        break
      }
    }
  }

  // 파일 전송
  sendFile(file: File, toPeerId: string) {
    const peerConnection = this.peers.get(toPeerId)
    if (!peerConnection || !peerConnection.isConnected) {
      console.error(`❌ Cannot send file: Peer ${toPeerId} is not connected.`)
      return
    }

    const transferId = uuidv4()
    const fileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
    }

    const newTransfer: FileTransferInfo = {
      id: transferId,
      file, // Keep the file reference for the sender
      ...fileMetadata,
      status: 'pending',
      progress: 0,
      from: this.localPeerId!,
      to: toPeerId,
      transferredBytes: 0,
      startTime: Date.now(),
    }
    this.fileTransfers.set(transferId, newTransfer)
    this.updateFileTransfers()

    const message: Message = {
      type: 'file-metadata',
      payload: {
        file: fileMetadata,
        metadata: { transferId },
      },
    }

    peerConnection.connection.send(message)
    console.log(`📤 Sent file metadata to ${toPeerId}. Waiting for acceptance.`)
  }

  // 파일 청크 전송
  private async startSendingFileChunks(transferId: string) {
    const transfer = this.fileTransfers.get(transferId)
    if (!transfer || !transfer.file) {
      console.error(`❌ Cannot start sending chunks: Transfer or file not found for ${transferId}`)
      return
    }

    const peerConnection = this.peers.get(transfer.to)
    if (!peerConnection) {
      console.error(`❌ Cannot send chunks: Peer ${transfer.to} not found.`)
      transfer.status = 'failed'
      this.updateFileTransfers()
      return
    }

    console.log(`🚀 Starting file chunk transfer for ${transfer.name}`)
    transfer.status = 'transferring'
    this.updateFileTransfers()

    const CHUNK_SIZE = 64 * 1024 // 64KB
    let offset = 0
    const fileReader = new FileReader()

    const readNextChunk = () => {
      const slice = transfer.file!.slice(offset, offset + CHUNK_SIZE)
      fileReader.readAsArrayBuffer(slice)
    }

    fileReader.onload = (event) => {
      if (!event.target?.result) return

      const chunk = event.target.result as ArrayBuffer
      offset += chunk.byteLength

      const isLastChunk = offset >= transfer.size

      peerConnection.connection.send({
        type: 'file-chunk',
        payload: {
          transferId,
          chunk,
          isLastChunk,
        },
      })
      
      transfer.transferredBytes = offset
      transfer.progress = (offset / transfer.size) * 100
      this.updateFileTransfers()

      if (isLastChunk) {
        console.log(`✅ Finished sending file ${transfer.name}`)
        transfer.status = 'completed'
        this.updateFileTransfers()
      } else {
        readNextChunk()
      }
    }

    fileReader.onerror = (error) => {
      console.error('❌ FileReader error:', error)
      transfer.status = 'failed'
      this.updateFileTransfers()
    }

    readNextChunk()
  }

  // 파일 수락
  acceptFile(transferId: string) {
    const transfer = this.fileTransfers.get(transferId)
    if (!transfer || transfer.status !== 'pending') return

    transfer.status = 'transferring'
    transfer.receivedChunks = []
    this.updateFileTransfers()

    const peerConnection = this.peers.get(transfer.from)
    if (peerConnection) {
      peerConnection.connection.send({
        type: 'file-transfer-accepted',
        payload: { transferId },
      })
      console.log(`👍 Accepted file transfer ${transferId}. Notifying sender.`)
    }
  }

  // 파일 거부
  rejectFile(transferId: string) {
    const transfer = this.fileTransfers.get(transferId)
    if (!transfer || transfer.status !== 'pending') return

    transfer.status = 'rejected'
    this.updateFileTransfers()

    const peerConnection = this.peers.get(transfer.from)
    if (peerConnection) {
      peerConnection.connection.send({
        type: 'file-transfer-rejected',
        payload: { transferId },
      })
    }
  }

  // 전송 제거
  removeTransfer(transferId: string) {
    const transfer = this.fileTransfers.get(transferId)
    if (transfer) {
      if (transfer.downloadUrl) {
        URL.revokeObjectURL(transfer.downloadUrl)
      }
      this.fileTransfers.delete(transferId)
      this.updateFileTransfers()
    }
  }

  // 정리
  destroy() {
    this.peer?.destroy()
    this.peers.clear()
    this.fileTransfers.clear()
    this.updatePeers()
    this.updateFileTransfers()
    console.log('💥 WebRTC Manager destroyed.')
  }
}

// React Hook for components
export const useWebRTC = () => {
  const manager = WebRTCManager.getInstance()
  
  // Reactive state
  const localPeerId = ref<string | null>(manager.getLocalPeerId())
  const peers = ref<PeerConnection[]>(manager.getPeers())
  const isInitialized = ref<boolean>(manager.getIsInitialized())
  const fileTransfers = ref<FileTransferInfo[]>(manager.getFileTransfers())

  // Event listeners
  const handleLocalPeerIdChanged = (event: CustomEvent) => {
    localPeerId.value = event.detail
  }

  const handlePeersChanged = (event: CustomEvent) => {
    peers.value = event.detail
  }

  const handleIsInitializedChanged = (event: CustomEvent) => {
    isInitialized.value = event.detail
  }

  const handleFileTransfersChanged = (event: CustomEvent) => {
    fileTransfers.value = event.detail
  }

  // Setup event listeners
  onMounted(() => {
    manager.addEventListener('localPeerIdChanged', handleLocalPeerIdChanged as EventListener)
    manager.addEventListener('peersChanged', handlePeersChanged as EventListener)
    manager.addEventListener('isInitializedChanged', handleIsInitializedChanged as EventListener)
    manager.addEventListener('fileTransfersChanged', handleFileTransfersChanged as EventListener)

    // Initialize if not already done
    if (!manager.getIsInitialized()) {
      manager.initializePeer()
    }
  })

  // Cleanup event listeners
  onUnmounted(() => {
    manager.removeEventListener('localPeerIdChanged', handleLocalPeerIdChanged as EventListener)
    manager.removeEventListener('peersChanged', handlePeersChanged as EventListener)
    manager.removeEventListener('isInitializedChanged', handleIsInitializedChanged as EventListener)
    manager.removeEventListener('fileTransfersChanged', handleFileTransfersChanged as EventListener)
  })

  return {
    localPeerId: readonly(localPeerId),
    peers: readonly(peers),
    isInitialized: readonly(isInitialized),
    fileTransfers: readonly(fileTransfers),
    initialize: () => manager.initializePeer(),
    connectToPeer: (peerId: string, peerName?: string) => manager.connectToPeer(peerId, peerName),
    removePeer: (peerId: string) => manager.removePeer(peerId),
    sendFile: (file: File, toPeerId: string) => manager.sendFile(file, toPeerId),
    acceptFile: (transferId: string) => manager.acceptFile(transferId),
    rejectFile: (transferId: string) => manager.rejectFile(transferId),
    removeTransfer: (transferId: string) => manager.removeTransfer(transferId),
  }
}