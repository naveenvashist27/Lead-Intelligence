"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api, clearToken, getToken, User } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<User>("/auth/me")
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          router.replace("/login");
        } else {
          setError(err.message);
        }
      });
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  if (error) return <main style={{ padding: 16 }}><p role="alert">{error}</p></main>;
  if (!user) return <main style={{ padding: 16 }}>Loading…</main>;

  return (
    <main style={{ padding: 16 }}>
      <h1>ETDOX Lead Intelligence</h1>
      <p>Signed in as {user.name || user.email} ({user.role})</p>
      <p>Searches and leads will appear here in the next phases.</p>
      <button onClick={logout}>Sign out</button>
    </main>
  );
}
