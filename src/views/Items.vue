<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <h3 class="page-title">Items</h3>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">Items</h6>
          </v-card-title>
          <v-card-text class="border-bottom">
            <d-input-group>
              <d-input id="item_id" placeholder="Item ID" v-model="item_id" @keyup.enter="search_item" />
              <d-input-group-addon append>
                <v-btn variant="text" @click="search_item"><i class="material-icons">search</i></v-btn>
                <v-btn variant="text" @click="previous_page"><i
                    class="material-icons">arrow_back_ios</i></v-btn>
                <v-btn variant="text" @click="next_page"><i
                    class="material-icons">arrow_forward_ios</i></v-btn>
              </d-input-group-addon>
            </d-input-group>
          </v-card-text>
          <v-card-text class="pa-0 pb-3">
            <v-table class="mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">ID</th>
                  <th scope="col" class="border-0">Categories</th>
                  <th scope="col" class="border-0">Hidden</th>
                  <th scope="col" class="border-0">Timestamp</th>
                  <th scope="col" class="border-0">Labels</th>
                  <th scope="col" class="border-0">Description</th>
                  <th scope="col" class="border-0"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in items" :key="idx">
                  <td>{{ item.ItemId }}</td>
                  <td>
                    <div>
                      <d-badge outline theme="secondary" v-for="(category, idx) in item.Categories" :key="idx">
                        {{ category }}
                      </d-badge>
                    </div>
                  </td>
                  <td>
                    <d-checkbox :checked="item.IsHidden" disabled="true" />
                  </td>
                  <td>{{ format_date_time(item.Timestamp) }}</td>
                  <td>
                    <span
                      style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif">
                      {{ fold(item.Labels) }}
                    </span>
                  </td>
                  <td>{{ item.Comment }}</td>
                  <td>
                    <v-btn-group>
                      <v-btn size="small" variant="outlined" @click="view_item(item.ItemId)"><i
                          class="material-icons">visibility</i></v-btn>
                      <v-btn size="small" color="error" variant="outlined" @click="open_delete_item_dialog(item.ItemId)"><i
                          class="material-icons">delete</i></v-btn>
                    </v-btn-group>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <d-modal v-if="showDialog" @close="showDialog = false" centered>
      <d-modal-header>
        <d-modal-title>Delete Item</d-modal-title>
      </d-modal-header>
      <d-modal-body>
        <div class="mb-3">Are you sure to delete item <span style="font-weight: bold">{{ deleteItemId }}</span>? Please
          type the ID of the deleted item.</div>
        <d-input-group>
          <d-input v-model="confirmItemId" />
          <d-input-group-addon append>
            <v-btn color="error" variant="outlined" @click="delete_item">
              <i class="material-icons">delete</i>
            </v-btn>
          </d-input-group-addon>
        </d-input-group>
        <span style="color: red">{{ deleteItemError }}</span>
      </d-modal-body>
    </d-modal>
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
