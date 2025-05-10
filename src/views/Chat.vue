<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <h3 class="page-title">Chat</h3>
      </div>
    </div>

    <d-row>
      <d-col lg="4" md="12" sm="12" class="mb-4">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Context</h6>
          </div>
          <div class="card-body p-0 pb-2">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <d-row>
                  <d-col>
                    <d-input-group prepend="Item ID" class="mb-4">
                      <d-input v-model="item_id" @keyup.enter.native="search_item" />
                      <d-input-group-addon append>
                        <d-button class="btn-white" @click="search_item"><i class="material-icons">search</i></d-button>
                      </d-input-group-addon>
                    </d-input-group>
                  </d-col>
                </d-row>
                <d-row>
                  <d-col>
                    <highlightjs language='json' :code="json" />
                  </d-col>
                </d-row>
              </d-list-group-item>
            </d-list-group>
          </div>
        </div>
      </d-col>
      <d-col lg="8" md="12" sm="12" class="mb-4">
        <div class="card card-small mb-4">
          <div class="card-header border-bottom">
            <h6 class="m-0">Prompt</h6>
          </div>
          <div class="card-body p-0 pb-2">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <d-row class="mb-3">
                  <d-col sm="12" md="12">
                    <d-form-textarea :rows="3" :max-rows="6" @input="render_prompt($event)">
                    </d-form-textarea>
                  </d-col>
                </d-row>
                <d-row>
                  <d-col sm="12" md="10">
                    <d-input-group prepend="Template" class="mb-3">
                      <d-select>
                        <option :value="null"></option>
                      </d-select>
                    </d-input-group>
                  </d-col>
                  <d-col sm="12" md="2" class="text-right">
                    <d-button outline @click="send">Send</d-button>
                  </d-col>
                </d-row>
                <d-row v-if="prompt">
                  <d-col sm="12" md="12">
                    <div class="p-3 mt-3 border rounded">
                      <div v-html="prompt"></div>
                    </div>
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
import nunjucks from 'nunjucks';
import utils from '../utils';

export default {
  data() {
    return {
      prompt: '',
      message: '',
      item_id: '',
      context: {},
      json: '{}',
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
    search_item() {
      axios({
        method: 'get',
        url: `/api/item/${this.item_id}`,
      })
        .then((response) => {
          this.context = {
            item: response.data,
          };
          this.json = utils.stringify(this.context);
        });
    },
    render_prompt(event) {
      this.prompt = nunjucks.renderString(event, this.context);
    },
  },
};
</script>
