import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { directQueryClient } from "./lib/queryClient-direct";
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <QueryClientProvider client={directQueryClient}>
      <App />
    </QueryClientProvider>
  </HelmetProvider>
);
