'use client';

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthProfile() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <p>Halo, <strong>{session.user?.name}</strong>! 👋</p>
        <button 
          onClick={() => signOut()}
          style={{ padding: "5px 10px", cursor: "pointer", marginTop: "10px" }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <button 
        onClick={() => signIn("google")} 
        style={{ padding: "10px 20px", cursor: "pointer", background: "black", color: "white", borderRadius: "5px" }}
      >
        Sign in with Google
      </button>
    </div>
  );
}