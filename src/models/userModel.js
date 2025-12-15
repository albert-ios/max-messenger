import { db } from '../config/db.js';

// Создание нового пользователя
export const createUser = (username, email, passwordHash) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(query, [username, email, passwordHash], function (err) {
      if (err) {
        reject(err);
      } else {
        // this.lastID — это ID только что созданного юзера
        resolve({ id: this.lastID, username, email });
      }
    });
  });
};

// Поиск пользователя по Email (для входа)
export const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Поиск пользователя по ID (пригодится позже)
export const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, username, email, created_at FROM users WHERE id = ?`;
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};