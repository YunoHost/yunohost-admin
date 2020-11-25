<template>
  <div id="console">
    <b-list-group>
      <!-- HISTORY BAR -->
      <b-list-group-item
        class="d-flex align-items-center"
        :class="{ 'bg-best text-white': open }"
        ref="history-button"
        role="button" tabindex="0"
        :aria-expanded="open ? 'true' : 'false'" aria-controls="console-collapse"
        @mousedown.left.prevent="onHistoryBarClick"
        @keyup.enter.space.prevent="open = !open"
      >
        <h6 class="m-0">
          <icon iname="history" /> {{ $t('history.title') }}
        </h6>

        <div class="ml-auto">
          <!-- LAST ACTION -->
          <small v-if="lastAction">
            <u v-t="'history.last_action'" />
            {{ lastAction.uri | readableUri }} ({{ $t('history.methods.' + lastAction.method) }})
          </small>
        </div>
      </b-list-group-item>

      <!-- ACTION LIST -->
      <b-collapse id="console-collapse" v-model="open">
        <b-list-group-item class="p-0" id="history" ref="history">
          <!-- ACTION -->
          <b-list-group v-for="(action, i) in history" :key="i" flush>
            <!-- ACTION DESC -->
            <b-list-group-item class="sticky-top d-flex align-items-center">
              <div>
                <strong>{{ $t('action') }}:</strong>
                {{ action.uri | readableUri }}
                <small>({{ $t('history.methods.' + action.method) }})</small>
              </div>

              <time :datetime="action.date | hour" class="ml-auto">{{ action.date | hour }}</time>
            </b-list-group-item>

            <!-- ACTION MESSAGE -->
            <b-list-group-item
              v-for="({ type, text }, j) in action.messages" :key="j"
              :variant="type" v-html="text"
            />
          </b-list-group>
        </b-list-group-item>
      </b-collapse>
    </b-list-group>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'YnhConsole',

  props: {
    value: { type: Boolean, default: false },
    height: { type: [Number, String], default: 30 }
  },

  data () {
    return {
      open: false
    }
  },

  watch: {
    open (value) {
      // In case it is needed.
      this.$emit('toggle', value)
      if (value) {
        // Wait for DOM update and scroll if needed.
        this.$nextTick().then(this.scrollToLastAction)
      }
    },

    'lastAction.messages' () {
      if (!this.open) return
      this.$nextTick(this.scrollToLastAction)
    }
  },

  computed: mapGetters(['history', 'lastAction']),

  methods: {
    scrollToLastAction () {
      const historyElem = this.$refs.history
      const lastActionGroup = historyElem.lastElementChild
      if (lastActionGroup) {
        const lastItem = lastActionGroup.lastElementChild || lastActionGroup
        historyElem.scrollTop = lastItem.offsetTop
      }
    },

    onHistoryBarClick (e) {
      const history = this.$refs.history
      let mousePos = e.clientY

      const onMouseMove = ({ clientY }) => {
        if (!this.open) {
          history.style.height = '0px'
          this.open = true
        }
        const currentHeight = history.offsetHeight
        const nextSize = currentHeight + (mousePos - clientY)
        if (nextSize < 10 && nextSize < currentHeight) {
          // Close the console and reset its size if the user reduce it to less than 10px.
          mousePos = e.clientY
          history.style.height = null
          onMouseUp()
        } else {
          history.style.height = nextSize + 'px'
          mousePos = clientY
        }
      }

      // Delay the mouse move listener to distinguish a click from a drag.
      const listenToMouseMove = setTimeout(() => {
        history.style.height = history.offsetHeight + 'px'
        history.classList.remove('with-max')
        window.addEventListener('mousemove', onMouseMove)
      }, 200)

      const onMouseUp = () => {
        // Toggle opening if no mouse movement
        if (mousePos === e.clientY) {
          // add a max-height class if the box's height is not custom
          if (!history.style.height) {
            history.classList.add('with-max')
          }
          this.open = !this.open
        }
        clearTimeout(listenToMouseMove)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mouseup', onMouseUp)
    }
  },

  filters: {
    readableUri (uri) {
      return uri.split('?')[0].replace('/', ' > ')
    },

    hour (date) {
      return new Date(date).toLocaleTimeString()
    }
  }
}
</script>

<style lang="scss" scoped>
#console {
  position: sticky;
  z-index: 15;
  bottom: 0;

  margin-left: -1.5rem;
  width: calc(100% + 3rem);

  @include media-breakpoint-down(xs) {
    margin-left: -15px;
    width: calc(100% + 30px);

    & > .list-group {
      border-radius: 0;
    }
  }
}

#console-collapse {
  // disable collapse animation
  transition: none !important;
}

#history {
  overflow-y: auto;

  &.with-max {
    max-height: 30vh;
  }
}

.list-group-item {
  font-size: $font-size-sm;
  padding: $tooltip-padding-y $tooltip-padding-x;
}
</style>
