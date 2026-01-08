 // index.tsx — Optimized for Best Performance
import "./src/index.css"; // ✅ Tailwind CSS import
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async"; // ✅ IMPORT ADD
import App from "./App";
import ErrorBoundary from "./src/components/ErrorBoundary";
import Spinner from "./src/components/Spinner";

// Mount point
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);

// 🚀 Non-blocking React render
const startApp = () => {
  root.render(
    <ErrorBoundary>
      <HelmetProvider> {/* ✅ WRAP WITH HelmetProvider */}
        <Suspense fallback={<Spinner />}>
          <App />
        </Suspense>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

// ⏳ Load React AFTER the browser is idle
if ("requestIdleCallback" in window) {
  requestIdleCallback(startApp);
} else {
  setTimeout(startApp, 1);
}