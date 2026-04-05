<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Preview</span>
        <h3 class="page-title">Import Items</h3>
      </v-col>
    </v-row>
    <v-alert
      v-if="timeUntilDismissed > 0"
      :color="alertColor"
      variant="tonal"
      closable
      @click:close="clearAlertCountdown"
    >{{ alertText }}</v-alert>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title>
            <v-form @submit.prevent="uploadFile">
              <v-row>
                <v-col cols="12" md="10">
                  <strong class="text-muted d-block mb-2">File</strong>
                  <v-file-input
                    v-model="selectedFile"
                    accept=".jsonl"
                    prepend-icon="mdi-paperclip"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    :label="fileName"
                    @update:modelValue="loadFile"
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <strong class="text-muted d-block mb-2">&nbsp;</strong>
                  <v-btn type="submit" variant="outlined">Confirm Import</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-title>
          <v-progress-linear v-if="progressShow" indeterminate color="primary" />
          <v-card-text class="pa-0 pb-3">
            <v-table class="mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0" v-for="columnName in columnNames" :key="columnName">
                    {{ columnName }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, row_idx) in rows" :key="row_idx">
                  <td v-for="columnName in columnNames" :key="columnName">
                    <div v-if="columnName === 'Categories'">
                      <v-chip
                        v-for="(label, idx) in row[columnName]"
                        :key="idx"
                        size="small"
                        variant="outlined"
                        color="primary"
                        class="mr-1 mb-1"
                      >
                        {{ label }}
                      </v-chip>
                    </div>
                    <div v-else-if="columnName === 'Labels'">
                      <span
                        style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif">
                        {{ row[columnName] }}
                      </span>
                    </div>
                    <div v-else>
                      {{ row[columnName] }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import moment from 'moment';

export default {
  data() {
    return {
      fileName: 'Choose file...',
      selectedFile: null,
      progressShow: false,
      alertTheme: 'danger',
      alertText: null,
      duration: 5,
      timeUntilDismissed: 0,
      alertTimerId: null,
      columnNames: [
        'ItemId',
        'IsHidden',
        'Categories',
        'Timestamp',
        'Labels',
        'Comment',
      ],
      rows: [],
    };
  },
  computed: {
    alertColor() {
      return this.alertTheme === 'danger' ? 'error' : this.alertTheme;
    },
  },
  beforeUnmount() {
    this.clearAlertCountdown();
  },
  methods: {
    loadFile(fileValue) {
      const file = Array.isArray(fileValue) ? fileValue[0] : fileValue;
      if (!file) {
        this.fileName = 'Choose file...';
        this.rows = [];
        return;
      }
      // load file name
      this.fileName = file.name;
      // load file content
      const reader = new FileReader();
      reader.readAsText(file.slice(0, 4096));
      reader.onload = (e) => {
        this.rows = e.target.result.split('\n').slice(0, -1).map(line => JSON.parse(line));
      };
    },
    format_date_time(timestamp) {
      if (timestamp === '') {
        return '';
      }
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    },
    startAlertCountdown(seconds) {
      this.clearAlertCountdown();
      this.timeUntilDismissed = seconds;
      this.alertTimerId = setInterval(() => {
        if (this.timeUntilDismissed <= 1) {
          this.clearAlertCountdown();
          return;
        }
        this.timeUntilDismissed -= 1;
      }, 1000);
    },
    clearAlertCountdown() {
      if (this.alertTimerId) {
        clearInterval(this.alertTimerId);
        this.alertTimerId = null;
      }
      this.timeUntilDismissed = 0;
    },
    showDanger(message) {
      this.startAlertCountdown(this.duration);
      this.alertTheme = 'danger';
      this.alertText = message;
    },
    showSuccess(message) {
      this.startAlertCountdown(this.duration);
      this.alertTheme = 'success';
      this.alertText = message;
    },
    resetProgressBar() {
      this.progressTotal = 100;
      this.progressLoaded = 0;
    },
    resetTable() {
      this.table = [];
    },
    uploadFile() {
      // create form
      const formData = new FormData();
      // file must be chosen
      if (!this.selectedFile) {
        this.showDanger('file must be chosen');
        return;
      }
      formData.append('file', this.selectedFile);
      // start upload
      this.progressShow = true;
      axios
        .post('/api/bulk/items', formData)
        .then((response) => {
          // import items successfully
          this.showSuccess(response.data);
          this.resetProgressBar();
          this.resetTable();
          this.progressShow = false;
        })
        .catch((error) => {
          // receive error
          this.showDanger(error.response.data);
          this.resetProgressBar();
          this.progressShow = false;
        });
    },
  },
};
</script>
