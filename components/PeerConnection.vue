<template>
  <div class="w-full">
    <!-- 헤더 -->
    <div class="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <UIcon name="i-heroicons-signal" class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold">{{ t('peerConnection.title') }}</h3>
            <p class="text-sm text-emerald-100">{{ t('peerConnection.subtitle') }}</p>
          </div>
        </div>
        <UBadge
          :color="isInitialized ? 'success' : 'warning'"
          variant="solid"
          class="bg-white/20 backdrop-blur-sm"
        >
          {{ isInitialized ? `🟢 ${t('peerConnection.ready')}` : `🟡 ${t('peerConnection.initializing')}` }}
        </UBadge>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="rounded-b-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
      <div class="space-y-6">
        <!-- 내 피어 ID -->
        <div class="rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 p-4 ring-1 ring-gray-200">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-heroicons-identification" class="h-4 w-4 text-gray-600" />
            <label class="text-sm font-semibold text-gray-700">{{ t('peerConnection.myPeerId') }}</label>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <code class="block truncate rounded-lg bg-white px-3 py-2 text-sm font-mono ring-1 ring-gray-300">
                {{ localPeerId || `🔄 ${t('peerConnection.generating')}` }}
              </code>
            </div>
            <div class="flex gap-2">
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                @click="copyPeerId"
                :disabled="!localPeerId"
                class="shrink-0"
              >
                <UIcon name="i-heroicons-clipboard-document" class="h-4 w-4" />
              </UButton>
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                @click="showQRCode"
                :disabled="!localPeerId"
                class="shrink-0"
              >
                <UIcon name="i-heroicons-qr-code" class="h-4 w-4" />
              </UButton>
            </div>
          </div>
        </div>

        <!-- 피어 추가 폼 -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-heroicons-plus-circle" class="h-4 w-4 text-gray-600" />
            <h4 class="text-sm font-semibold text-gray-700">{{ t('peerConnection.connectToPeer') }}</h4>
          </div>
          
          <div class="grid grid-cols-1 gap-3">            
            <UInput
              v-model="newPeerId"
              :placeholder="t('peerConnection.peerIdPlaceholder')"
              :disabled="!isInitialized"
              size="lg"
            >
              <template #leading>
                <UIcon name="i-heroicons-hashtag" class="h-4 w-4" />
              </template>
            </UInput>
          </div>
          
          <div class="flex gap-2">
            <UButton
              color="primary"
              size="lg"
              @click="addNewPeer"
              :disabled="!canAddPeer"
              :loading="isConnecting"
              class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl"
            >
              <template v-if="!isConnecting">
                <UIcon name="i-heroicons-link" class="mr-2 h-4 w-4" />
                {{ t('peerConnection.connect') }}
              </template>
              <template v-else>
                {{ t('peerConnection.connecting') }}
              </template>
            </UButton>
            
            <UButton
              color="neutral"
              size="lg"
              @click="showQRScanner"
              :disabled="!isInitialized"
              class="px-3"
            >
              <UIcon name="i-heroicons-qr-code" class="h-5 w-5" />
            </UButton>
          </div>
        </div>

        <!-- 연결된 피어 목록 -->
        <div v-if="connectedPeers.length > 0" class="space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-check-circle" class="h-4 w-4 text-green-500" />
            <h4 class="text-sm font-semibold text-gray-700">{{ t('peerConnection.connectedPeers') }} ({{ connectedPeers.length }}개)</h4>
          </div>
          
          <div class="space-y-2">
            <div
              v-for="peer in connectedPeers"
              :key="peer.id"
              class="group flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
                  <UIcon name="i-heroicons-wifi" class="h-4 w-4" />
                </div>
                <div>
                  <p class="text-sm font-medium text-green-900">{{ peer.name || `피어 ${peer.id.slice(0, 6)}` }}</p>
                  <p class="text-xs text-green-600">🟢 {{ t('peerConnection.connected') }}</p>
                </div>
              </div>
              <UButton
                color="error"
                variant="ghost"
                size="sm"
                @click="disconnectPeer(peer.id)"
                class="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </UButton>
            </div>
          </div>
        </div>

        <!-- 연결 대기 중인 피어 -->
        <div v-if="pendingPeers.length > 0" class="space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="h-4 w-4 text-yellow-500" />
            <h4 class="text-sm font-semibold text-gray-700">연결 중 ({{ pendingPeers.length }}개)</h4>
          </div>
          
          <div class="space-y-2">
            <div
              v-for="peer in pendingPeers"
              :key="peer.id"
              class="group flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white shadow-sm">
                  <UIcon name="i-heroicons-signal-slash" class="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <p class="text-sm font-medium text-yellow-900">{{ peer.name || `피어 ${peer.id.slice(0, 6)}` }}</p>
                  <p class="text-xs text-yellow-600">🟡 연결 중...</p>
                </div>
              </div>
              <UButton
                color="error"
                variant="ghost"
                size="sm"
                @click="disconnectPeer(peer.id)"
                class="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </UButton>
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-if="connectedPeers.length === 0 && pendingPeers.length === 0" class="text-center py-8">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <UIcon name="i-heroicons-user-group" class="h-8 w-8 text-gray-400" />
          </div>
          <p class="text-sm font-medium text-gray-700 mb-1">{{ t('peerConnection.noPeers') }}</p>
          <p class="text-xs text-gray-500">{{ t('peerConnection.guideInputPeerId') }}</p>
        </div>
      </div>
    </div>

    <!-- QR 코드 표시 모달 -->
    <UModal v-model:open="showQRModal" :title="t('peerConnection.qrModalTitle')">
      <template #body>
        <div class="text-center">
          <div class="flex justify-center mb-4">
            <div v-if="qrCodeDataUrl" class="bg-white p-4 rounded-lg shadow-inner">
              <img :src="qrCodeDataUrl" :alt="t('peerConnection.qrCodeAlt')" class="w-48 h-48" />
            </div>
            <div v-else class="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-gray-400" />
            </div>
          </div>
          <p class="text-sm text-gray-600">{{ t('peerConnection.qrGuide') }}</p>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="showQRModal = false"
          >
            {{ t('common.close') }}
          </UButton>
          <UButton
            color="primary"
            @click="copyPeerId"
          >
            {{ t('peerConnection.copyPeerId') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- QR 코드 스캔 모달 -->
    <UModal v-model:open="showScanModal" :title="t('peerConnection.qrScanTitle')">
      <template #body>
        <div class="text-center">
          <div class="mb-4">
            <div v-if="!isScanning" class="space-y-4">
              <div class="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div class="text-center">
                  <UIcon name="i-heroicons-camera" class="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p class="text-sm text-gray-600">{{ t('peerConnection.qrScanStart') }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ t('peerConnection.qrScanPermission') }}</p>
                </div>
              </div>
              <UButton
                color="primary"
                @click="startScanning"
                block
                :loading="isScanning"
              >
                <UIcon name="i-heroicons-camera" class="mr-2 h-4 w-4" />
                {{ t('peerConnection.qrScanStartBtn') }}
              </UButton>
            </div>
            
            <div v-else class="space-y-4">
              <div class="relative">
                <video
                  ref="videoElement"
                  class="w-full h-64 bg-black rounded-lg"
                  autoplay
                  muted
                  playsinline
                ></video>
                <!-- QR 스캔 오버레이 -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="w-32 h-32 border-2 border-white border-dashed rounded-lg bg-black/20 backdrop-blur-sm flex items-center justify-center">
                    <div class="text-white text-xs text-center">
                      {{ t('peerConnection.qrScanOverlay') }}
                    </div>
                  </div>
                </div>
              </div>
              <canvas
                ref="canvasElement"
                class="hidden"
              ></canvas>
              <div class="flex gap-2">
                <UButton
                  color="error"
                  variant="outline"
                  @click="stopScanning"
                  class="flex-1"
                >
                  {{ t('common.stop') }}
                </UButton>
                <UButton
                  color="primary"
                  @click="() => captureAndScan(true)"
                  class="flex-1"
                >
                  {{ t('peerConnection.qrScanManual') }}
                </UButton>
              </div>
            </div>
          </div>
          
          <p class="text-sm text-gray-600">{{ t('peerConnection.qrScanGuide') }}</p>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end">
          <UButton
            color="neutral"
            variant="outline"
            @click="closeScanModal"
          >
            {{ t('common.close') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useWebRTC } from '~/composables/useWebRTC'
import QRCode from 'qrcode'
// @ts-ignore
import jsQR from 'jsqr'
import type { PeerConnection } from '~/types/webrtc'

const toast = useToast()
const { t } = useI18n()

const { 
  localPeerId, 
  peers, 
  connectToPeer, 
  removePeer, 
  isInitialized,
  initialize: initializePeer,
} = useWebRTC()

const newPeerId = ref('')
const isConnecting = ref(false)

// QR Code 관련 상태
const showQRModal = ref(false)
const showScanModal = ref(false)
const qrCodeDataUrl = ref('')
const isScanning = ref(false)
const videoElement = ref<HTMLVideoElement>()
const canvasElement = ref<HTMLCanvasElement>()
let mediaStream: MediaStream | null = null

const canAddPeer = computed(() => {
  return newPeerId.value.trim() !== '' && !peers.value.some(p => p.id === newPeerId.value.trim()) && isInitialized.value
})

const connectedPeers = computed(() => {
  return peers.value.filter(peer => peer.isConnected)
})

const pendingPeers = computed(() => {
  return peers.value.filter(peer => !peer.isConnected)
})

// QR 코드 생성
const generateQRCode = async (data: string) => {
  try {
    const url = await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    return url
  } catch (error) {
    console.error('QR 코드 생성 실패:', error)
    return ''
  }
}

// QR 코드 모달 표시
const showQRCode = async () => {
  if (!localPeerId.value) return
  
  showQRModal.value = true
  qrCodeDataUrl.value = await generateQRCode(localPeerId.value)
}

// QR 스캔 모달 표시
const showQRScanner = () => {
  showScanModal.value = true
}

// QR 스캔 모달 닫기
const closeScanModal = () => {
  stopScanning()
  showScanModal.value = false
}

// 카메라 시작
const startScanning = async () => {
  console.log('카메라 스캔 시작 시도...')
  
  try {
    // 먼저 isScanning을 true로 설정하여 UI 업데이트
    isScanning.value = true
    
    // 다양한 카메라 설정을 시도
    const constraints = [
      { video: { facingMode: 'environment' } }, // 후면 카메라 우선
      { video: { facingMode: 'user' } }, // 전면 카메라
      { video: true } // 기본 카메라
    ]
    
    let streamObtained = false
    
    for (const constraint of constraints) {
      try {
        console.log('카메라 제약 조건 시도:', constraint)
        mediaStream = await navigator.mediaDevices.getUserMedia(constraint)
        streamObtained = true
        console.log('카메라 스트림 획득 성공')
        break
      } catch (err) {
        console.log('이 제약 조건으로 실패:', err)
        continue
      }
    }
    
    if (!streamObtained) {
      throw new Error('모든 카메라 설정에서 접근 실패')
    }
    
    if (videoElement.value && mediaStream) {
      videoElement.value.srcObject = mediaStream
      console.log('비디오 엘리먼트에 스트림 설정 완료')
      
      // 비디오가 로드되면 자동 스캔 시작
      videoElement.value.addEventListener('loadedmetadata', () => {
        console.log('비디오 메타데이터 로드됨, 자동 스캔 시작')
        startAutoScan()
      })
      
      // 비디오가 재생되기 시작하면 알림
      videoElement.value.addEventListener('playing', () => {
        console.log('비디오 재생 시작됨')
        toast.add({
          title: '카메라 시작됨',
          description: 'QR 코드를 카메라에 비춰주세요',
          color: 'success',
          icon: 'i-heroicons-camera'
        })
      })
    }
  } catch (error) {
    console.error('카메라 접근 실패:', error)
    isScanning.value = false // 실패 시 상태 되돌리기
    
    let errorMessage = '카메라에 접근할 수 없습니다.'
    
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        errorMessage = '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = '카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = '카메라가 다른 애플리케이션에서 사용 중입니다.'
      }
    }
    
    toast.add({
      title: '카메라 오류',
      description: errorMessage,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle'
    })
  }
}

// 자동 스캔 기능
let scanInterval: NodeJS.Timeout | null = null

const startAutoScan = () => {
  if (scanInterval) clearInterval(scanInterval)
  
  scanInterval = setInterval(() => {
    if (isScanning.value) {
      captureAndScan(false) // 자동 스캔 시에는 토스트 메시지 표시 안함
    }
  }, 500) // 0.5초마다 스캔
}

// 카메라 중지
const stopScanning = () => {
  console.log('카메라 중지 중...')
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => {
      track.stop()
      console.log('카메라 트랙 중지됨:', track.label)
    })
    mediaStream = null
  }
  
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
    console.log('자동 스캔 인터벌 중지됨')
  }
  
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
  
  isScanning.value = false
  console.log('카메라 완전히 중지됨')
}

