import "./globals.css";

export const metadata = {
  title: "Library Membership System",
  description: "Member list and expiry tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav
          style={{ background: "#1e3229", borderBottom: "3px solid #a67c3d" }}
        >
          <div
            style={{
              maxWidth: 880,
              margin: "0 auto",
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
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
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#e0cfa3",
              }}
            >
              Membership System
            </span>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
