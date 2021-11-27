<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Items</h3>
      </div>
    </div>

    <!-- Default Light Table -->
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Items</h6>
          </div>
          <div class="card-body border-bottom">
            <d-input-group>
              <d-input
                id="item_id"
                placeholder="Item ID"
                v-model="item_id"
                @keyup.enter.native="search_item"
              />
              <d-input-group-addon append>
                <d-button class="btn-white" @click="search_item"
                  ><i class="material-icons">search</i></d-button
                >
                <d-button class="btn-white" @click="next_page"
                  ><i class="material-icons">arrow_forward_ios</i></d-button
                >
              </d-input-group-addon>
            </d-input-group>
          </div>
          <div class="card-body p-0 pb-3">
            <table class="table mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">ID</th>
                  <th scope="col" class="border-0">Categories</th>
                  <th scope="col" class="border-0">Hidden</th>
                  <th scope="col" class="border-0">Timestamp</th>
                  <th scope="col" class="border-0">Labels</th>
                  <th scope="col" class="border-0">Description</th>
                  <th scope="col" class="border-0"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in items" :key="idx">
                  <td>{{ item.ItemId }}</td>
                  <td>
                    <div>
                      <d-badge
                        outline
                        theme="secondary"
                        v-for="(category, idx) in item.Categories"
                        :key="idx"
                      >
                        {{ category }}
                      </d-badge>
                    </div>
                  </td>
                  <td>
                    <d-checkbox :checked="item.IsHidden" disabled="true" />
                  </td>
                  <td>{{ format_date_time(item.Timestamp) }}</td>
                  <td>
                    <div>
                      <d-badge
                        outline
                        theme="primary"
                        v-for="(label, idx) in item.Labels"
                        :key="idx"
                      >
                        {{ label }}
                      </d-badge>
                    </div>
                  </td>
                  <td>{{ item.Comment }}</td>
                  <td>
                    <router-link
                      :to="{
                        name: 'item_neighbors',
                        params: { item_id: item.ItemId },
                      }"
                    >
                      <d-button size="small" outline>Neighbors</d-button>
                    </router-link>
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
import moment from "moment";

const axios = require("axios");

export default {
  data() {
    return {
      items: null,
      cursor: "",
      item_id: null,
    };
  },
  mounted() {
    axios.get("/api/items").then((response) => {
      this.items = response.data.Items;
      this.cursor = response.data.Cursor;
    });
  },
  methods: {
    next_page() {
      axios
        .get("/api/items", {
          params: {
            cursor: this.cursor,
          },
        })
        .then((response) => {
          this.items = response.data.Items;
          this.cursor = response.data.Cursor;
        });
    },
    format_date_time(timestamp) {
      if (timestamp == "") {
        return "";
      }
      return moment(String(timestamp)).format("YYYY/MM/DD HH:mm");
    },
    search_item() {
      axios.get(`/api/item/${this.item_id}`).then((response) => {
        this.items = [response.data];
      });
    },
  },
};
</script>
