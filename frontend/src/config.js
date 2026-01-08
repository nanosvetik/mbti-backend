// frontend/src/config.js

// Твой новый адрес бэкенда из туннеля
const TUNNEL_URL = 'https://common-papayas-turn.loca.lt';

export const API_BASE_URL = TUNNEL_URL;

// Для защищенного туннеля (https) используем защищенный протокол wss
export const WS_BASE_URL = TUNNEL_URL.replace('https://', 'wss://');