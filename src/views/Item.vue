<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Item ID:</span>
        <h3 class="page-title">{{ item_id }}</h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">Information</h6>
          </v-card-title>
          <v-card-text class="pa-0 pb-2">
            <v-list>
              <v-list-item class="p-3" v-if="current_item != null">
                <v-row>
                  <v-col sm="12" md="2">
                    <label>Categories</label>
                  </v-col>
                  <v-col sm="12" md="10">
                    <v-chip
                      v-for="(category, idx) in current_item.Categories"
                      :key="idx"
                      size="small"
                      variant="outlined"
                      color="secondary"
                      class="mr-1 mb-1"
                    >
                      {{ category }}
                    </v-chip>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col sm="12" md="2">
                    <label>Timestamp</label>
                  </v-col>
                  <v-col sm="12" md="10">
                    <label class="text-light">{{
                      format_date_time(current_item.Timestamp)
                    }}</label>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col sm="12" md="2">
                    <label>Labels</label>
                  </v-col>
                  <v-col sm="12" md="10">
                    <div>
                      <highlightjs language='json' :code="stringify(current_item.Labels)" />
                    </div>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col sm="12" md="2">
                    <label>Description</label>
                  </v-col>
                  <v-col sm="12" md="10">
                    <label class="text-light">{{ current_item.Comment }}</label>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row v-if="recommenders.length > 0">
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">Item to Item Recommendations</h6>
          </v-card-title>
          <v-card-text class="border-bottom">
            <v-row>
              <v-col sm="6" md="6">
                <div class="d-flex align-center flex-wrap mb-3">
                  <v-chip size="small" variant="outlined" class="mr-2">Recommender</v-chip>
                  <v-select
                    :model-value="recommender"
                    :items="recommenders"
                    hide-details="auto"
                    density="comfortable"
                    class="flex-grow-1"
                    @update:modelValue="changeRecommender"
                  />
                </div>
              </v-col>
              <v-col sm="6" md="6">
                <div class="d-flex align-center flex-wrap mb-3">
                  <v-chip size="small" variant="outlined" class="mr-2">Categories</v-chip>
                  <v-select
                    :model-value="category"
                    :items="categories"
                    hide-details="auto"
                    density="comfortable"
                    class="flex-grow-1"
                    @update:modelValue="changeCategory"
                  />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text class="pa-0 pb-3">
            <v-table class="mb-0">
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
                      <v-chip
                        v-for="(category, idx) in item.Categories"
                        :key="idx"
                        size="small"
                        variant="outlined"
                        color="secondary"
                        class="mr-1 mb-1"
                      >
                        {{ category }}
                      </v-chip>
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
            </v-table>
          </v-card-text>
          <v-card-actions class="border-top" v-if="last_modified !== undefined">
            <span class="text-muted">Last Update: {{ format_date_time(last_modified) }}</span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import utils from '../utils';

export default {
  data() {
    return {
      item_id: null,
      items: [],
      last_modified: undefined,
      current_item: null,
      recommenders: [],
      recommender: '',
      categories: [''],
      category: '',
    };
  },
  created() {
    this.item_id = this.$route.params.item_id;
  },
  mounted() {
    axios({
      method: 'get',
      url: `/api/item/${this.item_id}`,
    }).then((response) => {
      this.current_item = response.data;
    });
    axios({
      method: 'get',
      url: '/api/dashboard/categories',
    }).then((response) => {
      this.categories = [''].concat(response.data);
    });
    // load config
    axios({
      method: 'get',
      url: '/api/dashboard/config',
    }).then((response) => {
      this.cacheSize = response.data.database.cache_size;
      this.recommenders = response.data.recommend['item-to-item'].map(recommender => recommender.name);
      if (this.recommenders.length > 0) {
        this.changeRecommender(this.recommenders[0]);
      }
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
      axios({
        method: 'get',
        url: `/api/dashboard/item-to-item/${value}/${this.item_id}`,
        params: {
          category: this.category === '' ? null : this.category,
        },
      }).then((response) => {
        this.items = response.data;
        this.last_modified = response.headers['last-modified'];
      });
    },
    changeCategory(event) {
      this.category = event;
      axios({
        method: 'get',
        url: `/api/dashboard/item-to-item/neighbors/${this.item_id}`,
        params: {
          category: event === '' ? null : event,
        },
      }).then((response) => {
        this.items = response.data;
        this.last_modified = response.headers['last-modified'];
      });
    },
    fold: utils.fold,
    stringify: utils.stringify,
  },
};
</script>
