import Link from "next/link";

export default function SignupPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem"
    }}>
      <div className="glass animate-fade-in" style={{
        width: "100%", maxWidth: "420px", padding: "2.5rem", borderRadius: "1rem"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontSize: "2rem" }}>⬡</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.75rem" }}>Create Account</h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Launch your Command Center
          </p>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.375rem", display: "block" }}>
              Full Name
            </label>
            <input type="text" placeholder="Praful Jadhav" className="input-field" />
          </div>
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.375rem", display: "block" }}>
              Email
            </label>
            <input type="email" placeholder="founder@company.com" className="input-field" />
          </div>
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.375rem", display: "block" }}>
              Password
            </label>
            <input type="password" placeholder="••••••••" className="input-field" />
          </div>
          <Link href="/dashboard" className="btn-primary" style={{
            justifyContent: "center", marginTop: "0.5rem", width: "100%", textDecoration: "none"
          }}>
            Create Account →
          </Link>
        </form>

        <div style={{
          textAlign: "center", marginTop: "1.5rem",
          color: "var(--muted-foreground)", fontSize: "0.8125rem"
        }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
