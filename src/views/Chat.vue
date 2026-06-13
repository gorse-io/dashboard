<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-6 text-center text-sm-left mb-0">
        <h3 class="page-title">Chat</h3>
      </div>
      <div class="col-12 col-sm-6 text-center text-sm-right mb-0">
        <d-button outline size="sm" @click="clearMessages">New Chat</d-button>
      </div>
    </div>

    <d-row>
      <d-col lg="12" md="12" sm="12" class="mb-4">
        <div class="card card-small mb-4 chat-card">
          <div class="card-header border-bottom">
            <h6 class="m-0">Conversation</h6>
          </div>
          <div class="card-body p-0 pb-2">
            <d-list-group flush>
              <d-list-group-item class="p-3">
                <div class="chat-messages mb-3">
                  <div v-if="messages.length === 0" class="chat-empty text-center text-muted">
                    Send a message to start a conversation.
                  </div>
                  <div
                    v-for="(message, index) in messages"
                    :key="index"
                    class="chat-message"
                    :class="message.role"
                  >
                    <div class="chat-message-role text-uppercase text-muted">
                      {{ message.role }}
                    </div>
                    <div class="chat-message-content" v-html="renderMessageContent(message.content)" />
                  </div>
                </div>
                <d-row class="mb-3">
                  <d-col sm="12" md="12">
                    <d-form-textarea
                      :rows="3"
                      :max-rows="6"
                      v-model="prompt"
                      :disabled="isStreaming"
                      placeholder="Type a message..."
                      @keydown.enter.exact.prevent="send"
                    />
                  </d-col>
                </d-row>
                <d-row>
                  <d-col sm="12" md="12" class="text-right">
                    <d-button outline :disabled="isStreaming" @click="send">
                      {{ isStreaming ? 'Sending...' : 'Send' }}
                    </d-button>
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
      messages: [],
      isStreaming: false,
    };
  },
  methods: {
    send() {
      const content = this.prompt.trim();
      if (!content || this.isStreaming) {
        return;
      }

      this.prompt = '';
      this.isStreaming = true;
      this.messages.push({
        role: 'user',
        content,
      });
      const assistantIndex = this.messages.length;
      const assistantMessage = {
        role: 'assistant',
        content: '',
      };
      this.messages.push(assistantMessage);

      axios({
        method: 'post',
        url: '/api/chat/completions',
        data: {
          stream: true,
          messages: this.messages
            .filter((message) => message.content)
            .map((message) => ({
              role: message.role,
              content: message.content,
            })),
        },
        responseType: 'stream',
        adapter: 'fetch',
      }).then((response) => {
        const reader = response.data.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const read = () => reader.read().then(({ done, value }) => {
          if (done) {
            this.renderChatCompletionEvents(buffer, assistantIndex);
            this.isStreaming = false;
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop();
          events.forEach((event) => this.renderChatCompletionEvents(event, assistantIndex));
          read();
        });
        read();
      }).catch((error) => {
        this.messages[assistantIndex].content = error.toString();
        this.isStreaming = false;
      });
    },
    clearMessages() {
      if (this.isStreaming) {
        return;
      }
      this.messages = [];
    },
    renderChatCompletionEvents(event, assistantIndex) {
      event.split('\n').forEach((line) => {
        if (!line.startsWith('data:')) {
          return;
        }
        const data = line.slice('data:'.length).trim();
        if (!data || data === '[DONE]') {
          return;
        }
        try {
          const chunk = JSON.parse(data);
          const content = chunk.choices?.[0]?.delta?.content || '';
          this.messages[assistantIndex].content += content;
        } catch (error) {
          this.messages[assistantIndex].content = error.toString();
        }
      });
    },
    renderMessageContent(content) {
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    },
  },
};
</script>

<style scoped>
.chat-card {
  min-height: calc(100vh - 12rem);
}

.chat-messages {
  min-height: 24rem;
  max-height: calc(100vh - 22rem);
  overflow-y: auto;
}

.chat-empty {
  padding: 8rem 1rem;
}

.chat-message {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.chat-message.user {
  align-items: flex-end;
}

.chat-message.assistant {
  align-items: flex-start;
}

.chat-message-role {
  font-size: 0.7rem;
  letter-spacing: 0.05rem;
  margin-bottom: 0.25rem;
}

.chat-message-content {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  line-height: 1.5;
  white-space: normal;
}

.chat-message.user .chat-message-content {
  color: #fff;
  background: #007bff;
  border-bottom-right-radius: 0.25rem;
}

.chat-message.assistant .chat-message-content {
  color: #3d5170;
  background: #f5f6f8;
  border-bottom-left-radius: 0.25rem;
}
</style>
