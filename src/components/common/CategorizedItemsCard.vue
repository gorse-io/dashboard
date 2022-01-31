<template>
  <d-card class="card-small">
    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </d-card-header>

    <div class="card-body border-bottom">
      <d-input-group prepend="Categories" class="mb-3">
        <d-select @change="changeCategory">
          <option v-for="(category, idx) in categories" :key="idx" :value="category">
            {{ category }}
          </option>
        </d-select>
      </d-input-group>
    </div>

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
              theme="secondary"
              v-for="(label, idx) in item.Categories"
              :key="idx"
            >
              {{ label }}
            </d-badge>
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
    title: {
      type: String,
      default: '--',
    },
    pageSize: {
      default: 10,
    },
    api: {
      type: String,
    },
  },
  data() {
    return {
      items: [],
      pageNumber: 0,
      categories: [''],
    };
  },
  mounted() {
    axios.get('/api/dashboard/categories').then((response) => {
      this.categories = [''].concat(response.data);
    });
    axios.get(this.api, {
      params: {
        end: this.cacheSize,
      },
    })
      .then((response) => {
        this.items = response.data;
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
    changeCategory(value) {
      axios.get(this.api + value, {
        params: {
          end: this.cacheSize,
        },
      })
        .then((response) => {
          this.items = response.data;
        });
    },
  },
};
</script>
