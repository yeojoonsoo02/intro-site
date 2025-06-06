"use client";
import { useState } from "react";

export default function AuthButton({ onAdminChange }: { onAdminChange?: (isAdmin: boolean) => void }) {
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    const pw = window.prompt("관리자 비밀번호를 입력하세요");
    if (pw === "supersecret") {
      setIsAdmin(true);
      if (onAdminChange) onAdminChange(true);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };
  const handleLogout = () => {
    setIsAdmin(false);
    if (onAdminChange) onAdminChange(false);
  };

  return (
    <div style={{ position: "absolute", top: 10, right: 10, fontSize: "0.8rem" }}>
      {isAdmin ? (
        <>
          <span style={{ marginRight: 8, color: '#008000' }}>관리자</span>
          <button onClick={handleLogout} style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", color: "#333" }}>로그아웃</button>
        </>
      ) : (
        <button onClick={handleLogin} style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", color: "#333" }}>관리자 로그인</button>
      )}
    </div>
  );
} 