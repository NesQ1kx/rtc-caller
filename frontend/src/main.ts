import { createApp } from 'vue'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material';

import App from './App.vue'
import "./assets/css/main.css";
import router from "./router.ts";


createApp(App).use(router).use(PrimeVue, {
  theme: {
    preset: Material
  }
}).mount('#app')