// QR 코드 캡처 및 스캔
const captureAndScan = async (showToast: boolean = true) => {
  if (!videoElement.value || !canvasElement.value) return
  
  const video = videoElement.value
  const canvas = canvasElement.value
  const context = canvas.getContext('2d')
  
  if (!context) return
  
  // 캔버스에 비디오 프레임 그리기
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  // 이미지 데이터 추출
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  
  try {
    const result = await scanQRFromImageData(imageData)
    
    if (result && result.trim() !== '') {
      // QR 코드에서 피어 ID 추출 (검증)
      if (result.length > 5) { // 최소한의 검증
        newPeerId.value = result.trim()
        closeScanModal()
        
        if (showToast) {
          toast.add({
            title: 'QR 코드 스캔 성공',
            description: `피어 ID가 입력되었습니다: ${result.slice(0, 8)}...`,
            color: 'success',
            icon: 'i-heroicons-qr-code'
          })
        }
      } else if (showToast) {
        toast.add({
          title: '잘못된 QR 코드',
          description: '유효한 피어 ID가 아닙니다.',
          color: 'warning',
          icon: 'i-heroicons-exclamation-triangle'
        })
      }
    } else if (showToast) {
      // 자동 스캔 중에는 메시지 표시하지 않음
      // toast 메시지 없음
    }
  } catch (error) {
    console.error('QR 스캔 실패:', error)
    if (showToast) {
      toast.add({
        title: 'QR 스캔 오류',
        description: '스캔 중 오류가 발생했습니다.',
        color: 'error',
        icon: 'i-heroicons-exclamation-triangle'
      })
    }
  }
}

