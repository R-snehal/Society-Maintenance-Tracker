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
    <div className="container" style={{ maxWidth: 360, marginTop: 60 }}>
      <h1>Log in</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Log in</button>
      </form>
      <p>No account? <Link href="/register">Register</Link></p>
    </div>
  );
}
