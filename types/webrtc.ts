import type { DataConnection } from 'peerjs'

export interface FileTransferInfo {
  id: string
  name: string
  size: number
  type: string
  status: 'pending' | 'transferring' | 'completed' | 'rejected' | 'failed'
  progress: number
  from: string
  to: string
  transferredBytes: number
  startTime: number
  endTime?: number
  file?: File // For the sender to hold the file reference
  receivedChunks?: ArrayBuffer[] // For the receiver to assemble the file
  downloadUrl?: string // For the receiver to download the completed file
}

export interface PeerConnection {
  id: string
  name: string
  isConnected: boolean
  connection: DataConnection
}

interface FileMetadataPayload {
  file: { name: string; size: number; type: string }
  metadata: { transferId: string }
}

interface FileChunkPayload {
  transferId: string
  chunk: ArrayBuffer
  isLastChunk: boolean
}

interface FileTransferAcceptedPayload {
  transferId: string
}

interface FileTransferRejectedPayload {
  transferId: string
}

export type Message =
  | { type: 'file-metadata'; payload: FileMetadataPayload }
  | { type: 'file-chunk'; payload: FileChunkPayload }
  | { type: 'file-transfer-accepted'; payload: FileTransferAcceptedPayload }
  | { type: 'file-transfer-rejected'; payload: FileTransferRejectedPayload }
