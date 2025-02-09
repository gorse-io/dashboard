<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">User ID:</span>
        <h3 class="page-title">{{ user_id }}</h3>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Information</h6>
          </div>
          <div class="card-body p-0 pb-3">
            <d-list-group flush>
              <d-list-group-item class="p-3" v-if="current_user != null">
                <d-row>
                  <d-col sm="12" md="2">
                    <label>Labels</label>
                  </d-col>
                  <d-col sm="12" md="10">
                    <div>
                      <highlightjs language='json' :code="JSON.stringify(current_user.Labels, null, 2)" />
                    </div>
                  </d-col>
                </d-row>
              </d-list-group-item>
            </d-list-group>
          </div>
        </div>
      </div>
    </div>

    <!-- Default Light Table -->
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">User to User</h6>
          </div>
          <div class="card-body p-0 pb-3">
            <table class="table mb-0">
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
                      <d-button size="small" outline>Insight</d-button>
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

const axios = require('axios');

export default {
  data() {
    return {
      user_id: null,
      users: [],
      current_user: null,
    };
  },
  created() {
    this.user_id = this.$route.params.user_id;
  },
  mounted() {
    axios.get(`/api/dashboard/user-to-user/neighbors/${this.user_id}`).then((response) => {
      this.users = response.data;
    });
    axios.get(`/api/user/${this.user_id}`).then((response) => {
      this.current_user = response.data;
    });
  },
  methods: {
    format_date_time(timestamp) {
      if (timestamp === '') {
        return '';
      }
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    },
  },
};
</script>
