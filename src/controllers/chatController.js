import { createChat, getAllChats, getChatMessages } from '../models/chatModel.js';
import { createMessage } from '../models/messageModel.js';

export const createNewChat = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Имя чата обязательно' });
    
    // req.user берется из токена (authMiddleware)
    const chat = await createChat(name, req.user.id); 
    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
};

export const getChats = async (req, res, next) => {
  try {
    const chats = await getAllChats();
    res.json(chats);
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const messages = await getChatMessages(req.params.id);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};
// Вставь это в controllers/chatController.js вместо старой sendMessage

// Вставь это в controllers/chatController.js вместо старой sendMessage

export const sendMessage = async (req, res, next) => {
  try {
    console.log("📥 [Server] Получен запрос sendMessage");

    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
    // Если req.user нет, значит middleware не сработал
    if (!req.user) {
        console.error("❌ Ошибка: req.user is undefined. Пользователь не авторизован.");
        return res.status(401).json({ error: 'Ошибка авторизации' });
    }

    const { chatId } = req.params;
    const { content } = req.body;
    const file = req.file;

    console.log(`👤 User: ${req.user.id}, Chat: ${chatId}, Content: ${content}`);

    // 2. СОХРАНЕНИЕ В БД
    // (Убедись, что createMessage импортирован в начале файла!)
    const newMessage = await createMessage(chatId, req.user.id, content || '', 'text', null);
    console.log("✅ Сообщение сохранено в БД, ID:", newMessage.id);

    // 3. ОТПРАВКА ПО WEBSOCKET (С защитой от вылета)
    try {
        const wss = req.app.get('wss');
        if (wss && wss.clients) {
            wss.clients.forEach((client) => {
              if (client.readyState === 1) { 
                client.send(JSON.stringify({
                  type: 'NEW_MESSAGE',
                  payload: newMessage
                }));
              }
            });
        } else {
            console.log("⚠️ WSS не найден, но это не критично.");
        }
    } catch (wsError) {
        console.error("⚠️ Ошибка WebSocket:", wsError.message);
    }

    // 4. ОТВЕТ КЛИЕНТУ
    res.status(201).json(newMessage);

  } catch (err) {
    // ВОТ ЗДЕСЬ мы увидим настоящую причину ошибки в терминале
    console.error("🔥 КРИТИЧЕСКАЯ ОШИБКА НА СЕРВЕРЕ:", err);
    res.status(500).json({ error: err.message });
  }
};