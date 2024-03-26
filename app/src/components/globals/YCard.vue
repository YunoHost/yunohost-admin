<template>
  <BCard v-bind="$attrs" :no-body="collapsable ? true : $attrs['no-body']">
    <template #header>
      <div class="w-100 d-flex align-items-center flex-wrap custom-header">
        <slot name="header">
          <Component :is="titleTag" class="custom-header-title">
            <YIcon v-if="icon" :iname="icon" class="mr-2" />{{ title }}
          </Component>
          <slot name="header-next" />
        </slot>

        <div
          v-if="hasButtons"
          class="mt-2 w-100 custom-header-buttons"
          :class="{
            [`ml-${buttonUnbreak}-auto mt-${buttonUnbreak}-0 w-${buttonUnbreak}-auto`]:
              buttonUnbreak,
          }"
        >
          <slot name="header-buttons" />
        </div>
      </div>

      <BButton
        v-if="collapsable"
        @click="visible = !visible"
        size="sm"
        variant="outline-secondary"
        class="align-self-center ml-auto"
        :class="{
          'not-collapsed': visible,
          collapsed: !visible,
          [`ml-${buttonUnbreak}-2`]: buttonUnbreak,
        }"
      >
        <YIcon iname="chevron-right" />
        <span class="sr-only">{{ $t('words.collapse') }}</span>
      </BButton>
    </template>

    <BCollapse v-if="collapsable" :visible="visible">
      <slot v-if="'no-body' in $attrs" name="default" />
      <BCardBody v-else>
        <slot name="default" />
      </BCardBody>
    </BCollapse>
    <template v-else>
      <slot name="default" />
    </template>

    <template #footer v-if="'buttons' in $slots">
      <slot name="buttons" />
    </template>
  </BCard>
</template>

<script>
export default {
  compatConfig: { MODE: 3 },
  name: 'YCard',

  props: {
    id: { type: String, default: 'ynh-form' },
    title: { type: String, default: null },
    titleTag: { type: String, default: 'h2' },
    icon: { type: String, default: null },
    collapsable: { type: Boolean, default: false },
    collapsed: { type: Boolean, default: false },
    buttonUnbreak: { type: String, default: 'md' },
  },

  data() {
    return {
      visible: !this.collapsed,
    }
  },

  computed: {
    hasButtons() {
      return 'header-buttons' in this.$slots
    },
  },
}
</script>

<style lang="scss" scoped>
:deep(.card-header) {
  display: flex;

  .custom-header {
    & > :first-child {
      margin-right: 1rem;
    }

    .btn + .btn {
      margin-left: 0.5rem;
    }
  }
}

:deep(.card-footer) {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  & > *:not(:first-child) {
    margin-left: 0.5rem;
  }
}
:deep(.collapse:not(.show) + .card-footer) {
  display: none;
}
</style>
