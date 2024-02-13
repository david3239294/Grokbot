<template>
  <v-app  id="inspire">
    <v-app-bar class="px-3 z" flat height="72" border>
      <v-spacer>
        <CreateButton :createNewChat="createNewChat" />
      </v-spacer>

      <v-app-bar-nav-icon
        class="d-sm-none d-block"
        variant="text"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <ToogleTheme />
      <User />
    </v-app-bar>
    <v-main>
      <EmptyChat
        v-if="messageView.length === 0"
        :value="message"
        class="night"
        :class="{ day:isDay }"
        @cardClick="sendCard"
      />
      <MessageView v-else :message-view="messageView" :subtitle="subtitle" />
    </v-main>
    <v-navigation-drawer v-model="drawer" outline location="left">
      <v-list class="z">
        <v-list-item
          v-for="(n, i) in allChatsViews"
          :key="i"
          :value="i"
          active-color="tonal"
          @click.stop="(currentChat = i), setCurrentChat()"
          link
          prepend-icon="mdi-message-text"
        >
          <template v-slot:append>
            <v-btn
              v-if="currentChat === i"
              icon="mdi-delete"
              class="hover"
              variant="text"
              @click="deleteChat(i)"
            ></v-btn>
          </template>
          {{ i > 0 ? "Новый чат" + " " + i : "Новый чат" }}
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer class="z" app height="92">
  <MessageField id="footer" v-model="message" :send="sendMessage" />
</v-footer>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import MessageView from '@/components/chat/MessageView';
import MessageField from '@/components/chat/MessageField';
import User from './User';
import EmptyChat from '@/components/chat/EmptyChat';
import CreateButton from '@/components/chat/CreateButton.vue';
import ToogleTheme from '@/components/chat/ToogleTheme.vue';

const isDay = localStorage.getItem('theme') === 'light';
const serverUrl = 'http://localhost:3000'; // Replace with your actual server URL

const scrollFn = () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};

const currentChat = ref(JSON.parse(localStorage.getItem('currentChat')) || 0);
const allChatsViews = ref(
  Array(JSON.parse(localStorage.getItem('allChatsViewsLength'))) || []
);
const message = ref('');
const messageView = ref(
  JSON.parse(localStorage.getItem(`messageView${currentChat.value}`)) || []
);

const setCurrentChatInLocal = () => {
  localStorage.setItem('currentChat', JSON.stringify(currentChat.value));
};

const setAllChatsViewsLengthInLocal = () => {
  localStorage.setItem(
    'allChatsViewsLength',
    JSON.stringify(allChatsViews.value.length)
  );
};

const sendMessage = async () => {
  const messageListKey = `messageList${currentChat.value}`;
  let messageList = JSON.parse(localStorage.getItem(messageListKey)) || [];
  const tokensLimit = 8000;
  let currentTokens = messageList.reduce(
    (acc, msg) => acc + msg.content.length,
    0
  );

  if (currentTokens >= tokensLimit) {
    messageList.splice(0, Math.floor(messageList.length / 2));
    localStorage.setItem(messageListKey, JSON.stringify(messageList));
  }

  if (message.value.trim() === '') {
    return;
  }

  try {
    const apiKey = JSON.parse(localStorage.getItem('api')) || '';
    const userMessage = message.value;
    const maxTokens = 1000;
    const temperature = 0.5;
    const model = 'gpt-3.5-turbo';

    const newMessageView = {
      prependAvatar: 'public/ava2.jpg',
      title: 'Вы',
      subtitle: userMessage,
    };

    const divider = { type: 'divider', inset: true };

    const newMessageList = { role: 'user', content: userMessage };

    messageView.value.push(newMessageView, divider);
    messageList.push(newMessageList);
    setTimeout(() => {
      scrollFn();
    }, 100);

    const response = await fetch(`${serverUrl}/openai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: messageList,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    const data = await response.json();

    if (data.choices) {
      const aiMessage = data.choices[0].message.content;

      const newMessageView = {
        prependAvatar: 'ChatGPT.svg',
        title: 'Chat-GPT',
        subtitle: aiMessage,
      };

      const newMessageList = { role: 'assistant', content: aiMessage };
      messageView.value.push(newMessageView, divider);
      messageList.push(newMessageList);
      localStorage.setItem(messageListKey, JSON.stringify(messageList));
      localStorage.setItem(
        `messageView${currentChat.value}`,
        JSON.stringify(messageView.value)
      );

      setTimeout(() => {
        scrollFn();
      }, 100);
    }

    if (data.error) {
      const aiMessage = data.error.message;

      const newMessageView = {
        prependAvatar: 'public/ava1.jpg',
        title: 'Ошибка',
        subtitle: aiMessage,
      };
      messageView.value.push(newMessageView, divider);
    }
  } catch (error) {
    console.error(error);
  }

  message.value = '';
  scrollFn();
  document.getElementById('footer').blur();
};
const sendCard = (newMessage) => {
  message.value = newMessage;
  sendMessage();
};
</script>
<style>
.active-chat {
  background-color: #e0e0e0;
}
.container{
  min-height: 340px;
  height: 100%;
  width: 100%;
  margin: 20;
}
.night{
  background: radial-gradient(circle, #7d00d1, #47166f, transparent, transparent);
}
.day{
  background: radial-gradient(circle, #d79cfe, #c693f0, transparent, transparent);
}
.z{
  z-index: 0;
}
.hover{

}
.hover:hover{
color: rgb(205, 134, 255);
}
</style>
