<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="py-4">
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase text-subtitle-2">Overview</span>
        <h3 class="text-h5">Settings</h3>
      </v-col>
    </v-row>

    <!-- Settings Sections -->
    <v-row v-for="(settings, section) in config" :key="section">
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-b">
            <h6 class="text-h6">{{ section }}</h6>
          </v-card-title>
          <v-list>
            <v-list-item
              v-for="(value, name) in settings"
              :key="name"
              class="px-4 py-3"
            >
              <v-row no-gutters>
                <v-col cols="12" md="2">
                  <label class="text-body-2 font-weight-medium">{{ name }}</label>
                </v-col>
                <v-col cols="12" md="10">
                  <v-text-field
                    v-if="value == null"
                    :placeholder="`missing ${name} in configuration file`"
                    readonly
                    variant="outlined"
                    density="compact"
                    hide-details
                    error
                  />
                  <div v-else-if="Array.isArray(value) && value.length > 0 && typeof value[0] === 'object'">
                    <div v-for="(item, i) in value" :key="item.Name || i">
                      <v-divider v-if="i > 0" class="my-2" />
                      <v-row
                        v-for="(fieldValue, fieldName) in item"
                        :key="fieldName"
                        class="mb-2"
                      >
                        <v-col cols="12" md="3">
                          <label class="text-body-2">{{ fieldName }}</label>
                        </v-col>
                        <v-col cols="12" md="9">
                          <v-text-field
                            v-if="fieldValue == null"
                            readonly
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                          <v-text-field
                            v-else-if="typeof fieldValue === 'object'"
                            :model-value="JSON.stringify(fieldValue)"
                            readonly
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                          <v-text-field
                            v-else
                            :model-value="String(fieldValue)"
                            readonly
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                  <v-text-field
                    v-else-if="Array.isArray(value)"
                    :model-value="JSON.stringify(value)"
                    readonly
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                  <div v-else-if="typeof value === 'object'">
                    <v-row
                      v-for="(fieldValue, fieldName) in value"
                      :key="fieldName"
                      class="mb-2"
                    >
                      <v-col cols="12" md="3">
                        <label class="text-body-2">{{ fieldName }}</label>
                      </v-col>
                      <v-col cols="12" md="9">
                        <v-text-field
                          v-if="fieldValue == null"
                          readonly
                          variant="outlined"
                          density="compact"
                          hide-details
                        />
                        <v-text-field
                          v-else-if="typeof fieldValue === 'object'"
                          :model-value="JSON.stringify(fieldValue)"
                          readonly
                          variant="outlined"
                          density="compact"
                          hide-details
                        />
                        <v-text-field
                          v-else
                          :model-value="String(fieldValue)"
                          readonly
                          variant="outlined"
                          density="compact"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                  </div>
                  <v-text-field
                    v-else
                    :model-value="String(value)"
                    readonly
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'settings-view',
  setup() {
    const config = ref(null);

    onMounted(async () => {
      try {
        const response = await axios({
          method: 'get',
          url: '/api/dashboard/config',
        });
        config.value = response.data;
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    });

    return {
      config,
    };
  },
};
</script>