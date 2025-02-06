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
                    <d-badge outline theme="secondary" v-for="(category, idx) in current_item.Categories" :key="idx">
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
                    <div>
                      <highlightjs language='json' :code="stringify(current_item.Labels)" />
                    </div>
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
            <h6 class="m-0">Item to Item Recommendations</h6>
          </div>
          <div class="card-body border-bottom">
            <d-row>
              <d-col sm="6" md="6">
                <d-input-group prepend="Recommender" class="mb-3">
                  <d-select @change="changeRecommender" :value="recommender">
                    <option v-for="(recommender, idx) in recommenders" :key="idx" :value="recommender">
                      {{ recommender }}
                    </option>
                  </d-select>
                </d-input-group>
              </d-col>
              <d-col sm="6" md="6">
                <d-input-group prepend="Categories" class="mb-3">
                  <d-select @change="changeCategory">
                    <option v-for="(category, idx) in categories" :key="idx" :value="category">
                      {{ category }}
                    </option>
                  </d-select>
                </d-input-group>
              </d-col>
            </d-row>
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
                  <th scope="col" class="border-0">Score</th>
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
                  <td>{{ format_date_time(item.Timestamp) }}</td>
                  <td>
                    <span
                      style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif">
                      {{ fold(item.Labels) }}
                    </span>
                  </td>
                  <td>{{ item.Comment }}</td>
                  <td>{{ item.Score.toFixed(5) }}</td>
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
import utils from '../utils';

const axios = require('axios');

export default {
  data() {
    return {
      item_id: null,
      items: [],
      current_item: null,
      recommenders: ['neighbors'],
      recommender: 'neighbors',
      categories: [''],
      category: '',
    };
  },
  created() {
    this.item_id = this.$route.params.item_id;
  },
  mounted() {
    axios
      .get(`/api/dashboard/item-to-item/${this.recommender}/${this.item_id}`)
      .then((response) => {
        this.items = response.data;
      });
    axios.get(`/api/item/${this.item_id}`).then((response) => {
      this.current_item = response.data;
    });
    axios.get('/api/dashboard/categories').then((response) => {
      this.categories = [''].concat(response.data);
    });
    // load config
    axios.get('/api/dashboard/config')
      .then((response) => {
        this.cacheSize = response.data.database.cache_size;
        this.recommenders = ['neighbors'];
        response.data.recommend['item-to-item'].forEach((recommender) => {
          this.recommenders.push(recommender.name);
        });
      });
  },
  methods: {
    format_date_time(timestamp) {
      if (timestamp === '') {
        return '';
      }
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    },
    changeRecommender(value) {
      this.recommender = value;
      axios
        .get(`/api/dashboard/item-to-item/${value}/${this.item_id}`, {
          params: {
            category: this.category === '' ? null : this.category,
          },
        })
        .then((response) => {
          this.items = response.data;
        });
    },
    changeCategory(event) {
      this.category = event;
      axios
        .get(`/api/dashboard/item-to-item/neighbors/${this.item_id}`, {
          params: {
            category: event === '' ? null : event,
          },
        })
        .then((response) => {
          this.items = response.data;
        });
    },
    fold: utils.fold,
    stringify: utils.stringify,
  },
};
</script>
