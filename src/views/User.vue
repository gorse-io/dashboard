<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">User ID:</span>
        <h3 class="page-title">{{ user_id }}</h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">Information</h6>
          </v-card-title>
          <v-card-text class="pa-0 pb-3">
            <v-list>
              <v-list-item class="p-3" v-if="current_user != null">
                <v-row>
                  <v-col sm="12" md="2">
                    <label>Labels</label>
                  </v-col>
                  <v-col sm="12" md="10">
                    <div>
                      <highlightjs language='json' :code="JSON.stringify(current_user.Labels, null, 2)" />
                    </div>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col sm="12" md="2">
                    <label>Description</label>
                  </v-col>
                  <v-col sm="12" md="10">
                    <label class="text-light">{{ current_user.Comment }}</label>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row v-if="recommenders.length > 0">
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">User to User</h6>
          </v-card-title>
          <v-card-text class="border-bottom">
            <v-row>
              <v-col sm="12" md="12">
                <div class="d-flex align-center flex-wrap mb-3">
                  <v-chip size="small" variant="outlined" class="mr-2">Recommender</v-chip>
                  <v-select
                    :model-value="recommender"
                    :items="recommenders"
                    hide-details="auto"
                    density="comfortable"
                    class="flex-grow-1"
                    @update:modelValue="changeRecommender"
                  />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text class="pa-0">
            <v-table class="mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">ID</th>
                  <th scope="col" class="border-0">Labels</th>
                  <th scope="col" class="border-0">Score</th>
                  <th scope="col" class="border-0"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, idx) in users" :key="idx">
                  <td>{{ user.UserId }}</td>
                  <td>
                    <span
                      style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif">
                      {{ user.Labels }}
                    </span>
                  </td>
                  <td>{{ user.Score.toFixed(5) }}</td>
                  <td>
                    <router-link :to="{
                      name: 'recommend',
                      params: { user_id: user.UserId },
                    }">
                      <v-btn size="small" variant="outlined"><i class="material-icons">visibility</i></v-btn>
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-card-actions class="border-top" v-if="last_modified !== undefined">
            <span class="text-muted">Last Update: {{ format_date_time(last_modified) }}</span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import moment from 'moment';

export default {
  data() {
    return {
      user_id: null,
      users: [],
      last_modified: undefined,
      recommenders: [],
      recommender: null,
      current_user: null,
    };
  },
  created() {
    this.user_id = this.$route.params.user_id;
  },
  mounted() {
    axios({
      method: 'get',
      url: `/api/user/${this.user_id}`,
    }).then((response) => {
      this.current_user = response.data;
    });
    // load config
    axios({
      method: 'get',
      url: '/api/dashboard/config',
    }).then((response) => {
      this.cacheSize = response.data.database.cache_size;
      this.recommenders = response.data.recommend['user-to-user'].map(recommender => recommender.name);
      if (this.recommenders.length > 0) {
        this.changeRecommender(this.recommenders[0]);
      }
    });
  },
  methods: {
    changeRecommender(value) {
      this.recommender = value;
      axios({
        method: 'get',
        url: `/api/dashboard/user-to-user/${value}/${this.user_id}`,
      }).then((response) => {
        this.users = response.data;
        this.last_modified = response.headers['last-modified'];
      });
    },
    format_date_time(timestamp) {
      if (timestamp === '') {
        return '';
      }
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    },
  },
};
</script>
