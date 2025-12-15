import '../styles/main.css';
import { initUI } from './ui.js';
import { initSocket } from './socket.js'; // <--- ВАЖНО: В фигурных скобках

console.log('App started');

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    // initSocket(); // Можно пока закомментировать, запустим его, когда войдем в чат
});