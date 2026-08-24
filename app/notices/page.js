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

    <main className="container">

      <div className="page-heading">
        <h1>Notice Board</h1>
        <p>
          Important announcements and updates from your society.
        </p>
      </div>


      {notices.length === 0 ? (

        <div className="empty-state">
          <h3>No notices yet</h3>
          <p>
            There are currently no announcements to display.
          </p>
        </div>

      ) : (

        <div>

          {notices.map((n) => (

            <div
              key={n.id}
              className={`card notice-card ${
              n.is_important ? "important" : ""
            }`}
            >

              <div className="complaint-header">

                <div>

                  <div className="notice-title">
                    {n.title}
                  </div>

                  <div className="notice-meta">
                    Posted on{" "}
                    {new Date(
                      n.created_at
                    ).toLocaleDateString()}
                  </div>

                </div>


                {n.is_important && (
                  <span
                    className="badge"
                    style={{
                      background: "#fee2e2",
                      color: "#b91c1c"
                    }}
                  >
                    Important
                  </span>
                )}

              </div>


              <p className="notice-body">
                {n.body}
              </p>

            </div>

          ))}

        </div>

      )}

    </main>
  </div>
);
}
