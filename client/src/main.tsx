import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { staticQueryClient } from "./lib/static-queryClient-updated";
import { uxEnhancer } from "./lib/ux-enhancer";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={staticQueryClient}>
    <App />
  </QueryClientProvider>
);
