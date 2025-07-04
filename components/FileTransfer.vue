<template>
  <div class="w-full">
    <!-- 헤더 -->
    <div class="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-6 text-white">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <UIcon name="i-heroicons-paper-airplane" class="h-5 w-5" />
        </div>
        <div>
          <h3 class="text-lg font-bold">{{ t('fileTransfer.title') }}</h3>
          <p class="text-sm text-blue-100">{{ t('fileTransfer.subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="rounded-b-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
      <div class="space-y-6">
        <!-- 파일 업로드 영역 -->
        <div 
          class="group relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-all hover:border-blue-400 hover:bg-blue-50"
          :class="{ 'border-red-300 bg-red-50': !hasConnectedPeers }"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <div class="text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <UIcon name="i-heroicons-cloud-arrow-up" class="h-8 w-8" />
            </div>
            
            <UButton
              color="primary"
              variant="soft"
              size="lg"
              @click="triggerFileInput"
              :disabled="!hasConnectedPeers"
              class="mb-3"
            >
              <UIcon name="i-heroicons-document-plus" class="mr-2 h-4 w-4" />
              {{ t('fileTransfer.selectFile') }}
            </UButton>
            
            <p class="text-sm text-gray-600">
              {{ t('fileTransfer.dragDrop') }}
            </p>
            
            <input
              ref="fileInput"
              type="file"
              multiple
              class="hidden"
              @change="handleFileSelect"
            />
          </div>

          <div v-if="!hasConnectedPeers" class="absolute inset-0 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm">
            <div class="text-center">
              <UIcon name="i-heroicons-wifi-slash" class="mx-auto mb-2 h-8 w-8 text-red-500" />
              <p class="text-sm font-medium text-red-700">{{ t('fileTransfer.noPeersConnected') }}</p>
              <p class="text-xs text-red-600">먼저 피어를 연결해주세요</p>
            </div>
          </div>
        </div>

        <!-- 선택된 파일 목록 -->
        <div v-if="selectedFiles.length > 0" class="space-y-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-document-duplicate" class="h-4 w-4 text-gray-500" />
            <h4 class="text-sm font-semibold text-gray-800">선택된 파일 ({{ selectedFiles.length }}개)</h4>
          </div>
          
          <div class="max-h-48 space-y-2 overflow-y-auto">
            <div
              v-for="(file, index) in selectedFiles"
              :key="file.name + index"
              class="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-sm">
                <UIcon :name="getFileIcon(file.type)" class="h-5 w-5" />
              </div>
              
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-gray-900">{{ file.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
              </div>
              
              <UButton
                color="error"
                variant="ghost"
                size="sm"
                @click="removeFile(file)"
                class="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </UButton>
            </div>
          </div>

          <!-- 받는 사람 선택 -->
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-user-group" class="h-4 w-4 text-gray-500" />
              <h4 class="text-sm font-semibold text-gray-800">받는 사람</h4>
            </div>
            
            <USelect
              v-model="selectedPeerId"
              :items="peerOptions"
              placeholder="피어를 선택하세요"
              value-key="value"
              class="w-full"
              size="lg"
            >
              <template #leading>
                <UIcon name="i-heroicons-user" class="h-4 w-4" />
              </template>
            </USelect>
            
            <!-- 피어 목록이 비어있을 때 표시 -->
            <div v-if="peerOptions.length === 0" class="text-sm text-red-600 bg-red-50 p-2 rounded">
              ⚠️ 연결된 피어가 없어 파일을 보낼 수 없습니다.
            </div>
          </div>

          <!-- 전송 버튼 -->
          <UButton
            color="primary"
            size="lg"
            block
            @click="sendFiles"
            :disabled="!selectedPeerId || selectedFiles.length === 0"
            :loading="isSending"
            class="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
          >
            <template v-if="!isSending">
              <UIcon name="i-heroicons-paper-airplane" class="mr-2 h-4 w-4" />
              파일 전송하기
            </template>
            <template v-else>
              <UIcon name="i-heroicons-arrow-path" class="mr-2 h-4 w-4 animate-spin" />
              전송 중...
            </template>
          </UButton>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="hasConnectedPeers" class="text-center py-6">
          <div class="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <UIcon name="i-heroicons-document" class="h-6 w-6 text-gray-400" />
          </div>
          <p class="text-sm text-gray-500">파일을 선택하면 전송을 시작할 수 있습니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWebRTC } from '~/composables/useWebRTC'

const { peers, sendFile } = useWebRTC()
const { t } = useI18n()

const fileInput = ref<HTMLInputElement>()
const selectedFiles = ref<File[]>([])
const selectedPeerId = ref<string>('')
const isSending = ref(false)

const hasConnectedPeers = computed(() => {
  return peers.value.some(peer => peer.isConnected)
})

const peerOptions = computed(() => {
  return peers.value
    .filter(peer => peer.isConnected)
    .map(peer => ({
      label: peer.name || `피어 ${peer.id.slice(0, 6)}`,
      value: peer.id,
    }))
})

watch(peers, (newPeers) => {
  const isSelectedPeerStillConnected = newPeers.some(p => p.id === selectedPeerId.value && p.isConnected)

  if (selectedPeerId.value && !isSelectedPeerStillConnected) {
    selectedPeerId.value = ''
  }

  if (!selectedPeerId.value && peerOptions.value.length > 0) {
    selectedPeerId.value = peerOptions.value[0].value
  }
}, { deep: true, immediate: true })

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(target.files)]
  }
}

const handleDrop = (event: DragEvent) => {
  if (!hasConnectedPeers.value) return
  
  const files = event.dataTransfer?.files
  if (files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(files)]
  }
}

const removeFile = (fileToRemove: File) => {
  selectedFiles.value = selectedFiles.value.filter(file => file !== fileToRemove)
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) {
    return 'i-heroicons-photo'
  } else if (type.startsWith('video/')) {
    return 'i-heroicons-film'
  } else if (type.startsWith('audio/')) {
    return 'i-heroicons-musical-note'
  } else if (type.includes('pdf')) {
    return 'i-heroicons-document-text'
  } else if (type.includes('zip') || type.includes('archive')) {
    return 'i-heroicons-archive-box'
  } else if (type.includes('word') || type.includes('doc')) {
    return 'i-heroicons-document-text'
  } else if (type.includes('excel') || type.includes('sheet')) {
    return 'i-heroicons-table-cells'
  } else if (type.includes('powerpoint') || type.includes('presentation')) {
    return 'i-heroicons-presentation-chart-bar'
  } else {
    return 'i-heroicons-document'
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const sendFiles = async () => {
  if (!selectedPeerId.value || selectedFiles.value.length === 0) return;

  isSending.value = true;
  try {
    selectedFiles.value.forEach(file => sendFile(file, selectedPeerId.value));
    console.log('🚀 Files sent successfully');
  } catch (error) {
    console.error('❌ File transfer failed:', error);
  } finally {
    isSending.value = false;
  }
}
</script>
