<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Preview</span>
        <h3 class="page-title">Import Feedback</h3>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header">
            <d-form validated>
              <d-form-row>
                <d-col md="9" class="form-group">
                  <strong class="text-muted d-block mb-2">File</strong>
                  <div class="custom-file mb-3">
                    <input
                      type="file"
                      class="custom-file-input"
                      id="customFile2"
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
                <d-col md="3" class="form-group">
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
              </d-form-row>
            </d-form>
            <d-form>
              <d-form-row>
                <d-col md="3">
                  <strong class="text-muted d-block mb-2"
                    >Field Matching</strong
                  >
                  <d-input-group prepend="FeedbackType" class="mb-3">
                    <d-select v-model="feedbackTypeColIdx">
                      <option
                        v-for="(name, idx) in previewHeader"
                        :key="idx"
                        :value="idx"
                      >
                        {{ name }}
                      </option>
                    </d-select>
                  </d-input-group>
                </d-col>
                <d-col md="3">
                  <strong class="text-muted d-block mb-2">&nbsp</strong>
                  <d-input-group prepend="UserId" class="mb-3">
                    <d-select v-model="userIdColIdx">
                      <option
                        v-for="(name, idx) in previewHeader"
                        :key="idx"
                        :value="idx"
                      >
                        {{ name }}
                      </option>
                    </d-select>
                  </d-input-group>
                </d-col>
                <d-col md="3">
                  <strong class="text-muted d-block mb-2">&nbsp</strong>
                  <d-input-group prepend="ItemId" class="mb-3">
                    <d-select v-model="itemIdColIdx">
                      <option
                        v-for="(name, idx) in previewHeader"
                        :key="idx"
                        :value="idx"
                      >
                        {{ name }}
                      </option>
                    </d-select>
                  </d-input-group>
                </d-col>
                <d-col md="3">
                  <strong class="text-muted d-block mb-2">&nbsp</strong>
                  <d-input-group prepend="Timestamp" class="mb-3">
                    <d-select v-model="timestampColIdx">
                      <option
                        v-for="(name, idx) in previewHeader"
                        :key="idx"
                        :value="idx"
                      >
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
                  <d-button type="submit">Comfirm Import</d-button></d-col
                >
              </d-form-row>
            </d-form>
          </div>
          <d-progress height="5px" class="mb-3" :value="20" :max="100" />
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
                    {{ mappedColumNames[idx]
                    }}<span class="text-semibold">({{ name }})</span>
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
import moment from "moment";

export default {
  data() {
    return {
      fieldSeparator: ",",
      fileName: "Choose file...",
      hasHeader: true,
      lines: [],
      items: [],
      feedbackTypeColIdx: 0,
      userIdColIdx: 1,
      itemIdColIdx: 2,
      timestampColIdx: 3,
    };
  },
  computed: {
    mappedColumNames() {
      let header = this.previewHeader;
      let names = [];
      for (let i = 0; i < header.length; i++) {
        if (i == this.feedbackTypeColIdx) {
          names.push("FeedbackType");
        } else if (i == this.userIdColIdx) {
          names.push("UserId");
        } else if (i == this.itemIdColIdx) {
          names.push("ItemId");
        } else if (i == this.timestampColIdx) {
          names.push("Timestamp");
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
  },
};
</script>
