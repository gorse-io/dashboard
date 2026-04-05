<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Settings</h3>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row v-for="(settings, section) in config" :key="section">
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">{{ section }}</h6>
          </v-card-title>
          <v-card-text class="pa-0 pb-3">
            <v-list>
              <v-list-item class="p-3" v-for="(value, name) in settings" :key="name">
                <v-row>
                  <v-col sm="12" md="2">
                    <label>{{ name }}</label>
                  </v-col>
                  <v-col sm="12" md="10">
                    <v-text-field
                      v-if="value == null"
                      type="text"
                      :placeholder="'missing `' + name + '` in configuration file'"
                      :model-value="''"
                      error
                      readonly
                      hide-details="auto"
                      density="comfortable"
                    />
                    <div v-else-if="value.constructor === Array && value.length > 0 && typeof value[0] == 'object'">
                      <div v-for="(item, i) in value" v-bind:key="item.Name">
                        <div v-if="i > 0" class="mt-2 mb-2 border-top"></div>
                        <div v-for="(fieldValue, fieldName) in item" :key="fieldName" class="d-flex align-center flex-wrap mb-2">
                          <v-chip size="small" variant="outlined" class="mr-2" style="width: 250px">{{ fieldName }}</v-chip>
                          <v-text-field
                            v-if="fieldValue == null"
                            type="text"
                            :model-value="''"
                            readonly
                            hide-details="auto"
                            density="comfortable"
                            class="flex-grow-1"
                          />
                          <v-text-field
                            v-else-if="fieldValue.constructor === Object || fieldValue.constructor === Array"
                            type="text"
                            :model-value="JSON.stringify(fieldValue)"
                            readonly
                            hide-details="auto"
                            density="comfortable"
                            class="flex-grow-1"
                          />
                          <v-text-field
                            v-else
                            type="text"
                            :model-value="fieldValue.toString()"
                            readonly
                            hide-details="auto"
                            density="comfortable"
                            class="flex-grow-1"
                          />
                        </div>
                      </div>
                    </div>
                    <v-text-field
                      v-else-if="value.constructor === Array"
                      type="text"
                      :model-value="JSON.stringify(value)"
                      readonly
                      hide-details="auto"
                      density="comfortable"
                    />
                    <div v-else-if="typeof value == 'object'">
                      <div v-for="(fieldValue, fieldName) in value" :key="fieldName" class="d-flex align-center flex-wrap mb-2">
                        <v-chip size="small" variant="outlined" class="mr-2" style="width: 250px">{{ fieldName }}</v-chip>
                        <v-text-field
                          v-if="fieldValue == null"
                          type="text"
                          :model-value="''"
                          readonly
                          hide-details="auto"
                          density="comfortable"
                          class="flex-grow-1"
                        />
                        <v-text-field
                          v-else-if="fieldValue.constructor === Object || fieldValue.constructor === Array"
                          type="text"
                          :model-value="JSON.stringify(fieldValue)"
                          readonly
                          hide-details="auto"
                          density="comfortable"
                          class="flex-grow-1"
                        />
                        <v-text-field
                          v-else
                          type="text"
                          :model-value="fieldValue.toString()"
                          readonly
                          hide-details="auto"
                          density="comfortable"
                          class="flex-grow-1"
                        />
                      </div>
                    </div>
                    <v-text-field
                      v-else
                      type="text"
                      :model-value="value.toString()"
                      readonly
                      hide-details="auto"
                      density="comfortable"
                    />
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      config: null,
    };
  },
  mounted() {
    axios({
      method: 'get',
      url: '/api/dashboard/config',
    })
      .then((response) => {
        this.config = response.data;
      });
  },
};
</script>
