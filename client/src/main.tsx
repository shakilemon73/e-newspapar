import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { directQueryClient } from "./lib/queryClient-direct";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={directQueryClient}>
    <App />
  </QueryClientProvider>
);
