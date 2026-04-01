<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="py-4">
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase text-subtitle-2">Preview</span>
        <h3 class="text-h5">Import Items</h3>
      </v-col>
    </v-row>

    <v-alert
      v-if="alertText"
      :type="alertTheme"
      closable
      class="mb-4"
      @click:close="alertText = null"
    >
      {{ alertText }}
    </v-alert>

    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-text>
            <v-form @submit.prevent="uploadFile">
              <v-row>
                <v-col cols="12" md="10">
                  <v-file-input
                    v-model="selectedFile"
                    label="Choose file..."
                    accept=".jsonl"
                    :hint="'Upload local *.jsonl file.'"
                    persistent-hint
                    @update:model-value="loadFile"
                  />
                </v-col>
                <v-col cols="12" md="2" class="d-flex align-center">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    type="submit"
                    :loading="progressShow"
                    :disabled="!selectedFile"
                  >
                    Confirm Import
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-progress-linear
            v-if="progressShow"
            indeterminate
            color="primary"
            class="mb-2"
          />

          <v-table v-if="rows.length > 0">
            <thead>
              <tr>
                <th
                  v-for="columnName in columnNames"
                  :key="columnName"
                  class="text-left"
                >
                  {{ columnName }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIdx) in rows" :key="rowIdx">
                <td v-for="columnName in columnNames" :key="columnName">
                  <div v-if="columnName === 'Categories'">
                    <v-chip
                      v-for="(label, idx) in row[columnName]"
                      :key="idx"
                      size="small"
                      variant="outlined"
                      color="primary"
                      class="mr-1"
                    >
                      {{ label }}
                    </v-chip>
                  </div>
                  <span v-else-if="columnName === 'Labels'" class="font-monospace">
                    {{ row[columnName] }}
                  </span>
                  <span v-else>{{ row[columnName] }}</span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'import-items-view',
  setup() {
    const selectedFile = ref(null);
    const fileName = ref('Choose file...');
    const progressShow = ref(false);
    const alertTheme = ref('error');
    const alertText = ref(null);
    const columnNames = ref([
      'ItemId',
      'IsHidden',
      'Categories',
      'Timestamp',
      'Labels',
      'Comment',
    ]);
    const rows = ref([]);

    const loadFile = (file) => {
      if (!file) return;

      fileName.value = file.name;
      const reader = new FileReader();
      reader.readAsText(file.slice(0, 4096));
      reader.onload = (e) => {
        try {
          rows.value = e.target.result
            .split('\n')
            .slice(0, -1)
            .map((line) => JSON.parse(line));
        } catch (error) {
          console.error('Error parsing file:', error);
        }
      };
    };

    const showDanger = (message) => {
      alertTheme.value = 'error';
      alertText.value = message;
    };

    const showSuccess = (message) => {
      alertTheme.value = 'success';
      alertText.value = message;
    };

    const uploadFile = async () => {
      if (!selectedFile.value) {
        showDanger('File must be chosen');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile.value);

      progressShow.value = true;

      try {
        const response = await axios.post('/api/bulk/items', formData);
        showSuccess(response.data);
        rows.value = [];
        selectedFile.value = null;
      } catch (error) {
        showDanger(error.response?.data || error.message);
      } finally {
        progressShow.value = false;
      }
    };

    return {
      selectedFile,
      fileName,
      progressShow,
      alertTheme,
      alertText,
      columnNames,
      rows,
      loadFile,
      uploadFile,
    };
  },
};
</script>