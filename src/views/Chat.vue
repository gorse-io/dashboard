<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <h3 class="page-title">Chat</h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col lg="12" md="12" sm="12" class="mb-4">
        <v-card class="mb-4">
          <v-card-title class="border-bottom">
            <h6 class="m-0">Prompt</h6>
          </v-card-title>
          <v-card-text class="pa-0 pb-2">
            <v-list>
              <v-list-item class="p-3">
                <v-row class="mb-3">
                  <v-col sm="12" md="12">
                    <v-textarea :rows="3" :max-rows="6" v-model="prompt">
                    </v-textarea>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col sm="12" md="12" class="text-right">
                    <v-btn variant="outlined" @click="send">Send</v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="message">
                  <v-col sm="12" md="12">
                    <div class="p-3 mt-3 border rounded">
                      <div v-html="message"></div>
                    </div>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      prompt: '',
      message: '',
    };
  },
  methods: {
    async send() {
      if (!this.prompt) {
        this.message = 'Please enter a prompt.';
        return;
      }
      axios({
        method: 'post',
        url: '/api/chat',
        data: this.prompt,
        responseType: 'stream',
        adapter: 'fetch',
      }).then((response) => {
        const reader = response.data.getReader();
        const decoder = new TextDecoder();
        const that = this;
        that.message = '';
        reader.read().then(function processText({ done, value }) {
          if (done) {
            return;
          }
          that.message += decoder.decode(value, { stream: true }).replace(/\n/g, '<br>');
          reader.read().then(processText);
        });
      }).catch((error) => {
        this.message = error;
      });
    },
  },
};
</script>
