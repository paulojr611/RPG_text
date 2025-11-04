<template>
  <main>
    <RouterView />
  </main>

</template>

<script setup>
import { RouterView } from 'vue-router';
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8000'


</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
