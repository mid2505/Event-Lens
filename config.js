// config.js
// Auto-detect environment
const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

// Base URLs
const LOCAL_API = "http://localhost:5001";
const PROD_API  = "https://eventlens-bwesbravb5dvhhct.centralindia-01.azurewebsites.net";

// Export correct base URL
export const API_BASE = isLocal ? LOCAL_API : PROD_API;
