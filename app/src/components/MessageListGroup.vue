<script setup lang="ts">
import type { BListGroup, ColorVariant } from 'bootstrap-vue-next'
import { computed, nextTick, watch, ref } from 'vue'

type ActionMessage = { color: ColorVariant; text: string }

const props = withDefaults(
  defineProps<{
    messages: ActionMessage[]
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

const auto = ref(true)
const rootElem = ref<InstanceType<typeof BListGroup> | null>(null)

if (props.autoScroll) {
  watch(() => props.messages, scrollToEnd, { deep: true })
}

const reducedMessages = computed(() => {
  const len = props.messages.length
  if (!props.limit || len <= props.limit) {
    return props.messages
  }
  return props.messages.slice(len - props.limit)
})

function scrollToEnd() {
  if (!auto.value) return
  nextTick(() => {
    rootElem.value!.$el.scrollTo(
      0,
      rootElem.value!.$el.lastElementChild.offsetTop,
    )
  })
}

function onScroll(e: Event) {
  const target = e.target as HTMLElement
  auto.value = target.scrollHeight === target.scrollTop + target.clientHeight
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
      variant="info"
      v-t="'api.partial_logs'"
    />

    <YListGroupItem
      v-for="({ color, text }, i) in reducedMessages"
      :key="i"
      :variant="color"
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
