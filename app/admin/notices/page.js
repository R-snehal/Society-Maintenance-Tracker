"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/apiClient";
import { Topbar } from "../../components";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const data = await apiFetch("/api/notices");
    setNotices(data.notices);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/api/notices", {
        method: "POST",
        body: JSON.stringify({ title, body, isImportant }),
      });
      setTitle(""); setBody(""); setIsImportant(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <Topbar title="Manage Notices" />
      <div className="container">
        <div className="card">
          <h3>Post a Notice</h3>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Notice body" value={body} onChange={(e) => setBody(e.target.value)} required rows={3} />
            <label>
              <input type="checkbox" style={{ width: "auto", marginRight: 6 }}
                checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
              Mark as important (pins to top + emails all residents)
            </label>
            <button type="submit">Post Notice</button>
          </form>
        </div>

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
