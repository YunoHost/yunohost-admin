<script setup lang="ts">
import type { BCard } from 'bootstrap-vue-next'
import { getCurrentInstance, nextTick, ref } from 'vue'

import MessageListGroup from '@/components/MessageListGroup.vue'
import QueryHeader from '@/components/QueryHeader.vue'
import { useStoreGetters } from '@/store/utils'

// FIXME prop `value` not used?
const props = withDefaults(
  defineProps<{
    value?: boolean
    height?: number | string
  }>(),
  {
    value: false,
    height: 30,
  },
)

const { history, lastAction, waiting, error } = useStoreGetters()
const rootElem = ref<InstanceType<typeof BCard> | null>(null)
const historyElem = ref<HTMLElement | null>(null)
const open = ref(false)

function scrollToAction(actionIndex: number) {
  const actionCard = rootElem.value!.$el.querySelector(
    '#messages-collapse-' + actionIndex,
  ).parentElement
  const headerOffset = actionCard.firstElementChild.offsetHeight
  // Can't use `scrollIntoView()` here since it will also scroll in the main content.
  historyElem.value!.scrollTop = actionCard.offsetTop - headerOffset
}

async function onLastActionClick() {
  if (!open.value) {
    open.value = true
    await nextTick()
  }
  const hElem = historyElem.value!
  const lastActionCard = hElem.lastElementChild as HTMLElement
  const lastCollapsable = lastActionCard.querySelector('.collapse')

  if (lastCollapsable && !lastCollapsable.classList.contains('show')) {
    // FIXME not sure root emits still work with bvn
    const { emit: rootEmit } = getCurrentInstance()!
    rootEmit('bv::toggle::collapse', lastCollapsable.id)
    // `scrollToAction` will be triggered and will handle the scrolling.
  } else {
    const headerElem = lastActionCard.firstElementChild as HTMLElement
    hElem.scrollTop = lastActionCard.offsetTop - headerElem.offsetHeight
  }
}

function onHistoryBarKey(e: KeyboardEvent) {
  // FIXME interactive element in another is not valid, need to find another way.
  const { nodeName, parentElement } = e.target as HTMLElement
  if (nodeName === 'BUTTON' || parentElement?.nodeName === 'BUTTON') return
  open.value = !open.value
}

function onHistoryBarClick(e: MouseEvent) {
  // FIXME interactive element in another is not valid, need to find another way.
  const { nodeName, parentElement } = e.target as HTMLElement
  if (nodeName === 'BUTTON' || parentElement?.nodeName === 'BUTTON') return

  const hElem = historyElem.value!
  let mousePos = e.clientY

  const onMouseMove = ({ clientY }: MouseEvent) => {
    if (!open.value) {
      hElem.style.height = '0px'
      open.value = true
    }
    const currentHeight = hElem.offsetHeight
    const move = mousePos - clientY
    const nextSize = currentHeight + move
    if (nextSize < 10 && nextSize < currentHeight) {
      // Close the console and reset its size if the user reduce it to less than 10px.
      mousePos = e.clientY
      hElem.style.height = ''
      onMouseUp()
    } else {
      hElem.style.height = nextSize + 'px'
      // Simulate scroll when reducing the box so the content doesn't move.
      if (nextSize < currentHeight) {
        hElem.scrollBy(0, -move)
      }
      mousePos = clientY
    }
  }

  // Delay the mouse move listener to distinguish a click from a drag.
  const listenToMouseMove = setTimeout(() => {
    hElem.style.height = hElem.offsetHeight + 'px'
    hElem.classList.add('no-max')
    window.addEventListener('mousemove', onMouseMove)
  }, 200)

  const onMouseUp = () => {
    // Toggle opening if no mouse movement.
    if (mousePos === e.clientY) {
      // remove the free height class if the box's height is not custom
      if (!hElem.style.height) {
        hElem.classList.remove('no-max')
      }
      open.value = !open.value
    }
    clearTimeout(listenToMouseMove)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <BCard id="console" ref="rootElem" no-body>
    <!-- HISTORY BAR -->
    <BCardHeader
      role="button"
      tabindex="0"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="console-collapse"
      header-tag="header"
      :header-bg-variant="open ? 'best' : 'white'"
      :class="{ 'text-white': open }"
      class="d-flex align-items-center"
      @mousedown.left.prevent="onHistoryBarClick"
      @keyup.space.enter.prevent="onHistoryBarKey"
    >
      <h5 class="m-0">
        <YIcon iname="history" />
        <span class="d-none d-sm-inline fw-bold">
          {{ $t('history.title') }}
        </span>
      </h5>

      <!-- CURRENT/LAST ACTION -->
      <BButton
        v-if="lastAction"
        size="sm"
        pill
        class="ms-auto py-0"
        :variant="open ? 'light' : 'best'"
        @click.prevent="onLastActionClick"
        @keyup.enter.space.prevent="onLastActionClick"
      >
        <small>{{ $t('history.last_action') }}</small>
      </BButton>
      <QueryHeader
        v-if="lastAction"
        :request="lastAction"
        class="w-auto ms-2 xs-hide"
      />
    </BCardHeader>

    <BCollapse id="console-collapse" v-model="open">
      <div class="accordion" role="tablist" id="history" ref="historyElem">
        <p v-if="history.length === 0" class="alert m-0 px-2 py-1">
          {{ $t('history.is_empty') }}
        </p>

        <!-- ACTION LIST -->
        <BCard
          v-for="(action, i) in history"
          :key="i"
          no-body
          class="rounded-0 rounded-top border-start-0 border-right-0"
        >
          <!-- ACTION -->
          <BCardHeader
            header-tag="header"
            header-bg-variant="white"
            class="sticky-top d-flex"
          >
            <!-- ACTION DESC -->
            <QueryHeader
              role="tab"
              v-b-toggle="
                action.messages.length ? 'messages-collapse-' + i : undefined
              "
              :request="action"
              show-time
              show-error
            />
          </BCardHeader>

          <!-- ACTION MESSAGES -->
          <BCollapse
            v-if="action.messages.length"
            :id="'messages-collapse-' + i"
            accordion="my-accordion"
            role="tabpanel"
            @shown="scrollToAction(i)"
            @hide="scrollToAction(i)"
          >
            <MessageListGroup :messages="action.messages" />
          </BCollapse>
        </BCard>
      </div>
    </BCollapse>
  </BCard>
</template>

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

  @include media-breakpoint-down(sm) {
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
