import { Suspense, StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import "./index.css";
import App from "./App.tsx";

const AdminApp = lazy(() => import("./admin/AdminApp"));
const DevInspector = import.meta.env.DEV
  ? lazy(() =>
      import("react-dev-inspector").then((module) => ({
        default: module.Inspector,
      })),
    )
  : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {DevInspector ? (
      <Suspense fallback={null}>
        <DevInspector />
      </Suspense>
    ) : null}
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<main className="min-h-screen" />}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route path="*" element={<App />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
