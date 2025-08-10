<template>
  <d-card class="card-small h-100">
    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </d-card-header>

    <d-card-body class="pt-0">
      <d-row class="border-bottom py-2 bg-light">

        <d-col col sm="6" class="d-flex mb-2 mb-sm-0">
          <d-input-group size="sm" class="date-range d-flex justify-content-right">
            <d-datepicker v-model="dateRange.from"
              :highlighted="{ from: dateRange.from, to: dateRange.to || new Date() }" placeholder="Start Date" typeable
              small />
            <d-datepicker v-model="dateRange.to" :highlighted="{ from: dateRange.from, to: dateRange.to || new Date() }"
              placeholder="End Date" typeable small />
            <d-input-group-text slot="append">
              <i class="material-icons">&#xE916;</i>
            </d-input-group-text>
          </d-input-group>
        </d-col>

        <d-col col sm="6">
          <d-input-group size="sm" class="d-flex btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0">
            <d-select :value="timeseries">
              <option :value="timeseries">{{ timeseries.title }}</option>
            </d-select>
          </d-input-group>
        </d-col>

      </d-row>
      <!-- Legend & Chart -->
      <div ref="legend"></div>
      <canvas height="80" ref="canvas" style="max-width: 100% !important"></canvas>
    </d-card-body>
  </d-card>
</template>

<script>
import axios from 'axios';
import Chart from '../../utils/chart';
import { value } from 'jsonpath';

const moment = require('moment');

export default {
  name: 'users-overview',
  props: {
    title: {
      type: String,
      default: 'Recommendation Performance',
    },
    chartData: {
      type: Object,
      default() {
        return {
          labels: [],
          datasets: [{
            label: 'Current Duration',
            fill: 'start',
            data: [],
            backgroundColor: 'rgba(0,123,255,0.1)',
            borderColor: 'rgba(0,123,255,1)',
            pointBackgroundColor: '#ffffff',
            pointHoverBackgroundColor: 'rgb(0,123,255)',
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 3,
          }/*, {
            label: 'Past Duration',
            fill: 'start',
            data: [],
            backgroundColor: 'rgba(255,65,105,0.1)',
            borderColor: 'rgba(255,65,105,1)',
            pointBackgroundColor: '#ffffff',
            pointHoverBackgroundColor: 'rgba(255,65,105,1)',
            borderDash: [3, 3],
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 2,
            pointBorderColor: 'rgba(255,65,105,1)',
          }*/],
        };
      },
    },
  },
  data() {
    return {
      dateRange: {
        from: null,
        to: null,
      },
      timeseries: {
        name: 'cf_ndcg',
        title: 'Collaborative Filtering - NDCG',
      },
    };
  },
  mounted() {
    const currentEnd = moment();
    const currentBegin = currentEnd.clone().subtract(7, 'days');
    axios({
      method: 'get',
      url: `/api/dashboard/timeseries/cf_ndcg?begin=${currentBegin.toISOString()}&end=${currentEnd.toISOString()}`,
    })
      .then((response) => {
        this.chartData.labels = response.data.map(item => moment(item.Timestamp).format('MMM DD HH:mm'));
        this.chartData.datasets[0].data = response.data.map(item => Number(item.Value).toFixed(5));

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
              xAxes: [{
                gridLines: false,
                ticks: {
                  callback(tick, index) {
                    // Jump every 7 values on the X axis labels to avoid clutter.
                    return index % 7 !== 0 ? '' : tick;
                  },
                },
              }],
              yAxes: [{
                ticks: {
                  suggestedMax: Math.max(...this.chartData.datasets[0].data),
                  callback(tick) {
                    if (tick === 0) {
                      return tick;
                    }
                    // Format the amounts using Ks for thousands.
                    return tick > 999 ? `${(tick / 1000).toFixed(1)}K` : tick;
                  },
                },
              }],
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
        buoMeta.data[this.chartData.datasets[0].data.length - 1]._model.radius = 0;

        // Render the chart.
        BlogUsersOverview.render();
      });
  },
};
</script>
