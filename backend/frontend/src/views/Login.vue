<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <h2 class="text-2xl font-bold text-center mb-6">Login</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2" for="email">E-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2" for="password">Senha</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      <p class="text-center text-sm text-gray-600 mt-4">
        Não tem conta?
        <a href="/register" class="text-blue-500 hover:underline">Cadastre-se</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'

const form = reactive({
  email: '',
  password: ''
})
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    const response = await axios.post('/api/login', form)
    // Armazene o token ou redirecione
    console.log('Login bem-sucedido:', response.data)
    window.location.href = '/' // Ajuste conforme sua rota
  } catch (error) {
    console.error('Erro ao fazer login:', error.response?.data)
    alert(error.response?.data.message || 'Erro no login')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Ajustes adicionais de estilo, se necessário */
</style>