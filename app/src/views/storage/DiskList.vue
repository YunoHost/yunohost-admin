<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import api from '@/api'
import type { Disk } from '@/types/core/api.ts'

const { t } = useI18n()

function smartStatusBadgeAttrs(disk: Disk) {
  const common = {
    title: t(`storage_disks.infos.smart_status_icon_alt.${disk.smartStatus}`),
  }
  switch (disk.smartStatus) {
    case 'SANE':
      return { class: 'status bg-success', ...common }
    case 'CRITICAL':
      return { class: 'status bg-danger', ...common }
    default:
      return { class: 'status bg-secondary', ...common }
  }
}

const disks = await api
  .get<{
    disks: Disk[]
  }>({ uri: 'storage/disk/list?with_info&human_readable_size' })
  .then((result) => {
    return result.disks.length ? result.disks : null
  })
</script>

<template>
  <YAlert v-if="!disks" alert icon="exclamation-triangle" variant="warning">
    {{ $t('items_verbose_count', { items: $t('items.inserted_disk', 0) }, 0) }}
  </YAlert>
  <BContainer v-else>
    <BRow>
      <BCol v-for="disk in disks" :key="disk.serial" :lg="4">
        <BCard>
          <BCardTitle class="d-flex align-items-center">
            <span v-bind="smartStatusBadgeAttrs(disk)" />{{ disk.model }}
            <div class="ms-auto">
              <YIcon
                v-if="disk.connection_bus == 'usb'"
                iname="usb"
                :title="$t('storage_disks.infos.usb_icon_alt')"
                role="img"
              />
              <YIcon
                v-if="disk.removable"
                iname="eject"
                :title="$t('storage_disks.infos.ejectable_icon_alt')"
                role="img"
                class="ms-2"
              />
            </div>
          </BCardTitle>
          <section class="disk-infos">
            <ul>
              <li>
                <strong>{{ $t('storage_disks.infos.serial') }} </strong>
                <span v-if="disk.serial.length >= 0">{{ disk.serial }}</span>
                <em v-else>{{ $t('storage_disks.infos.serial_unknown') }}</em>
              </li>
              <li>
                <strong>{{ $t('storage_disks.infos.size') }}</strong>
                {{ disk.size }}
              </li>
              <li>
                <strong>{{ $t('storage_disks.infos.type') }}</strong>
                {{ disk.type }}
                <template v-if="disk.rpm">({{ disk.rpm }} RPM)</template>
              </li>
            </ul>
          </section>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<style lang="scss" scoped>
.row {
  row-gap: 1rem;
}

.disk-infos ul {
  list-style: none;
  padding-left: 1rem;
  &,
  & * {
    white-space: nowrap;
  }
}

.status {
  border-radius: 100%;
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}
</style>
