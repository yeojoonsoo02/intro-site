"use client";
import { useState, useEffect } from "react";
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "@/lib/firebase";
import type { User } from "firebase/auth";

export default function AuthButton({ onUserChange }: { onUserChange?: (user: User | null) => void }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (onUserChange) onUserChange(u);
    });
    return () => unsubscribe();
  }, [onUserChange]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (_) {
      alert("로그인 실패");
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (_) {
      alert("로그아웃 실패");
    }
  };

  return (
    <div style={{ position: "absolute", top: 10, right: 10, fontSize: "0.8rem" }}>
      {user ? (
        <>
          <span style={{ marginRight: 8 }}>{user.email}</span>
          <button onClick={handleLogout} style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", color: "#333" }}>로그아웃</button>
        </>
      ) : (
        <button onClick={handleLogin} style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", color: "#333" }}>로그인</button>
      )}
    </div>
  );
} 