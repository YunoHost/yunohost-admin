<script setup lang="ts">
import api from '@/api'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { distanceToNow } from '@/helpers/filters/date'
import { useAutoModal } from '@/composables/useAutoModal'

const { t } = useI18n()
const modalConfirm = useAutoModal()

const { registration_requests } = await api.get<string>({
  uri: `users/registrations?raw`,
  initial: true,
}).then((registrationsData) => {
    return { registration_requests: ref(registrationsData.registration_requests) }
})

async function acceptRegistrationRequest(request_id) {
  const confirmed = await modalConfirm(t('confirm_user_registration_request_accept'))
  if (!confirmed) return

  // FIXME : also ask if we want to notify the user by email ?

  api.put({ uri: 'users/registrations/' + request_id + '/accept'}).then(() => {
      registration_requests.value = registration_requests.value.filter(
        (request) => request.id !== request_id,
      )
  })
}
async function rejectRegistrationRequest(request_id) {
  const confirmed = await modalConfirm(t('confirm_user_registration_request_reject'))
  if (!confirmed) return

  api.put({ uri: 'users/registrations/' + request_id + '/reject'}).then(() => {
      registration_requests.value = registration_requests.value.filter(
        (request) => request.id !== request_id,
      )
  })
}
</script>

<template>
  <div>
      <YAlert
        v-if="!registration_requests.length"
        variant="info"
      >
        {{ $t('items_verbose_count', { items: $t('items.registration_requests', 0) }, 0) }}
      </YAlert>

      <BListGroup v-else free>
        <BListGroupItem
          v-for="request in registration_requests"
          :key="request.id"
          class="ps-3 pe-3"
        >
          <div class="d-flex w-full justify-content-between align-items-center flex-column flex-sm-row">
          <div class="d-flex">
            <div>
              <div class="fs-5">
                <span class="fw-bold">{{ request.username }}</span>
                <span class="text-secondary">
                  @{{ request.domain }}
                </span>
              </div>
              <div class="m-0">
                  <YIcon iname="user" />
                  {{ request.fullname }}
              </div>
              <div v-if="request.external_email" class="m-0">
                  <YIcon iname="envelope" />
                  {{ request.external_email }}
              </div>
              <div class="m-0">
                  <YIcon iname="clock-o" />
                  {{ distanceToNow(request.submitted, true, true) }}
              </div>

            </div>
          </div>

          <div>
              <BButton
                class="me-3"
                variant="success"
                @click="acceptRegistrationRequest(request.id)"
              >
                  <YIcon iname="check" /> {{ $t('users_registration_request_accept') }}
              </BButton>
              <BButton
                variant="danger"
                @click="rejectRegistrationRequest(request.id)"
              >
                  <YIcon iname="times" /> {{ $t('users_registration_request_reject') }}
              </BButton>
          </div>
          </div>
          <div v-if="request.notes" class="m-0 font-monospace" style="white-space: pre-wrap;">
              <hr/>
              <YIcon iname="comment-o" />
              {{ request.notes }}
          </div>
        </BListGroupItem>
      </BListGroup>
  </div>
</template>
