<template>
  <d-card class="card-small">
    <d-card-header class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </d-card-header>

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

    <d-card-body class="p-0">
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
    </d-card-body>

    <d-card-footer class="border-top" v-if="last_modified !== undefined">
      <!-- <d-button-group class="mb-3">
        <d-button class="btn-white" @click="prevPage" v-if="this.pageNumber !== 0"><i
            class="material-icons">arrow_back_ios</i></d-button>
        <d-button class="btn-white" @click="nextPage" v-if="this.pageNumber + 1 !== pageCount"><i
            class="material-icons">arrow_forward_ios</i></d-button>
      </d-button-group> -->
      <span class="text-muted">Last Update: {{ format_date_time(last_modified) }}</span>
    </d-card-footer>
  </d-card>
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
      url: '/api/dashboard/non-personalized/popular/',
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
        url: `/api/dashboard/non-personalized/${value}/`,
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
        url: `/api/dashboard/non-personalized/${this.recommender}/`,
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
