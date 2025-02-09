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
      <!-- Top Referrals List Group -->
      <div v-for="(item, idx) in pageItems" :key="idx" class="blog-comments__item d-flex p-3">
        <!-- Content -->
        <div class="blog-comments__content">
          <!-- Content - Title -->
          <div class="blog-comments__meta text-muted">
            {{ item.ItemId }}
          </div>

          <!-- Content - Body -->
          <p class="m-0 my-1 mb-2 text-muted text-semibold">
            {{ item.Comment }}
          </p>

          <!-- Content - Actions -->
          <div class="blog-comments__actions">
            <d-badge outline v-for="(label, idx) in item.Categories" :key="idx">
              {{ label }}
            </d-badge>
            <span
              style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif">
              {{ fold(item.Labels) }}
            </span>
          </div>

          <p class="m-0 my-0 mb-0 text-muted text-semibold" style="font-size: 80%">
            {{ item.Timestamp }}
          </p>
        </div>
      </div>
    </d-card-body>

    <d-card-footer class="border-top">
      <d-button-group class="mb-3">
        <d-button class="btn-white" @click="prevPage" v-if="this.pageNumber !== 0"><i
            class="material-icons">arrow_back_ios</i></d-button>
        <d-button class="btn-white" @click="nextPage" v-if="this.pageNumber + 1 !== pageCount"><i
            class="material-icons">arrow_forward_ios</i></d-button>
      </d-button-group>
    </d-card-footer>
  </d-card>
</template>

<script>
import axios from 'axios';
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
        });
    },
    fold: utils.fold,
  },
};
</script>
