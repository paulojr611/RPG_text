import { createRouter, createWebHistory } from 'vue-router';
import count from '../views/Count.vue';
import rpg from '../views/rpg.vue';
import criarpersonagem from '../views/CriarPersonagem.vue';
import status from '../views/Status.vue';
import login from '../views/Login.vue';


const routes = [
    {
    path: '/',
    name: 'Login',
    component: login,
  },
  {
    path: '/criarpersonagem',
    name: 'criarpersonagem',
    component: criarpersonagem,
  },
  {
    path: '/rpg',
    name: 'rpg',
    component: rpg,
   // meta: { requiresClick: true },
  },
  {
    path: '/status',
    name: 'status',
    component: status,
   // meta: { requiresClick: true },
  },
  {
    path: '/count',
    name: 'count',
    component: count,
  },

];

let hasClicked = false;

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresClick && !hasClicked) {
    console.warn('Acesso bloqueado: requer clique antes de acessar.');
    return next(false); 
  }
  next();
});

export const setClickAccess = () => {
  hasClicked = true;
};

export default router;
