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
        height="80"
        ref="canvas"
        style="max-width: 100% !important"
      ></canvas>
    </d-card-body>
  </d-card>
</template>

<script>
import Chart from '../../utils/chart';
import moment from 'moment';

const axios = require('axios');

const defaultChartData = {
  labels: Array.from(new Array(30), (_, i) =>
    moment()
      .subtract(30 - i, 'days')
      .format('MM/DD')),
  datasets: [],
};

const colors = [
  '#2196f3',
  '#f44336',
  '#ffeb3b',
  '#4caf50',
  '#009688',
  '#e91e63',
  '#ff9800',
  '#8bc34a',
  '#9c27b0',
  '#795548',
];

export default {
  name: 'users-overview',
  props: {
    title: {
      type: String,
      default: 'Positive Feedback Rate',
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
    // load click-through rate
    let i = 0;
    axios.get('/api/dashboard/rates?n=30').then((response) => {
      this.chartData.datasets = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of (Object.entries(response.data))) {
        const color = colors[i];
        this.chartData.datasets.push({
          label: key,
          fill: 'start',
          data: value.map(x => x.Value).reverse(),
          backgroundColor: this.hexToRgba(color, 0),
          borderColor: this.hexToRgba(color, 1),
          pointBackgroundColor: '#ffffff',
          pointHoverBackgroundColor: this.hexToRgba(color),
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 3,
        });
        if (i === 0) {
          this.chartData.labels = value.map(x =>
            moment(x.Timestamp)
              .format('MM/DD'))
            .reverse();
        }
        i += 1;
      }

      const chartOptions = {
        ...{
          responsive: true,
          legend: {
            position: 'top',
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
                    return index % 7 !== 0 ? '' : tick;
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
            mode: 'nearest',
            intersect: false,
          },
          tooltips: {
            custom: false,
            mode: 'nearest',
            intersect: false,
          },
        },
        ...this.chartOptions,
      };

      const BlogUsersOverview = new Chart(this.$refs.canvas, {
        type: 'LineWithLine',
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
  methods: {
    hexToRgba(hex, a = null) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result == null) {
        return null;
      }
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      if (a == null) {
        return `rgb(${r},${g},${b})`;
      }
      return `rgba(${r},${g},${b},${a})`;
    },
  },
};
</script>

