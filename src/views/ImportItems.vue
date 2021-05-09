<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Preview</span>
        <h3 class="page-title">Import Items</h3>
      </div>
    </div>
    <d-alert
      :theme="alertTheme"
      :show="timeUntilDismissed"
      dismissible
      @alert-dismissed="timeUntilDismissed = 0"
      @alert-dismiss-countdown="handleTimeChange"
      >{{ alertText }}</d-alert
    >
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header">
            <d-form validated>
              <d-form-row>
                <d-col md="8" class="form-group">
                  <strong class="text-muted d-block mb-2">File</strong>
                  <div class="custom-file mb-3">
                    <input
                      type="file"
                      class="custom-file-input"
                      id="csvFile"
                      @change="loadFile"
                      required
                    />
                    <label class="custom-file-label" for="customFile2">{{
                      fileName
                    }}</label>
                    <d-form-invalid-feedback
                      >Upload local csv file.</d-form-invalid-feedback
                    >
                  </div>
                </d-col>
                <d-col md="2" class="form-group">
                  <label for="fieldSeparator">Field Separator</label>
                  <d-input
                    id="fieldSeparator"
                    type="text"
                    v-model="fieldSeparator"
                    required
                  />
                  <d-form-invalid-feedback
                    >Field separator is required!</d-form-invalid-feedback
                  >
                </d-col>
                <d-col md="2">
                  <label for="labelSeparator">Label Separator</label>
                  <d-input
                    id="labelSeparator"
                    type="text"
                    v-model="labelSeparator"
                    required
                  />
                  <d-form-invalid-feedback
                    >Label separator is required!</d-form-invalid-feedback
                  >
                </d-col>
              </d-form-row>
            </d-form>
            <d-form @submit.prevent="uploadFile">
              <d-form-row>
                <d-col md="3">
                  <strong class="text-muted d-block mb-2"
                    >Field Matching</strong
                  >
                  <d-input-group prepend="ID" class="mb-3">
                    <d-select v-model="itemIdColIdx">
                      <option v-for="(name, idx) in previewHeader" :key="idx" :value="idx">
                        {{ name }}
                      </option>
                    </d-select>
                  </d-input-group>
                </d-col>
                <d-col md="3">
                  <strong class="text-muted d-block mb-2">&nbsp</strong>
                  <d-input-group prepend="Timestamp" class="mb-3">
                    <d-select v-model="timestampColIdx">
                      <option v-for="(name, idx) in previewHeader" :key="idx" :value="idx">
                        {{ name }}
                      </option>
                    </d-select>
                  </d-input-group>
                </d-col>
                <d-col md="3">
                  <strong class="text-muted d-block mb-2">&nbsp</strong>
                  <d-input-group prepend="Labels" class="mb-3">
                    <d-select v-model="labelsColIdx">
                      <option v-for="(name, idx) in previewHeader" :key="idx" :value="idx">
                        {{ name }}
                      </option>
                    </d-select>
                  </d-input-group>
                </d-col>
                <d-col md="3">
                  <strong class="text-muted d-block mb-2">&nbsp</strong>
                  <d-input-group prepend="Description" class="mb-3">
                    <d-select v-model="descColIdx">
                      <option v-for="(name, idx) in previewHeader" :key="idx" :value="idx">
                        {{ name }}
                      </option>
                    </d-select>
                  </d-input-group>
                </d-col>

                <d-col md="10" class="form-group">
                  <d-checkbox v-model="hasHeader"
                    >The first line is the header.</d-checkbox
                  >
                </d-col>
                <d-col md="2">
                  <d-button>Comfirm Import</d-button></d-col
                >
              </d-form-row>
            </d-form>
          </div>
          <d-progress height="5px" class="mb-3" :value="progressLoaded" :max="progressTotal" />
          <div class="card-body p-0 pb-3">
            <table class="table mb-0">
              <thead class="bg-light">
                <tr>
                  <th
                    scope="col"
                    class="border-0"
                    v-for="(name, idx) in previewHeader"
                    :key="idx"
                  >
                    {{ mappedColumNames[idx] }}<span class="text-semibold">({{ name }})</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(line, row_idx) in previewBody" :key="row_idx">
                  <td v-for="(value, col_idx) in line" :key="col_idx">
                    <div v-if="mappedColumNames[col_idx] == 'Labels'">
                      <d-badge
                        outline
                        theme="primary"
                        v-for="(label, idx) in splitLabels(
                          value,
                          labelSeparator
                        )"
                        :key="idx"
                      >
                        {{ label }}
                      </d-badge>
                    </div>
                    <div v-else>
                      {{ value }}
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
const axios = require('axios');
import moment from "moment";