// 간단한 QR 코드 디코딩 시뮬레이션 (실제로는 전용 라이브러리 사용 권장)
const scanQRFromImageData = async (imageData: ImageData): Promise<string | null> => {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    return code ? code.data : null
  } catch (error) {
    console.error('QR 코드 디코딩 실패:', error)
    return null
  }
}

// 실시간 피어 상태 감시
watch(peers, (newPeers) => {
  const connected = newPeers.filter(peer => peer.isConnected)
  const pending = newPeers.filter(peer => !peer.isConnected)
  
  console.log('👥 Peer status update:', {
    connected: connected.length,
    pending: pending.length,
    total: newPeers.length
  })
  
  // 연결이 성공하면 isConnecting 상태 리셋
  if (isConnecting.value) {
    const justConnected = newPeers.find(p => 
      p.isConnected && (p.id === newPeerId.value.trim())
    );
    
    if (justConnected) {
      console.log('🎉 Connection established, resetting form');
      isConnecting.value = false;
      newPeerId.value = '';
    }
  }
}, { deep: true })

const addNewPeer = async () => {
  if (!canAddPeer.value) return

  isConnecting.value = true
  try {
    await connectToPeer(newPeerId.value.trim())
    console.log(`[PeerConnection] Successfully initiated connection to ${newPeerId.value}`)
    newPeerId.value = ''
  } catch (error) {
    console.error('[PeerConnection] Failed to add peer:', error)
    toast.add({
      title: '연결 실패',
      description: '피어 연결에 실패했습니다. 피어 ID를 확인해주세요.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle'
    })
  } finally {
    isConnecting.value = false
  }
}

const disconnectPeer = (peerId: string) => {
  console.log(`[PeerConnection] Disconnecting peer: ${peerId}`)
  removePeer(peerId)
  
  toast.add({
    title: '피어 연결 해제',
    description: '피어 연결이 해제되었습니다.',
    color: 'info',
    icon: 'i-heroicons-wifi-slash'
  })
}

const copyPeerId = async () => {
  if (localPeerId.value) {
    try {
      await navigator.clipboard.writeText(localPeerId.value)
      toast.add({
        title: '복사 완료',
        description: '피어 ID가 클립보드에 복사되었습니다.',
        color: 'success',
        icon: 'i-heroicons-clipboard-document-check'
      })
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
      toast.add({
        title: '복사 실패',
        description: '클립보드 복사에 실패했습니다.',
        color: 'error',
        icon: 'i-heroicons-exclamation-triangle'
      })
    }
  }
}

// Watch for initialization to complete
watch(isInitialized, (initialized) => {
  if (initialized) {
    console.log('[PeerConnection] WebRTC is initialized.')
  }
})

onMounted(() => {
  // The composable now handles its own initialization
  // but you can call it here if you need to force it.
  // initializePeer()
})
</script>
