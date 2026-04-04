<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Advance</h3>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">Data Export</h6>
          </v-card-title>
          <v-card-text class="pa-0 pb-3">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <a :href="'/api/bulk/users'">
                      <v-btn class="advance_button" variant="outlined">&nbsp;&nbsp;&nbsp;Export
                        Users&nbsp;&nbsp;&nbsp;</v-btn>
                    </a>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label>Export users into JSON lines.</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <a :href="'/api/bulk/items'">
                      <v-btn class="advance_button" variant="outlined">&nbsp;&nbsp;&nbsp;Export
                        Items&nbsp;&nbsp;&nbsp;</v-btn>
                    </a>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label>Export items into JSON lines.</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <a :href="'/api/bulk/feedback'">
                      <v-btn variant="outlined">Export Feedback</v-btn>
                    </a>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label>Export feedbacks into JSON lines.</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
            </d-list-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">Data Import</h6>
          </v-card-title>
          <v-card-text class="pa-0 pb-3">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <router-link :to="{ name: 'import_users' }">
                      <v-btn variant="outlined">&nbsp;&nbsp;&nbsp;Import
                        Users&nbsp;&nbsp;&nbsp;</v-btn>
                    </router-link>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label>Import users into gorse.</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <router-link :to="{ name: 'import_items' }">
                      <v-btn variant="outlined">&nbsp;&nbsp;&nbsp;Import
                        Items&nbsp;&nbsp;&nbsp;</v-btn>
                    </router-link>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label>Import items into gorse.</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <router-link :to="{ name: 'import_feedback' }">
                      <v-btn variant="outlined">Import Feedback</v-btn>
                    </router-link>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label>Import feedbacks into gorse.</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
            </d-list-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">Danger Zone</h6>
          </v-card-title>
          <v-card-text class="pa-0 pb-3">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <v-btn variant="outlined" color="error" @click="handleClick">&nbsp;Purge
                      Database&nbsp;</v-btn>
                    <d-modal v-if="showDialog" @close="handleClose" centered>
                      <d-modal-header>
                        <d-modal-title>Are you absolutely sure?</d-modal-title>
                      </d-modal-header>
                      <d-modal-body>
                        <label>This action <span style="color: red; font-weight: bold">cannot</span> be undone. This
                          will permanently:</label>
                        <d-checkbox v-model="checkList" value="delete_users">Delete all users.</d-checkbox>
                        <d-checkbox v-model="checkList" value="delete_items">Delete all items.</d-checkbox>
                        <d-checkbox v-model="checkList" value="delete_feedback">Delete all feedbacks.</d-checkbox>
                        <d-checkbox v-model="checkList" value="delete_cache">Delete all caches.</d-checkbox>
                        <d-alert :theme="alertTheme" :show="showAlert">{{ alertMessage }}</d-alert>
                        <v-btn variant="outlined" color="error" @click="purge" :disabled="disableDialog">
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          I understand the consequences, purge all data
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </v-btn>
                      </d-modal-body>
                    </d-modal>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label>Purge all data in data storage and cache storage.</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
            </d-list-group>
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
      showDialog: false,
      checkList: [],
      alertMessage: '',
      alertTheme: '',
      showAlert: false,
      disableDialog: false,
    };
  },
  methods: {
    handleClick() {
      this.showDialog = true;
      this.showAlert = false;
      this.disableDialog = false;
      this.checkList = [];
    },
    handleClose() {
      this.showDialog = false;
    },
    purge() {
      this.disableDialog = true;
      const params = new URLSearchParams();
      params.append('check_list', this.checkList);
      axios.post('api/purge', params)
        .then(() => {
          this.alertMessage = 'purge database successfully';
          this.alertTheme = 'success';
          this.showAlert = true;
          setTimeout(() => {
            this.showDialog = false;
          }, 500);
        })
        .catch((error) => {
          if (error.response) {
            this.alertMessage = error.response.data;
          } else {
            this.alertMessage = error;
          }
          this.alertTheme = 'danger';
          this.showAlert = true;
          this.disableDialog = false;
        });
    },
  },
};
</script>
