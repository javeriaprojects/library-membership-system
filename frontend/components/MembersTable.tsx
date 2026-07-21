"use client";

import { Member } from "@/lib/types";
import DueStamp from "./DueStamp";

interface MembersTableProps {
  members: Member[];
}

export default function MembersTable({ members }: MembersTableProps) {
  if (members.length === 0) {
    return (
      <p className="empty">
        No members enrolled yet. Add the first one above — their card starts here.
      </p>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Enrolled</th>
            <th>Expiry</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr key={m.id} className={!m.is_active ? "row--expired" : ""}>
              <td className="mono">{String(i + 1).padStart(2, "0")}</td>
              <td className="name">{m.name}</td>
              <td className="mono">{m.email}</td>
              <td className="mono">
                {new Date(m.registered_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </td>
              <td colSpan={2}>
                <DueStamp expiryDate={m.expiry_date} isActive={m.is_active} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .empty {
          color: var(--ink-soft);
          font-size: 14px;
          padding: 24px 0;
        }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid var(--line);
          border-radius: 6px;
          background: var(--card);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        thead th {
          text-align: left;
          font-family: "Space Mono", monospace;
          font-size: 10.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-soft);
          padding: 12px 14px;
          border-bottom: 1px solid var(--line);
          background: rgba(47, 75, 63, 0.04);
        }
        tbody td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--line);
          vertical-align: middle;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        .name {
          font-weight: 600;
        }
        .mono {
          font-family: "Space Mono", monospace;
          font-size: 12px;
          color: var(--ink-soft);
        }
        .row--expired {
          background: rgba(140, 63, 52, 0.04);
        }
      `}</style>
    </div>
  );
}
