<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Item ID:</span>
        <h3 class="page-title">{{ item_id }}</h3>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Information</h6>
          </div>
          <div class="card-body p-0 pb-3">
            <d-list-group flush>
              <d-list-group-item class="p-3" v-if="current_item != null">
                <d-row>
                  <d-col sm="12" md="2">
                    <label>Categories</label>
                  </d-col>
                  <d-col sm="12" md="10">
                    <d-badge
                      outline
                      theme="secondary"
                      v-for="(category, idx) in current_item.Categories"
                      :key="idx"
                    >
                      {{ category }}
                    </d-badge>
                  </d-col>
                </d-row>
                <d-row>
                  <d-col sm="12" md="2">
                    <label>Timestamp</label>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label class="text-light">{{
                      format_date_time(current_item.Timestamp)
                    }}</label>
                  </d-col>
                </d-row>
                <d-row>
                  <d-col sm="12" md="2">
                    <label>Labels</label>
                  </d-col>
                  <d-col sm="12" md="10">
                    <d-badge
                      outline
                      theme="primary"
                      v-for="(label, idx) in current_item.Labels"
                      :key="idx"
                    >
                      {{ label }}
                    </d-badge>
                  </d-col>
                </d-row>
                <d-row>
                  <d-col sm="12" md="2">
                    <label>Description</label>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label class="text-light">{{ current_item.Comment }}</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
            </d-list-group>
          </div>
        </div>
      </div>
    </div>

    <!-- Default Light Table -->
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Related Items</h6>
          </div>
          <div class="card-body border-bottom">
            <d-input-group prepend="Categories" class="mb-3">
              <d-select @change="changeCategory">
                <option
                  v-for="(category, idx) in categories"
                  :key="idx"
                  :value="category"
                >
                  {{ category }}
                </option>
              </d-select>
            </d-input-group>
          </div>
          <div class="card-body p-0 pb-3">
            <table class="table mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">ID</th>
                  <th scope="col" class="border-0">Categories</th>
                  <th scope="col" class="border-0">Timestamp</th>
                  <th scope="col" class="border-0">Labels</th>
                  <th scope="col" class="border-0">Description</th>
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
      item_id: null,
      items: [],
      current_item: null,
      categories: [''],
    };
  },
  created() {
    this.item_id = this.$route.params.item_id;
  },
  mounted() {
    axios
      .get(`/api/dashboard/item/${this.item_id}/neighbors`)
      .then((response) => {
        this.items = response.data;
      });
    axios.get(`/api/item/${this.item_id}`).then((response) => {
      this.current_item = response.data;
    });
    axios.get('/api/dashboard/categories').then((response) => {
      this.categories = [''].concat(response.data);
    });
  },
  methods: {
    format_date_time(timestamp) {
      if (timestamp === '') {
        return '';
      }
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    },
    changeCategory(event) {
      axios
        .get(`/api/dashboard/item/${this.item_id}/neighbors/${event}`, {
          params: {
            n: 100,
          },
        })
        .then((response) => {
          this.items = response.data;
        });
    },
  },
};
</script>
