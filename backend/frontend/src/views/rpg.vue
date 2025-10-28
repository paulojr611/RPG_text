<script setup>
import useGlobalImports from '@/composables/globalImports';

const { ref, onMounted, axios, useRouter, sidebar,  UserIcon} = useGlobalImports();

const menuStore = sidebar();
const router = useRouter();
const personagens = ref([])

const removeSide = () => {
  menuStore.removeAllMenuItems();
};
const addSide = () => {
  menuStore.addMenuItem({ label: 'Status', icon: UserIcon , route: '/status' });
};


const errorMsg = ref(null)

const carregarPersonagens = async () => {
  try {
    const { data } = await axios.get('/api/personagem')
    personagens.value = data
    if (data.length == 0) {
      router.push('/'); 
    }
  } catch (error) {
    errorMsg.value = 'Erro ao carregar personagens.'
    console.error(error)
  }
}


const atualizarPersonagem = async (personagem) => {
  try {
    const atualizado = { ...personagem, nivel: personagem.nivel + 1, xp: personagem.xp + 100 }
    await axios.put(`/api/personagem/${personagem.id}`, atualizado)
    carregarPersonagens()
  } catch (error) {
    errorMsg.value = 'Erro ao atualizar personagem.'
    console.error(error)
  }
}

// Deletar personagem
const deletarPersonagem = async (id) => {
  try {
    await axios.delete(`/api/personagem/${id}`)
    personagens.value = personagens.value.filter(p => p.id !== id)
  } catch (error) {
    errorMsg.value = 'Erro ao deletar personagem.'
    console.error(error)
  }
}

//Carrega os personagens quando o componente é montado
onMounted(carregarPersonagens)
onMounted(() => {
  removeSide();
});
onMounted(() => {
  addSide();
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div v-if="errorMsg" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      {{ errorMsg }}
    </div>

    <!-- Listagem dos personagens -->
    <div class="bg-white shadow rounded p-6">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Lista de Personagens</h2>
      <ul v-if="personagens.length">
        <li v-for="personagem in personagens" :key="personagem.id"
          class="border-b border-gray-200 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ personagem.nome }}</h3>
            <p class="text-gray-600">Nível: {{ personagem.nivel }}</p>
            <p class="text-gray-600">Vida: {{ personagem.vida }} / {{ personagem.vidaMax }}</p>
            <p class="text-gray-600">Mana: {{ personagem.mana }} / {{ personagem.manaMax }}</p>
            <p class="text-gray-600">CA: {{ personagem.ca }} | DR: {{ personagem.DR }}</p>
            <p class="text-gray-600">Moedas: {{ personagem.moedas }} | XP: {{ personagem.xp }}</p>
          </div>
          <div class="mt-4 md:mt-0 flex space-x-2">
            <button @click="atualizarPersonagem(personagem)"
              class="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded">
              + Nível
            </button>
            <button @click="deletarPersonagem(personagem.id)"
              class="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded">
              Excluir
            </button>
          </div>
        </li>
      </ul>
      <p v-else class="text-center text-gray-500">
        Nenhum personagem encontrado.
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>
