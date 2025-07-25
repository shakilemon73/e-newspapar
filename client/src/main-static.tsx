import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { staticQueryClient } from './lib/static-queryClient';
import App from './App';
import './index.css';

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

// Add global error handler for DOM-related errors
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('add')) {
    console.warn('DOM classList error caught:', event.error);
    event.preventDefault();
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