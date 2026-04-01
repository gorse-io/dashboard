<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4">
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase text-subtitle-2">Overview</span>
        <h3 class="text-h5">Users</h3>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-b">Users</v-card-title>
          <v-card-text class="border-b">
            <v-text-field
              v-model="user_id"
              label="User ID"
              density="compact"
              hide-details
              @keyup.enter="search_user"
            >
              <template v-slot:append>
                <v-btn icon="mdi-magnify" variant="text" @click="search_user" />
                <v-btn icon="mdi-arrow-left" variant="text" @click="previous_page" />
                <v-btn icon="mdi-arrow-right" variant="text" @click="next_page" />
              </template>
            </v-text-field>
          </v-card-text>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">ID</th>
                <th class="text-left">Labels</th>
                <th class="text-left">Description</th>
                <th class="text-left">Last Active</th>
                <th class="text-left">Last Update</th>
                <th class="text-left"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, idx) in users" :key="idx">
                <td>{{ user.UserId }}</td>
                <td>
                  <span class="font-monospace">
                    {{ user.Labels }}
                  </span>
                </td>
                <td>{{ user.Comment }}</td>
                <td>{{ format_date_time(user.LastActiveTime) }}</td>
                <td>{{ format_date_time(user.LastUpdateTime) }}</td>
                <td>
                  <v-btn-group>
                    <v-btn size="small" variant="outlined" @click="list_user_neighbors(user.UserId)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn size="small" variant="outlined" @click="list_user_recommend(user.UserId)">
                      <v-icon>mdi-heart</v-icon>
                    </v-btn>
                    <v-btn size="small" color="error" variant="outlined" @click="open_delete_user_dialog(user.UserId)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-btn-group>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-card-title>Delete User</v-card-title>
        <v-card-text>
          <div class="mb-3">
            Are you sure to delete user <span class="font-weight-bold">{{ deleteUserId }}</span>?
            Please type the ID of the deleted user.
          </div>
          <v-text-field v-model="confirmUserId" density="compact">
            <template v-slot:append-inner>
              <v-btn color="error" variant="outlined" @click="delete_user">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-text-field>
          <span class="text-error">{{ deleteUserError }}</span>
        </v-card-text>
      </v-card>
    </v-dialog>
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