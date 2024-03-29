<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    skeleton="CardListSkeleton"
  >
    <!-- FIXME switch to <CardForm> ? -->
    <YCard :title="$t('backup_create')" icon="archive" no-body>
      <BFormCheckboxGroup
        v-model="selected"
        id="backup-select"
        name="backup-select"
        size="lg"
      >
        <BListGroup flush>
          <!-- SYSTEM HEADER -->
          <BListGroupItem
            class="d-flex align-items-sm-center flex-column flex-sm-row text-primary"
          >
            <h4 class="m-0"><YIcon iname="cube" /> {{ $t('system') }}</h4>

            <div class="ml-sm-auto mt-2 mt-sm-0">
              <BButton
                @click="toggleSelected(true, 'system')"
                v-t="'select_all'"
                size="sm"
                variant="outline-dark"
              />

              <BButton
                @click="toggleSelected(false, 'system')"
                v-t="'select_none'"
                size="sm"
                variant="outline-dark"
                class="ml-2"
              />
            </div>
          </BListGroupItem>

          <!-- SYSTEM ITEMS -->
          <BListGroupItem
            v-for="(item, partName) in system"
            :key="partName"
            class="d-flex justify-content-between align-items-center pr-0"
          >
            <div class="mr-2">
              <h5 class="font-weight-bold">
                {{ item.name }}
              </h5>
              <p class="m-0 text-muted">
                {{ item.description }}
              </p>
            </div>

            <BFormCheckbox
              :value="partName"
              :aria-label="$t('check')"
              class="d-inline"
            />
          </BListGroupItem>

          <!-- APPS HEADER -->
          <BListGroupItem
            class="d-flex align-items-sm-center flex-column flex-sm-row text-primary"
          >
            <h4 class="m-0">
              <YIcon iname="cubes" /> {{ $t('applications') }}
            </h4>

            <div class="ml-sm-auto mt-2 mt-sm-0">
              <BButton
                @click="toggleSelected(true, 'apps')"
                v-t="'select_all'"
                size="sm"
                variant="outline-dark"
              />

              <BButton
                @click="toggleSelected(false, 'apps')"
                v-t="'select_none'"
                size="sm"
                variant="outline-dark"
                class="ml-2"
              />
            </div>
          </BListGroupItem>

          <!-- APPS ITEMS -->
          <BListGroupItem
            v-for="(item, appName) in apps"
            :key="appName"
            class="d-flex justify-content-between align-items-center pr-0"
          >
            <div class="mr-2">
              <h5 class="font-weight-bold">
                {{ item.name }}
                <small class="text-secondary">{{ item.id }}</small>
              </h5>
              <p class="m-0">
                {{ item.description }}
              </p>
            </div>

            <BFormCheckbox
              :value="appName"
              :aria-label="$t('check')"
              class="d-inline"
            />
          </BListGroupItem>
        </BListGroup>
      </BFormCheckboxGroup>

      <!-- SUBMIT -->
      <template #buttons>
        <BButton
          @click="createBackup"
          v-t="'backup_action'"
          variant="success"
          :disabled="selected.length === 0"
        />
      </template>
    </YCard>
  </ViewBase>
</template>

<script>
import api from '@/api'

export default {
  name: 'BackupCreate',

  props: {
    id: { type: String, required: true },
  },

  data() {
    return {
      queries: [
        ['GET', 'hooks/backup'],
        ['GET', 'apps?with_backup'],
      ],
      selected: [],
      // api data
      system: undefined,
      apps: undefined,
    }
  },

  methods: {
    formatHooks(hooks) {
      const data = {}
      hooks.forEach((hook) => {
        const groupId = hook.startsWith('conf_')
          ? 'adminjs_group_configuration'
          : hook
        if (groupId in data) {
          data[groupId].value.push(hook)
          data[groupId].description += ', ' + this.$i18n.t('hook_' + hook)
        } else {
          data[groupId] = {
            name: this.$i18n.t('hook_' + groupId),
            value: [hook],
            description: this.$i18n.t(
              groupId === hook ? `hook_${hook}_desc` : 'hook_' + hook,
            ),
          }
        }
      })
      return data
    },

    onQueriesResponse({ hooks }, { apps }) {
      this.system = this.formatHooks(hooks)
      // transform app array into literal object to match hooks data structure
      this.apps = apps.reduce((obj, app) => {
        obj[app.id] = app
        return obj
      }, {})
      this.selected = [...Object.keys(this.system), ...Object.keys(this.apps)]
    },

    toggleSelected(select, type) {
      if (select) {
        const toSelect = Object.keys(this[type]).filter(
          (item) => !this.selected.includes(item),
        )
        this.selected = [...this.selected, ...toSelect]
      } else {
        const toUnselect = Object.keys(this[type])
        this.selected = this.selected.filter(
          (selected) => !toUnselect.includes(selected),
        )
      }
    },

    createBackup() {
      const data = { apps: [], system: [] }
      for (const item of this.selected) {
        if (item in this.system) {
          data.system = [...data.system, ...this.system[item].value]
        } else {
          data.apps.push(item)
        }
      }

      api.post('backups', data, 'backups.create').then(() => {
        this.$router.push({ name: 'backup-list', params: { id: this.id } })
      })
    },
  },
}
</script>
