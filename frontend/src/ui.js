import { login, register, request } from './api.js';

// Состояние приложения
let currentChatId = null;

export function initUI() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  // Логика переключения форм входа/регистрации
  if (document.getElementById('go-to-register')) {
      document.getElementById('go-to-register').onclick = (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
      };
  }
  
  if (document.getElementById('go-to-login')) {
      document.getElementById('go-to-login').onclick = (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
      };
  }

  // Регистрация
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
      alert(err.message);
    }
  };

  // Вход
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showChatView();
      loadChats(); // Загружаем чаты сразу после входа
    } catch (err) {
      alert(err.message);
    }
  };

  // Логика создания чата
  const createChatBtn = document.getElementById('create-chat-btn');
  if (createChatBtn) {
      createChatBtn.onclick = async () => {
        const nameInput = document.getElementById('new-chat-name');
        const name = nameInput.value;
        if (!name) return alert('Введите название чата!');

        try {
            await request('/api/chats', 'POST', { name });
            nameInput.value = ''; // Очистить поле
            loadChats(); // Обновить список
        } catch (err) {
            alert('Ошибка создания чата: ' + err.message);
        }
      };
  }

  // Логика кнопки "Скрепка"
  const attachBtn = document.getElementById('attach-btn');
  const fileInput = document.getElementById('file-input');
  
  if (attachBtn && fileInput) {
      attachBtn.onclick = () => fileInput.click();
      fileInput.onchange = () => {
          if (fileInput.files.length > 0) {
              alert(`Файл "${fileInput.files[0].name}" выбран! (Логика отправки скоро будет)`);
          }
      };
  }

  const sendBtn = document.getElementById('send-btn'); // Убедись, что в HTML кнопка имеет id="send-btn"
  const messageInput = document.getElementById('message-input'); // Убедись, что поле ввода имеет id="message-input"

  const handleSendMessage = async () => {
      const content = messageInput.value;
      
      // Проверки
      if (!content.trim()) return; // Не отправляем пустоту
      if (!currentChatId) return alert('Выберите чат!');

      try {
          // 1. Отправляем запрос на сервер
          // Используем request, который у тебя уже импортирован
          await request(`/api/chats/${currentChatId}/messages`, 'POST', { content });
          
          // 2. Очищаем поле ввода
          messageInput.value = '';

          // 3. Обновляем список сообщений
          // (В идеале это делает WebSocket, но пока обновим вручную через запрос)
          const messages = await request(`/api/chats/${currentChatId}/messages`);
          renderMessages(messages);
          
      } catch (err) {
          console.error('Ошибка отправки:', err);
          alert('Не удалось отправить сообщение');
      }
  };

  if (sendBtn) {
      sendBtn.onclick = handleSendMessage;
  }

  // Дополнительно: Отправка по нажатию Enter
  if (messageInput) {
      messageInput.onkeydown = (e) => {
          if (e.key === 'Enter') {
             handleSendMessage();
          }
      };
  }

  // Выход из аккаунта
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
      logoutBtn.onclick = () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          location.reload();
      };
  }

  // Если пользователь уже вошел ранее
  if (localStorage.getItem('token')) {
    showChatView();
    loadChats();
  }
}

// Показывает экран чата, скрывает вход
function showChatView() {
    const authView = document.getElementById('auth-view');
    const chatView = document.getElementById('chat-view');
    
    if (authView) authView.style.display = 'none';
    if (chatView) chatView.style.display = 'flex'; // Используем flex для колонок

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && document.getElementById('current-user')) {
        document.getElementById('current-user').innerText = user.username;
    }
}

// Загружает список чатов с сервера
async function loadChats() {
    try {
        const chats = await request('/api/chats');
        const list = document.getElementById('chat-list');
        if (!list) return;
        
        list.innerHTML = ''; // Очистка старого списка

        chats.forEach(chat => {
            const div = document.createElement('div');
            div.className = 'chat-item';
            div.innerText = chat.name;
            div.onclick = () => selectChat(chat);
            list.appendChild(div);
        });
    } catch (err) {
        console.error('Ошибка загрузки чатов:', err);
    }
}

// Выбор конкретного чата
async function selectChat(chat) {
    currentChatId = chat.id;
    
    // Подсветка активного чата
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
    // (можно добавить event.target.classList.add('active'), но пока так)

    // Обновление заголовка
    document.getElementById('chat-header').innerHTML = `<h3>${chat.name}</h3>`;
    
    // Показываем поле ввода (оно скрыто по умолчанию)
    document.getElementById('input-area').style.display = 'flex';

    // Загрузка сообщений
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '<i>Загрузка истории...</i>';

    try {
        const messages = await request(`/api/chats/${chat.id}/messages`);
        renderMessages(messages);
    } catch (err) {
        messagesContainer.innerHTML = 'Ошибка загрузки сообщений';
    }
}

function renderMessages(messages) {
    const container = document.getElementById('messages');
    container.innerHTML = '';
    
    if (messages.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#888; margin-top:20px;">Сообщений пока нет. Напиши первое!</div>';
        return;
    }

    messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `<b>${msg.username}</b> ${msg.content}`;
        container.appendChild(div);
    });
    
    // Прокрутка вниз
    container.scrollTop = container.scrollHeight;
}


// ============================================================
  // Вставь это в конец функции initUI()
  // ============================================================

  const sendBtn = document.getElementById('send-btn');
  const messageInput = document.getElementById('message-input');

  // Функция отправки
  const handleSendMessage = async () => {
      const content = messageInput.value;
      
      // 1. Проверки: текст не пустой и чат выбран
      if (!content.trim()) return; 
      if (!currentChatId) {
          alert('Сначала выберите чат слева!');
          return;
      }

      try {
          // 2. Отправляем данные на сервер
          // (Используем твою функцию request из api.js)
          await request(`/api/chats/${currentChatId}/messages`, 'POST', { content });
          
          // 3. Очищаем поле ввода сразу после отправки
          messageInput.value = '';

          // 4. Обновляем список сообщений
          // Мы запрашиваем историю заново, чтобы увидеть своё новое сообщение
          const messages = await request(`/api/chats/${currentChatId}/messages`);
          renderMessages(messages);
          
      } catch (err) {
          console.error('Ошибка при отправке:', err);
          alert('Не удалось отправить сообщение. Проверь консоль.');
      }
  };

  // Привязываем клик по кнопке "Send"
  if (sendBtn) {
      sendBtn.onclick = handleSendMessage;
  }

  // Привязываем нажатие Enter в поле ввода
  if (messageInput) {
      messageInput.onkeydown = (e) => {
          if (e.key === 'Enter') {
             handleSendMessage();
          }
      };
  }