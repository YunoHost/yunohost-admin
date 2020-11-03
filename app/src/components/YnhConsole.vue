<template>
  <div id="console">
    <b-list-group>
      <!-- HISTORY BAR -->
      <b-list-group-item class="d-flex align-items-center" :class="{ 'bg-best text-white': open }">
        <h6 class="m-0">
          <icon iname="history" /> {{ $t('history.title') }}
        </h6>

        <div class="ml-auto">
          <!-- LAST ACTION -->
          <small v-if="lastAction">
            <u v-t="'history.last_action'" />
            {{ lastAction.uri | readableUri }} ({{ $t('history.methods.' + lastAction.method) }})
          </small>

          <b-button
            v-b-toggle:console-collapse
            class="ml-2 px-1 py-0" size="sm" :variant="open ? 'light' : 'outline-dark'"
          >
            <icon iname="chevron-right" /><span class="sr-only">{{ $t('words.collapse') }}</span>
          </b-button>
        </div>
      </b-list-group-item>

      <!-- ACTION LIST -->
      <b-collapse id="console-collapse" v-model="open">
        <b-list-group-item class="p-0" id="history" ref="history">
          <!-- ACTION -->
          <b-list-group v-for="(action, i) in history" :key="i" flush>
            <!-- ACTION DESC -->
            <b-list-group-item class="sticky-top d-flex align-items-center" variant="dark">
              <div>
                <strong>{{ $t('action') }}:</strong>
                {{ action.uri | readableUri }}
                <small>({{ $t('history.methods.' + action.method) }})</small>
              </div>

              <time :datetime="action.date | hour" class="ml-auto">{{ action.date | hour }}</time>
            </b-list-group-item>

            <!-- ACTION MESSAGE -->
            <b-list-group-item v-for="({ type, text }, j) in action.messages" :key="j">
              <icon iname="comment" :class="'text-' + type" /> <span v-html="text" />
            </b-list-group-item>
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
  z-index: 5;
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

#history {
  overflow-y: auto;
  max-height: 30vh;
}

#collapse {
  // disable collapse animation
  transition: none !important;
}

.list-group-item {
  font-size: $font-size-sm;
  padding: $tooltip-padding-y $tooltip-padding-x;
}
</style>
