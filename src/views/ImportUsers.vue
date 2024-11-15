<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Preview</span>
        <h3 class="page-title">Import Users</h3>
      </div>
    </div>
    <d-alert :theme="alertTheme" :show="timeUntilDismissed" dismissible @alert-dismissed="timeUntilDismissed = 0"
      @alert-dismiss-countdown="handleTimeChange">{{ alertText }}</d-alert>
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header">
            <d-form validated @submit.prevent="uploadFile">
              <d-form-row>
                <d-col md="10" class="form-group">
                  <strong class="text-muted d-block mb-2">File</strong>
                  <div class="custom-file mb-3">
                    <input type="file" class="custom-file-input" id="csvFile" @change="loadFile" required />
                    <label class="custom-file-label" for="customFile2">{{
                      fileName
                      }}</label>
                    <d-form-invalid-feedback>Upload local *.jsonl file.</d-form-invalid-feedback>
                  </div>
                </d-col>
                <d-col md="2"><strong class="text-muted d-block mb-2">&nbsp;</strong><d-button outline>Comfirm
                    Import</d-button></d-col>
              </d-form-row>
            </d-form>
          </div>
          <div class="progress" v-if="progressShow">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75"
              aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
          </div>
          <div class="card-body p-0 pb-3">
            <table class="table mb-0">
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
                    <div v-if="columnName == 'Labels'">
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
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

const axios = require('axios');

export default {
  data() {
    return {
      fileName: 'Choose file...',
      progressShow: false,
      alertTheme: 'danger',
      alertText: null,
      duration: 5,
      timeUntilDismissed: 0,
      columnNames: [
        'UserId',
        'Labels',
        'Comment',
      ],
      rows: [],
    };
  },
  methods: {
    loadFile(event) {
      const file = event.target.files[0];
      // load file name
      this.fileName = file.name;
      // load file content
      const reader = new FileReader();
      reader.readAsText(file.slice(0, 1024));
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
    handleTimeChange(time) {
      this.timeUntilDismissed = time;
    },
    showDanger(mesage) {
      this.timeUntilDismissed = this.duration;
      this.alertTheme = 'danger';
      this.alertText = mesage;
    },
    showSuccess(mesage) {
      this.timeUntilDismissed = this.duration;
      this.alertTheme = 'success';
      this.alertText = mesage;
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
      const csvfile = document.querySelector('#csvFile');
      if (csvfile.files.length === 0) {
        this.showDanger('file must be chosen');
        return;
      }
      formData.append('file', csvfile.files[0]);
      // start upload
      this.progressShow = true;
      axios
        .post('/api/bulk/users', formData)
        .then((response) => {
          // import users successfully
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
