<script setup>
import useGlobalImports from '@/composables/globalImports';

const { ref, onMounted, axios, useRouter, sidebar, AcademicCapIcon} = useGlobalImports();

const menuStore = sidebar();
const router = useRouter();
const personagens = ref([])

const removeSide = () => {
  menuStore.removeAllMenuItems();
};
const addSide = () => {
  menuStore.addMenuItem({ label: 'RPG', icon: AcademicCapIcon , route: '/rpg' });
};

onMounted(() => {
  removeSide();
});
onMounted(() => {
  addSide();
});
</script>
<template>
    sdalkj
</template>