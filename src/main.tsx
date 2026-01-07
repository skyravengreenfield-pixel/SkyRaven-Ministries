import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.tsx'
import './index.css'
import { initializeFirebase } from './config/firebase'

// Debug: Check environment variables
console.log('=== ENVIRONMENT CHECK ===');
console.log('VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('All env vars:', import.meta.env);

// Initialize Firebase before rendering the app
initializeFirebase();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
