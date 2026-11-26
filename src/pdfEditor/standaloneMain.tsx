// Tek HTML dosyası (internetsiz çevrimdışı derleme) için bağımsız giriş noktası
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { PdfEditorApp } from './PdfEditorApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PdfEditorApp />
  </StrictMode>,
);
