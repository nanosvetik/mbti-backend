// frontend/src/config.js

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Если запускаем локально — идем на порт 8000, иначе на Render
export const API_BASE_URL = isLocalhost
    ? "http://localhost:8000"
    : "https://mbti-backend-26c5.onrender.com";

export const WS_BASE_URL = isLocalhost
    ? "ws://localhost:8000"
    : "wss://mbti-backend-26c5.onrender.com";