<template>
  <UApp>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <!-- 헤더 -->
      <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                <UIcon name="i-heroicons-share" class="h-6 w-6" />
              </div>
              <div>
                <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {{ $t('header.title') }}
                </h1>
                <p class="text-xs text-gray-500">{{ $t('header.subtitle') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <LanguageSwitcher />
              <UBadge v-if="isOnline" color="success" variant="subtle"
                class="bg-green-50 text-green-700 ring-green-200">
                🟢 {{ $t('header.online') }}
              </UBadge>
              <UBadge v-else color="error" variant="subtle" class="bg-red-50 text-red-700 ring-red-200">
                🔴 {{ $t('header.offline') }}
              </UBadge>
            </div>
          </div>
        </div>
      </header>

      <!-- 메인 콘텐츠 -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 피어 연결 -->
          <div class="lg:col-span-1 space-y-6">
            <PeerConnection />

            <!-- 통계 카드 -->
            <!-- <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-200">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-users" class="h-4 w-4 text-blue-500" />
                  <p class="text-xs font-medium text-gray-600">연결된 피어</p>
                </div>
                <p class="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div class="rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-200">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-arrow-up-tray" class="h-4 w-4 text-green-500" />
                  <p class="text-xs font-medium text-gray-600">전송 완료</p>
                </div>
                <p class="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div> -->
          </div>

          <!-- 파일 전송 및 진행 상황 -->
          <div class="lg:col-span-2 space-y-8">
            <!-- 파일 전송 컨트롤 -->
            <FileTransfer />

            <!-- 파일 전송 진행 상황 -->
            <FileTransferProgress />
          </div>
        </div>

        <!-- 사용법 안내 -->
        <div class="mt-8">
          <div class="relative overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
            <!-- 헤더 그라데이션 -->
            <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4">
              <div class="flex items-center gap-3 text-white">
                <UIcon name="i-heroicons-academic-cap" class="h-6 w-6" />
                <h2 class="text-xl font-bold">{{ $t('guide.title') }}</h2>
              </div>
            </div>

            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      1</div>
                    <h3 class="font-semibold text-gray-900">{{ $t('guide.peerConnection.title') }}</h3>
                  </div>
                  <ul class="text-sm text-gray-600 space-y-2 ml-11">
                    <li class="flex items-start gap-2">
                      <span class="text-blue-500 mt-0.5">•</span>
                      {{ $t('guide.peerConnection.step1') }}
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-500 mt-0.5">•</span>
                      {{ $t('guide.peerConnection.step2') }}
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-500 mt-0.5">•</span>
                      {{ $t('guide.peerConnection.step3') }}
                    </li>
                  </ul>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm">
                      2</div>
                    <h3 class="font-semibold text-gray-900">{{ $t('guide.fileTransfer.title') }}</h3>
                  </div>
                  <ul class="text-sm text-gray-600 space-y-2 ml-11">
                    <li class="flex items-start gap-2">
                      <span class="text-green-500 mt-0.5">•</span>
                      {{ $t('guide.fileTransfer.step1') }}
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-500 mt-0.5">•</span>
                      {{ $t('guide.fileTransfer.step2') }}
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-500 mt-0.5">•</span>
                      {{ $t('guide.fileTransfer.step3') }}
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-500 mt-0.5">•</span>
                      {{ $t('guide.fileTransfer.step4') }}
                    </li>
                  </ul>
                </div>
              </div>

              <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <div class="flex items-start gap-3">
                  <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div class="text-sm">
                    <p class="font-semibold text-amber-800 mb-1">{{ $t('guide.notice.title') }}</p>
                    <p class="text-amber-700">
                      {{ $t('guide.notice.content') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 푸터 -->
      <footer class="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <UIcon name="i-heroicons-heart" class="h-4 w-4 text-red-500" />
              <p class="text-sm text-gray-600">
                {{ $t('footer.madeWith') }}
                <span class="font-semibold text-green-600">Nuxt 3</span> +
                <span class="font-semibold text-blue-600">Nuxt UI 3</span> +
                <span class="font-semibold text-purple-600">WebRTC</span>
              </p>
            </div>
            <p class="text-xs text-gray-500">
              {{ $t('footer.experience') }}
            </p>
            <p class="text-xs text-gray-500">
              {{ $t('footer.writtenBy') }} <a href="https://github.com/Baw-Appie" target="_blank" class="text-blue-600">Baw-Appie</a> with GitHub Copilot (Claude Sonet 4)
            </p>
          </div>
        </div>
      </footer>
    </div>
  </UApp>
</template>

<script setup>
// const { $t } = useNuxtApp()
const { t } = useI18n()

// 온라인 상태 확인
const isOnline = ref(true)

// 브라우저 환경에서만 실행
onMounted(() => {
  if (process.client) {
    isOnline.value = navigator.onLine
    
    window.addEventListener('online', () => {
      isOnline.value = true
    })
    
    window.addEventListener('offline', () => {
      isOnline.value = false
    })
  }
})

// 페이지 메타데이터 설정
useHead({
  title: () => t('header.title'),
  meta: [
    {
      name: 'description',
      content: () => t('header.subtitle')
    }
  ]
})
</script>
