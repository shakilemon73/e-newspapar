import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { staticQueryClient } from './lib/static-queryClient';
import { cleanupCorruptedStorage } from './lib/storage-cleanup';
import App from './App';
import './index.css';

// Run storage cleanup immediately to prevent JSON parsing errors
try {
  cleanupCorruptedStorage();
} catch (error) {
  console.warn('Storage cleanup failed:', error);
}

// Static site entry point - uses static query client with Supabase
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found - creating fallback div');
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'root';
  document.body.appendChild(fallbackRoot);
}

const finalRootElement = document.getElementById('root');
if (!finalRootElement) {
  throw new Error('Unable to create root element');
}

// Add comprehensive global error handler
window.addEventListener('error', (event) => {
  if (event.error && event.error.message) {
    const message = event.error.message;
    // Handle classList errors
    if (message.includes('add') || message.includes('classList') || message.includes('Cannot read properties of undefined')) {
      console.warn('DOM manipulation error prevented:', event.error);
      event.preventDefault();
      return;
    }
    // Handle JSON parsing errors
    if (message.includes('JSON.parse') || message.includes('not valid JSON') || message.includes('[object Object]')) {
      console.warn('JSON parsing error prevented:', event.error);
      try {
        cleanupCorruptedStorage();
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
      event.preventDefault();
      return;
    }
  }
});

try {
  const root = createRoot(finalRootElement);
  
  root.render(
    <StrictMode>
      <QueryClientProvider client={staticQueryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render React app:', error);
  // Fallback rendering
  if (finalRootElement) {
    finalRootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>Loading...</h1>
        <p>If this message persists, please refresh the page.</p>
        <script>setTimeout(() => window.location.reload(), 3000);</script>
      </div>
    `;
  }
}