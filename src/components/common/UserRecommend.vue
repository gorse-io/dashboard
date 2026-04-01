<template>
  <v-card>
    <v-card-title class="border-b">
      <h6 class="text-h6">Recommend</h6>
    </v-card-title>

    <v-card-text class="pa-0">
      <div class="pa-4 border-b">
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="recommender"
              :items="recommenders"
              label="Recommender"
              density="compact"
              hide-details
              @update:model-value="changeRecommend"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="category"
              :items="categories"
              label="Categories"
              density="compact"
              hide-details
              @update:model-value="changeCategory"
            />
          </v-col>
        </v-row>
      </div>
    </v-card-text>

    <v-card-text class="pa-0">
      <div v-for="(item, idx) in pageItems" :key="idx" class="pa-3 border-b">
        <div class="text-muted mb-1">
          {{ item.ItemId }}
        </div>

        <p class="mb-1 text-muted">
          {{ item.Comment }}
        </p>

        <div class="mb-1">
          <v-chip
            v-for="(label, labelIdx) in item.Categories"
            :key="labelIdx"
            size="small"
            variant="outlined"
            class="mr-1"
          >
            {{ label }}
          </v-chip>
          <span class="font-monospace">
            {{ fold(item.Labels) }}
          </span>
        </div>

        <p class="mb-0 text-caption text-muted">
          {{ item.Timestamp }}
        </p>
      </div>
    </v-card-text>

    <v-card-actions class="border-t">
      <v-btn
        variant="text"
        @click="prevPage"
        :disabled="pageNumber === 0"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn
        variant="text"
        @click="nextPage"
        :disabled="pageNumber + 1 >= pageCount"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import utils from '@/utils';

export default {
  name: 'user-recommend',
  props: {
    user_id: {
      type: String,
      default: '',
    },
    recommenders: {
      type: Array,
      default: () => [''],
    },
  },
  setup(props) {
    const categories = ref(['']);
    const pageSize = 10;
    const items = ref([]);
    const pageNumber = ref(0);
    const recommender = ref('');
    const category = ref('');

    const fold = utils.fold;

    const pageCount = computed(() => {
      return Math.ceil(items.value.length / pageSize);
    });

    const pageItems = computed(() => {
      const start = pageNumber.value * pageSize;
      const end = Math.min(start + pageSize, items.value.length);
      return items.value.slice(start, end);
    });

    const fetchData = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: `/api/dashboard/recommend/${props.user_id}/${recommender.value}`,
          params: {
            n: 100,
            category: category.value || undefined,
          },
        });
        items.value = response.data;
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    const changeRecommend = () => {
      pageNumber.value = 0;
      fetchData();
    };

    const changeCategory = () => {
      pageNumber.value = 0;
      fetchData();
    };

    const prevPage = () => {
      if (pageNumber.value > 0) {
        pageNumber.value -= 1;
      }
    };

    const nextPage = () => {
      if (pageNumber.value + 1 < pageCount.value) {
        pageNumber.value += 1;
      }
    };

    onMounted(async () => {
      await fetchData();

      try {
        const response = await axios({
          method: 'get',
          url: '/api/dashboard/categories',
        });
        categories.value = [''].concat(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    });

    return {
      categories,
      items,
      pageNumber,
      recommender,
      category,
      fold,
      pageCount,
      pageItems,
      changeRecommend,
      changeCategory,
      prevPage,
      nextPage,
    };
  },
};
</script>