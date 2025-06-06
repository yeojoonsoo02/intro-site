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
    <div className="absolute top-3 right-3 z-10 text-xs sm:text-sm">
      {isAdmin ? (
        <>
          <span className="mr-2 text-green-700 font-semibold">관리자</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
          >
            로그아웃
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
        >
          관리자 로그인
        </button>
      )}
    </div>
  );
}