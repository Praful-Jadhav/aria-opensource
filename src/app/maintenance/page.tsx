import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", padding: "2rem", textAlign: "center", background: "var(--background)" }}>
      <div className="glass" style={{ padding: "4rem 3rem", borderRadius: "1rem", maxWidth: "600px", border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
        <div style={{ fontSize: "5rem", marginBottom: "1.5rem" }}>
          🛠️
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-0.025em" }}>System Offline</h1>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--primary)", marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Scheduled Maintenance (M05)</h2>
        
        <p style={{ color: "var(--muted-foreground)", marginBottom: "2.5rem", lineHeight: 1.7, fontSize: "1.125rem" }}>
          The Sovereign AI Task Force infrastructure is currently down for elite-tier core upgrades. The Vault and Memory arrays are secure.
        </p>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/dashboard" className="btn-primary" style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
            Check Core Status
          </Link>
        </div>
      </div>
    </div>
  );
}
