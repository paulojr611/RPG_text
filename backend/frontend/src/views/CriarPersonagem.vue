<script setup>
import useGlobalImports from '@/composables/globalImports';

const { ref, onMounted, axios, useRouter, sidebar, setClickAccess } = useGlobalImports();

const router = useRouter();
const personagens = ref([])
const errorMsg = ref('');
const menuStore = sidebar();

const removeSide = () => {
    menuStore.removeAllMenuItems();
};
const addSide = () => {
    //// menuStore.addMenuItem({ label: 'RPG', icon: AcademicCapIcon, route: '/rpg' });
};

const novoPersonagem = ref({
    nome: '',
    vida: 20,
    vidaMax: 20,
    mana: 5,
    manaMax: 5,
    ca: 10,
    DR: 0,
    nivel: 1,
    moedas: 100,
    xp: 0
})


const carregarPersonagens = async () => {
    try {
        const { data } = await axios.get('/api/personagem');
        personagens.value = data;
        if (data.length > 0) {
            setClickAccess();
            router.push('/rpg');
        }
    } catch (error) {
        errorMsg.value = 'Erro ao carregar personagens.';
        console.error(error);
    }
};

const criarPersonagem = async () => {
    if (novoPersonagem.value.nome.trim() === '') {
        alert('Digite um nome válido para o personagem.')
        return
    }
    try {
        const { data } = await axios.post('/api/personagem', novoPersonagem.value)
        personagens.value.push(data)
        window.location.reload();
    } catch (error) {
        errorMsg.value = 'Erro ao criar personagem.'
        console.error(error)
    }
}

onMounted(() => {
    removeSide();
});
onMounted(() => {
    addSide();
});
onMounted(carregarPersonagens)
</script>
<template>
    <div class="h-screen flex items-center justify-center">
        <div class="max-w-4xl w-full bg-white shadow rounded p-6">
            <h2 class="text-2xl font-semibold text-gray-700 mb-4 text-center">Criar Novo Personagem</h2>
            <div class="mb-4">
                <label for="nome" class="block text-gray-600 mb-1">Nome</label>
                <input id="nome" type="text" v-model="novoPersonagem.nome" placeholder="Digite o nome do personagem"
                    class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
            <div class="text-center">
                <button @click="criarPersonagem" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                    Criar Personagem
                </button>
            </div>
        </div>
    </div>

</template>