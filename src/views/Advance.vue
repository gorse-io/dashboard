<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Advance</h3>
      </div>
    </div>

    <!-- Default Light Table -->
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Data Export</h6>
          </div>
          <div class="card-body p-0 pb-3">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <a :href="'/api/bulk/users'">
                      <d-button class="advance_button" outline
                        >&nbsp;&nbsp;&nbsp;Export
                        Users&nbsp;&nbsp;&nbsp;</d-button
                      >
                    </a>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label
                      >Export users into a csv file. The format is "user_id,
                      labels".</label
                    >
                  </d-col>
                </d-row>
              </d-list-group-item>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <a :href="'/api/bulk/items'">
                      <d-button class="advance_button" outline
                        >&nbsp;&nbsp;&nbsp;Export
                        Items&nbsp;&nbsp;&nbsp;</d-button
                      >
                    </a>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label
                      >Export items into a csv file. The format is "item_id, is_hidden, categories,
                      timestamp, labels, description".</label
                    >
                  </d-col>
                </d-row>
              </d-list-group-item>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <a :href="'/api/bulk/feedback'">
                      <d-button outline>Export Feedback</d-button>
                    </a>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label
                      >Export feedbacks into a csv file. The format is
                      "feedback_type, user_id, item_id, timestamp".</label
                    >
                  </d-col>
                </d-row>
              </d-list-group-item>
            </d-list-group>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Data Import</h6>
          </div>
          <div class="card-body p-0 pb-3">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <router-link :to="{ name: 'import_users' }">
                      <d-button outline
                        >&nbsp;&nbsp;&nbsp;Import
                        Users&nbsp;&nbsp;&nbsp;</d-button
                      >
                    </router-link>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label>Import users into gorse.</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <router-link :to="{ name: 'import_items' }">
                      <d-button outline
                        >&nbsp;&nbsp;&nbsp;Import
                        Items&nbsp;&nbsp;&nbsp;</d-button
                      >
                    </router-link>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label>Import items into gorse.</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col sm="12" md="2">
                    <router-link :to="{ name: 'import_feedback' }">
                      <d-button outline>Import Feedback</d-button>
                    </router-link>
                  </d-col>
                  <d-col sm="12" md="10">
                    <label>Import feedbacks into gorse.</label>
                  </d-col>
                </d-row>
              </d-list-group-item>
            </d-list-group>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
