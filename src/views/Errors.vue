<template>
  <v-container fluid class="main-content-container px-4 pb-4">
    <v-row justify="center" align="center" class="fill-height" style="min-height: 400px;">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <h1 class="text-h2 mb-4">500</h1>
        <h3 class="text-h5 mb-2">Something went wrong!</h3>
        <p class="text-body-1 mb-4">There was a problem on our end. Please try again later.</p>
        <v-btn color="primary" @click="goBack">
          <v-icon start>mdi-arrow-left</v-icon>
          Go Back
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'error-view',
  setup() {
    const router = useRouter();

    const goBack = () => {
      router.back();
    };

    return {
      goBack,
    };
  },
};
</script>