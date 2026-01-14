// Пытаемся взять URL из переменных окружения Docker/Vite
const envApiUrl = import.meta.env.VITE_API_URL;

// Проверяем, запущен ли сайт локально
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Если есть переменная (на сервере) — берем её, иначе — локальный адрес
export const API_BASE_URL = envApiUrl || (isLocalhost ? "http://localhost:8001" : `https://${window.location.hostname}/api`);

// Настройка для веб-сокетов (автоматически меняет http на ws или https на wss)
export const WS_BASE_URL = API_BASE_URL.replace("https://", "wss://").replace("http://", "ws://");
