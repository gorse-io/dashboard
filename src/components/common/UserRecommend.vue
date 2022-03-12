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
          <d-col sm="6"
            ><d-select v-model="recommender" @change="changeRecommend">
              <option
                v-for="option in options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.text }}
              </option>
            </d-select></d-col
          >
          <d-col sm="6"
            ><d-input-group prepend="Categories" class="mb-3">
              <d-select v-model="category" @change="changeCategory">
                <option
                  v-for="(category, idx) in categories"
                  :key="idx"
                  :value="category"
                >
                  {{ category }}
                </option>
              </d-select>
            </d-input-group></d-col
          >
        </d-row>
      </div>
    </d-card-body>

    <d-card-body class="p-0">
      <!-- Top Referrals List Group -->
      <div
        v-for="(item, idx) in pageItems"
        :key="idx"
        class="blog-comments__item d-flex p-3"
      >
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
            <d-badge
              outline
              theme="primary"
              v-for="(label, idx) in item.Labels"
              :key="idx"
            >
              {{ label }}
            </d-badge>
          </div>

          <p
            class="m-0 my-0 mb-0 text-muted text-semibold"
            style="font-size: 80%"
          >
            {{ item.Timestamp }}
          </p>
        </div>
      </div>
    </d-card-body>

    <d-card-footer class="border-top">
      <d-button-group class="mb-3">
        <d-button
          class="btn-white"
          @click="prevPage"
          v-if="this.pageNumber !== 0"
          ><i class="material-icons">arrow_back_ios</i></d-button
        >
        <d-button
          class="btn-white"
          @click="nextPage"
          v-if="this.pageNumber + 1 !== pageCount"
          ><i class="material-icons">arrow_forward_ios</i></d-button
        >
      </d-button-group>
    </d-card-footer>
  </d-card>
</template>

<script>
const axios = require('axios');

export default {
  name: 'ao-top-referrals',
  props: {
    user_id: {
      default: '',
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
      options: [
        { value: '_', text: 'Recommendation' },
        { value: 'offline', text: 'Offline Recommendation' },
        { value: 'collaborative', text: 'Collaborative Recommendation' },
        { value: 'item_based', text: 'Item-based Recommendation' },
        { value: 'user_based', text: 'User-based Recommendation' },
      ],
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
      axios
        .get(`/api/dashboard/recommend/${this.user_id}/${value}/${this.category}`, {
          params: {
            n: 100,
          },
        })
        .then((response) => {
          this.items = response.data;
        });
    },
    changeCategory(value) {
      axios
        .get(`/api/dashboard/recommend/${this.user_id}/${this.recommender}/${value}`, {
          params: {
            n: 100,
          },
        })
        .then((response) => {
          this.items = response.data;
        });
    },
  },
  mounted() {
    axios
      .get(`/api/dashboard/recommend/${this.user_id}/${this.recommender}/`, {
        params: {
          n: 100,
        },
      })
      .then((response) => {
        this.items = response.data;
      });
    axios.get('/api/dashboard/categories').then((response) => {
      this.categories = [''].concat(response.data);
    });
  },
};
</script>
