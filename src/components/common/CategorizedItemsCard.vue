<template>
  <v-card class="card-small">
    <!-- Card Header -->
    <v-card-title class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </v-card-title>

    <v-card-text class="border-bottom">
      <div class="d-flex align-center flex-wrap mb-3">
        <v-chip size="small" variant="outlined" class="mr-2">Categories</v-chip>
        <v-select
          :items="categories"
          hide-details="auto"
          density="comfortable"
          class="flex-grow-1"
          @update:modelValue="changeCategory"
        />
      </div>
    </v-card-text>

    <v-card-text class="pa-0">
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
            <v-chip
              v-for="(label, idx) in item.Categories"
              :key="idx"
              size="small"
              variant="outlined"
              color="secondary"
              class="mr-1 mb-1"
            >
              {{ label }}
            </v-chip>
            <v-chip
              v-for="(label, idx) in item.Labels"
              :key="idx"
              size="small"
              variant="outlined"
              color="primary"
              class="mr-1 mb-1"
            >
              {{ label }}
            </v-chip>
          </div>

          <p class="m-0 my-0 mb-0 text-muted text-semibold" style="font-size: 80%">
            {{ item.Timestamp }}
          </p>
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="border-t">
      <v-btn-group class="mb-3">
        <v-btn variant="outlined" size="small" @click="prevPage" v-if="this.pageNumber !== 0"><i
            class="material-icons">arrow_back_ios</i></v-btn>
        <v-btn variant="outlined" size="small" @click="nextPage" v-if="this.pageNumber + 1 !== pageCount"><i
            class="material-icons">arrow_forward_ios</i></v-btn>
      </v-btn-group>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios';

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
    axios({
      method: 'get',
      url: '/api/dashboard/categories',
    }).then((response) => {
      this.categories = [''].concat(response.data);
    });
    axios({
      method: 'get',
      url: this.api,
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
      axios({
        method: 'get',
        url: this.api + value,
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
