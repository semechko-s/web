import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ValeraList from './components/ValeraList';
import ValeraStats from './components/ValeraStats';
import './styles.css';

function App() {
  return <BrowserRouter><Routes><Route path="/" element={<ValeraList />} /><Route path="/valera/:id" element={<ValeraStats />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
