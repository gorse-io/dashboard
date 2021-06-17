<template>
  <d-card class="card-small h-100">
    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </d-card-header>

    <d-card-body class="pt-0">
      <!-- Legend & Chart -->
      <div ref="legend"></div>
      <canvas
        height="120"
        ref="canvas"
        style="max-width: 100% !important"
      ></canvas>
    </d-card-body>
  </d-card>
</template>

<script>
import Chart from "../../utils/chart";
const axios = require("axios");
import moment from "moment";

const defaultChartData = {
  labels: Array.from(new Array(30), (_, i) =>
    moment()
      .subtract(30 - i, "days")
      .format("MM/DD")
  ),
  datasets: [
    {
      label: "Current Month",
      fill: "start",
      data: Array.from(new Array(30), (_, i) => 0),
      backgroundColor: "rgba(0,123,255,0.1)",
      borderColor: "rgba(0,123,255,1)",
      pointBackgroundColor: "#ffffff",
      pointHoverBackgroundColor: "rgb(0,123,255)",
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 3,
    },
  ],
};

export default {
  name: "users-overview",
  props: {
    title: {
      type: String,
      default: "Click Through Rate",
    },
    chartData: {
      type: Object,
      default() {
        return defaultChartData;
      },
    },
  },
  data() {
    return {
      dateRange: {
        from: null,
        to: null,
      },
    };
  },
  mounted() {
    // load click through rate
    axios.get("/api/measurements/ClickThroughRate?n=30").then((response) => {
      this.chartData.datasets[0].data = response.data.map((x) => x.Value).reverse();
      this.chartData.labels = response.data.map((x) =>
        moment(x.Timestamp).format("MM/DD")
      ).reverse();

      const chartOptions = {
        ...{
          responsive: true,
          legend: {
            position: "top",
          },
          elements: {
            line: {
              // A higher value makes the line look skewed at this ratio.
              tension: 0.3,
            },
            point: {
              radius: 0,
            },
          },
          scales: {
            xAxes: [
              {
                gridLines: false,
                ticks: {
                  callback(tick, index) {
                    // Jump every 7 values on the X axis labels to avoid clutter.
                    return index % 7 !== 0 ? "" : tick;
                  },
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  suggestedMax: 1.0,
                  callback(tick) {
                    if (tick === 0) {
                      return tick;
                    }
                    // Format the amounts using Ks for thousands.
                    return tick > 999 ? `${(tick / 1000).toFixed(1)}K` : tick;
                  },
                },
              },
            ],
          },
          hover: {
            mode: "nearest",
            intersect: false,
          },
          tooltips: {
            custom: false,
            mode: "nearest",
            intersect: false,
          },
        },
        ...this.chartOptions,
      };

      const BlogUsersOverview = new Chart(this.$refs.canvas, {
        type: "LineWithLine",
        data: this.chartData,
        options: chartOptions,
      });

      // They can still be triggered on hover.
      const buoMeta = BlogUsersOverview.getDatasetMeta(0);
      buoMeta.data[0]._model.radius = 0;
      buoMeta.data[
        this.chartData.datasets[0].data.length - 1
      ]._model.radius = 0;

      // Render the chart.
      BlogUsersOverview.render();
    });
  },
};
</script>

