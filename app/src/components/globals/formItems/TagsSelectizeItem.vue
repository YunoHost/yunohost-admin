<template>
  <div class="tags-selectize">
    <BFormTags
      v-bind="$attrs"
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      :id="id"
      size="lg"
      class="p-0 border-0"
      no-outer-focus
    >
      <template #default="{ tags, disabled, addTag, removeTag }">
        <ul
          v-if="!noTags && tags.length > 0"
          class="list-inline d-inline-block mb-2"
        >
          <li
            v-for="tag in tags"
            :key="id + '-' + tag"
            class="list-inline-item"
          >
            <BFormTag
              @remove="onRemoveTag({ option: tag, removeTag })"
              :title="tag"
              :disabled="disabled || disabledItems.includes(tag)"
              class="border border-dark mb-2"
            >
              <YIcon v-if="tagIcon" :iname="tagIcon" /> {{ tag }}
            </BFormTag>
          </li>
        </ul>

        <BDropdown
          ref="dropdown"
          variant="outline-dark"
          block
          menu-class="w-100"
          @keydown.native="onDropdownKeydown"
        >
          <template #button-content>
            <YIcon iname="search-plus" /> {{ label }}
          </template>

          <BDropdownGroup class="search-group">
            <BDropdownForm @submit.stop.prevent="() => {}">
              <BFormGroup
                :label="$t('search.for', { items: itemsName })"
                label-cols-md="auto"
                label-size="sm"
                :label-for="id + '-search-input'"
                :invalid-feedback="
                  $tc('search.not_found', 0, {
                    items: $tc('items.' + itemsName, 0),
                  })
                "
                :state="searchState"
                :disabled="disabled"
                class="mb-0"
              >
                <BFormInput
                  ref="search-input"
                  v-model="search"
                  :id="id + '-search-input'"
                  type="search"
                  size="sm"
                  autocomplete="off"
                />
              </BFormGroup>
            </BDropdownForm>
            <BDropdownDivider />
          </BDropdownGroup>

          <BDropdownItemButton
            v-for="option in availableOptions"
            :key="option"
            @click="onAddTag({ option, addTag })"
          >
            {{ option }}
          </BDropdownItemButton>
          <BDropdownText v-if="!criteria && availableOptions.length === 0">
            <YIcon iname="exclamation-triangle" />
            {{
              $tc('items_verbose_items_left', 0, {
                items: $tc('items.' + itemsName, 0),
              })
            }}
          </BDropdownText>
        </BDropdown>
      </template>
    </BFormTags>
  </div>
</template>

<script>
export default {
  compatConfig: { MODE: 3 },
  name: 'TagsSelectizeItem',

  inheritAttrs: false,

  props: {
    modelValue: { type: Array, required: true },
    options: { type: Array, required: true },
    id: { type: String, required: true },
    placeholder: { type: String, default: null },
    limit: { type: Number, default: null },
    name: { type: String, default: null },
    itemsName: { type: String, required: true },
    disabledItems: { type: Array, default: () => [] },
    // By default `addTag` and `removeTag` have to be executed manually by listening to 'tag-update'.
    auto: { type: Boolean, default: false },
    noTags: { type: Boolean, default: false },
    label: { type: String, default: null },
    tagIcon: { type: String, default: null },
  },

  data() {
    return {
      search: '',
    }
  },

  computed: {
    criteria() {
      return this.search.trim().toLowerCase()
    },

    availableOptions() {
      const criteria = this.criteria
      const options = this.options.filter((opt) => {
        return (
          this.modelValue.indexOf(opt) === -1 &&
          !this.disabledItems.includes(opt)
        )
      })
      if (criteria) {
        return options.filter((opt) => opt.toLowerCase().indexOf(criteria) > -1)
      }
      return options
    },

    searchState() {
      return this.criteria && this.availableOptions.length === 0 ? false : null
    },
  },

  methods: {
    onAddTag({ option, addTag }) {
      this.$emit('tag-update', { action: 'add', option, applyMethod: addTag })
      this.search = ''
      if (this.auto) {
        addTag(option)
      }
    },

    onRemoveTag({ option, removeTag }) {
      this.$emit('tag-update', {
        action: 'remove',
        option,
        applyMethod: removeTag,
      })
      if (this.auto) {
        removeTag(option)
      }
    },

    onDropdownKeydown(e) {
      // Allow to start searching after dropdown opening
      if (
        !['Tab', 'Space'].includes(e.code) &&
        e.target === this.$refs.dropdown.$el.lastElementChild
      ) {
        this.$refs['search-input'].focus()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
:deep(.dropdown-menu) {
  max-height: 300px;
  overflow-y: auto;
  padding-top: 0;

  .search-group {
    padding-top: 0.5rem;
    position: sticky;
    top: 0;
    background-color: $white;
  }
}
</style>
