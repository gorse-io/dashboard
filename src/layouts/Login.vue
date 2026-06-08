<template>
  <d-container>
    <div style="text-align: center;" class="align-center">
      <img style="width: 120px; margin-top: 60px; margin-bottom: 20px" src="@/assets/images/gorse.png" alt="Gorse" />
      <h5>Welcome to Gorse dashboard</h5>
      <d-card>
        <d-card-body>
          <d-form @submit.prevent="login">
            <label class="sr-only" for="username">Username</label>
            <d-form-input id="username" v-model="userName" name="user_name" class="mb-1" placeholder="Username" />
            <label class="sr-only" for="password">Password</label>
            <d-form-input id="password" v-model="password" name="password" class="mt-2" type="password" placeholder="Password" />
            <d-alert
              v-if="loginFailed"
              theme="danger"
              class="mt-2"
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
import axios from 'axios';
import { setLoginStatus } from '@/utils/auth';

export default {
  data() {
    return {
      userName: '',
      password: '',
      loginFailed: false,
      timeUntilDismissed: 5,
    };
  },
  methods: {
    handleTimeChange(time) {
      this.timeUntilDismissed = time;
    },
    async login() {
      const form = new URLSearchParams();
      form.append('user_name', this.userName);
      form.append('password', this.password);

      try {
        await axios.post('/login', form, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          skipAuthRedirect: true,
        });
        setLoginStatus(true);
        this.$router.push(this.$route.query.redirect || '/overview');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setLoginStatus(false);
          this.loginFailed = true;
          this.timeUntilDismissed = 5;
        }
      }
    },
  },
};
</script>
