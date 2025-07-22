// Static site entry point - uses Supabase directly without Express server
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { staticQueryClient } from "@/lib/static-queryClient";
import App from "./App";
import "./index.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={staticQueryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);