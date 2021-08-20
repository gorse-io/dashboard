<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Tasks</h3>
      </div>
    </div>

    <!-- Default Light Table -->
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">All Tasks</h6>
          </div>
          <div class="card-body p-0 pb-3">
            <table class="table mb-0">
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
                <tr v-for="(task, idx) in nodes" :key="idx" >
                  <td>{{ task.Name }}</td>
                  <td>{{ task.Status }}</td>
                  <td>
                    <span v-if="task.Status != 'Pending'">{{ format_date_time(task.StartTime) }}</span>
                  </td>
                  <td>
                    <span v-if="task.Status == 'Complete'">{{ format_date_time(task.FinishTime) }}</span>
                  </td>
                  <td>
                    <d-progress v-if="task.Status == 'Running'" :value="task.Done" :max="task.Total" />
                    <d-progress v-if="task.Status == 'Suspended'" :value="task.Done" :max="task.Total" theme="warning"/>
                    <d-progress v-if="task.Status == 'Complete'" :value="task.Total" :max="task.Total" theme="success"/>
                    <span style="color:red" v-if="task.Status == 'Failed'">{{ task.Error }}</span>
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
      axios.get('/api/dashboard/tasks')
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
