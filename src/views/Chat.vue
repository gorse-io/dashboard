<template>
  <div class="main-content-container container-fluid px-4 chat-container">
    <div class="chat-shell">
      <div class="chat-messages">
        <div v-if="messages.length === 0" class="chat-empty text-center text-muted">
          Send a message to start a conversation.
        </div>
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="chat-message"
          :class="message.role"
        >
          <div class="chat-message-content" v-html="renderMessageContent(message)" />
        </div>
      </div>
      <d-input-group class="chat-composer">
        <d-input
          v-model="prompt"
          :disabled="isStreaming"
          placeholder="Type a message..."
          @keydown.enter.exact.prevent="send"
        />
        <d-input-group-addon append>
          <d-button
            class="chat-composer-button"
            :disabled="isStreaming"
            @click="send"
          >
            {{ isStreaming ? 'Sending...' : 'Send' }}
          </d-button>
        </d-input-group-addon>
      </d-input-group>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { katex } from '@mdit/plugin-katex';
import MarkdownIt from 'markdown-it';
import 'katex/dist/katex.min.css';

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
}).use(katex);

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
    renderChatCompletionEvents(event, assistantIndex) {
      event.split('\n').forEach((line) => {
        console.log(line);
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
    renderMessageContent(message) {
      if (message.role === 'assistant') {
        return markdown.render(message.content);
      }
      const { content } = message;
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
.chat-container {
  box-sizing: border-box;
  display: flex;
  height: calc(100vh - 3.75rem);
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.chat-shell {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  padding-bottom: 5rem;
  overflow-y: auto;
}

.chat-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
  padding: 0 1rem;
}

.chat-composer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
}

.chat-composer-button {
  min-width: 6rem;
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

.chat-message-content {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  line-height: 1.5;
  white-space: normal;
}

.chat-message-content :deep(p:last-child),
.chat-message-content :deep(ul:last-child),
.chat-message-content :deep(ol:last-child),
.chat-message-content :deep(pre:last-child) {
  margin-bottom: 0;
}

.chat-message-content :deep(.katex-display:last-child) {
  margin-bottom: 0;
}

.chat-message-content :deep(ul),
.chat-message-content :deep(ol) {
  padding-left: 1.25rem;
}

.chat-message-content :deep(pre) {
  max-width: 100%;
  padding: 0.75rem;
  overflow-x: auto;
  color: #f8fafc;
  background: #1f2937;
  border-radius: 0.375rem;
}

.chat-message-content :deep(code) {
  word-break: break-word;
}

.chat-message-content :deep(.katex-display) {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.chat-message-content :deep(.katex) {
  white-space: normal;
}

.chat-message.user .chat-message-content {
  color: #fff;
  background: #007bff;
  border-bottom-right-radius: 0.25rem;
}

.chat-message.assistant .chat-message-content {
  color: var(--gd-text, #3d5170);
  background: var(--gd-surface, #fff);
  border: 1px solid var(--gd-border, #e1e5eb);
  border-bottom-left-radius: 0.25rem;
}
</style>
