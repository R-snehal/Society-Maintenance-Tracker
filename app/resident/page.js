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

    <main className="container">

      <div className="page-heading">
        <h1>Resident Dashboard</h1>
        <p>Manage your maintenance requests and stay updated.</p>
      </div>

      <div className="card">
        <h3>Raise a Complaint</h3>

        <p style={{ color: "#64748b", fontSize: 13, marginTop: -10 }}>
          Tell us about an issue in your society.
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label>Description</label>
          <textarea
            placeholder="Describe the issue clearly..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />

          <label>Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button type="submit">
            Submit Complaint
          </button>

        </form>
      </div>


      <div className="page-heading" style={{ marginTop: 35 }}>
        <h2>Your Complaints</h2>
        <p>Track the progress of issues you have reported.</p>
      </div>


      {complaints.length === 0 && (
        <div className="empty-state">
          <h3>No complaints yet</h3>
          <p>
            When you report an issue, it will appear here.
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
                Maintenance request
              </div>
            </div>

            <div>
              <span className={`badge ${c.status.replace(" ", "-")}`}>
                {c.status}
              </span>

              <span className={`badge ${c.priority}`}>
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


          <p className="complaint-meta">
            Raised {new Date(c.created_at).toLocaleString()}
          </p>


          <button onClick={() => toggleHistory(c.id)}>
            {expandedId === c.id
              ? "Hide History"
              : "View History"}
          </button>


          {expandedId === c.id && history[c.id] && (
            <div className="history">

              {history[c.id].map((h) => (
                <div key={h.id} className="history-item">

                  <strong>{h.status}</strong>

                  {" "}by {h.actor_name} on{" "}
                  {new Date(h.created_at).toLocaleString()}

                  {h.note && (
                    <div>
                      Note: {h.note}
                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </div>
      ))}

    </main>
  </div>
);
  // return (
  //   <div>
  //     <Topbar title="Resident Dashboard" />
  //     <div className="container">
  //       <div className="card">
  //         <h3>Raise a Complaint</h3>
  //         {error && <p className="error">{error}</p>}
  //         <form onSubmit={handleSubmit}>
  //           <select value={category} onChange={(e) => setCategory(e.target.value)}>
  //             {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
  //           </select>
  //           <textarea placeholder="Describe the issue" value={description}
  //             onChange={(e) => setDescription(e.target.value)} required rows={3} />
  //           <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
  //           <button type="submit">Submit Complaint</button>
  //         </form>
  //       </div>

  //       <h3>Your Complaints</h3>
  //       {complaints.length === 0 && <p>No complaints yet.</p>}
  //       {complaints.map((c) => (
  //         <div key={c.id} className={`card ${c.is_overdue ? "overdue" : ""}`}>
  //           <div style={{ display: "flex", justifyContent: "space-between" }}>
  //             <strong>#{c.id} - {c.category}</strong>
  //             <span>
  //               <span className={`badge ${c.status.replace(" ", "-")}`}>{c.status}</span>
  //               <span className={`badge ${c.priority}`}>{c.priority}</span>
  //               {c.is_overdue && <span className="badge" style={{ background: "#fecaca" }}>Overdue</span>}
  //             </span>
  //           </div>
  //           <p>{c.description}</p>
  //           {c.photo_url && <img src={c.photo_url} alt="complaint" style={{ maxWidth: 200, borderRadius: 4 }} />}
  //           <p style={{ fontSize: 12, color: "#666" }}>
  //             Raised {new Date(c.created_at).toLocaleString()}
  //           </p>
  //           <button onClick={() => toggleHistory(c.id)}>
  //             {expandedId === c.id ? "Hide History" : "View History"}
  //           </button>
  //           {expandedId === c.id && history[c.id] && (
  //             <div style={{ marginTop: 10 }}>
  //               {history[c.id].map((h) => (
  //                 <div key={h.id} className="history-item">
  //                   <strong>{h.status}</strong> by {h.actor_name} on {new Date(h.created_at).toLocaleString()}
  //                   {h.note && <div>Note: {h.note}</div>}
  //                 </div>
  //               ))}
  //             </div>
  //           )}
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );
}
