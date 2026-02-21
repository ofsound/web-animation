import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Inspector } from "react-dev-inspector";
import { ThemeProvider } from "./components/ThemeProvider";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Inspector />
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
