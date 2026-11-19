<script setup lang="ts">
import type { ColorVariant } from 'bootstrap-vue-next'
import { ref } from 'vue'

withDefaults(
  defineProps<{
    id: string
    title: string
    content: string
    variant?: ColorVariant
  }>(),
  {
    variant: 'info',
  },
)

const open = ref(false)
</script>

<template>
  <span class="explain-what">
    <slot name="default" />
    <span class="explain-what-popover-container">
      <BButton
        variant="light"
        @focus="open = true"
        @blur="open = false"
        @click="open = !open"
      >
        <YIcon iname="question" />
        <span class="visually-hidden">
          {{ $t('details_about', { subject: title }) }}
        </span>
      </BButton>
      <!-- FIXME missing prop `trigger` in bvn https://github.com/bootstrap-vue-next/bootstrap-vue-next/issues/1275 and looks like `placement` doesn't work -->
      <BPopover
        v-model="open"
        placement="top"
        custom-class="explain-what-popover"
        :variant="variant"
        :title="title"
      >
        <span v-html="content" />
      </BPopover>
    </span>
  </span>
</template>

<style lang="scss" scoped>
.explain-what {
  line-height: 1.2;

  .btn {
    padding: 0;
    margin-left: 0.25rem;
    border-radius: 50rem;
    line-height: inherit;
    font-size: inherit;
  }

  :deep() {
    .popover {
      background-color: $gray-800;
      color: $black;
      border-width: 2px;

      [data-bs-theme='dark'] & {
        background-color: $white;
        color: $white;
      }

      .popover-body {
        color: $white;

        [data-bs-theme='dark'] & {
          color: $black;
        }
      }
    }
  }
}
</style>
