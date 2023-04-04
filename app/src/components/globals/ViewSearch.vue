<template>
  <view-base v-bind="$attrs" v-on="$listeners" :skeleton="skeleton">
    <template v-if="hasCustomTopBar" #top-bar>
      <slot name="top-bar" />
    </template>
    <template v-if="!hasCustomTopBar" #top-bar-group-left>
      <b-input-group class="w-100">
        <b-input-group-prepend is-text>
          <icon iname="search" />
        </b-input-group-prepend>

        <b-form-input
          id="top-bar-search"
          :value="search" @input="$emit('update:search', $event)"
          :placeholder="$t('search.for', { items: $tc('items.' + itemsName, 2) })"
          :disabled="!items"
        />
      </b-input-group>
    </template>
    <template v-if="!hasCustomTopBar" #top-bar-group-right>
      <slot name="top-bar-buttons" />
    </template>

    <template #top>
      <slot name="top" />
    </template>

    <template #default>
      <b-alert v-if="items === null || filteredItems === null" variant="warning">
        <slot name="alert-message">
          <icon iname="exclamation-triangle" />
          {{ $tc(items === null ? 'items_verbose_count': 'search.not_found', 0, { items: $tc('items.' + itemsName, 0) }) }}
        </slot>
      </b-alert>

      <slot v-else name="default" />
    </template>

    <template #bot>
      <slot name="bot" />
    </template>

    <template #skeleton>
      <slot name="skeleton" />
    </template>
  </view-base>
</template>

<script>
export default {
  name: 'ViewSearch',

  props: {
    items: { type: null, required: true },
    itemsName: { type: String, required: true },
    filteredItems: { type: null, required: true },
    search: { type: String, default: null },
    skeleton: { type: String, default: 'list-group-skeleton' }
  },

  computed: {
    hasCustomTopBar () {
      return 'top-bar' in this.$slots
    }
  }
}
</script>
