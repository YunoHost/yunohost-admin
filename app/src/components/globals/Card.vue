<template>
  <b-card v-bind="$attrs" :no-body="collapsable ? true : $attrs['no-body']">
    <template #header>
      <div class="w-100 d-flex align-items-center flex-wrap custom-header">
        <slot name="header">
          <component :is="titleTag" class="custom-header-title">
            <icon v-if="icon" :iname="icon" class="mr-2" />{{ title }}
          </component>
        </slot>

        <div v-if="hasButtons" class="mt-2 w-100 custom-header-buttons" :class="{ [`ml-${buttonUnbreak}-auto mt-${buttonUnbreak}-0 w-${buttonUnbreak}-auto`]: buttonUnbreak }">
          <slot name="header-buttons" />
        </div>
      </div>

      <b-button
        v-if="collapsable" @click="visible = !visible"
        size="sm" variant="outline-secondary"
        class="align-self-center ml-auto" :class="{ 'not-collapsed': visible, 'collapsed': !visible, [`ml-${buttonUnbreak}-2`]: buttonUnbreak }"
      >
        <icon iname="chevron-right" />
        <span class="sr-only">{{ $t('words.collapse') }}</span>
      </b-button>
    </template>

    <b-collapse v-if="collapsable" :visible="visible">
      <slot v-if="('no-body' in $attrs)" name="default" />
      <b-card-body v-else>
        <slot name="default" />
      </b-card-body>
    </b-collapse>
    <slot v-else name="default" slot="default" />

    <slot name="footer" slot="footer">
      <slot name="buttons" />
    </slot>
  </b-card>
</template>

<script>

export default {
  name: 'Card',

  props: {
    id: { type: String, default: 'ynh-form' },
    title: { type: String, default: null },
    titleTag: { type: String, default: 'h2' },
    icon: { type: String, default: null },
    collapsable: { type: Boolean, default: false },
    collapsed: { type: Boolean, default: false },
    buttonUnbreak: { type: String, default: 'md' }
  },

  data () {
    return {
      visible: !this.collapsed
    }
  },

  computed: {
    hasButtons () {
      return 'header-buttons' in this.$slots
    }
  }
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;

  .custom-header {
    & > :first-child {
      margin-right: 1rem;
    }

    .btn + .btn {
      margin-left: .5rem;
    }
  }
}

.card-footer {
  display: flex;
  justify-content: flex-end;

  & > *:not(:first-child) {
    margin-left: .5rem;
  }
}
</style>
