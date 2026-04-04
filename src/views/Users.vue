<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Users</h3>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">Users</h6>
          </v-card-title>
          <v-card-text class="border-bottom">
            <d-input-group>
              <d-input id="user_id" v-model="user_id" placeholder="User ID" @keyup.enter="search_user" />
              <d-input-group-addon append>
                <v-btn variant="text" @click="search_user"><i class="material-icons">search</i></v-btn>
                <v-btn variant="text" @click="previous_page"><i
                    class="material-icons">arrow_back_ios</i></v-btn>
                <v-btn variant="text" @click="next_page"><i
                    class="material-icons">arrow_forward_ios</i></v-btn>
              </d-input-group-addon>
            </d-input-group>
          </v-card-text>
          <v-card-text class="pa-0 pb-3">
            <v-table class="mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">ID</th>
                  <th scope="col" class="border-0">Labels</th>
                  <th scope="col" class="border-0">Description</th>
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
                    <span
                      style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif">
                      {{ user.Labels }}
                    </span>
                  </td>
                  <td>{{ user.Comment }}</td>
                  <td>{{ format_date_time(user.LastActiveTime) }}</td>
                  <td>{{ format_date_time(user.LastUpdateTime) }}</td>
                  <td>
                    <v-btn-group>
                      <v-btn size="small" variant="outlined" @click="list_user_neighbors(user.UserId)"><i
                          class="material-icons">visibility</i></v-btn>
                      <v-btn size="small" variant="outlined" @click="list_user_recommend(user.UserId)"><i
                          class="material-icons">favorite</i></v-btn>
                      <v-btn size="small" color="error" variant="outlined" @click="open_delete_user_dialog(user.UserId)"><i
                          class="material-icons">delete</i></v-btn>
                    </v-btn-group>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <d-modal v-if="showDialog" @close="showDialog = false" centered>
      <d-modal-header>
        <d-modal-title>Delete Item</d-modal-title>
      </d-modal-header>
      <d-modal-body>
        <div class="mb-3">Are you sure to delete user <span style="font-weight: bold">{{ deleteUserId }}</span>? Please
          type the ID of the deleted user.</div>
        <d-input-group>
          <d-input v-model="confirmUserId" />
          <d-input-group-addon append>
            <v-btn color="error" variant="outlined" @click="delete_user">
              <i class="material-icons">delete</i>
            </v-btn>
          </d-input-group-addon>
        </d-input-group>
        <span style="color: red">{{ deleteUserError }}</span>
      </d-modal-body>
    </d-modal>
  </v-container>
</template>

<script>
import axios from 'axios';
import moment from 'moment';

export default {
  data() {
    return {
      users: null,
      cursors: [],
      user_id: null,
      showDialog: false,
      deleteUserId: '',
      confirmUserId: '',
      deleteUserError: '',
    };
  },
  mounted() {
    this.fetch_page();
  },
  methods: {
    fetch_page() {
      const cursor = this.cursors.empty ? '' : this.cursors[this.cursors.length - 1];
      axios({
        method: 'get',
        url: '/api/dashboard/users',
        params: {
          cursor,
        },
      })
        .then((response) => {
          this.users = response.data.Users;
          this.cursors.push(response.data.Cursor);
        });
    },
    previous_page() {
      if (this.cursors.length >= 2) {
        this.cursors.pop();
        this.cursors.pop();
      } else if (this.cursors.length >= 1) {
        this.cursors.pop();
      }
      this.fetch_page();
    },
    next_page() {
      this.fetch_page();
    },
    search_user() {
      axios({
        method: 'get',
        url: `/api/dashboard/user/${this.user_id}`,
      })
        .then((response) => {
          this.users = [response.data];
        });
    },
    format_date_time(timestamp) {
      if (timestamp === '') {
        return '';
      }
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    },
    list_user_neighbors(userId) {
      this.$router.push({
        name: 'user',
        params: { user_id: userId },
      });
    },
    list_user_recommend(userId) {
      this.$router.push({
        name: 'recommend',
        params: { user_id: userId },
      });
    },
    open_delete_user_dialog(userId) {
      this.showDialog = true;
      this.deleteUserId = userId;
      this.confirmUserId = '';
      this.deleteUserError = '';
    },
    delete_user() {
      if (this.deleteUserId !== this.confirmUserId) {
        this.deleteUserError = 'user ID mismatch';
        return;
      }
      axios.delete(`/api/user/${this.deleteUserId}`).then(() => {
        this.showDialog = false;
        if (this.cursors.length >= 1) {
          this.cursors.pop();
        }
        this.fetch_page();
      }).catch((error) => {
        if (error.response) {
          this.deleteUserError = error.response.data;
        } else {
          this.deleteUserError = error;
        }
      });
    },
  },
};
</script>
