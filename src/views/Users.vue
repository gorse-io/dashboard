<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Users</h3>
      </div>
    </div>

    <!-- Default Light Table -->
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Users</h6>
          </div>
          <div class="card-body border-bottom">
            <d-input-group>
              <d-input
                id="user_id"
                v-model="user_id"
                placeholder="User ID"
                @keyup.enter.native="search_user"
              />
              <d-input-group-addon append>
                <d-button class="btn-white" @click="search_user"
                  ><i class="material-icons">search</i></d-button
                >
                <d-button class="btn-white" @click="next_page"
                  ><i class="material-icons">arrow_forward_ios</i></d-button
                >
              </d-input-group-addon>
            </d-input-group>
          </div>
          <div class="card-body p-0 pb-3">
            <table class="table mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">ID</th>
                  <th scope="col" class="border-0">Labels</th>
                  <th scope="col" class="border-0">Last Active</th>
                  <th scope="col" class="border-0">Last Update</th>
                  <th scope="col" class="border-0"></th>
                  <th scope="col" class="border-0"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, idx) in users" :key="idx">
                  <td>{{ user.UserId }}</td>
                  <td>
                    <div>
                      <d-badge
                        outline
                        theme="primary"
                        v-for="(label, idx) in user.Labels"
                        :key="idx"
                      >
                        {{ label }}
                      </d-badge>
                    </div>
                  </td>
                  <td>{{ format_date_time(user.LastActiveTime) }}</td>
                  <td>{{ format_date_time(user.LastUpdateTime) }}</td>
                  <td>
                    <router-link
                      :to="{
                        name: 'user_neighbors',
                        params: { user_id: user.UserId },
                      }"
                    >
                      <d-button size="small" outline>Neighbors</d-button>
                    </router-link>
                  </td>
                  <td>
                    <router-link
                      :to="{
                        name: 'recommend',
                        params: { user_id: user.UserId },
                      }"
                    >
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

const axios = require("axios");

export default {
  data() {
    return {
      users: null,
      cursor: "",
      user_id: null,
    };
  },
  mounted() {
    axios.get("/api/dashboard/users").then((response) => {
      this.users = response.data.Users;
      this.cursor = response.data.Cursor;
    });
  },
  methods: {
    next_page() {
      axios
        .get("/api/dashboard/users", {
          params: {
            cursor: this.cursor,
          },
        })
        .then((response) => {
          this.users = response.data.Users;
          this.cursor = response.data.Cursor;
        });
    },
    search_user() {
      axios.get(`/api/dashboard/user/${this.user_id}`).then((response) => {
        this.users = [response.data];
      });
    },
    format_date_time(timestamp) {
      if (timestamp == "") {
        return "";
      }
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    }
  },
};
</script>
