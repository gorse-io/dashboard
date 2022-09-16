<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Items</h3>
      </div>
    </div>

    <!-- Default Light Table -->
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Items</h6>
          </div>
          <div class="card-body border-bottom">
            <d-input-group>
              <d-input
                id="item_id"
                placeholder="Item ID"
                v-model="item_id"
                @keyup.enter.native="search_item"
              />
              <d-input-group-addon append>
                <d-button class="btn-white" @click="search_item"
                  ><i class="material-icons">search</i></d-button
                >
                <d-button class="btn-white" @click="previous_page"
                ><i class="material-icons">arrow_back_ios</i></d-button
                >
                <d-button class="btn-white" @click="next_page"
                  ><i class="material-icons">arrow_forward_ios</i></d-button
                >
              </d-input-group-addon>
            </d-input-group>
          </div>
          <div class="card-body p-0 pb-3">
            <table class="table mb-0">
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
                      <d-badge
                        outline
                        theme="secondary"
                        v-for="(category, idx) in item.Categories"
                        :key="idx"
                      >
                        {{ category }}
                      </d-badge>
                    </div>
                  </td>
                  <td>
                    <d-checkbox :checked="item.IsHidden" disabled="true" />
                  </td>
                  <td>{{ format_date_time(item.Timestamp) }}</td>
                  <td>
                    <div>
                      <d-badge
                        outline
                        theme="primary"
                        v-for="(label, idx) in item.Labels"
                        :key="idx"
                      >
                        {{ label }}
                      </d-badge>
                    </div>
                  </td>
                  <td>{{ item.Comment }}</td>
                  <td>
                    <d-button-group>
                      <d-button size="small" outline @click="list_item_neighbors(item.ItemId)">Neighbors</d-button>
                      <d-button size="small" theme="danger" outline @click="open_delete_item_dialog(item.ItemId)">Delete</d-button>
                    </d-button-group>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <d-modal v-if="showDialog" @close="showDialog = false" centered>
      <d-modal-header>
        <d-modal-title>Delete Item</d-modal-title>
      </d-modal-header>
      <d-modal-body>
        <div class="mb-3">Are you sure to delete item <span style="font-weight: bold">{{ deleteItemId }}</span>? Please type the ID of the deleted item.</div>
        <d-input-group>
          <d-input v-model="confirmItemId"/>
          <d-input-group-addon append>
            <d-button theme="danger" outline @click="delete_item">
              <i class="material-icons">delete</i>
            </d-button>
          </d-input-group-addon>
        </d-input-group>
        <span style="color: red">{{ deleteItemError }}</span>
      </d-modal-body>
    </d-modal>
  </div>
</template>

<script>
import moment from 'moment';

const axios = require('axios');

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
      axios
        .get('/api/items', {
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
      axios.get(`/api/item/${this.item_id}`).then((response) => {
        this.items = [response.data];
      });
    },
    list_item_neighbors(itemId) {
      this.$router.push({
        name: 'item_neighbors',
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
      axios.delete(`/api/item/${this.deleteItemId}`).then(() => {
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
  },
};
</script>
