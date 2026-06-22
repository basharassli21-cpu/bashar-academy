"use client";

import * as React from "react";

export function ServiceWorkerRegister() {
  React.useEffect(() => {
    // Skipped outside production: the cache-first strategy for /_next/static/
    // chunks in sw.js fights Turbopack dev's stable (non-content-hashed)
    // chunk URLs, serving stale JS after every edit until the SW cache is
    // cleared by hand.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // ignore registration failures (e.g. unsupported browser)
      });
    }
  }, []);
  return null;
}
