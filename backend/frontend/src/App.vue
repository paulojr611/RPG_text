<template>
  <main>
    <RouterView />
  </main>
</template>

<script setup>
import { RouterView } from "vue-router";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const savedToken = localStorage.getItem("token");
if (savedToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
}
</script>
