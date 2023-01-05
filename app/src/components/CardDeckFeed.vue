<script>
// Implementation of the feed pattern
// https://www.w3.org/WAI/ARIA/apg/patterns/feed/

export default {
  name: 'CardDeckFeed',

  props: {
    stacks: { type: Number, default: 21 }
  },

  data () {
    return {
      busy: false,
      range: this.stacks,
      childrenCount: this.$slots.default.length
    }
  },

  methods: {
    getTopParent (prev) {
      return prev.parentElement === this.$refs.feed ? prev : this.getTopParent(prev.parentElement)
    },

    onScroll () {
      const elem = this.$refs.feed
      if (window.innerHeight > elem.clientHeight + elem.getBoundingClientRect().top - 200) {
        this.busy = true
        this.range = Math.min(this.range + this.stacks, this.childrenCount)
        this.$nextTick().then(() => {
          this.busy = false
        })
      }
    },

    onKeydown (e) {
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
    }
  },

  mounted () {
    window.addEventListener('scroll', this.onScroll)
    this.$refs.feed.addEventListener('keydown', this.onKeydown)
    this.onScroll()
  },

  beforeUpdate () {
    const slots = this.$slots.default
    if (this.childrenCount !== slots.length) {
      this.range = this.stacks
      this.childrenCount = slots.length
    }
  },

  render (h) {
    return h(
      'b-card-group',
      {
        attrs: { role: 'feed', 'aria-busy': this.busy.toString() },
        props: { deck: true },
        ref: 'feed'
      },
      this.$slots.default.slice(0, this.range)
    )
  },

  beforeDestroy () {
    window.removeEventListener('scroll', this.onScroll)
    this.$refs.feed.removeEventListener('keydown', this.onKeydown)
  }
}
</script>
