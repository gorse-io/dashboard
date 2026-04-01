<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="py-4">
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase text-subtitle-2">Item ID:</span>
        <h3 class="text-h5">{{ item_id }}</h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-b">Information</v-card-title>
          <v-list v-if="current_item">
            <v-list-item class="px-4 py-3">
              <v-row no-gutters>
                <v-col cols="12" md="2">
                  <label class="text-body-2 font-weight-medium">Categories</label>
                </v-col>
                <v-col cols="12" md="10">
                  <v-chip
                    v-for="(category, idx) in current_item.Categories"
                    :key="idx"
                    size="small"
                    variant="outlined"
                    class="mr-1"
                  >
                    {{ category }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-list-item>
            <v-list-item class="px-4 py-3">
              <v-row no-gutters>
                <v-col cols="12" md="2">
                  <label class="text-body-2 font-weight-medium">Timestamp</label>
                </v-col>
                <v-col cols="12" md="10">
                  <span class="text-muted">{{ format_date_time(current_item.Timestamp) }}</span>
                </v-col>
              </v-row>
            </v-list-item>
            <v-list-item class="px-4 py-3">
              <v-row no-gutters>
                <v-col cols="12" md="2">
                  <label class="text-body-2 font-weight-medium">Labels</label>
                </v-col>
                <v-col cols="12" md="10">
                  <highlightjs language='json' :code="stringify(current_item.Labels)" />
                </v-col>
              </v-row>
            </v-list-item>
            <v-list-item class="px-4 py-3">
              <v-row no-gutters>
                <v-col cols="12" md="2">
                  <label class="text-body-2 font-weight-medium">Description</label>
                </v-col>
                <v-col cols="12" md="10">
                  <span class="text-muted">{{ current_item.Comment }}</span>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Item to Item Table -->
    <v-row v-if="recommenders.length > 0">
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-b">Item to Item Recommendations</v-card-title>
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
                  <span class="font-monospace">{{ fold(item.Labels) }}</span>
                </td>
                <td>{{ item.Comment }}</td>
                <td>{{ item.Score.toFixed(5) }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-card-actions v-if="last_modified" class="border-t">
            <span class="text-muted text-caption">Last Update: {{ format_date_time(last_modified) }}</span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import moment from 'moment';
import utils from '../utils';

export default {
  name: 'item-view',
  setup() {
    const route = useRoute();
    const item_id = ref(route.params.item_id);
    const items = ref([]);
    const last_modified = ref(undefined);
    const current_item = ref(null);
    const recommenders = ref([]);
    const recommender = ref('');
    const categories = ref(['']);
    const category = ref('');

    const fold = utils.fold;
    const stringify = utils.stringify;

    const format_date_time = (timestamp) => {
      if (!timestamp) return '';
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    };

    const fetchItems = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: `/api/dashboard/item-to-item/${recommender.value}/${item_id.value}`,
          params: {
            category: category.value || undefined,
          },
        });
        items.value = response.data;
        last_modified.value = response.headers['last-modified'];
      } catch (error) {
        console.error('Error fetching item-to-item:', error);
      }
    };

    const changeRecommender = () => {
      fetchItems();
    };

    const changeCategory = () => {
      fetchItems();
    };

    onMounted(async () => {
      try {
        const response = await axios({
          method: 'get',
          url: `/api/item/${item_id.value}`,
        });
        current_item.value = response.data;
      } catch (error) {
        console.error('Error fetching item:', error);
      }

      try {
        const response = await axios({
          method: 'get',
          url: '/api/dashboard/categories',
        });
        categories.value = [''].concat(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      try {
        const response = await axios({
          method: 'get',
          url: '/api/dashboard/config',
        });
        if (response.data.recommend['item-to-item']) {
          recommenders.value = response.data.recommend['item-to-item'].map(r => r.name);
          if (recommenders.value.length > 0) {
            recommender.value = recommenders.value[0];
            fetchItems();
          }
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    });

    return {
      item_id,
      items,
      last_modified,
      current_item,
      recommenders,
      recommender,
      categories,
      category,
      fold,
      stringify,
      format_date_time,
      changeRecommender,
      changeCategory,
    };
  },
};
</script>