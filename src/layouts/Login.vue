<template>
  <v-container>
    <div style="text-align: center;" class="align-center">
      <img style="width: 120px; margin-top: 60px; margin-bottom: 20px" src="@/assets/images/gorse.png"/>
      <h5>Welcome to Gorse dashboard</h5>
      <v-card>
        <v-card-text>
          <v-form method="post" action="/login">
            <label class="sr-only" for="username">Username</label>
            <v-text-field
              id="username"
              name="user_name"
              class="mb-1"
              placeholder="Username"
              variant="outlined"
              hide-details="auto"
              density="comfortable"
            />
            <label class="sr-only" for="password">Password</label>
            <v-text-field
              id="password"
              name="password"
              class="mt-2"
              type="password"
              placeholder="Password"
              variant="outlined"
              hide-details="auto"
              density="comfortable"
            />
            <v-alert
              v-if="$route.query.msg === 'incorrect' && timeUntilDismissed > 0"
              color="error"
              variant="tonal"
              closable
              class="mt-2"
              @click:close="clearAlertCountdown"
            >The user name or password is incorrect.</v-alert>
            <v-btn class="mt-2" color="primary" type="submit">Login</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
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
      timeUntilDismissed: 0,
      alertTimerId: null,
    };
  },
  mounted() {
    if (this.$route.query.msg === 'incorrect') {
      this.startAlertCountdown(5);
    }
  },
  beforeUnmount() {
    this.clearAlertCountdown();
  },
  methods: {
    startAlertCountdown(seconds) {
      this.clearAlertCountdown();
      this.timeUntilDismissed = seconds;
      this.alertTimerId = setInterval(() => {
        if (this.timeUntilDismissed <= 1) {
          this.clearAlertCountdown();
          return;
        }
        this.timeUntilDismissed -= 1;
      }, 1000);
    },
    clearAlertCountdown() {
      if (this.alertTimerId) {
        clearInterval(this.alertTimerId);
        this.alertTimerId = null;
      }
      this.timeUntilDismissed = 0;
    },
  },
};
</script>
