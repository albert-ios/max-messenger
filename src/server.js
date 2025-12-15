import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

// Инициализация приложения
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Конфигурация
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware для JSON
app.use(express.json());

// Простой тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({ message: 'Бэкенд работает успешно!' });
});

// Логика WebSocket
wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    // Эхо-ответ
    ws.send(JSON.stringify({ type: 'info', text: 'Сервер услышал тебя!' }));
  });

  ws.on('close', () => console.log('Client disconnected'));
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`🔌 WebSocket готов к подключениям`);
});