<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Cluster</h3>
      </div>
    </div>

    <!-- Default Light Table -->
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Active Nodes</h6>
          </div>
          <div class="card-body p-0 pb-3 text-center">
            <table class="table mb-0">
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
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
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
