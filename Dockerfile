# 1. Используем Node.js 20 (нужен для better-sqlite3)
FROM node:20-alpine

# 2. Устанавливаем инструменты для сборки (Python, Make, G++)
# Это ОБЯЗАТЕЛЬНО для работы базы данных
RUN apk add --no-cache python3 make g++

# 3. Рабочая папка
WORKDIR /app

# 4. Копируем файлы зависимостей
COPY package*.json ./

# 5. Устанавливаем зависимости
RUN npm install

# 6. Копируем исходный код
COPY . .

# 7. Открываем порт
EXPOSE 3000

# 8. Запускаем сервер
CMD ["npm", "run", "server"]