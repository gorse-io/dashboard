<template>
  <d-card class="card-small">
    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </d-card-header>

    <d-card-body class="p-0">
      <!-- Top Referrals List Group -->
      <div v-for="(item, idx) in pageItems" :key="idx" class="blog-comments__item d-flex p-3">
        <!-- Content -->
        <div class="blog-comments__content">
          <!-- Content - Title -->
          <div class="blog-comments__meta text-muted">
            {{ item.Item.ItemId }}
            <d-badge outline pill theme="secondary" class="float-right">
              {{ item.FeedbackType + (item.Value > 0 ? '' + item.Value : '') }}
            </d-badge>
          </div>

          <!-- Content - Body -->
          <p class="m-0 my-1 mb-2 text-muted text-semibold">
            {{ item.Item.Comment }}
          </p>

          <!-- Content - Actions -->
          <div class="blog-comments__actions">
            <d-badge outline v-for="(label, idx) in item.Item.Categories" :key="idx">
              {{ label }}
            </d-badge>
            <span
              style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif">
              {{ fold(item.Item.Labels) }}
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
import utils from '@/utils';

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
    items: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      pageNumber: 0,
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
    fold: utils.fold,
  },
};
</script>
