<template>
  <d-container>
    <div style="text-align: center;" class="align-center">
      <img style="width: 120px; margin-top: 60px; margin-bottom: 20px" src="@/assets/images/gorse.png"/>
      <h5>Welcome to Gorse dashboard</h5>
      <d-card>
        <d-card-body>
          <d-form method="post" action="/login">
            <label class="sr-only" for="username">Username</label>
            <d-form-input id="username" name="user_name" class="mb-1" placeholder="Username" />
            <label class="sr-only" for="password">Password</label>
            <d-form-input id="password" name="password" class="mt-2" type="password" placeholder="Password" />
            <d-alert v-if="this.$route.query.msg === 'incorrect'" theme="danger" class="mt-2"
                     :show="timeUntilDismissed"
                     @alert-dismissed="timeUntilDismissed = 0"
                     @alert-dismiss-countdown="handleTimeChange">The user name or password is incorrect.</d-alert>
            <d-button class="mt-2" theme="primary" type="submit">Login</d-button>
          </d-form>
        </d-card-body>
      </d-card>
    </div>
  </d-container>
</template>

<style>
.align-center {
  margin: auto;
  max-width: 480px;
}
</style>

<script>
export default {
  data() {
    return {
      timeUntilDismissed: 5,
    };
  },
  methods: {
    handleTimeChange(time) {
      this.timeUntilDismissed = time;
    },
  },
};
</script>
