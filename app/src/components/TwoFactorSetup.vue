<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { renderSVG } from 'uqr'

import type { TwoFactorSetup } from '@/helpers/twofactor'
import { formatSecret } from '@/helpers/twofactor'

const props = defineProps<{
  setup: TwoFactorSetup
}>()

const { t } = useI18n()
const copied = ref(false)

// Generated locally from the otpauth:// URI: the secret never leaves the page
const qrSvg = computed(() => renderSVG(props.setup.uri, { border: 2 }))
const codesAsText = computed(() => props.setup.recovery_codes.join('\n') + '\n')

async function copyCodes() {
  try {
    await navigator.clipboard.writeText(codesAsText.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Clipboard API unavailable: codes stay visible on screen
  }
}

function downloadCodes() {
  const blob = new Blob(
    [
      t('twofactor.recovery_codes_file_header', { host: location.host }),
      '\n\n',
      codesAsText.value,
    ],
    { type: 'text/plain' },
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `recovery-codes-${location.host}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div>
    <h3 class="h5">1. {{ t('twofactor.step_scan') }}</h3>
    <p>{{ t('twofactor.step_scan_help') }}</p>

    <!-- QR codes need a light background, whatever the theme -->
    <div
      class="twofactor-qr bg-white rounded p-2 mx-auto mb-2"
      role="img"
      :aria-label="t('twofactor.qr_code_label')"
      v-html="qrSvg"
    />

    <details class="mb-4">
      <summary>{{ t('twofactor.cant_scan') }}</summary>
      <p class="mt-2 mb-1">{{ t('twofactor.manual_key') }}</p>
      <code class="d-block fs-5 p-2 bg-body-tertiary rounded text-break">
        {{ formatSecret(setup.secret) }}
      </code>
    </details>

    <h3 class="h5">2. {{ t('twofactor.step_save_codes') }}</h3>
    <YAlert variant="warning">
      {{ t('twofactor.recovery_codes_explain') }}
    </YAlert>
    <ul
      class="twofactor-codes list-unstyled font-monospace fs-5 p-3 mb-2 bg-body-tertiary rounded"
      :aria-label="t('twofactor.recovery_codes')"
    >
      <li v-for="code in setup.recovery_codes" :key="code">{{ code }}</li>
    </ul>
    <div class="d-flex gap-2 mb-4">
      <BButton size="sm" variant="info" @click="copyCodes">
        <YIcon iname="copy" />
        {{ copied ? t('twofactor.copied') : t('twofactor.copy') }}
      </BButton>
      <BButton size="sm" variant="info" @click="downloadCodes">
        <YIcon iname="download" />
        {{ t('twofactor.download') }}
      </BButton>
    </div>

    <h3 class="h5">3. {{ t('twofactor.step_confirm') }}</h3>
  </div>
</template>

<style scoped>
.twofactor-qr {
  width: 14rem;
  height: 14rem;
}
.twofactor-qr :deep(svg) {
  width: 100%;
  height: 100%;
}
.twofactor-codes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 1.5rem;
}
</style>
