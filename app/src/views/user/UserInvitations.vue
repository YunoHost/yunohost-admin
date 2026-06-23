<script setup lang="ts">
import api from '@/api'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { distanceToNow } from '@/helpers/filters/date'
import { useClipboard } from '@vueuse/core'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useAutoModal } from '@/composables/useAutoModal'

const { t } = useI18n()
const modalConfirm = useAutoModal()
const { text, copy, copied, isSupported } = useClipboard()

const { invitations } = await api.get({
  uri: `users/invitations?raw`,
  initial: true,
}).then((invitationsData) => {
    return { invitations: ref(invitationsData.invitations) }
})

async function cancelInvitation(invitationToken: string) {
  const confirmed = await modalConfirm(t('confirm_user_invitation_cancel'))
  if (!confirmed) return

  api.delete({ uri: 'users/invitations/' + invitationToken }).then(() => {
      invitations.value = invitations.value.filter(
        (invite) => invite.token !== invitationToken,
      )
  })
}

async function showInvitationQRCode(invitationURL: string) {
    const qrcode = await useQRCode(invitationURL);
    await modalConfirm("<center><div>" + t("users_invitation_share_qr_code") + "</div><img src='" + qrcode.value + "'/></center>", {title: "", noHeader: true}, { markdown: true, cancelable: false })
}

</script>

<template>
  <div>
      <TopBar>
        <template #group-right>
          <BButton variant="success" :to="{ name: 'user-invitations-new' }">
            <YIcon iname="plus" /> {{ $t('users_invite') }}
          </BButton>
        </template>
      </TopBar>

      <YAlert
        v-if="!invitations.length"
        variant="info"
      >
        {{ $t('items_verbose_count', { items: $t('items.invitations', 0) }, 0) }}
      </YAlert>

      <BListGroup v-else free>
        <BListGroupItem
          v-for="invitation in invitations"
          :key="invitation.token"
          class="d-flex justify-content-between align-items-center ps-3 pe-3"
        >
          <div class="col-6">
            <div>
              <div class="fs-5">
                <span class="fw-bold">{{ invitation.username || $t('users_invitation_username_to_be_chosen') }}</span>
                <span class="text-secondary">
                  @{{ invitation.domain }}
                </span>
              </div>
              <div v-if="invitation.external_email" class="m-0">
                  <YIcon iname="envelope" />
                  {{ invitation.external_email }}
              </div>
              <div v-if="invitation.groups && invitation.groups.length" class="m-0">
                  <YIcon iname="users" />
                  {{ invitation.groups.join(',') }}
              </div>
              <div class="m-0">
                  <YIcon iname="hourglass-2" />
                  {{ $t('users_invitation_expires_in', { timeRemaining: distanceToNow(invitation.expires, true, true) }) }}
              </div>
            </div>
          </div>

          <div class="d-flex flex-column flex-md-row">
              <BButton
                variant="outline-secondary"
                class="me-md-3 mb-1"
                @click="showInvitationQRCode(invitation.url)"
              >
                  <YIcon iname="qrcode" /> {{ $t('users_invitation_show_qrcode') }}
              </BButton>
              <BButton
                class="me-md-3 mb-1"
                :variant="!copied || text != invitation.url ? 'info' : 'success'"
                :disabled="!isSupported"
                @click="copy(invitation.url)"
              >
                  <span v-if="!copied || text != invitation.url"><YIcon iname="copy" /> {{ $t('users_invitation_copy_link') }}</span>
                  <span v-else><YIcon iname="check" /> {{ $t('users_invitation_copied') }}</span>
              </BButton>
              <BButton
                variant="danger"
                @click="cancelInvitation(invitation.token)"
              >
                  <YIcon iname="trash" /> {{ $t('users_invitation_cancel') }}
              </BButton>
          </div>
        </BListGroupItem>
      </BListGroup>
  </div>
</template>
