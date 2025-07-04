<template>
  <div class="w-full">
    <!-- 헤더 -->
    <div class="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-6 text-white">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <UIcon name="i-heroicons-chart-bar-square" class="h-5 w-5" />
        </div>
        <div>
          <h3 class="text-lg font-bold">{{ t('fileProgress.title') }}</h3>
          <p class="text-sm text-violet-100">{{ t('fileProgress.subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="rounded-b-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
      <div class="space-y-6">
        <!-- 빈 상태 -->
        <div v-if="fileTransfersComputed.length === 0" class="text-center py-12">
          <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
            <UIcon name="i-heroicons-inbox" class="h-10 w-10 text-gray-400" />
          </div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">전송 대기 중</h4>
          <p class="text-sm text-gray-500">{{ t('fileProgress.noTransfers') }}</p>
        </div>

        <!-- 파일 전송 목록 -->
        <div v-else class="space-y-4">
          <div
            v-for="transfer in fileTransfersComputed"
            :key="transfer.id"
            class="overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg"
            :class="getTransferCardClass(transfer.status)"
          >
            <!-- 파일 정보 헤더 -->
            <div class="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50">
              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                  <UIcon :name="getFileIcon(transfer.type)" class="h-6 w-6" />
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-gray-900">{{ transfer.name }}</h4>
                  <p class="text-xs text-gray-500">{{ formatFileSize(transfer.size) }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <UBadge 
                  :color="getStatusColor(transfer.status)"
                  variant="subtle"
                  size="sm"
                  class="font-medium"
                >
                  {{ getStatusText(transfer.status) }}
                </UBadge>
                
                <!-- 액션 버튼들 -->
                <div v-if="transfer.status === 'pending' && transfer.to === localPeerId" class="flex items-center gap-1">
                  <UButton
                    color="success"
                    variant="soft"
                    size="sm"
                    @click="acceptTransfer(transfer.id)"
                  >
                    <UIcon name="i-heroicons-check" class="h-4 w-4 mr-1" />
                    {{ t('fileProgress.accept') }}
                  </UButton>
                  
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    @click="rejectTransfer(transfer.id)"
                  >
                    <UIcon name="i-heroicons-x-mark" class="h-4 w-4 mr-1" />
                    {{ t('fileProgress.reject') }}
                  </UButton>
                </div>

                <!-- 다운로드 버튼 -->
                <a
                  v-if="transfer.status === 'completed' && transfer.downloadUrl && transfer.to === localPeerId"
                  :href="transfer.downloadUrl"
                  :download="transfer.name"
                  class="ml-2"
                >
                  <UButton
                    color="primary"
                    variant="soft"
                    size="sm"
                  >
                    <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4 mr-1" />
                    {{ t('fileProgress.download') }}
                  </UButton>
                </a>
                
                <UButton
                  v-if="transfer.status === 'completed' || transfer.status === 'failed' || transfer.status === 'rejected'"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-x-mark"
                  @click="removeTransfer(transfer.id)"
                />
              </div>
            </div>

            <!-- 진행률 바 -->
            <div v-if="transfer.status === 'transferring' || transfer.status === 'completed'" class="px-4 pt-2 pb-4">
              <UProgress v-model="transfer.progress" :color="getStatusColor(transfer.status)" animation="carousel" />
              <div class="flex items-center justify-between text-xs text-gray-500 mt-1.5">
                <span class="font-medium">{{ Math.round(transfer.progress) }}%</span>
                <div v-if="transfer.status === 'transferring'" class="flex items-center">
                  <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4 mr-1 text-blue-500" />
                  <span>{{ formatFileSize(transfer.transferredBytes) }} / {{ formatFileSize(transfer.size) }}</span>
                </div>
                <span v-else-if="transfer.status === 'completed'" class="text-green-600 font-semibold flex items-center">
                  <UIcon name="i-heroicons-check-circle" class="h-4 w-4 mr-1" />
                  완료
                </span>
              </div>
            </div>
            
            <div v-if="transfer.status === 'failed' || transfer.status === 'rejected'" class="px-4 pt-2 pb-4">
               <div class="text-xs text-red-600 font-semibold flex items-center">
                  <UIcon name="i-heroicons-exclamation-circle" class="h-4 w-4 mr-1" />
                  <span>{{ transfer.status === 'failed' ? '전송 중 오류가 발생했습니다.' : '사용자가 전송을 거부했습니다.' }}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWebRTC } from '~/composables/useWebRTC'
import type { FileTransferInfo } from '~/types/webrtc'

const { 
  fileTransfers,
  acceptFile,
  rejectFile,
  removeTransfer,
  localPeerId,
} = useWebRTC()

const { $i18n } = useNuxtApp()
const { t } = useI18n()

const fileTransfersComputed = computed(() => 
  [...fileTransfers.value].sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
)

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return 'i-heroicons-photo'
  if (fileType.startsWith('video/')) return 'i-heroicons-film'
  if (fileType.startsWith('audio/')) return 'i-heroicons-musical-note'
  if (fileType === 'application/pdf') return 'i-heroicons-document-text'
  if (fileType === 'application/zip' || fileType === 'application/x-rar-compressed') return 'i-heroicons-archive-box'
  return 'i-heroicons-document'
}

const getStatusText = (status: FileTransferInfo['status']): string => {
  const statusMap: Record<FileTransferInfo['status'], string> = {
    pending: 'fileProgress.receiving',
    transferring: 'fileProgress.sending',
    completed: 'fileProgress.completed',
    failed: 'fileProgress.failed',
    rejected: 'fileProgress.failed',
  }
  
  const translationKey = statusMap[status]
  return translationKey ? $i18n.t(translationKey) as string : '알 수 없음'
}

const getStatusColor = (status: FileTransferInfo['status']): 'warning' | 'info' | 'success' | 'error' | 'neutral' => {
  const colorMap: Record<FileTransferInfo['status'], 'warning' | 'info' | 'success' | 'error' | 'neutral'> = {
    pending: 'warning',
    transferring: 'info',
    completed: 'success',
    failed: 'error',
    rejected: 'error',
  }
  return colorMap[status] || 'neutral'
}

const getTransferCardClass = (status: FileTransferInfo['status']): string => {
  const classMap: Record<FileTransferInfo['status'], string> = {
    pending: 'border-amber-200 bg-amber-50',
    transferring: 'border-blue-200 bg-blue-50',
    completed: 'border-green-200 bg-green-50',
    failed: 'border-red-200 bg-red-50',
    rejected: 'border-red-200 bg-red-50',
  }
  return classMap[status] || 'border-gray-200 bg-gray-50'
}

const acceptTransfer = (id: string) => {
  acceptFile(id)
}

const rejectTransfer = (id: string) => {
  rejectFile(id)
}

// transferRate를 아직 계산하지 않으므로 임시 함수를 추가합니다.
const formatTransferRate = (rate: number): string => {
  if (!rate) return '0 KB'
  return `${formatFileSize(rate)}`
}
</script>