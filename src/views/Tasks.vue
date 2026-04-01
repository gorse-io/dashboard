<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4">
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase text-subtitle-2">Overview</span>
        <h3 class="text-h5">Tasks</h3>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-b">All Tasks</v-card-title>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Name</th>
                <th class="text-left">Status</th>
                <th class="text-left">Start</th>
                <th class="text-left">Finished</th>
                <th class="text-left">Progress</th>
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
                  <v-progress-linear
                    v-if="task.Status == 'Running'"
                    :model-value="(task.Count / task.Total) * 100"
                    color="primary"
                    height="20"
                  />
                  <v-progress-linear
                    v-if="task.Status == 'Suspended'"
                    :model-value="(task.Count / task.Total) * 100"
                    color="warning"
                    height="20"
                  />
                  <v-progress-linear
                    v-if="task.Status == 'Complete'"
                    :model-value="100"
                    color="success"
                    height="20"
                  />
                  <span class="text-error" v-if="task.Status == 'Failed'">{{ task.Error }}</span>
                </td>
              </tr>
            </tbody>
          </v-table>
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
      timer: null,
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