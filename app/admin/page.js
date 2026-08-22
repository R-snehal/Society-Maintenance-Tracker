"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/apiClient";
import { Topbar } from "../components";

const STATUSES = ["Open", "In Progress", "Resolved"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function AdminPage() {
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [noteDrafts, setNoteDrafts] = useState({});

  async function load() {
    setError("");
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      const data = await apiFetch(`/api/complaints?${params.toString()}`);
      setComplaints(data.complaints);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [category, status]);

  async function updateStatus(id, newStatus) {
    try {
      await apiFetch(`/api/complaints/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, note: noteDrafts[id] || "" }),
      });
      setNoteDrafts((d) => ({ ...d, [id]: "" }));
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updatePriority(id, priority) {
    try {
      await apiFetch(`/api/complaints/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ priority }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <Topbar title="Admin Dashboard" />
      <div className="container">
        <div style={{ marginBottom: 12 }}>
          <Link href="/admin/notices" style={{ marginRight: 12 }}>Manage Notices</Link>
          <Link href="/admin/dashboard">View Stats Dashboard</Link>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {["Plumbing", "Electrical", "Cleaning", "Security", "Elevator", "Other"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {complaints.map((c) => (
          <div key={c.id} className={`card ${c.is_overdue ? "overdue" : ""}`}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>#{c.id} - {c.category}</strong>
              <span>
                <span className={`badge ${c.status.replace(" ", "-")}`}>{c.status}</span>
                {c.is_overdue && <span className="badge" style={{ background: "#fecaca" }}>Overdue</span>}
              </span>
            </div>
            <p>{c.description}</p>
            {c.photo_url && <img src={c.photo_url} alt="complaint" style={{ maxWidth: 200, borderRadius: 4 }} />}
            <p style={{ fontSize: 12, color: "#666" }}>Raised {new Date(c.created_at).toLocaleString()}</p>

            <label>Priority:</label>
            <select value={c.priority} onChange={(e) => updatePriority(c.id, e.target.value)}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <label>Add note (optional):</label>
            <input value={noteDrafts[c.id] || ""}
              onChange={(e) => setNoteDrafts((d) => ({ ...d, [c.id]: e.target.value }))} />

            <div style={{ display: "flex", gap: 8 }}>
              {STATUSES.map((s) => (
                <button key={s} onClick={() => updateStatus(c.id, s)} disabled={c.status === s}>
                  Mark {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
