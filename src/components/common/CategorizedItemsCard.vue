<template>
  <v-card>
    <v-card-title class="border-b">
      <h6 class="text-h6">{{ title }}</h6>
    </v-card-title>

    <v-card-text class="border-b">
      <v-select
        v-model="category"
        :items="categories"
        label="Categories"
        density="compact"
        hide-details
        @update:model-value="changeCategory"
      />
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
          <v-chip
            v-for="(label, labelIdx) in item.Labels"
            :key="`label-${labelIdx}`"
            size="small"
            variant="outlined"
            color="primary"
            class="mr-1"
          >
            {{ label }}
          </v-chip>
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

export default {
  name: 'categorized-items-card',
  props: {
    title: {
      type: String,
      default: '--',
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    api: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const items = ref([]);
    const pageNumber = ref(0);
    const categories = ref(['']);
    const category = ref('');

    const pageCount = computed(() => {
      return Math.ceil(items.value.length / props.pageSize);
    });

    const pageItems = computed(() => {
      const start = pageNumber.value * props.pageSize;
      const end = Math.min(start + props.pageSize, items.value.length);
      return items.value.slice(start, end);
    });

    const fetchData = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: props.api,
          params: {
            end: 100,
          },
        });
        items.value = response.data || [];
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const changeCategory = async (value) => {
      try {
        const response = await axios({
          method: 'get',
          url: `${props.api}${value}`,
          params: {
            end: 100,
          },
        });
        items.value = response.data || [];
      } catch (error) {
        console.error('Error fetching data:', error);
      }
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
      items,
      pageNumber,
      categories,
      category,
      pageCount,
      pageItems,
      changeCategory,
      prevPage,
      nextPage,
    };
  },
};
</script>