<template>
  <b-card no-body id="console">
    <!-- HISTORY BAR -->
    <b-card-header
      role="button" tabindex="0"
      :aria-expanded="open ? 'true' : 'false'" aria-controls="console-collapse"
      header-tag="header" :header-bg-variant="open ? 'best' : 'white'"
      :class="{ 'text-white': open }"
      class="d-flex align-items-center"
      @mousedown.left.prevent="onHistoryBarClick"
      @keyup.space.enter.prevent="onHistoryBarKey"
    >
      <h5 class="m-0">
        <icon iname="history" /> <span class="d-none d-sm-inline font-weight-bold">{{ $t('history.title') }}</span>
      </h5>

      <!-- CURRENT/LAST ACTION -->
      <b-button
        v-if="lastAction"
        size="sm" pill
        class="ml-auto py-0"
        :variant="open ? 'light' : 'best'"
        @click.prevent="onLastActionClick"
        @keyup.enter.space.prevent="onLastActionClick"
      >
        <small>{{ $t('history.last_action') }}</small>
      </b-button>
      <query-header v-if="lastAction" :request="lastAction" class="w-auto ml-2 xs-hide" />
    </b-card-header>

    <b-collapse id="console-collapse" v-model="open">
      <div
        class="accordion" role="tablist"
        id="history" ref="history"
      >
        <p v-if="history.length === 0" class="alert m-0 px-2 py-1">
          {{ $t('history.is_empty') }}
        </p>

        <!-- ACTION LIST -->
        <b-card
          v-for="(action, i) in history" :key="i"
          no-body class="rounded-0 rounded-top border-left-0 border-right-0"
        >
          <!-- ACTION -->
          <b-card-header header-tag="header" header-bg-variant="white" class="sticky-top d-flex">
            <!-- ACTION DESC -->
            <query-header
              role="tab" v-b-toggle="action.messages.length ? 'messages-collapse-' + i : false"
              :request="action" show-time show-error
            />
          </b-card-header>

          <!-- ACTION MESSAGES -->
          <b-collapse
            v-if="action.messages.length"
            :id="'messages-collapse-' + i" accordion="my-accordion"
            role="tabpanel"
            @shown="scrollToAction(i)"
            @hide="scrollToAction(i)"
          >
            <message-list-group :messages="action.messages" />
          </b-collapse>
        </b-card>
      </div>
    </b-collapse>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'

import QueryHeader from '@/components/QueryHeader.vue'
import MessageListGroup from '@/components/MessageListGroup.vue'

export default {
  name: 'HistoryConsole',

  components: {
    QueryHeader,
    MessageListGroup
  },

  props: {
    value: { type: Boolean, default: false },
    height: { type: [Number, String], default: 30 }
  },

  data () {
    return {
      open: false
    }
  },

  computed: {
    ...mapGetters(['history', 'lastAction', 'waiting', 'error'])
  },

  methods: {
    scrollToAction (actionIndex) {
      const actionCard = this.$el.querySelector('#messages-collapse-' + actionIndex).parentElement
      const headerOffset = actionCard.firstElementChild.offsetHeight
      // Can't use `scrollIntoView()` here since it will also scroll in the main content.
      this.$refs.history.scrollTop = actionCard.offsetTop - headerOffset
    },

    async onLastActionClick () {
      if (!this.open) {
        this.open = true
        await this.$nextTick()
      }
      const historyElem = this.$refs.history
      const lastActionCard = historyElem.lastElementChild
      const lastCollapsable = lastActionCard.querySelector('.collapse')

      if (lastCollapsable && !lastCollapsable.classList.contains('show')) {
        this.$root.$emit('bv::toggle::collapse', lastCollapsable.id)
        // `scrollToAction` will be triggered and will handle the scrolling.
      } else {
        const headerOffset = lastActionCard.firstElementChild.offsetHeight
        historyElem.scrollTop = lastActionCard.offsetTop - headerOffset
      }
    },

    onHistoryBarKey (e) {
      // FIXME interactive element in another is not valid, need to find another way.
      if (e.target.nodeName === 'BUTTON' || e.target.parentElement.nodeName === 'BUTTON') return
      this.open = !this.open
    },

    onHistoryBarClick (e) {
      // FIXME interactive element in another is not valid, need to find another way.
      if (e.target.nodeName === 'BUTTON' || e.target.parentElement.nodeName === 'BUTTON') return

      const historyElem = this.$refs.history
      let mousePos = e.clientY

      const onMouseMove = ({ clientY }) => {
        if (!this.open) {
          historyElem.style.height = '0px'
          this.open = true
        }
        const currentHeight = historyElem.offsetHeight
        const move = mousePos - clientY
        const nextSize = currentHeight + move
        if (nextSize < 10 && nextSize < currentHeight) {
          // Close the console and reset its size if the user reduce it to less than 10px.
          mousePos = e.clientY
          historyElem.style.height = ''
          onMouseUp()
        } else {
          historyElem.style.height = nextSize + 'px'
          // Simulate scroll when reducing the box so the content doesn't move.
          if (nextSize < currentHeight) {
            historyElem.scrollBy(0, -move)
          }
          mousePos = clientY
        }
      }

      // Delay the mouse move listener to distinguish a click from a drag.
      const listenToMouseMove = setTimeout(() => {
        historyElem.style.height = historyElem.offsetHeight + 'px'
        historyElem.classList.add('no-max')
        window.addEventListener('mousemove', onMouseMove)
      }, 200)

      const onMouseUp = () => {
        // Toggle opening if no mouse movement.
        if (mousePos === e.clientY) {
          // remove the free height class if the box's height is not custom
          if (!historyElem.style.height) {
            historyElem.classList.remove('no-max')
          }
          this.open = !this.open
        }
        clearTimeout(listenToMouseMove)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mouseup', onMouseUp)
    }
  }
}
</script>

<style lang="scss" scoped>
// reset default style
.card + .card {
  margin-top: 0;
}

.card-header {
  padding: $tooltip-padding-y $tooltip-padding-x;
}

#console {
  position: sticky;
  z-index: 15;
  bottom: 0;

  width: calc(100% + 3rem);
  margin-left: -1.5rem;
  border-bottom: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  font-size: $font-size-sm;


  & > header {
    cursor: ns-resize;
  }

  .btn {
    height: 1.25rem;
    display: flex;
    align-items: center;
  }

  @include media-breakpoint-down(xs) {
    margin-left: -15px;
    width: calc(100% + 30px);

    & > .card-header {
      border-radius: 0;
    }
  }
}

// Hacky disable of collapse animation
.collapsing {
  transition: none !important;
  height: auto !important;
  display: block !important;
  position: static !important;
}

#history {
  overflow-y: auto;
  max-height: 20vh;

  &.no-max {
    max-height: none;
  }

  > .card {
    // reset bootstrap's `overflow: hidden` that prevent sticky headers to work properly.
    overflow: visible;

    &:first-of-type {
      // hide first top border that conflicts with the console header's bottom border.
      margin-top: -1px;
    }
  }

  [aria-controls] {
    cursor: pointer;
  }
}
</style>
