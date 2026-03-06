import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", padding: "2rem", textAlign: "center" }}>
      <div className="glass" style={{ padding: "3rem", borderRadius: "1rem", maxWidth: "600px" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem", animation: "pulse 2s infinite ease-in-out" }}>
          🚧
        </div>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>Module Offline / Coming Soon</h2>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem", lineHeight: 1.6 }}>
          The requested system node does not exist or is currently under construction by the Engineering Team. This sector is secured.
        </p>
        
        <Link href="/dashboard" className="btn-primary" style={{ display: "inline-block", padding: "0.75rem 2rem" }}>
          Return to Command Center
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}} />
    </div>
  );
}
