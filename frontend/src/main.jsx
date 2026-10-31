import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ValeraList from './components/ValeraList';
import ValeraStats from './components/ValeraStats';
import AuthPage from './AuthPage';
import './styles.css';

function Protected({ children }) {
  return localStorage.getItem('jwt') ? children : <Navigate to="/login" replace />;
}
function App() {
  return <BrowserRouter><Routes>
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/" element={<Protected><ValeraList /></Protected>} />
    <Route path="/valera/:id" element={<Protected><ValeraStats /></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
