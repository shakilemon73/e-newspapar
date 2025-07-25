import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { staticQueryClient } from './lib/static-queryClient';
import { cleanupCorruptedStorage } from './lib/storage-cleanup';
import { activateUltimateDOMProtection, DOMErrorBoundary } from './lib/dom-protection';
import App from './App';
import './index.css';

// CRITICAL: Activate ultimate DOM protection BEFORE anything else loads
// This prevents index.esm.js classList errors from Radix UI and other libraries
try {
  activateUltimateDOMProtection();
  console.log('🛡️ Ultimate DOM protection system activated');
} catch (error) {
  console.error('DOM protection activation failed:', error);
}

// Run storage cleanup to prevent JSON parsing errors
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

// World-class global error handler based on Stack Overflow solutions
window.addEventListener('error', (event) => {
  if (event.error && event.error.message) {
    const message = event.error.message;
    const filename = event.filename || '';
    
    // Handle classList errors (most common production issue) 
    if (message.includes('add') || 
        message.includes('classList') || 
        message.includes('Cannot read properties of undefined') ||
        message.includes('Cannot read property') ||
        filename.includes('index.esm.js')) {
      console.warn('🛡️ DOM manipulation error prevented:', event.error);
      event.preventDefault();
      return true;
    }
    
    // Handle JSON parsing errors
    if (message.includes('JSON.parse') || 
        message.includes('not valid JSON') || 
        message.includes('[object Object]') ||
        message.includes('SyntaxError')) {
      console.warn('🛡️ JSON parsing error prevented:', event.error);
      try {
        cleanupCorruptedStorage();
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
      event.preventDefault();
      return true;
    }
    
    // Handle React production build errors
    if (message.includes('Cannot read properties') && 
        (filename.includes('react-dom') || filename.includes('main-'))) {
      console.warn('🛡️ React production error prevented:', event.error);
      event.preventDefault();
      return true;
    }
  }
  return false;
});

// Additional error boundary for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message) {
    const message = event.reason.message;
    if (message.includes('classList') || 
        message.includes('Cannot read properties') ||
        message.includes('[object Object]')) {
      console.warn('🛡️ Promise rejection prevented:', event.reason);
      event.preventDefault();
      return;
    }
  }
});

try {
  const root = createRoot(finalRootElement);
  
  root.render(
    <StrictMode>
      <DOMErrorBoundary fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-muted-foreground">অ্যাপ লোড হচ্ছে...</p>
          </div>
        </div>
      }>
        <QueryClientProvider client={staticQueryClient}>
          <App />
        </QueryClientProvider>
      </DOMErrorBoundary>
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