<script setup lang="ts">
import type { BAccordion, BCard } from 'bootstrap-vue-next'
import { computed, nextTick, ref } from 'vue'

import MessageListGroup from '@/components/MessageListGroup.vue'
import QueryHeader from '@/components/QueryHeader.vue'
import { useRequests } from '@/composables/useRequests'
import { useSettings } from '@/composables/useSettings'

const { historyList, showModal } = useRequests()
const { dark } = useSettings()
const rootElem = ref<InstanceType<typeof BCard> | null>(null)
const historyElem = ref<InstanceType<typeof BAccordion> | null>(null)
const open = ref(false)

const lastAction = computed(() => {
  return historyList.value[historyList.value.length - 1]
})

async function scrollToAction(actionIndex: number) {
  await nextTick()
  const actionCard = rootElem.value!.$el.querySelector(
    '#messages-collapse-' + actionIndex,
  ).parentElement
  const headerOffset = actionCard.firstElementChild.offsetHeight - 7
  // Can't use `scrollIntoView()` here since it will also scroll in the main content.
  historyElem.value!.$el.scrollTop = actionCard.offsetTop - headerOffset
}

async function onLastActionClick() {
  if (!open.value) {
    open.value = true
    await nextTick()
  }
  const hElem = historyElem.value!.$el
  const lastActionCard = hElem.lastElementChild as HTMLElement
  const lastCollapsable = lastActionCard.querySelector('.collapse')

  if (lastCollapsable && !lastCollapsable.classList.contains('show')) {
    const btn = lastActionCard.querySelector('.accordion-button') as HTMLElement
    btn.click()
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

  const hElem = historyElem.value!.$el
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
  const listenToMouseMove = window.setTimeout(() => {
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
      :variant="open ? 'best' : dark ? 'dark' : 'light'"
      tag="header"
      class="d-flex align-items-center"
      @mousedown.left.prevent="onHistoryBarClick"
      @keyup.space.enter.prevent="onHistoryBarKey"
    >
      <h5 class="m-0">
        <YIcon iname="history" />
        <span class="d-none d-sm-inline fw-bold ms-1">
          {{ $t('history.title') }}
        </span>
      </h5>

      <!-- CURRENT/LAST ACTION -->
      <BButton
        v-if="lastAction"
        size="sm"
        pill
        class="ms-auto me-2 py-0"
        :variant="open ? 'light' : 'best'"
        @click.prevent="onLastActionClick"
        @keyup.enter.space.prevent="onLastActionClick"
      >
        <small>{{ $t('history.last_action') }}</small>
      </BButton>
      <QueryHeader
        v-if="lastAction"
        :request="lastAction"
        type="overlay"
        class="w-auto d-none d-sm-flex"
      />
    </BCardHeader>

    <!-- ACTION LIST -->
    <BCollapse id="console-collapse" v-model="open">
      <BAccordion id="history" ref="historyElem" flush free>
        <p v-if="historyList.length === 0" class="alert m-0 px-2 py-1">
          {{ $t('history.is_empty') }}
        </p>
        <BAccordionItem
          v-for="(request, i) in historyList"
          v-else
          :id="`messages-collapse-${i}`"
          :key="i"
          header-class="sticky-top"
          button-class="d-flex p-2"
          header-tag="div"
          @show="scrollToAction(i)"
        >
          <template #title>
            <QueryHeader
              :request="request"
              type="history"
              class="me-2"
              @show-error="showModal"
            />
          </template>
          <MessageListGroup
            v-if="request.action && request.action.messages.length"
            :messages="request.action.messages"
          />
          <YListGroupItem v-else size="xs" variant="info">
            {{ $t('history.no_logs') }}
            <BLink
              v-if="request.action?.operationId"
              :to="{
                name: 'tool-log',
                params: { name: request.action?.operationId },
              }"
            >
              {{ $t('history.check_logs') }}
            </BLink>
          </YListGroupItem>
        </BAccordionItem>
      </BAccordion>
    </BCollapse>
  </BCard>
</template>

<style lang="scss" scoped>
.card-header {
  padding: $tooltip-padding-y $tooltip-padding-x;
}

#console {
  position: sticky;
  // To be able to read the console while waiting modal is displayed
  z-index: 1057;
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
:deep(.collapsing) {
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

  > :deep(.accordion) {
    // overlap borders
    margin-top: -1px;
  }
  :deep(.accordion-body) {
    padding: 0;
  }

  [aria-controls] {
    cursor: pointer;
  }
}
</style>
