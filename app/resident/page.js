"use client";
import { useEffect, useState } from "react";
import { apiFetch, uploadPhoto, getSession } from "../../lib/apiClient";
import { Topbar } from "../components";

const CATEGORIES = ["Plumbing", "Electrical", "Cleaning", "Security", "Elevator", "Other"];

export default function ResidentPage() {
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [history, setHistory] = useState({});

  async function loadComplaints() {
    try {
      const data = await apiFetch("/api/complaints");
      setComplaints(data.complaints);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    const { user } = getSession();
    if (!user) return;
    loadComplaints();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      let photoUrl = null;
      if (file) photoUrl = await uploadPhoto(file);
      await apiFetch("/api/complaints", {
        method: "POST",
        body: JSON.stringify({ category, description, photoUrl }),
      });
      setDescription("");
      setFile(null);
      loadComplaints();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleHistory(id) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!history[id]) {
      const data = await apiFetch(`/api/complaints/${id}/history`);
      setHistory((h) => ({ ...h, [id]: data.history }));
    }
  }

  return (
    <div>
      <Topbar title="Resident Dashboard" />
      <div className="container">
        <div className="card">
          <h3>Raise a Complaint</h3>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea placeholder="Describe the issue" value={description}
              onChange={(e) => setDescription(e.target.value)} required rows={3} />
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            <button type="submit">Submit Complaint</button>
          </form>
        </div>

        <h3>Your Complaints</h3>
        {complaints.length === 0 && <p>No complaints yet.</p>}
        {complaints.map((c) => (
          <div key={c.id} className={`card ${c.is_overdue ? "overdue" : ""}`}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>#{c.id} - {c.category}</strong>
              <span>
                <span className={`badge ${c.status.replace(" ", "-")}`}>{c.status}</span>
                <span className={`badge ${c.priority}`}>{c.priority}</span>
                {c.is_overdue && <span className="badge" style={{ background: "#fecaca" }}>Overdue</span>}
              </span>
            </div>
            <p>{c.description}</p>
            {c.photo_url && <img src={c.photo_url} alt="complaint" style={{ maxWidth: 200, borderRadius: 4 }} />}
            <p style={{ fontSize: 12, color: "#666" }}>
              Raised {new Date(c.created_at).toLocaleString()}
            </p>
            <button onClick={() => toggleHistory(c.id)}>
              {expandedId === c.id ? "Hide History" : "View History"}
            </button>
            {expandedId === c.id && history[c.id] && (
              <div style={{ marginTop: 10 }}>
                {history[c.id].map((h) => (
                  <div key={h.id} className="history-item">
                    <strong>{h.status}</strong> by {h.actor_name} on {new Date(h.created_at).toLocaleString()}
                    {h.note && <div>Note: {h.note}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
