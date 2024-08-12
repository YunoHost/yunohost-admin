<script setup lang="ts">
import { BCardGroup } from 'bootstrap-vue-next'
import {
  getCurrentInstance,
  h,
  nextTick,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  ref,
} from 'vue'

// Implementation of the feed pattern
// https://www.w3.org/WAI/ARIA/apg/patterns/feed/

const props = withDefaults(defineProps<{ stacks?: number }>(), { stacks: 21 })
const slots = defineSlots<{
  default: any
}>()

const busy = ref(false)
const range = ref(props.stacks)
const childrenCount = ref(slots.default()[0].children.length)
const feedElem = ref<InstanceType<typeof BCardGroup> | null>(null)

function getTopParent(prev: HTMLElement): HTMLElement {
  return prev.parentElement === feedElem.value?.$el
    ? prev
    : getTopParent(prev.parentElement!)
}

const i = getCurrentInstance()
function onScroll() {
  const elem = feedElem.value?.$el
  if (
    window.innerHeight >
    elem.clientHeight + elem.getBoundingClientRect().top - 200
  ) {
    busy.value = true
    range.value = Math.min(range.value + props.stacks, childrenCount.value)
    nextTick().then(() => {
      busy.value = false
    })
  }
}

function onKeydown(e: KeyboardEvent) {
  if (['PageUp', 'PageDown'].includes(e.code)) {
    e.preventDefault()
    const key = e.code === 'PageUp' ? 'previous' : 'next'
    const sibling = getTopParent(e.target as HTMLElement)[
      `${key}ElementSibling`
    ] as HTMLElement | null
    sibling?.focus()
    sibling?.scrollIntoView({ block: 'center' })
  }
  // FIXME Add `Home` and `End` shorcuts
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  feedElem.value?.$el.addEventListener('keydown', onKeydown)
  onScroll()
})

onBeforeUpdate(() => {
  const children = slots.default()[0].children
  if (childrenCount.value !== children.length) {
    range.value = props.stacks
    childrenCount.value = children.length
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  feedElem.value?.$el.removeEventListener('keydown', onKeydown)
})

const root = () =>
  h(
    BCardGroup,
    {
      deck: true,
      role: 'feed',
      'aria-busy': busy.value,
      ref: feedElem,
    },
    {
      default: () => slots.default()[0].children.slice(0, range.value),
    },
  )
</script>

<template>
  <root />
</template>
