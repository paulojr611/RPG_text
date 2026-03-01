<template>
  <div class="relative w-screen h-screen overflow-hidden font-medieval bg-black text-emerald-200">
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
      style="background-image: radial-gradient(circle at 20% 10%, rgba(16, 185, 129, 0.2), transparent 45%), radial-gradient(circle at 80% 90%, rgba(52, 211, 153, 0.15), transparent 45%); filter: brightness(0.7) contrast(1.1);"
    ></div>
    <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black opacity-90"></div>

    <div class="relative z-10 flex h-full flex-col justify-end p-6">
      <pre class="glow-text mb-4 text-lg leading-relaxed whitespace-pre-wrap">{{ log }}</pre>

      <input
        v-model="input"
        @keydown.enter="handleInput"
        class="w-full rounded border border-emerald-800 bg-black/70 p-3 text-emerald-100 shadow-lg placeholder-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        placeholder="> Digite seu comando..."
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { gameState, processInput } from "../engine/commandEngine.js";

const log = ref("");
const input = ref("");

function say(text) {
  log.value += `\n${text}`;
}

async function handleInput() {
  const userInput = input.value;
  input.value = "";

  if (userInput.trim() !== "") {
    log.value += gameState.typingPassword ? "\n> ********" : `\n> ${userInput}`;
  }

  await processInput(userInput, say);
}

onMounted(() => {
  //say("Voce desperta em uma taverna antiga...");
  setTimeout(() => {
    processInput("", say);
  }, 800);
});
</script>

<style scoped>
.font-medieval {
  font-family: "Cinzel", serif;
}

.glow-text {
  text-shadow: 0 0 8px rgba(0, 255, 150, 0.6), 0 0 15px rgba(0, 255, 150, 0.3);
}
</style>
