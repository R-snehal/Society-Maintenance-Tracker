"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, clearSession } from "../lib/apiClient";

export function Topbar({ title }) {
  const router = useRouter();
  const { user } = getSession();

  function logout() {
    clearSession();
    router.replace("/login");
  }
  return (
  <header className="topbar">
    <div className="topbar-brand">
      <div className="brand-icon">S</div>

      <div className="topbar-title">
        <strong>SocietyCare</strong>
        <span className="topbar-user">
          {title} {user && `• ${user.name}`}
        </span>
      </div>
    </div>

    <div className="topbar-actions">
      <Link href="/notices">Notice Board</Link>

      {user && (
        <button onClick={logout}>
          Log out
        </button>
      )}
    </div>
  </header>
);
  // return (
  //   <div className="topbar">
  //     <div>
  //       <strong>{title}</strong>
  //       {user && <span style={{ marginLeft: 10, color: "#666" }}>({user.name})</span>}
  //     </div>
  //     <div>
  //       <Link href="/notices" style={{ marginRight: 12 }}>Notice Board</Link>
  //       {user && <button onClick={logout}>Log out</button>}
  //     </div>
  //   </div>
  // );
}
