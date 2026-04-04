<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Tasks</h3>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">All Tasks</h6>
          </v-card-title>
          <v-card-text class="pa-0 pb-3">
            <v-table class="mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">Name</th>
                  <th scope="col" class="border-0">Status</th>
                  <th scope="col" class="border-0">Start</th>
                  <th scope="col" class="border-0">Finished</th>
                  <th scope="col" class="border-0">Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(task, idx) in nodes" :key="idx">
                  <td>{{ task.Name }}</td>
                  <td>{{ task.Status }}</td>
                  <td>
                    <span v-if="task.Status != 'Pending'">{{ format_date_time(task.StartTime) }}</span>
                  </td>
                  <td>
                    <span v-if="task.Status == 'Complete'">{{ format_date_time(task.FinishTime) }}</span>
                  </td>
                  <td>
                    <d-progress v-if="task.Status == 'Running'" :value="task.Count" :max="task.Total" />
                    <d-progress v-if="task.Status == 'Suspended'" :value="task.Count" :max="task.Total"
                      theme="warning" />
                    <d-progress v-if="task.Status == 'Complete'" :value="task.Total" :max="task.Total"
                      theme="success" />
                    <span style="color:red" v-if="task.Status == 'Failed'">{{ task.Error }}</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
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
      nodes: null,
    };
  },
  mounted() {
    this.fetchNodes();
    this.timer = setInterval(this.fetchNodes, 1000);
  },
  beforeUnmount() {
    this.cancelAutoUpdate();
  },
  methods: {
    format_date_time(timestamp) {
      return moment(String(timestamp)).format('YYYY/MM/DD HH:mm');
    },
    fetchNodes() {
      axios({
        method: 'get',
        url: '/api/dashboard/tasks',
      })
        .then((response) => {
          this.nodes = response.data;
        });
    },
    cancelAutoUpdate() {
      clearInterval(this.timer);
    },
  },
};
</script>
