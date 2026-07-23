"use client";

interface DueStampProps {
  expiryDate: string | null;
  isActive: boolean;
}

function daysRemaining(expiryDate: string): number {
  const diffMs = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function DueStamp({ expiryDate, isActive }: DueStampProps) {
  // Librarian accounts have no expiry_date at all — nothing to stamp.
  if (!expiryDate) {
    return null;
  }

  const days = daysRemaining(expiryDate);
  const expired = !isActive || days < 0;

  const formatted = new Date(expiryDate).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div className={`stamp ${expired ? "stamp--expired" : "stamp--active"}`}>
      <span className="stamp__label">{expired ? "expired" : "due back"}</span>
      <span className="stamp__date">{formatted}</span>

      <style jsx>{`
        .stamp {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
          padding: 6px 12px;
          border: 2px solid currentColor;
          border-radius: 3px;
          font-family: "Space Mono", monospace;
          transform: rotate(-2deg);
          background: rgba(255, 255, 255, 0.4);
        }
        .stamp--active {
          color: var(--forest);
        }
        .stamp--expired {
          color: var(--stamp-red);
          transform: rotate(-3deg);
        }
        .stamp__label {
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .stamp__date {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
      `}</style>
    </div>
  );
}
