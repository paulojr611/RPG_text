import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { sidebar } from '../stores/menuSidebar';
import { UserIcon, AcademicCapIcon } from '@heroicons/vue/24/solid';
import { setClickAccess } from '../router/router';

export default function useGlobalImports() {
  return {
    ref,
    onMounted,
    axios,
    useRouter,
    sidebar,
    setClickAccess,
    AcademicCapIcon,
    UserIcon,
  };
}
