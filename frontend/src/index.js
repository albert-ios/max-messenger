/// <reference types="@rspack/core/module" />

import '../styles/main.css';
import { initUI } from './ui.js';

console.log('Rspack app started!');

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    app.innerHTML = '<h1>Привет! Rspack работает 🚀</h1><p>Стили загружены, JS выполняется.</p>';
    
});