import axios from 'axios';

// API principal de Pilgrim para datos generales del negocio
export const pilgrimApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_PILGRIM_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API exclusiva para gestión de usuarios conectada a los microservicios Java
export const userApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_USER_API_URL || 'http://localhost:8080/api/users',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Puedes agregar interceptores aquí más adelante para inyectar tokens de autorización, etc.
