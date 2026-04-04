<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Cluster</h3>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">Active Nodes</h6>
          </v-card-title>
          <v-card-text class="pa-0 pb-3 text-center">
            <v-table class="mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">Type</th>
                  <th scope="col" class="border-0">Hostname</th>
                  <th scope="col" class="border-0">UUID</th>
                  <th scope="col" class="border-0">Version</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(node, idx) in nodes" :key="idx">
                  <td>{{ node.Type }}</td>
                  <td>{{ node.Hostname }}</td>
                  <td>{{ node.UUID }}</td>
                  <td>{{ node.Version }}</td>
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
    fetchNodes() {
      axios({
        method: 'get',
        url: '/api/dashboard/cluster',
      })
        .then((response) => {
          this.nodes = response.data;
        });
    },
    cancelAutoUpdate() {
      clearInterval(this.timer);
    },
    openMetrics(host, port) {
      window.open(`http://${host}:${port}/metrics`, '_blank');
    },
    openAPIDocs(host, port) {
      window.open(`http://${host}:${port}/apidocs`, '_blank');
    },
  },
};
</script>
