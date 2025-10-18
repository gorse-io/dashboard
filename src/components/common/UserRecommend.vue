<template>
  <d-card class="card-small">
    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">Recommend</h6>
      <div class="block-handle"></div>
    </d-card-header>

    <d-card-body class="p-0">
      <div class="card-body border-bottom">
        <d-row>
          <d-col sm="6"><d-select v-model="recommender" @change="changeRecommend">
              <option v-for="recommend in recommenders" :key="recommend" :value="recommend">
                {{ recommend }}
              </option>
            </d-select></d-col>
          <d-col sm="6"><d-input-group prepend="Categories" class="mb-3">
              <d-select v-model="category" @change="changeCategory">
                <option v-for="(category, idx) in categories" :key="idx" :value="category">
                  {{ category }}
                </option>
              </d-select>
            </d-input-group></d-col>
        </d-row>
      </div>
    </d-card-body>

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
    user_id: {
      default: '',
    },
    recommenders: {
      type: Array,
      default: () => [''],
    },
  },
  data() {
    return {
      categories: [''],
      pageSize: 10,
      items: [],
      pageNumber: 0,
      recommender: '_',
      category: '',
    };
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
    changeRecommend(value) {
      axios({
        method: 'get',
        url: `/api/dashboard/recommend/${this.user_id}/${value}`,
        params: {
          n: 100,
          category: this.category,
        },
      }).then((response) => {
        this.items = response.data;
      });
    },
    changeCategory(value) {
      console.log(this.recommender);
      axios({
        method: 'get',
        url: `/api/dashboard/recommend/${this.user_id}/${this.recommender}`,
        params: {
          n: 100,
          category: value,
        },
      }).then((response) => {
        this.items = response.data;
      });
    },
    fold: utils.fold,
  },
  mounted() {
    axios({
      method: 'get',
      url: `/api/dashboard/recommend/${this.user_id}/${this.recommender}/`,
      params: {
        n: 100,
      },
    }).then((response) => {
      this.items = response.data;
    });
    axios({
      method: 'get',
      url: '/api/dashboard/categories',
    }).then((response) => {
      this.categories = [''].concat(response.data);
    });
  },
};
</script>
