<script>
// Implementation of the feed pattern
// https://www.w3.org/WAI/ARIA/apg/patterns/feed/
import { h } from 'vue'
import { BCardGroup } from 'bootstrap-vue-next'

export default {
  name: 'CardDeckFeed',

  props: {
    stacks: { type: Number, default: 21 },
  },

  data() {
    return {
      busy: false,
      range: this.stacks,
      childrenCount: this.$slots.default()[0].children,
    }
  },

  methods: {
    getTopParent(prev) {
      return prev.parentElement === this.$refs.feed.$el
        ? prev
        : this.getTopParent(prev.parentElement)
    },

    onScroll() {
      const elem = this.$refs.feed.$el
      if (
        window.innerHeight >
        elem.clientHeight + elem.getBoundingClientRect().top - 200
      ) {
        this.busy = true
        this.range = Math.min(this.range + this.stacks, this.childrenCount)
        this.$nextTick().then(() => {
          this.busy = false
        })
      }
    },

    onKeydown(e) {
      if (['PageUp', 'PageDown'].includes(e.code)) {
        e.preventDefault()
        const key = e.code === 'PageUp' ? 'previous' : 'next'
        const sibling = this.getTopParent(e.target)[`${key}ElementSibling`]
        if (sibling) {
          sibling.focus()
          sibling.scrollIntoView({ block: 'center' })
        }
      }
      // FIXME Add `Home` and `End` shorcuts
    },
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll)
    this.$refs.feed.$el.addEventListener('keydown', this.onKeydown)
    this.onScroll()
  },

  beforeUpdate() {
    const slots = this.$slots.default()[0].children
    if (this.childrenCount !== slots.length) {
      this.range = this.stacks
      this.childrenCount = slots.length
    }
  },

  render() {
    return h(
      BCardGroup,
      {
        deck: true,
        role: 'feed',
        'aria-busy': this.busy.toString(),
        ref: 'feed',
      },
      {
        default: () => this.$slots.default()[0].children.slice(0, this.range),
      },
    )
  },

  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
    this.$refs.feed.$el.removeEventListener('keydown', this.onKeydown)
  },
}
</script>
