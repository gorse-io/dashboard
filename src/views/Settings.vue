<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Settings</h3>
      </div>
    </div>

    <!-- Default Light Table -->
    <div class="row" v-for="(settings, section) in config" :key="section">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">{{ section }}</h6>
          </div>
          <div class="card-body p-0 pb-3">
            <d-list-group flush>
            <d-list-group-item class="p-3" v-for="(value, name) in settings" :key="name">
            <d-row>
              <d-col sm="12" md="2">
               <label>{{ name }}</label>
              </d-col>
              <d-col sm="12" md="10">
                <d-input v-if="value == null" type="text" :placeholder="'missing `' + name + '` in configuration file'" state="invalid" readonly/>
                <div v-else-if="typeof value == 'object'">
                  <d-input-group v-for="(fieldValue, fieldName) in value" :key="fieldName" class="mb-2">
                    <d-input-group-text slot="prepend" style="width: 250px">{{ fieldName }}</d-input-group-text>
                    <d-input v-if="fieldValue.constructor === Object || fieldValue.constructor === Array" type="text" :value="JSON.stringify(fieldValue)" readonly/>
                    <d-input v-else :value="fieldValue.toString()" type="text" readonly/>
                  </d-input-group>
                </div>
                <d-input v-else type="text" :value="value.toString()" readonly/>
              </d-col>
            </d-row>
            </d-list-group-item>
            </d-list-group>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
const axios = require('axios');

export default {
  data() {
    return {
      config: null,
    };
  },
  mounted() {
    axios.get('/api/dashboard/config')
      .then((response) => {
        this.config = response.data;
      });
  },
};
</script>
