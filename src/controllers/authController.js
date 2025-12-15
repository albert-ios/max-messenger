import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

// РЕГИСТРАЦИЯ
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 1. Простая валидация
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // 2. Проверка: существует ли такой email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email уже используется' });
    }

    // 3. Хешируем пароль (никогда не храним пароли в открытом виде!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Сохраняем в БД
    const newUser = await createUser(username, email, hashedPassword);

    // 5. Генерируем токен сразу при регистрации
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({ message: 'Пользователь создан', token, user: newUser });
  } catch (err) {
    next(err);
  }
};

// ВХОД (LOGIN)
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Ищем пользователя
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    // 2. Сравниваем пароли (введенный vs хеш в БД)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    // 3. Выдаем токен
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({ message: 'Успешный вход', token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
};