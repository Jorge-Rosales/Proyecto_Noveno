import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost/bitacora-cultural-api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});