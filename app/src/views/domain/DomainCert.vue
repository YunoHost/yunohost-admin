<template>
  <div class="domain-cert" v-if="cert">
    <b-card class="mb-3">
      <template v-slot:header>
        <h2><icon iname="lock" /> {{ $t('certificate_status') }}</h2>
      </template>

      <p :class="'alert alert-' + cert.alert.type">
        <icon :iname="cert.alert.icon" /> {{ $t('certificate_alert_' + cert.alert.trad) }}
      </p>

      <dl>
        <dt v-t="'certificate_authority'" />
        <dd>{{ cert.type }} ({{ name }})</dd>
        <hr>
        <dt v-t="'validity'" />
        <dd>{{ $tc('pluralized.day_validity', cert.validity) }}</dd>
      </dl>
    </b-card>

    <b-card>
      <template v-slot:header>
        <h2><icon iname="wrench" /> {{ $t('operations') }}</h2>
      </template>

      <!-- CERT INSTALL LETSENCRYPT -->
      <template v-if="actionsEnabled.installLetsencrypt">
        <p>
          <icon :iname="cert.acmeEligible ? 'check' : 'meh-o'" /> <span v-html="$t(`domain_${cert.acmeEligible ? 'is' : 'not'}_eligible_for_ACME`)" />
        </p>
        <b-button
          variant="success" :disabled="!cert.acmeEligible"
          @click="action = 'install_LE'" v-b-modal.action-confirm-modal
        >
          <icon iname="star" /> {{ $t('install_letsencrypt_cert') }}
        </b-button>
        <hr>
      </template>

      <!-- CERT RENEW LETS-ENCRYPT -->
      <template v-if="actionsEnabled.manualRenewLetsencrypt">
        <p v-t="'manually_renew_letsencrypt_message'" />
        <b-button variant="warning" @click="action = 'manual_renew_LE'" v-b-modal.action-confirm-modal>
          <icon iname="refresh" /> {{ $t('manually_renew_letsencrypt') }}
        </b-button>
        <hr>
      </template>

      <!-- CERT REGEN SELF-SIGNED -->
      <template v-if="actionsEnabled.regenSelfsigned">
        <p v-t="'regenerate_selfsigned_cert_message'" />
        <b-button variant="warning" @click="action = 'regen_selfsigned'" v-b-modal.action-confirm-modal>
          <icon iname="refresh" /> {{ $t('regenerate_selfsigned_cert') }}
        </b-button>
        <hr>
      </template>

      <!-- CERT REPLACE WITH SELF-SIGNED -->
      <template v-if="actionsEnabled.replaceWithSelfsigned">
        <p v-t="'revert_to_selfsigned_cert_message'" />
        <b-button variant="danger" @click="action = 'revert_to_selfsigned'" v-b-modal.action-confirm-modal>
          <icon iname="exclamation-triangle" /> {{ $t('revert_to_selfsigned_cert') }}
        </b-button>
        <hr>
      </template>
    </b-card>

    <!-- ACTIONS CONFIRMATION MODAL -->
    <b-modal
      v-if="action"
      id="action-confirm-modal" centered
      body-bg-variant="danger" body-text-variant="light"
      @ok="callAction" hide-header
    >
      {{ $t(`confirm_cert_${action}`) }}
    </b-modal>
  </div>
</template>

<script>
import api from '@/helpers/api'

export default {
  name: 'DomainCert',
  props: {
    name: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      cert: undefined,
      actionsEnabled: undefined,
      action: undefined
    }
  },

  methods: {
    fetchData () {
      // simply use the api helper since we will not store the request's result.
      api.get(`domains/cert-status/${this.name}?full`).then((data) => {
        const certData = data.certificates[this.name]

        const cert = {
          type: certData.CA_type.verbose,
          name: certData.CA_name,
          validity: certData.validity,
          acmeEligible: certData.ACME_eligible
        }

        switch (certData.summary.code) {
          case 'critical':
            cert.alert = { type: 'danger', trad: 'not_valid', icon: 'exclamation-circle' }
            break
          case 'warning':
            cert.alert = { type: 'warning', trad: 'selfsigned', icon: 'exclamation-triangle' }
            break
          case 'attention':
            if (cert.type === 'lets-encrypt') {
              cert.alert = { type: 'warning', trad: 'letsencrypt_about_to_expire', icon: 'clock-o' }
            } else {
              cert.alert = { type: 'danger', trad: 'about_to_expire', icon: 'clock-o' }
            }
            break
          case 'good':
            cert.alert = { type: 'success', trad: 'good', icon: 'check-circle' }
            break
          case 'great':
            cert.alert = { type: 'success', trad: 'great', icon: 'thumbs-up' }
            break
          default:
            cert.alert = { type: 'warning', trad: 'unknown', icon: 'question' }
        }

        const actionsEnabled = {
          installLetsencrypt: false,
          manualRenewLetsencrypt: false,
          regenSelfsigned: false,
          replaceWithSelfsigned: false
        }

        switch (certData.CA_type.code) {
          case 'self-signed':
            actionsEnabled.installLetsencrypt = true
            actionsEnabled.regenSelfsigned = true
            break
          case 'lets-encrypt':
            actionsEnabled.manualRenewLetsencrypt = true
            actionsEnabled.replaceWithSelfsigned = true
            break
          default:
            actionsEnabled.replaceWithSelfsigned = true
        }

        this.action = undefined
        this.cert = cert
        this.actionsEnabled = actionsEnabled
      })
    },

    callAction () {
      const action = this.action
      let uri = 'domains/cert-install/' + this.name
      if (action === 'regen_selfsigned') uri += '?self_signed'
      else if (action === 'manual_renew_LE') uri += '?force'
      else if (action === 'revert_to_selfsigned') uri += '?self_signed&force'

      api.post(uri, {}).then(response => {
        this.fetchData()
      }).catch(() => {
        // FIXME api POST calls seems to always return null, error or not
      })
    }
  },

  created () {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
</style>
