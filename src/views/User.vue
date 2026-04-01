<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="py-4">
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase text-subtitle-2">User ID:</span>
        <h3 class="text-h5">{{ user_id }}</h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-b">Information</v-card-title>
          <v-list v-if="current_user">
            <v-list-item class="px-4 py-3">
              <v-row no-gutters>
                <v-col cols="12" md="2">
                  <label class="text-body-2 font-weight-medium">Labels</label>
                </v-col>
                <v-col cols="12" md="10">
                  <highlightjs language='json' :code="JSON.stringify(current_user.Labels, null, 2)" />
                </v-col>
              </v-row>
            </v-list-item>
            <v-list-item class="px-4 py-3">
              <v-row no-gutters>
                <v-col cols="12" md="2">
                  <label class="text-body-2 font-weight-medium">Description</label>
                </v-col>
                <v-col cols="12" md="10">
                  <span class="text-muted">{{ current_user.Comment }}</span>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- User to User Table -->
    <v-row v-if="recommenders.length > 0">
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-b">User to User</v-card-title>
          <v-card-text class="border-b">
            <v-select
              v-model="recommender"
              :items="recommenders"
              label="Recommender"
              density="compact"
              hide-details
              @update:model-value="changeRecommender"
            />
          </v-card-text>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">ID</th>
                <th class="text-left">Labels</th>
                <th class="text-left">Score</th>
                <th class="text-left"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, idx) in users" :key="idx">
                <td>{{ user.UserId }}</td>
                <td>
                  <span class="font-monospace">{{ user.Labels }}</span>
                </td>
                <td>{{ user.Score.toFixed(5) }}</td>
                <td>
                  <v-btn
                    size="small"
                    variant="outlined"
                    :to="{ name: 'recommend', params: { user_id: user.UserId } }"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </td>
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

export default {
  name: 'user-view',
  setup() {
    const route = useRoute();
    const user_id = ref(route.params.user_id);
    const users = ref([]);
    const last_modified = ref(undefined);
    const recommenders = ref([]);
    const recommender = ref(null);
    const current_user = ref(null);

    const format_date_time = (timestamp) => {
      if (!timestamp) return '';
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    };

    const changeRecommender = async (value) => {
      recommender.value = value;
      try {
        const response = await axios({
          method: 'get',
          url: `/api/dashboard/user-to-user/${value}/${user_id.value}`,
        });
        users.value = response.data;
        last_modified.value = response.headers['last-modified'];
      } catch (error) {
        console.error('Error fetching user-to-user:', error);
      }
    };

    onMounted(async () => {
      try {
        const response = await axios({
          method: 'get',
          url: `/api/user/${user_id.value}`,
        });
        current_user.value = response.data;
      } catch (error) {
        console.error('Error fetching user:', error);
      }

      try {
        const response = await axios({
          method: 'get',
          url: '/api/dashboard/config',
        });
        if (response.data.recommend['user-to-user']) {
          recommenders.value = response.data.recommend['user-to-user'].map(r => r.name);
          if (recommenders.value.length > 0) {
            changeRecommender(recommenders.value[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    });

    return {
      user_id,
      users,
      last_modified,
      recommenders,
      recommender,
      current_user,
      format_date_time,
      changeRecommender,
    };
  },
};
</script>