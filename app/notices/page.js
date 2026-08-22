"use client";
import { useEffect, useState } from "react";
import { apiFetch, getSession } from "../../lib/apiClient";
import { Topbar } from "../components";

export default function NoticeBoardPage() {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const { user } = getSession();
    if (!user) return;
    apiFetch("/api/notices").then((d) => setNotices(d.notices)).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <Topbar title="Notice Board" />
      <div className="container">
        {error && <p className="error">{error}</p>}
        {notices.length === 0 && <p>No notices yet.</p>}
        {notices.map((n) => (
          <div key={n.id} className={`card ${n.is_important ? "important" : ""}`}>
            <strong>{n.title}</strong> {n.is_important && <span className="badge" style={{ background: "#fed7aa" }}>Pinned</span>}
            <p>{n.body}</p>
            <p style={{ fontSize: 12, color: "#666" }}>
              By {n.author_name} on {new Date(n.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
