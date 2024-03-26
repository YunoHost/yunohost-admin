import { h } from 'vue'
import { useModalController, BModal } from 'bootstrap-vue-next'
import { VueShowdown } from 'vue-showdown'

export function useAutoModal() {
  const { confirm, show } = useModalController()

  return function (
    message,
    props_,
    { markdown = false, cancelable = true } = {},
  ) {
    const props = {
      okTitle: this.$t('ok'),
      cancelTitle: this.$t('cancel'),
      centered: true,
      okOnly: !cancelable,
      ...(markdown
        ? { headerBgVariant: 'warning', headerClass: 'text-black' }
        : {
            hideHeader: true,
            bodyBgVariant: 'warning',
            bodyClass: ['fw-bold', 'rounded-top', 'text-black'],
          }),
      ...props_,
    }

    const fn = cancelable ? confirm : show
    return fn?.({
      props,
      component: h(BModal, null, {
        default: () =>
          markdown
            ? h(VueShowdown, {
                markdown: message,
                options: { headerLevelStart: 3 },
              })
            : message,
      }),
    })
  }
}
