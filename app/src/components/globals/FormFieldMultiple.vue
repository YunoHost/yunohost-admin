<script
  setup
  lang="ts"
  generic="C extends AnyWritableComponents, MV extends any[]"
>
import { computed, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'

import { omit } from '@/helpers/commons'
import type { ArrInnerType } from '@/types/commons'
import type {
  AnyWritableComponents,
  BaseItemComputedProps,
  FormField,
  FormFieldProps,
  ItemComponentToItemProps,
} from '@/types/form'

defineOptions({
  name: 'FormField',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<
    FormFieldProps<C, MV> & {
      defaultValue?: () => ArrInnerType<MV>
      addBtnText?: string
    }
  >(),
  {
    append: undefined,
    asInputGroup: false,
    component: undefined,
    cProps: undefined,
    description: undefined,
    descriptionVariant: undefined,
    id: undefined,
    label: undefined,
    labelFor: undefined,
    link: undefined,
    prepend: undefined,
    rules: undefined,
    defaultValue: undefined,
    addBtnText: undefined,

    validation: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [modelValue: MV]
}>()

const slots = defineSlots<{
  default?: (_: {
    componentProps: ItemComponentToItemProps[C] & BaseItemComputedProps
    index: number
  }) => any
  description?: () => any
}>()

const modelValue = defineModel<MV>()

const { t } = useI18n()

const attrs = useAttrs()

const computedAttrs = computed(() => {
  const attrs_ = { ...omit(attrs, ['hr', 'readonly', 'visible']) }

  if (props.label) {
    const defaultAttrs = {
      'label-cols-md': 4,
      'label-cols-lg': 3,
      'label-class': ['fw-bold', 'py-0'],
    }

    if (!('label-cols' in attrs_)) {
      let attr: keyof typeof defaultAttrs
      for (attr in defaultAttrs) {
        if (!(attr in attrs_)) attrs_[attr] = defaultAttrs[attr]
      }
    } else if (!('label-class' in attrs_)) {
      attrs_['label-class'] = defaultAttrs['label-class']
    }
  }

  return attrs_
})

const id = computed(() => {
  if (props.id) return props.id
  return props.cProps?.id ? props.cProps?.id + '_group' : undefined
})

const error = computed(() => {
  const v = props.validation
  if (v && v.$dirty) {
    return v.$errors.length ? { errors: v.$errors, $model: v.$model } : null
  }
  return null
})

const subProps = computed<FormFieldProps<C, ArrInnerType<MV>>[]>(() => {
  return (
    modelValue.value?.map((modelValue: ArrInnerType<MV>, i) => {
      return {
        cProps: {
          ...(props.cProps ?? ({} as ItemComponentToItemProps[C])),
          id: `${props.cProps?.id}.${i}`,
        },
        validation: props.validation?.[i],
        modelValue,
        component: props.component,
      }
    }) || []
  )
})

const state = computed(() => {
  // Need to set state as null if no error, else component turn green
  return error.value ? false : null
})

const errorMessage = computed(() => {
  if (!error.value) return ''
  const { errors, $model } = error.value
  // FIXME maybe handle translation in validators directly
  // https://vuelidate-next.netlify.app/advanced_usage.html#i18n-support

  return errors
    .map((err) => {
      if (err) {
        if (err.$validator === '$externalResults') return err.$message
        return t('form_errors.' + err.$validator, {
          value: $model,
          ...err.$params,
        })
      }
    })
    .join('<br>')
})

function addElement() {
  const value = [...(modelValue.value || []), props.defaultValue!()] as MV
  emit('update:modelValue', value)

  // FIXME: Focus newly inserted form item
}

function removeElement(index: number) {
  if (!modelValue.value) return
  const value = [...modelValue.value] as MV
  value.splice(index, 1)
  emit('update:modelValue', value)
}

function updateElement(index: number, newValue: ArrInnerType<MV>) {
  if (!modelValue.value) return
  const value = [...modelValue.value] as MV
  value.splice(index, 1, newValue)
  emit('update:modelValue', value)
}
</script>

<template>
  <BFormGroup v-bind="computedAttrs" :id="id" :label="label" :state="state">
    <div v-for="(fieldProps, index) in subProps" :key="index" class="item">
      <!-- @vue-expect-error -->
      <FormField
        v-bind="fieldProps"
        class="w-100 mb-3"
        @update:model-value="updateElement(index, $event as ArrInnerType<MV>)"
      >
        <template v-if="slots.default" #default="componentProps">
          <!-- @vue-expect-error -->
          <slot v-bind="{ componentProps, index }" />
        </template>
      </FormField>

      <BButton
        v-if="defaultValue !== undefined"
        variant="danger"
        @click="removeElement(index)"
      >
        <YIcon :title="$t('delete')" iname="trash-o" />
        <span class="visually-hidden">{{ $t('delete') }}</span>
      </BButton>
    </div>

    <BButton
      v-if="defaultValue !== undefined"
      variant="success"
      @click="addElement()"
    >
      <YIcon iname="plus" /> {{ addBtnText ?? $t('add') }}
    </BButton>

    <!-- FIXME is it needed? or more generic error like "errors in this multiple fields" -->
    <template #invalid-feedback>
      <span v-html="errorMessage" />
    </template>

    <template #description>
      <slot name="description">
        <!-- Render description -->
        <template v-if="description || link">
          <div class="d-flex">
            <BLink
              v-if="link"
              :to="'name' in link ? { name: link.name } : undefined"
              :href="'href' in link ? link.href : undefined"
              class="ms-auto"
            >
              {{ link.text }}
            </BLink>
          </div>

          <VueShowdown
            v-if="description"
            :markdown="description"
            :class="{
              ['alert p-1 px-2 alert-' + descriptionVariant]:
                descriptionVariant,
            }"
          />
        </template>
      </slot>
    </template>
  </BFormGroup>
</template>

<style lang="scss" scoped>
:deep(.invalid-feedback code) {
  background-color: $gray-200;
}

.item {
  display: flex;
  justify-items: stretch;

  .btn-danger {
    align-self: flex-start;
    margin-left: 0.5rem;
  }
}
</style>
