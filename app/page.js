"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "../lib/apiClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { user } = getSession();
    if (!user) return router.replace("/login");
    router.replace(user.role === "admin" ? "/admin" : "/resident");
  }, [router]);

  return null;
}
