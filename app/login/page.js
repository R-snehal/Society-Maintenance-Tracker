"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, saveSession } from "../../lib/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveSession(data.token, data.user);
      router.replace(data.user.role === "admin" ? "/admin" : "/resident");
    } catch (err) {
      setError(err.message);
    }
  }
   return (
  <div className="auth-page">
    <div className="auth-card">
      <div className="auth-logo">S</div>

      <h1>Welcome back</h1>

      <p className="auth-subtitle">
        Log in to manage your society complaints and updates.
      </p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" style={{ width: "100%", marginTop: 6 }}>
          Log in
        </button>
      </form>

      <div className="auth-footer">
        No account? <Link href="/register">Create one</Link>
      </div>
    </div>
  </div>
);
}
