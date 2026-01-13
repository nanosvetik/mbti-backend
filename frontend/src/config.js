const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const currentHost = isLocalhost ? "localhost" : window.location.hostname;

export const API_BASE_URL = `http://${currentHost}:8001`;
export const WS_BASE_URL = `ws://${currentHost}:8001`;