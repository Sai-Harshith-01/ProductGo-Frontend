import { io } from 'socket.io-client';

// The URL should match your server
const URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const socket = io(URL, {
  autoConnect: false, // connect only when user is logged in
  withCredentials: true,
});
