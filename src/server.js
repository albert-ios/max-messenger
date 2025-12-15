import http from 'http';
import { WebSocketServer } from 'ws';
import { initDB } from './config/db.js';
import app from './app.js';

// Создаем HTTP сервер на основе настроенного app
const server = http.createServer(app);

// WebSocket на пути /chat-ws
const wss = new WebSocketServer({ server, path: '/chat-ws' }); 

// Конфигурация порта
const PORT = process.env.PORT || 3000;

// Инициализация Базы Данных
initDB();

// Передаем wss в app, чтобы контроллеры могли делать broadcast (понадобится позже)
app.set('wss', wss);

// Логика WebSocket (пока простая)
wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });

  ws.on('close', () => console.log('Client disconnected'));
  ws.on('error', console.error);
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ждет подключений по адресу /chat-ws`);
});