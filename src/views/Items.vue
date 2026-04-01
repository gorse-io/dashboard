<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4">
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <h3 class="text-h5">Items</h3>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-b">Items</v-card-title>
          <v-card-text class="border-b">
            <v-text-field
              v-model="item_id"
              label="Item ID"
              density="compact"
              hide-details
              @keyup.enter="search_item"
            >
              <template v-slot:append>
                <v-btn icon="mdi-magnify" variant="text" @click="search_item" />
                <v-btn icon="mdi-arrow-left" variant="text" @click="previous_page" />
                <v-btn icon="mdi-arrow-right" variant="text" @click="next_page" />
              </template>
            </v-text-field>
          </v-card-text>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">ID</th>
                <th class="text-left">Categories</th>
                <th class="text-left">Hidden</th>
                <th class="text-left">Timestamp</th>
                <th class="text-left">Labels</th>
                <th class="text-left">Description</th>
                <th class="text-left"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in items" :key="idx">
                <td>{{ item.ItemId }}</td>
                <td>
                  <v-chip
                    v-for="(category, catIdx) in item.Categories"
                    :key="catIdx"
                    size="small"
                    variant="outlined"
                    class="mr-1"
                  >
                    {{ category }}
                  </v-chip>
                </td>
                <td>
                  <v-checkbox
                    :model-value="item.IsHidden"
                    disabled
                    hide-details
                    density="compact"
                  />
                </td>
                <td>{{ format_date_time(item.Timestamp) }}</td>
                <td>
                  <span class="font-monospace">
                    {{ fold(item.Labels) }}
                  </span>
                </td>
                <td>{{ item.Comment }}</td>
                <td>
                  <v-btn-group>
                    <v-btn size="small" variant="outlined" @click="view_item(item.ItemId)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn size="small" color="error" variant="outlined" @click="open_delete_item_dialog(item.ItemId)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-btn-group>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-card-title>Delete Item</v-card-title>
        <v-card-text>
          <div class="mb-3">
            Are you sure to delete item <span class="font-weight-bold">{{ deleteItemId }}</span>?
            Please type the ID of the deleted item.
          </div>
          <v-text-field v-model="confirmItemId" density="compact">
            <template v-slot:append-inner>
              <v-btn color="error" variant="outlined" @click="delete_item">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-text-field>
          <span class="text-error">{{ deleteItemError }}</span>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import utils from '../utils';

export default {
  data() {
    return {
      items: null,
      cursors: [],
      item_id: null,
      showDialog: false,
      deleteItemId: '',
      confirmItemId: '',
      deleteItemError: '',
    };
  },
  mounted() {
    this.fetch_page();
  },
  methods: {
    fetch_page() {
      const cursor = this.cursors.empty ? '' : this.cursors[this.cursors.length - 1];
      axios({
        method: 'get',
        url: '/api/items',
        params: {
          cursor,
        },
      })
        .then((response) => {
          this.items = response.data.Items;
          this.cursors.push(response.data.Cursor);
        });
    },
    previous_page() {
      if (this.cursors.length >= 2) {
        this.cursors.pop();
        this.cursors.pop();
      } else if (this.cursors.length === 1) {
        this.cursors.pop();
      }
      this.fetch_page();
    },
    next_page() {
      this.fetch_page();
    },
    format_date_time(timestamp) {
      if (timestamp === '') {
        return '';
      }
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    },
    search_item() {
      axios({
        method: 'get',
        url: `/api/item/${this.item_id}`,
      })
        .then((response) => {
          this.items = [response.data];
        });
    },
    view_item(itemId) {
      this.$router.replace({
        name: 'item',
        params: { item_id: itemId },
      });
    },
    open_delete_item_dialog(itemId) {
      this.showDialog = true;
      this.deleteItemId = itemId;
      this.confirmItemId = '';
      this.deleteItemError = '';
    },
    delete_item() {
      if (this.deleteItemId !== this.confirmItemId) {
        this.deleteItemError = 'item ID mismatch';
        return;
      }
      axios({
        method: 'delete',
        url: `/api/item/${this.deleteItemId}`,
      })
        .then(() => {
          this.showDialog = false;
          if (this.cursors.length >= 1) {
            this.cursors.pop();
          }
          this.fetch_page();
        }).catch((error) => {
          if (error.response) {
            this.deleteItemError = error.response.data;
          } else {
            this.deleteItemError = error;
          }
        });
    },
    fold: utils.fold,
  },
};
</script>