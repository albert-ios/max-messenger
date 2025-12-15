export function initSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/chat-ws`;
    
    console.log('Connecting to:', wsUrl);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log('✅ WebSocket подключен!');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📩 Сообщение от сервера:', data);
    };

    socket.onclose = () => console.log('WebSocket отключен');
    socket.onerror = (error) => console.error('WebSocket error:', error);
}