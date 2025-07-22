import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { staticQueryClient } from './lib/static-queryClient';
import App from './App';
import './index.css';

// Static site entry point - uses static query client with Supabase
const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <QueryClientProvider client={staticQueryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);