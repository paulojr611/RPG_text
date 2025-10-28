import { defineStore } from 'pinia';
import { AcademicCapIcon, BellSnoozeIcon, BellIcon } from '@heroicons/vue/24/solid';

export const sidebar = defineStore('menu', {
 /* state: () => ({
    menuItems: [
      { label: 'RPG', icon: AcademicCapIcon, route: '/rpg' },
      { label: 'Jaburu', icon: BellSnoozeIcon, route: '/' },
      { label: 'Commit do dia', icon: BellIcon, route: '/' } 
    ]
  }),*/
  actions: {
    addMenuItem(item) {
      this.menuItems.push(item);
    },
    removeMenuItem(label) {
      this.menuItems = this.menuItems.filter(item => item.label !== label);
    },
    removeAllMenuItems() {
      this.menuItems = []; 
    }
  }
});
