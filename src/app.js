import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Маршруты
app.use('/auth', authRoutes);

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({ message: 'Бэкенд работает успешно!' });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так на сервере', details: err.message });
});

export default app;