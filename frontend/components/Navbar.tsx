"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav style={{ background: "#3a6350", borderBottom: "3px solid #b98a4a" }}>
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📖</span>
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                fontSize: 17,
                color: "#ffffff",
              }}
            >
              Maxenius Public Library
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {!loading && user && (
            <>
              <Link href="/" style={navLinkStyle}>
                Home
              </Link>
              <Link href="/books" style={navLinkStyle}>
                Books
              </Link>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#ecdfc0",
                }}
              >
                {user.name} · {user.role}
              </span>
              <button onClick={logout} style={logoutButtonStyle}>
                Log out
              </button>
            </>
          )}

          {!loading && !user && (
            <>
              <Link href="/login" style={navLinkStyle}>
                Log in
              </Link>
              <Link href="/signup" style={signupLinkStyle}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: "#f4f5f1",
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
};

const signupLinkStyle: React.CSSProperties = {
  color: "#3a6350",
  background: "#f4f5f1",
  fontSize: 12,
  fontWeight: 700,
  textDecoration: "none",
  padding: "6px 12px",
  borderRadius: 4,
};

const logoutButtonStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 600,
  color: "#f4f5f1",
  background: "transparent",
  border: "1px solid rgba(244,245,241,0.4)",
  borderRadius: 4,
  padding: "5px 10px",
  cursor: "pointer",
};
