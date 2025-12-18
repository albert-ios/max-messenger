import http from 'http';
import { WebSocketServer } from 'ws';
import app from './app.js'; // Импортируем настроенный Express app
import { db } from './config/db.js'; // Подключаем базу

// 1. Создаем "обертку" HTTP-сервера вокруг Express
// Это нужно, чтобы на одном порту работал и сайт, и WebSocket
const server = http.createServer(app);

// 2. Создаем WebSocket сервер и привязываем его к нашему HTTP серверу
const wss = new WebSocketServer({ server });

// Сохраняем wss в app, чтобы использовать его в контроллерах (для sendMessage)
app.set('wss', wss);

// Логика работы WebSocket
wss.on('connection', (ws) => {
  console.log('🔌 Новое WebSocket подключение!');

  ws.on('error', console.error);

  ws.on('message', (message) => {
    // Если нужно обрабатывать входящие сообщения от сокета (пока у нас через HTTP)
    console.log('Получено сообщение:', message);
  });
});

// 3. ЗАПУСКАЕМ ИМЕННО SERVER (а не app.listen)
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 WebSocket готов к подключениям`);
});