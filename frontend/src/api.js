// frontend/src/api.js

export async function request(url, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }
  return data;
}

export const login = (email, password) => request('/auth/login', 'POST', { email, password });
export const register = (username, email, password) => request('/auth/register', 'POST', { username, email, password });