export default {
  data() {
    return {
      fieldSeparator: ",",
      labelSeparator: "|",
      fileName: "Choose file...",
      hasHeader: true,
      lines: [],
      items: [],
      itemIdColIdx: 0,
      timestampColIdx: 1,
      labelsColIdx: 2,
      descColIdx: 3,
      progressTotal: 100,
      progressLoaded: 0,
      alertTheme: "danger",
      alertText: null,
      duration: 3,
      timeUntilDismissed: 0,
    };
  },
  computed: {
    mappedColumNames() {
      let header = this.previewHeader;
      let names = [];
      for (let i = 0; i < header.length; i++) {
        if (i == this.itemIdColIdx) {
          names.push("ID");
        } else if (i == this.timestampColIdx) {
          names.push("Timestamp");
        } else if (i == this.labelsColIdx) {
          names.push("Labels");
        } else if (i == this.descColIdx) {
          names.push("Description");
        } else {
          names.push("");
        }
      }
      return names;
    },
    previewHeader() {
      return this.previewTable[0];
    },
    previewBody() {
      return this.previewTable.slice(1);
    },
    previewTable() {
      if (this.fieldSeparator.length == 0) {
        return [];
      }
      let table = [];
      let numCols = 0;
      // split fields
      this.lines.forEach((line) => {
        const fields = line.split(this.fieldSeparator);
        table.push(fields);
        numCols = Math.max(numCols, fields.length);
      });
      // add header
      if (!this.hasHeader) {
        let header = [];
        for (let i = 0; i < numCols; i++) {
          header.push(i.toString());
        }
        table.unshift(header);
      }
      return table;
    },
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
        const lines = e.target.result.split(/\r?\n/);
        this.lines = lines.slice(0, -1);
      };
    },
    format_date_time(timestamp) {
      return moment(String(timestamp)).format("YYYY/MM/DD hh:mm");
    },
    splitLabels(text, sep) {
      let labels = [];
      if (sep.length == 0) {
        return labels;
      }
      text.split(sep).forEach((e) => {
        if (e.length > 0) {
          labels.push(e);
        }
      });
      return labels;
    },
    handleTimeChange(time) {
      this.timeUntilDismissed = time;
    },
    showAlert() {
      this.timeUntilDismissed = this.duration;
    },
    resetProgressBar() {
      this.progressTotal = 100;
      this.progressLoaded = 0;
    },
    resetTable() {
      this.table = []
    },
    uploadFile() {
      var config = {
        onUploadProgress: (progressEvent) => {
          this.progressLoaded = progressEvent.loaded;
          this.progressTotal = progressEvent.total;
        }
      };
      var formData = new FormData();
      formData.append('sep', this.fieldSeparator);
      formData.append('has-header', this.hasHeader);
      formData.append('label-sep', this.labelSeparator);
      var csvfile = document.querySelector('#csvFile');
      formData.append("file", csvfile.files[0]);
      axios.post('/api/bulk/items', formData, config)
        .then((response) => {
          this.alertTheme = "success";
          this.alertText = response.data;
          this.showAlert();
          this.resetProgressBar();
          this.resetTable();
        })
        .catch((error) => {
          this.alertTheme = "danger";
          this.alertText = error.response.data;
          this.showAlert();
          this.resetProgressBar();
        });
    }
  },
};
</script>
