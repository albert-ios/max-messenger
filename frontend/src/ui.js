// frontend/src/ui.js
import { login, register } from './api.js';

export function initUI() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authView = document.getElementById('auth-view');
  const chatView = document.getElementById('chat-view');
  
  // 1. Логика переключения кнопок (ЭТО ТО, ЧТО НЕ РАБОТАЕТ)
  document.getElementById('go-to-register').onclick = (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  };
  
  document.getElementById('go-to-login').onclick = (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  };

  // 2. Отправка формы регистрации
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
      await register(username, email, password);
      alert('Аккаунт создан! Теперь войдите.');
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  // 3. Отправка формы входа
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showChat();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  // Если мы уже вошли - показываем чат
  if (localStorage.getItem('token')) {
    showChat();
  }
  
  // Кнопка выхода
  document.getElementById('logout-btn').onclick = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.reload();
  };
}

function showChat() {
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('chat-view').style.display = 'flex';
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('current-user').innerText = user.username;
    }
}