import { createRouter, createWebHistory } from 'vue-router';
import main from '../views/Main.vue';


const routes = [
  {
    path:'/',
    name:'Main',
    component: main,
  },
];

let hasClicked = false;

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
