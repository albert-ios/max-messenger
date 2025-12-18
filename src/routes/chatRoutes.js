import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js'; // <--- Импорт загрузчика
import { createNewChat, getChats, getHistory, sendMessage } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);

router.post('/', createNewChat);
router.get('/', getChats);
router.get('/:id/messages', getHistory);

// Маршрут для отправки сообщений (поддерживает файлы)
router.post('/:chatId/messages', upload.single('file'), sendMessage);

router.use(protect);

export default router;