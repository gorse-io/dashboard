<template>
  <v-card class="card-small">
    <v-card-title class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </v-card-title>

    <v-card-text class="border-bottom">
      <v-row>
        <v-col cols="12" md="6">
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
        <v-col cols="12" md="6">
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

    <v-card-text class="pa-0">
      <v-table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Categories</th>
            <th>Timestamp</th>
            <th>Labels</th>
            <th>Description</th>
            <th>Score</th>
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

    <v-card-actions class="border-t" v-if="last_modified !== undefined">
      <span class="text-muted">Last Update: {{ format_date_time(last_modified) }}</span>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import utils from '@/utils';

export default {
  name: 'ao-top-referrals',
  props: {
    title: {
      type: String,
      default: 'Non-personalized Recommendations',
    },
    pageSize: {
      default: 10,
    },
    recommenders: {
      type: Array,
    },
  },
  data() {
    return {
      items: [],
      last_modified: undefined,
      pageNumber: 0,
      categories: [''],
      recommender: this.recommenders[0],
      category: '',
    };
  },
  mounted() {
    axios({
      method: 'get',
      url: '/api/dashboard/categories',
    }).then((response) => {
      this.categories = [''].concat(response.data);
    });
    axios({
      method: 'get',
      url: '/api/dashboard/latest',
      params: {
        end: this.cacheSize,
      },
    })
      .then((response) => {
        this.items = response.data === null ? [] : response.data;
        this.last_modified = response.headers['last-modified'];
      });
  },
  computed: {
    pageCount() {
      return this.items.length / this.pageSize;
    },
    pageItems() {
      const start = this.pageNumber * this.pageSize;
      const end = Math.min(start + this.pageSize, this.items.length);
      return this.items.slice(start, end);
    },
  },
  methods: {
    prevPage() {
      this.pageNumber -= 1;
    },
    nextPage() {
      this.pageNumber += 1;
    },
    changeRecommender(value) {
      this.recommender = value;
      axios({
        method: 'get',
        url: `/api/dashboard/${value}`,
        params: {
          category: this.category,
          end: this.cacheSize,
        },
      })
        .then((response) => {
          this.items = response.data === null ? [] : response.data;
          this.last_modified = response.headers['last-modified'];
        });
    },
    changeCategory(value) {
      this.category = value;
      axios({
        method: 'get',
        url: `/api/dashboard/${this.recommender}`,
        params: {
          category: value,
          end: this.cacheSize,
        },
      })
        .then((response) => {
          this.items = response.data === null ? [] : response.data;
          this.last_modified = response.headers['last-modified'];
        });
    },
    fold: utils.fold,
    format_date_time(timestamp) {
      if (timestamp === '') {
        return '';
      }
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    },
  },
};
</script>
