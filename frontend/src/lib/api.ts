import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// Single-tenant local demo, no auth — a plain client is enough.
export const api = axios.create({ baseURL: API_BASE_URL })
