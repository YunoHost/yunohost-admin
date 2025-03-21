<template>
  <YAlert v-if="!hasDisks" alert icon="exclamation-triangle" variant="warning">
    {{ $t('items_verbose_count', { items: $t('items.inserted_disk', 0) }, 0) }}
  </YAlert>
  <BContainer v-else>
    <BRow>
      <BCol v-for="disk in disks" :key="disk.serial" :lg="4">
        <BCard>
          <BCardTitle class="clearfix">
            <span v-bind="smartStatusBadgeAttrs(disk)" />{{ disk.model }}
            <span class="disks-icons float-end">
              <i
                v-if="disk.connection_bus == 'usb'"
                class="fa fa-usb"
                role="img"
                :title="$t('storage_disks.infos.usb_icon_alt')"
              ></i>
              <i
                v-if="disk.removable"
                class="fa fa-eject"
                role="img"
                :title="$t('storage_disks.infos.ejectable_icon_alt')"
              ></i>
            </span>
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
                {{ disk.type }}<template v-if="disk.rpm">
                ({{ disk.rpm }} RPM)</template>
              </li>
            </ul>
          </section>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import { ref, type Ref, computed } from 'vue'
import api from '@/api'
import type { Disk } from '@/types/core/api.ts'
import {
  BContainer,
  BRow,
  BCol,
  BCard,
  BCardTitle,
} from 'bootstrap-vue-next'
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const disks: Ref<Disk[]> = ref([])
const hasDisks = computed(
  () => Number.isInteger(disks.value.length) && disks.value.length > 0,
)

function smartStatusBadgeAttrs(disk: Disk) {
  const common = {title: t(`storage_disks.infos.smart_status_icon_alt.${disk.smartStatus}`)}
  switch (disk.smartStatus) {
    case 'SANE':
      return {class: "status bg-success", ...common}
    case 'CRITICAL':
      return {class: "status bg-danger", ...common}
    default:
      return {class: "status bg-secondary", ...common}
  }
}

api
  .fetch<{
    disks: Disk[]
  }>({ uri: 'storage/disk/list?with_info&human_readable_size' })
  .then((result) => {
    disks.value = result.disks
  })
</script>

<style lang="scss" scoped>
.row {
  row-gap: 1rem;
}

.disks-icons > * {
  margin-right: 0.5rem;
  margin-left: 0.5rem;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }
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
