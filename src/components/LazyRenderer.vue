<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    unrender?: boolean
    minHeight?: number
    renderDelay?: number
    unrenderDelay?: number
    rootMargin?: string
  }>(),
  {
    unrender: true,
    minHeight: 0,
    renderDelay: 100,
    unrenderDelay: 2000,
    rootMargin: '300px',
  },
)

defineSlots<{
  default: any
}>()

const observer = ref<IntersectionObserver | null>(null)
const render = ref(false)
const fixedMinHeight = ref(props.minHeight)
const rootElem = ref<HTMLDivElement | null>(null)

onMounted(() => {
  let unrenderTimer: number
  let renderTimer: number

  observer.value = new IntersectionObserver(
    (entries) => {
      let intersecting = entries[0].isIntersecting

      // Fix for weird bug when typing fast in app search or on slow client.
      // Intersection is triggered but even if the element is indeed in the viewport,
      // isIntersecting is `false`, so we have to manually check this…
      // FIXME Would be great to find out why this is happening
      if (!intersecting && rootElem.value!.offsetTop < window.innerHeight) {
        intersecting = true
      }

      if (intersecting) {
        clearTimeout(unrenderTimer)
        // Show the component after a delay (to avoid rendering while scrolling fast)
        renderTimer = window.setTimeout(
          () => {
            render.value = true
          },
          props.unrender ? props.renderDelay : 0,
        )

        if (!props.unrender) {
          // Stop listening to intersections after first appearance if unrendering is not activated
          observer.value!.disconnect()
        }
      } else if (props.unrender) {
        clearTimeout(renderTimer)
        // Hide the component after a delay if it's no longer in the viewport
        unrenderTimer = window.setTimeout(() => {
          fixedMinHeight.value = rootElem.value!.clientHeight
          render.value = false
        }, props.unrenderDelay)
      }
    },
    { rootMargin: props.rootMargin },
  )

  observer.value.observe(rootElem.value!)
})

onBeforeUnmount(() => {
  observer.value!.disconnect()
})
</script>

<template>
  <div
    ref="rootElem"
    class="lazy-renderer"
    :style="`min-height: ${fixedMinHeight}px`"
  >
    <slot v-if="render" />
  </div>
</template>
