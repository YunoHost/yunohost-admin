<template>
  <div class="lazy-renderer" :style="`min-height: ${fixedMinHeight}px`">
    <slot v-if="render" />
  </div>
</template>

<script>
export default {
  name: 'LazyRenderer',

  props: {
    unrender: { type: Boolean, default: true },
    minHeight: { type: Number, default: 0 },
    renderDelay: { type: Number, default: 100 },
    unrenderDelay: { type: Number, default: 2000 },
    rootMargin: { type: String, default: '300px' }
  },

  data () {
    return {
      observer: null,
      render: false,
      fixedMinHeight: this.minHeight
    }
  },

  mounted () {
    let unrenderTimer
    let renderTimer
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        clearTimeout(unrenderTimer)
        // Show the component after a delay (to avoid rendering while scrolling fast)
        renderTimer = setTimeout(() => {
          this.render = true
        }, this.unrender ? this.renderDelay : 0)

        if (!this.unrender) {
          // Stop listening to intersections after first appearance if unrendering is not activated
          this.observer.disconnect()
        }
      } else if (this.unrender) {
        clearTimeout(renderTimer)
        // Hide the component after a delay if it's no longer in the viewport
        unrenderTimer = setTimeout(() => {
          this.fixedMinHeight = this.$el.clientHeight
          this.render = false
        }, this.unrenderDelay)
      }
    }, { rootMargin: this.rootMargin })

    this.observer.observe(this.$el)
  },

  beforeDestroy () {
    this.observer.disconnect()
  }
}
</script>
