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

    <main className="container">

      <div className="admin-hero">

  <div>
    <span className="admin-eyebrow">
      SOCIETY MANAGEMENT
    </span>

    <h1>Admin Dashboard</h1>

    <p>
      Manage complaints and keep your society running smoothly.
    </p>
  </div>

  <div className="admin-quick-actions">

    <Link href="/admin/notices">
      Manage Notices
    </Link>

    <Link href="/admin/dashboard">
      View Analytics
    </Link>

  </div>

</div>

      {error && <p className="error">{error}</p>}

      <div className="filter-heading">
        <strong>Filter Complaints</strong>
      </div>
      <div className="filters">

        <div>
          <label>Category</label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>

            {[
              "Plumbing",
              "Electrical",
              "Cleaning",
              "Security",
              "Elevator",
              "Other"
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}

          </select>
        </div>


        <div>
          <label>Status</label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>

            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}

          </select>
        </div>

      </div>


      <div
        className="page-heading"
        style={{ marginTop: 32 }}
      >
        <h2>Complaints</h2>
        <p>
          Review and manage complaints submitted by residents.
        </p>
      </div>


      {complaints.length === 0 && (
        <div className="empty-state">
          <h3>No complaints found</h3>
          <p>
            There are no complaints matching your current filters.
          </p>
        </div>
      )}


      {complaints.map((c) => (

        <div
          key={c.id}
          className={`card complaint-card ${
            c.is_overdue ? "overdue" : ""
          }`}
        >

          <div className="complaint-header">

            <div>
              <div className="complaint-title">
                #{c.id} · {c.category}
              </div>

              <div className="complaint-meta">
                Raised{" "}
                {new Date(
                  c.created_at
                ).toLocaleString()}
              </div>
            </div>


            <div>

              <span
                className={`badge ${
                  c.status.replace(" ", "-")
                }`}
              >
                {c.status}
              </span>

              <span
                className={`badge ${c.priority}`}
              >
                {c.priority}
              </span>

              {c.is_overdue && (
                <span
                  className="badge"
                  style={{
                    background: "#fee2e2",
                    color: "#b91c1c"
                  }}
                >
                  Overdue
                </span>
              )}

            </div>

          </div>


          <p className="complaint-description">
            {c.description}
          </p>


          {c.photo_url && (
            <img
              src={c.photo_url}
              alt="complaint"
              className="complaint-image"
            />
          )}


          <div className="admin-field">

            <label>Priority</label>

            <select
              value={c.priority}
              onChange={(e) =>
                updatePriority(
                  c.id,
                  e.target.value
                )
              }
            >
              {PRIORITIES.map((p) => (
                <option
                  key={p}
                  value={p}
                >
                  {p}
                </option>
              ))}
            </select>

          </div>


          <div className="admin-field">

            <label>
              Add note <span>(optional)</span>
            </label>

            <input
              placeholder="Add a note about this update..."
              value={noteDrafts[c.id] || ""}
              onChange={(e) =>
                setNoteDrafts((d) => ({
                  ...d,
                  [c.id]: e.target.value
                }))
              }
            />

          </div>


          <div className="admin-status-actions">

            {STATUSES.map((s) => (

              <button
                key={s}
                onClick={() =>
                  updateStatus(c.id, s)
                }
                disabled={c.status === s}
              >
                {c.status === s
                  ? `Current: ${s}`
                  : `Mark ${s}`}
              </button>

            ))}

          </div>

        </div>

      ))}

    </main>
  </div>
);
}
