import { login, register, request } from './api.js';

// Состояние приложения
let currentChatId = null;

// ================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (WebSocket и отображение)
// ================================================================

function appendMessageToView(msg) {
    const container = document.getElementById('messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'message';
    
    // Красивое отображение имени
    const authorName = msg.username || 'Собеседник';
    div.innerHTML = `<b>${authorName}:</b> ${msg.content}`;
    
    container.appendChild(div);
    
    // Прокрутка вниз
    container.scrollTop = container.scrollHeight;
}

function connectWebSocket() {
    // Определяем адрес: берем текущий IP, но порт ставим 3000 (где бэкенд)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname; // Например, 172.20.10.4
    const port = '3000'; 
    
    console.log(`🔌 Подключение к WebSocket: ${protocol}//${host}:${port}`);
    const ws = new WebSocket(`${protocol}//${host}:${port}`);

    ws.onopen = () => {
        console.log('🟢 WebSocket подключен!');
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'NEW_MESSAGE') {
                const message = data.payload;
                
                // Если мы прямо сейчас смотрим этот чат - показываем сообщение
                if (currentChatId && message.chat_id == currentChatId) {
                    appendMessageToView(message);
                }
            }
        } catch (e) {
            console.error('Ошибка обработки WS сообщения:', e);
        }
    };

    ws.onclose = () => {
        console.log('🔴 WebSocket отключился. Переподключение через 3 сек...');
        setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
    };
}

// ================================================================
// ОСНОВНАЯ ЛОГИКА UI
// ================================================================

export function initUI() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  // 1. Запускаем WebSocket сразу при загрузке UI
  connectWebSocket();

  // Логика переключения форм
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
      loadChats();
    } catch (err) {
      alert(err.message);
    }
  };

  // Создание чата
  const createChatBtn = document.getElementById('create-chat-btn');
  if (createChatBtn) {
      createChatBtn.onclick = async () => {
        const nameInput = document.getElementById('new-chat-name');
        const name = nameInput.value;
        if (!name) return alert('Введите название чата!');

        try {
            await request('/api/chats', 'POST', { name });
            nameInput.value = '';
            loadChats();
        } catch (err) {
            alert('Ошибка создания чата: ' + err.message);
        }
      };
  }

  // Логика отправки сообщения
  const sendBtn = document.getElementById('send-btn');
  const messageInput = document.getElementById('message-input');

  const handleSendMessage = async () => {
      const content = messageInput.value;
      
      if (!content.trim()) return; 
      if (!currentChatId) return alert('Выберите чат!');

      try {
          // Отправляем на сервер
          await request(`/api/chats/${currentChatId}/messages`, 'POST', { content });
          
          // Очищаем поле
          messageInput.value = '';

          // ВАЖНО: Мы НЕ вызываем renderMessages() тут вручную.
          // Мы ждем, пока WebSocket пришлет нам наше же сообщение обратно.
          // Это и будет доказательством работы Real-time!
          
      } catch (err) {
          console.error('Ошибка отправки:', err);
          alert('Не удалось отправить сообщение');
      }
  };

  if (sendBtn) {
      sendBtn.onclick = handleSendMessage;
  }

  if (messageInput) {
      messageInput.onkeydown = (e) => {
          if (e.key === 'Enter') handleSendMessage();
      };
  }

  // Выход
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
      logoutBtn.onclick = () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          location.reload();
      };
  }

  // Если уже вошли
  if (localStorage.getItem('token')) {
    showChatView();
    loadChats();
  }
}

// Показывает экран чата
function showChatView() {
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('chat-view').style.display = 'flex';

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && document.getElementById('current-user')) {
        document.getElementById('current-user').innerText = user.username;
    }
}

// Загружает чаты
async function loadChats() {
    try {
        const chats = await request('/api/chats');
        const list = document.getElementById('chat-list');
        if (!list) return;
        
        list.innerHTML = ''; 

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

// Выбор чата
async function selectChat(chat) {
    currentChatId = chat.id;
    
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
    document.getElementById('chat-header').innerHTML = `<h3>${chat.name}</h3>`;
    document.getElementById('input-area').style.display = 'flex';

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
        // Используем ту же функцию, что и для WebSocket, чтобы код был чище
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `<b>${msg.username}:</b> ${msg.content}`;
        container.appendChild(div);
    });
    
    container.scrollTop = container.scrollHeight;
}