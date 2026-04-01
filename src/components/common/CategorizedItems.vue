<template>
  <v-card class="mb-4">
    <v-card-title class="border-b">
      <h6 class="text-h6">{{ title }}</h6>
    </v-card-title>

    <v-card-text class="border-b">
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="recommender"
            :items="recommenders"
            label="Recommender"
            density="compact"
            hide-details
            @update:model-value="changeRecommender"
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
    </v-card-text>

    <v-table>
      <thead>
        <tr>
          <th class="text-left">ID</th>
          <th class="text-left">Categories</th>
          <th class="text-left">Timestamp</th>
          <th class="text-left">Labels</th>
          <th class="text-left">Description</th>
          <th class="text-left">Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in items" :key="idx">
          <td>{{ item.ItemId }}</td>
          <td>
            <v-chip
              v-for="(category, catIdx) in item.Categories"
              :key="catIdx"
              size="small"
              variant="outlined"
              class="mr-1"
            >
              {{ category }}
            </v-chip>
          </td>
          <td>{{ format_date_time(item.Timestamp) }}</td>
          <td>
            <span class="font-monospace">
              {{ fold(item.Labels) }}
            </span>
          </td>
          <td>{{ item.Comment }}</td>
          <td>{{ item.Score.toFixed(5) }}</td>
        </tr>
      </tbody>
    </v-table>

    <v-card-actions v-if="last_modified !== undefined" class="border-t">
      <span class="text-muted text-caption">Last Update: {{ format_date_time(last_modified) }}</span>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import moment from 'moment';
import utils from '@/utils';

export default {
  name: 'categorized-items',
  props: {
    title: {
      type: String,
      default: 'Non-personalized Recommendations',
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    recommenders: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const items = ref([]);
    const last_modified = ref(undefined);
    const pageNumber = ref(0);
    const categories = ref(['']);
    const recommender = ref(props.recommenders[0] || '');
    const category = ref('');

    const fold = utils.fold;

    const format_date_time = (timestamp) => {
      if (!timestamp) return '';
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    };

    const fetchData = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: `/api/dashboard/${recommender.value}`,
          params: {
            category: category.value || undefined,
            end: 100,
          },
        });
        items.value = response.data === null ? [] : response.data;
        last_modified.value = response.headers['last-modified'];
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const changeRecommender = () => {
      fetchData();
    };

    const changeCategory = () => {
      fetchData();
    };

    onMounted(async () => {
      try {
        const response = await axios({
          method: 'get',
          url: '/api/dashboard/categories',
        });
        categories.value = [''].concat(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      await fetchData();
    });

    watch(() => props.recommenders, (newRecommenders) => {
      if (newRecommenders && newRecommenders.length > 0) {
        recommender.value = newRecommenders[0];
        fetchData();
      }
    });

    return {
      items,
      last_modified,
      pageNumber,
      categories,
      recommender,
      category,
      fold,
      format_date_time,
      changeRecommender,
      changeCategory,
    };
  },
};
</script>