<script setup lang="ts">
import type { BDropdown, BFormInput } from 'bootstrap-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type {
  BaseItemComputedProps,
  TagsSelectizeItemProps,
} from '@/types/form'

type TagUpdateArgs = {
  action: 'add' | 'remove'
  option: string
  applyFn: (tag: string) => void
}

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<TagsSelectizeItemProps & BaseItemComputedProps<string[]>>(),
  {
    id: undefined,
    name: undefined,
    placeholder: undefined,
    touchKey: undefined,
    auto: false,
    disabledItems: undefined,
    label: undefined,
    limit: undefined,
    noTags: false,
    tagIcon: undefined,

    ariaDescribedby: undefined,
    modelValue: undefined,
    state: undefined,
    validation: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'tag-update': [value: TagUpdateArgs]
}>()

const model = defineModel<string[]>()
const searchElem = ref<InstanceType<typeof BDropdown> | null>(null)
const dropdownElem = ref<InstanceType<typeof BFormInput> | null>(null)

const { t } = useI18n()

const search = ref('')
const criteria = computed(() => {
  return search.value.trim().toLowerCase()
})
const availableOptions = computed(() => {
  const options = props.options.filter((opt) => {
    return (
      props.modelValue?.indexOf(opt) === -1 &&
      props.disabledItems?.includes(opt)
    )
  })
  if (criteria.value) {
    return options.filter(
      (opt) => opt.toLowerCase().indexOf(criteria.value) > -1,
    )
  }
  return options
})
const searchI18n = computed(() => {
  const params = { items: t('items.' + props.itemsName, 0) }
  return {
    label: t('search.for', { items: props.itemsName }),
    invalidFeedback: t('search.not_found', params, 0),
    noItems: t('items_verbose_items_left', params, 0),
  }
})
const searchState = computed(() => {
  return criteria.value && availableOptions.value.length === 0 ? false : null
})

function onAddTag(option: string, applyFn: TagUpdateArgs['applyFn']) {
  emit('tag-update', { action: 'add', option, applyFn })
  search.value = ''
  if (props.auto) {
    applyFn(option)
  }
}

function onRemoveTag(option: string, applyFn: TagUpdateArgs['applyFn']) {
  emit('tag-update', { action: 'remove', option, applyFn })
  if (props.auto) {
    applyFn(option)
  }
}

function onDropdownKeydown(e: KeyboardEvent) {
  // Allow to start searching after dropdown opening
  // FIXME check if dropdownElem.value!.firstElementChild works (removed the $el)
  if (
    !['Tab', 'Space'].includes(e.code) &&
    e.target === dropdownElem.value!.$el.firstElementChild
  ) {
    searchElem.value!.$el.focus()
  }
}

// FIXME call touch somewhere?
</script>

<template>
  <div class="tags-selectize">
    <BFormTags
      v-bind="$attrs"
      :id="id"
      v-model="model"
      :name="name"
      :aria-describedby="ariaDescribedby"
      :state="state"
      no-outer-focus
      size="lg"
      class="p-0 border-0"
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
              :title="tag"
              :disabled="disabled || disabledItems?.includes(tag)"
              class="border border-dark mb-2"
              @remove="onRemoveTag(tag, removeTag)"
            >
              <YIcon v-if="tagIcon" :iname="tagIcon" /> {{ tag }}
            </BFormTag>
          </li>
        </ul>

        <BDropdown
          ref="dropdownElem"
          variant="outline-dark"
          block
          menu-class="w-100"
          @keydown="onDropdownKeydown"
        >
          <template #button-content>
            <YIcon iname="search-plus" /> {{ label }}
          </template>

          <BDropdownGroup class="search-group">
            <BDropdownForm @submit.stop.prevent="() => {}">
              <BFormGroup
                :label="searchI18n.label"
                :label-for="id + '-search-input'"
                label-cols-md="auto"
                label-size="sm"
                :invalid-feedback="searchI18n.invalidFeedback"
                :state="searchState"
                :disabled="disabled"
                class="mb-0"
              >
                <BFormInput
                  :id="id + '-search-input'"
                  ref="searchElem"
                  v-model="search"
                  autocomplete="off"
                  size="sm"
                  type="search"
                />
              </BFormGroup>
            </BDropdownForm>
            <BDropdownDivider />
          </BDropdownGroup>

          <BDropdownItemButton
            v-for="option in availableOptions"
            :key="option"
            @click="onAddTag(option, addTag)"
          >
            {{ option }}
          </BDropdownItemButton>
          <BDropdownText v-if="!criteria && availableOptions.length === 0">
            <YIcon iname="exclamation-triangle" />
            {{ searchI18n.noItems }}
          </BDropdownText>
        </BDropdown>
      </template>
    </BFormTags>
  </div>
</template>

<style lang="scss" scoped>
:deep(.dropdown-menu) {
  max-height: 300px;
  overflow-y: auto;
  padding-top: 0;

  .search-group {
    padding-top: 0.5rem;
    position: sticky;
    top: 0;
  }
}

// FIXME bvn fix (should be fixed in lib)
:deep(.btn-group) {
  display: block;
  .btn {
    width: 100%;
  }
}
</style>
