<template>
  <view-base :queries="queries" @queries-response="formatCertData" ref="view">
    <card v-if="cert" :title="$t('certificate_status')" icon="lock">
      <p :class="'alert alert-' + cert.alert.type">
        <icon :iname="cert.alert.icon" /> {{ $t('certificate_alert_' + cert.alert.trad) }}
      </p>

      <b-row no-gutters class="row-line">
        <b-col md="4" xl="2">
          <strong v-t="'certificate_authority'" />
        </b-col>
        <b-col>{{ cert.type }} ({{ name }})</b-col>
      </b-row>

      <b-row no-gutters class="row-line">
        <b-col md="4" xl="2">
          <strong v-t="'validity'" />
        </b-col>
        <b-col>{{ $tc('day_validity', cert.validity) }}</b-col>
      </b-row>
    </card>

    <card v-if="cert" :title="$t('operations')" icon="wrench">
      <!-- CERT INSTALL LETSENCRYPT -->
      <template v-if="actionsEnabled.installLetsencrypt">
        <p>
          <icon :iname="cert.acmeEligible ? 'check' : 'meh-o'" /> <span v-html="$t(`domain_${cert.acmeEligible ? 'is' : 'not'}_eligible_for_ACME`)" />
        </p>

        <b-button @click="callAction('install_LE')" variant="success" :disabled="!cert.acmeEligible">
          <icon iname="star" /> {{ $t('install_letsencrypt_cert') }}
        </b-button>
        <hr>
      </template>

      <!-- CERT RENEW LETS-ENCRYPT -->
      <template v-if="actionsEnabled.manualRenewLetsencrypt">
        <p v-t="'manually_renew_letsencrypt_message'" />

        <b-button @click="callAction('manual_renew_LE')" variant="warning">
          <icon iname="refresh" /> {{ $t('manually_renew_letsencrypt') }}
        </b-button>
        <hr>
      </template>

      <!-- CERT REGEN SELF-SIGNED -->
      <template v-if="actionsEnabled.regenSelfsigned">
        <p v-t="'regenerate_selfsigned_cert_message'" />

        <b-button @click="callAction('regen_selfsigned')" variant="warning">
          <icon iname="refresh" /> {{ $t('regenerate_selfsigned_cert') }}
        </b-button>
        <hr>
      </template>

      <!-- CERT REPLACE WITH SELF-SIGNED -->
      <template v-if="actionsEnabled.replaceWithSelfsigned">
        <p v-t="'revert_to_selfsigned_cert_message'" />

        <b-button @click="callAction('revert_to_selfsigned')" variant="danger">
          <icon iname="exclamation-triangle" /> {{ $t('revert_to_selfsigned_cert') }}
        </b-button>
        <hr>
      </template>
    </card>

    <template #skeleton>
      <card-info-skeleton :item-count="2" />
      <card-buttons-skeleton :item-count="2" />
    </template>
  </view-base>
</template>

<script>
import api from '@/api'

export default {
  name: 'DomainCert',

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [`domains/cert-status/${this.name}?full`],
      cert: undefined,
      actionsEnabled: undefined
    }
  },

  methods: {
    formatCertAlert (code, type) {
      switch (code) {
        case 'critical': return { type: 'danger', trad: 'not_valid', icon: 'exclamation-circle' }
        case 'warning': return { type: 'warning', trad: 'selfsigned', icon: 'exclamation-triangle' }
        case 'attention':
          if (type === 'lets-encrypt') {
            return { type: 'warning', trad: 'letsencrypt_about_to_expire', icon: 'clock-o' }
          } else {
            return { type: 'danger', trad: 'about_to_expire', icon: 'clock-o' }
          }
        case 'good': return { type: 'success', trad: 'good', icon: 'check-circle' }
        case 'great': return { type: 'success', trad: 'great', icon: 'thumbs-up' }
        default: return { type: 'warning', trad: 'unknown', icon: 'question' }
      }
    },

    formatCertData (data) {
      const certData = data.certificates[this.name]

      const cert = {
        type: certData.CA_type.verbose,
        name: certData.CA_name,
        validity: certData.validity,
        acmeEligible: certData.ACME_eligible,
        alert: this.formatCertAlert(certData.summary.code, certData.CA_type.verbose)
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

      this.cert = cert
      this.actionsEnabled = actionsEnabled
    },

    async callAction (action) {
      const confirmed = await this.$askConfirmation(this.$i18n.t(`confirm_cert_${action}`))
      if (!confirmed) return

      let uri = 'domains/cert-install/' + this.name
      if (action === 'regen_selfsigned') uri += '?self_signed'
      else if (action === 'manual_renew_LE') uri += '?force'
      else if (action === 'revert_to_selfsigned') uri += '?self_signed&force'
      // FIXME trigger loading ? while posting ? while getting ?
      // this.$refs.view.fallback_loading = true
      api.post(uri).then(this.$refs.view.fetchQueries)
    }
  }
}
</script>
