<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="py-4">
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <h3 class="text-h5">Chat</h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-b">Prompt</v-card-title>
          <v-card-text>
            <v-textarea
              v-model="prompt"
              :rows="3"
              :max-rows="6"
              variant="outlined"
              placeholder="Enter your prompt..."
              class="mb-4"
            />
            <v-btn variant="outlined" color="primary" @click="send" :loading="loading">
              Send
            </v-btn>

            <v-card v-if="message" variant="outlined" class="mt-4">
              <v-card-text>
                <div v-html="message" />
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'chat-view',
  setup() {
    const prompt = ref('');
    const message = ref('');
    const loading = ref(false);

    const send = async () => {
      if (!prompt.value) {
        message.value = 'Please enter a prompt.';
        return;
      }

      loading.value = true;
      message.value = '';

      try {
        const response = await axios({
          method: 'post',
          url: '/api/chat',
          data: prompt.value,
          responseType: 'stream',
          adapter: 'fetch',
        });

        const reader = response.data.getReader();
        const decoder = new TextDecoder();

        const processText = async ({ done, value }) => {
          if (done) {
            loading.value = false;
            return;
          }

          message.value += decoder.decode(value, { stream: true }).replace(/\n/g, '<br>');
          const result = await reader.read();
          await processText(result);
        };

        const result = await reader.read();
        await processText(result);
      } catch (error) {
        message.value = error.message || String(error);
        loading.value = false;
      }
    };

    return {
      prompt,
      message,
      loading,
      send,
    };
  },
};
</script>