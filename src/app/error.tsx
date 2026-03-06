"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error natively to our own M06 Observability layer (or PostHog if external)
    console.error("Critical System Failure Caught by Boundary:", error);
  }, [error]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", padding: "2rem", textAlign: "center" }}>
      <div className="glass" style={{ padding: "3rem", borderRadius: "1rem", maxWidth: "600px" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</h1>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem", color: "var(--danger)" }}>Architecture Fault Detected</h2>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem", lineHeight: 1.6 }}>
          A cascading failure occurred within the Command Center module. The Sovereign AI Task Force has isolated the error to prevent corruption.
        </p>
        
        <div style={{ background: "rgba(0,0,0,0.4)", padding: "1rem", borderRadius: "0.5rem", marginBottom: "2rem", textAlign: "left", overflowX: "auto" }}>
          <code style={{ fontSize: "0.8125rem", color: "var(--danger)" }}>
            {error.message || "Unknown internal error"}
          </code>
        </div>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button onClick={() => reset()} className="btn-primary">
            Attempt Soft Reboot
          </button>
          <Link href="/dashboard" className="btn-outline">
            Return to Overview Core
          </Link>
        </div>
      </div>
    </div>
  );
}
