<script setup lang="ts">
import { watchThrottled } from '@vueuse/core'
import type { BListGroup } from 'bootstrap-vue-next'
import { nextTick, ref } from 'vue'

import type { RequestMessage } from '@/composables/useRequests'

const props = withDefaults(
  defineProps<{
    messages: RequestMessage[]
    fixedHeight?: boolean
    bordered?: boolean
    autoScroll?: boolean
    limit?: number
  }>(),
  {
    fixedHeight: false,
    bordered: false,
    autoScroll: false,
    limit: undefined,
  },
)

const rootElem = ref<InstanceType<typeof BListGroup> | null>(null)

const auto = ref(props.autoScroll)
const reducedMessages = ref<RequestMessage[]>([...props.messages])

watchThrottled(
  () => props.messages,
  (messages) => {
    const len = messages.length
    if (!props.limit || len <= props.limit) {
      reducedMessages.value = [...messages]
    } else {
      reducedMessages.value = messages.slice(len - props.limit)
    }
    if (auto.value) nextTick(scrollToEnd)
  },
  { throttle: 300, deep: true },
)

function scrollToEnd() {
  const elem = rootElem.value?.$el
  elem?.scrollTo(0, elem.lastElementChild.offsetTop)
}

function onScroll() {
  if (!props.autoScroll) return
  const elem = rootElem.value!.$el
  const { scrollHeight, scrollTop, clientHeight } = elem
  auto.value = scrollHeight === scrollTop + clientHeight
}
</script>
<template>
  <BListGroup
    ref="rootElem"
    flush
    :class="{ 'fixed-height': fixedHeight, bordered: bordered }"
    @scroll="onScroll"
  >
    <YListGroupItem
      v-if="limit && messages.length > limit"
      v-t="'api.partial_logs'"
      variant="info"
    />
    <YListGroupItem
      v-for="({ variant, text }, i) in reducedMessages"
      :key="i"
      :variant="variant"
      size="xs"
    >
      <span v-html="text" />
    </YListGroupItem>
  </BListGroup>
</template>

<style lang="scss" scoped>
.fixed-height {
  max-height: 20vh;
  overflow-y: auto;
}

.bordered {
  border: $card-border-width solid $card-border-color;
  @include border-radius($card-border-radius);
}
</style>
