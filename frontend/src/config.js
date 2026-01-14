// Проверяем, где запущен код
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Жёстко прописываем адреса, чтобы не было путаницы с поддоменами
export const API_BASE_URL = isLocalhost 
    ? "http://localhost:8001" 
    : "https://api.marinka-ai.ru";

export const WS_BASE_URL = isLocalhost 
    ? "ws://localhost:8001" 
    : "wss://api.marinka-ai.ru";

console.log("Current API URL:", API_BASE_URL);
