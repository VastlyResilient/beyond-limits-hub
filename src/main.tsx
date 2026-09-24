import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);

/* Register the service worker so the Hub can be installed to a home screen and
   still opens with no signal. Registered after paint, and only in a real browser
   build (import.meta.env.PROD) so the dev server is never shadowed by a cache. */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* installability is a bonus, never a hard requirement */
    });
  });
}
