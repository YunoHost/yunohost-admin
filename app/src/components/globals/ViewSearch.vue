<template>
  <div>
    <view-top-bar>
      <template #group-left>
        <b-input-group id="search-group" class="w-100">
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

      <slot name="top-bar-buttons" slot="group-right" />
    </view-top-bar>

    <b-alert v-if="items === null || filteredItems === null" variant="warning" show>
      <slot name="alert-message">
        <icon iname="exclamation-triangle" />
        {{ $t(items === null ? 'items_verbose_count' : 'search.not_found', { items: $tc('items.' + itemsName, 0) }) }}
      </slot>
    </b-alert>

    <slot v-else name="default" />

    <slot name="extra"/>
  </div>
</template>

<script>
export default {
  name: 'SearchView',

  props: {
    search: { type: String, required: true },
    itemsName: { type: String, required: true },
    items: { type: null, required: true },
    filteredItems: { type: null, required: true }
  }
}
</script>
