import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyD8LpoEmP9-FZdgSi9ZxEF9NyojzYbkvDE",
    authDomain: "petzim.firebaseapp.com",
    projectId: "petzim",
    storageBucket: "petzim.firebasestorage.app",
    messagingSenderId: "1017940724186",
    appId: "1:1017940724186:web:f27a0ef4dbb0951a07d8e3",
    measurementId: "G-ZX6EBW7L10",
    databaseURL: 'https://petzim-default-rtdb.firebaseio.com'
  };

const app = initializeApp(firebaseConfig);
export const realtimeDb = getDatabase(app);