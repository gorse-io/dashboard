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
              <d-input id="user_id" v-model="user_id" placeholder="User ID" @keyup.enter.native="search_user" />
              <d-input-group-addon append>
                <d-button class="btn-white" @click="search_user"><i class="material-icons">search</i></d-button>
                <d-button class="btn-white" @click="previous_page"><i
                    class="material-icons">arrow_back_ios</i></d-button>
                <d-button class="btn-white" @click="next_page"><i
                    class="material-icons">arrow_forward_ios</i></d-button>
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
                    <span
                      style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif">
                      {{ user.Labels }}
                    </span>
                  </td>
                  <td>{{ format_date_time(user.LastActiveTime) }}</td>
                  <td>{{ format_date_time(user.LastUpdateTime) }}</td>
                  <td>
                    <d-button-group>
                      <d-button size="small" outline @click="list_user_neighbors(user.UserId)">Neighbors</d-button>
                      <d-button size="small" outline @click="list_user_recommend(user.UserId)">Insight</d-button>
                      <d-button size="small" theme="danger" outline @click="open_delete_user_dialog(user.UserId)"><i
                          class="material-icons">delete</i></d-button>
                    </d-button-group>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

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
            <d-button theme="danger" outline @click="delete_user">
              <i class="material-icons">delete</i>
            </d-button>
          </d-input-group-addon>
        </d-input-group>
        <span style="color: red">{{ deleteUserError }}</span>
      </d-modal-body>
    </d-modal>
  </div>
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
