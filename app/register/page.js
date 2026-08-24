"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, saveSession } from "../../lib/apiClient";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      saveSession(data.token, data.user);
      router.replace("/resident");
    } catch (err) {
      setError(err.message);
    }
  }
  return (
  <div className="auth-page">
    <div className="auth-card">
      <div className="auth-logo">S</div>

      <h1>Create your account</h1>

      <p className="auth-subtitle">
        Join your society maintenance portal.
      </p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Full name</label>
        <input
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          placeholder="Create a password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" style={{ width: "100%", marginTop: 6 }}>
          Create account
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link href="/login">Log in</Link>
      </div>
    </div>
  </div>
);

}
