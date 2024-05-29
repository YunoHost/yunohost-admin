<script setup lang="ts">
// FIXME addTag removeTag types
import type { BDropdown, BFormInput } from 'bootstrap-vue-next'
import { computed, ref } from 'vue'

type TagUpdateArgs = {
  action: 'add' | 'remove'
  option: string
  applyFn: (tag: string) => void
}

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    // FIXME typing
    options: string[]
    id: string
    placeholder?: string
    limit?: number
    name?: string
    itemsName: string
    disabledItems?: string[]
    auto?: boolean
    noTags?: boolean
    label?: string
    tagIcon?: string
  }>(),
  {
    placeholder: undefined,
    limit: undefined,
    name: undefined,
    disabledItems: () => [],
    auto: false,
    noTags: false,
    label: undefined,
    tagIcon: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'tag-update': [value: TagUpdateArgs]
}>()

const search = ref('')
const searchElem = ref<InstanceType<typeof BDropdown> | null>(null)
const dropdownElem = ref<InstanceType<typeof BFormInput> | null>(null)

const criteria = computed(() => {
  return search.value.trim().toLowerCase()
})

const availableOptions = computed(() => {
  const options = props.options.filter((opt) => {
    return (
      props.modelValue.indexOf(opt) === -1 && !props.disabledItems.includes(opt)
    )
  })
  if (criteria.value) {
    return options.filter(
      (opt) => opt.toLowerCase().indexOf(criteria.value) > -1,
    )
  }
  return options
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

function onDropdownKeydown(e) {
  // Allow to start searching after dropdown opening
  // FIXME check if dropdownElem.value!.firstElementChild works (removed the $el)
  if (
    !['Tab', 'Space'].includes(e.code) &&
    e.target === dropdownElem.value!.$el.firstElementChild
  ) {
    searchElem.value!.$el.focus()
  }
}
</script>

<template>
  <div class="tags-selectize">
    <BFormTags
      v-bind="$attrs"
      :modelValue="modelValue"
      @update:modelValue="emit('update:modelValue', $event)"
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
              @remove="onRemoveTag(tag, removeTag)"
              :title="tag"
              :disabled="disabled || disabledItems.includes(tag)"
              class="border border-dark mb-2"
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
                :label="$t('search.for', { items: itemsName })"
                label-cols-md="auto"
                label-size="sm"
                :label-for="id + '-search-input'"
                :invalid-feedback="
                  $t(
                    'search.not_found',
                    {
                      items: $t('items.' + itemsName, 0),
                    },
                    0,
                  )
                "
                :state="searchState"
                :disabled="disabled"
                class="mb-0"
              >
                <BFormInput
                  ref="searchElem"
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
            @click="onAddTag(option, addTag)"
          >
            {{ option }}
          </BDropdownItemButton>
          <BDropdownText v-if="!criteria && availableOptions.length === 0">
            <YIcon iname="exclamation-triangle" />
            {{
              $t(
                'items_verbose_items_left',
                {
                  items: $t('items.' + itemsName, 0),
                },
                0,
              )
            }}
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
