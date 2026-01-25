<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <h3 class="page-title">Chat</h3>
      </div>
    </div>

    <d-row>
      <d-col lg="12" md="12" sm="12" class="mb-4">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Prompt</h6>
          </div>
          <div class="card-body p-0 pb-2">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <d-row class="mb-3">
                  <d-col sm="12" md="12">
                    <d-form-textarea :rows="3" :max-rows="6" v-model="prompt">
                    </d-form-textarea>
                  </d-col>
                </d-row>
                <d-row>
                  <d-col sm="12" md="12" class="text-right">
                    <d-button outline @click="send">Send</d-button>
                  </d-col>
                </d-row>
                <d-row v-if="message">
                  <d-col sm="12" md="12">
                    <div class="p-3 mt-3 border rounded">
                      <div v-html="message"></div>
                    </div>
                  </d-col>
                </d-row>
              </d-list-group-item>
            </d-list-group>
          </div>
        </div>
      </d-col>
    </d-row>
  </div>
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
