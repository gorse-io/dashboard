<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Users</h3>
      </div>
    </div>

    <!-- Default Light Table -->
    <div class="row">
      <div class="col">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Users</h6>
          </div>
          <div class="card-body border-bottom">
            <d-input-group>
              <d-input placeholder="User ID" />
              <d-input-group-addon append>
                <d-button class="btn-white"><i class="material-icons">search</i></d-button>
                <d-button class="btn-white"><i class="material-icons">arrow_forward_ios</i></d-button>
              </d-input-group-addon>
            </d-input-group>
          </div>
          <div class="card-body p-0 pb-3 text-center">
            <table class="table mb-0">
              <thead class="bg-light">
                <tr>
                  <th scope="col" class="border-0">ID</th>
                  <th scope="col" class="border-0">Last Active</th>
                  <th scope="col" class="border-0">Last Recommend</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ali</td>
                  <td>Kerry</td>
                  <td>Russian Federation</td>
                </tr>
                <tr>
                  <td>Clark</td>
                  <td>Angela</td>
                  <td>Estonia</td>
                </tr>
                <tr>
                  <td>Jerry</td>
                  <td>Nathan</td>
                  <td>Cyprus</td>
                </tr>
                <tr>
                  <td>Colt</td>
                  <td>Angela</td>
                  <td>Liberia</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
