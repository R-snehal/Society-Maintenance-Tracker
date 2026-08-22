"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/apiClient";
import { Topbar } from "../../components";

export default function AdminStatsPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/dashboard").then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="container">
        {error && <p className="error">{error}</p>}
        {!stats ? <p>Loading...</p> : (
          <>
            <div className="stats-grid">
              <div className="stat-box"><div className="num">{stats.total}</div>Total Complaints</div>
              <div className="stat-box"><div className="num">{stats.overdueCount}</div>Overdue (&gt;{stats.overdueThresholdDays}d)</div>
            </div>

            <h3>By Status</h3>
            <div className="stats-grid">
              {stats.byStatus.map((s) => (
                <div key={s.status} className="stat-box"><div className="num">{s.count}</div>{s.status}</div>
              ))}
            </div>

            <h3>By Category</h3>
            <div className="stats-grid">
              {stats.byCategory.map((c) => (
                <div key={c.category} className="stat-box"><div className="num">{c.count}</div>{c.category}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
