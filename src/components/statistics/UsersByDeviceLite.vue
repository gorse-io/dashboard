<template>
  <div class="card card-small h-100">
    <!-- Card Header -->
    <div class="card-header border-bottom">
      <h6 class="m-0">{{ title }}</h6>
    </div>

    <!-- Chart -->
    <div class="card-body d-flex py-0">
      <canvas
        height="220"
        ref="canvas"
        class="blog-users-by-device m-auto"
      ></canvas>
    </div>
  </div>
</template>

<script>
import Chart from "../../utils/chart";
const axios = require("axios");

const defaultChartData = {
  datasets: [
    {
      hoverBorderColor: "#ffffff",
      data: [1, 0, 0],
      backgroundColor: [
        "rgba(0,123,255,0.9)",
        "rgba(0,123,255,0.5)",
        "rgba(0,123,255,0.3)",
      ],
    },
  ],
  labels: ["Total", "Monthly", "Daily"],
};

export default {
  name: "users-by-device",
  props: {
    /**
     * The chart config.
     */
    chartConfig: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * The chart options.
     */
    chartOptions: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * The chart data.
     */
    chartData: {
      type: Object,
      default() {
        return defaultChartData;
      },
    },
    /**
     * The chart title.
     */
    title: {
      type: String,
      default: "Active Users",
    },
  },
  mounted() {
    axios
      .all([
        axios.get("/api/measurements/ActiveUsersYesterday?n=1"),
        axios.get(`/api/measurements/ActiveUsersMonthly?n=1`),
        axios.get(`/api/dashboard/stats`),
      ])
      .then(
        axios.spread((response1, response2, response3) => {
          this.chartData.datasets[0].data[0] = response3.data.NumUsers;
          this.chartData.datasets[0].data[1] = response2.data[0].Value;
          this.chartData.datasets[0].data[2] = response1.data[0].Value;

          const chartConfig = {
            type: "pie",
            data: this.chartData,
            options: {
              ...{
                legend: {
                  position: "bottom",
                  labels: {
                    padding: 25,
                    boxWidth: 20,
                  },
                },
                cutoutPercentage: 0,
                tooltips: {
                  custom: false,
                  mode: "index",
                  position: "nearest",
                },
              },
              ...this.chartOptions,
            },
          };

          new Chart(this.$refs.canvas, chartConfig);
        })
      );
  },
};
</script>

