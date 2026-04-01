<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <div class="text-center mb-6">
          <v-img src="@/assets/images/gorse.png" width="120" class="mb-4 mx-auto" />
          <h5 class="text-h5">Welcome to Gorse dashboard</h5>
        </div>

        <v-card>
          <v-card-text>
            <v-form method="post" action="/login">
              <v-text-field
                id="username"
                name="user_name"
                label="Username"
                variant="outlined"
                class="mb-2"
              />
              <v-text-field
                id="password"
                name="password"
                label="Password"
                type="password"
                variant="outlined"
                class="mb-2"
              />
              <v-alert
                v-if="$route.query.msg === 'incorrect'"
                type="error"
                class="mb-2"
                closable
              >
                The user name or password is incorrect.
              </v-alert>
              <v-btn
                color="primary"
                type="submit"
                block
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'login-layout',
};
</script>