"use client";
import { useState } from "react";

export default function AuthButton({ onAdminChange, visible }: { onAdminChange?: (isAdmin: boolean) => void; visible?: boolean }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  const handleLogin = () => setShowModal(true);

  const handleModalClose = () => {
    setShowModal(false);
    setPw("");
    setError("");
  };

  const handleModalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pw === adminPassword) {
      setIsAdmin(true);
      if (onAdminChange) onAdminChange(true);
      handleModalClose();
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    if (onAdminChange) onAdminChange(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30">
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded-full text-xs shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition border border-gray-300 dark:border-gray-600"
            aria-label="관리자 로그아웃"
          >
            관리자 모드 해제
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-4 py-1.5 rounded-full text-xs shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="관리자 로그인"
          >
            ⚙️ 설정
          </button>
        )}
      </div>
      {showModal && (
        <div className="admin-modal-backdrop" onClick={handleModalClose}>
          <form
            className="admin-modal"
            onClick={e => e.stopPropagation()}
            onSubmit={handleModalSubmit}
            autoComplete="off"
          >
            <div className="text-lg font-semibold mb-1">관리자 인증</div>
            <div className="text-sm text-muted mb-2">관리자 비밀번호를 입력하세요.</div>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(""); }}
              placeholder="비밀번호"
              autoFocus
              maxLength={32}
              aria-label="관리자 비밀번호"
            />
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
            <div className="modal-actions mt-2">
              <button type="button" className="modal-btn cancel" onClick={handleModalClose}>취소</button>
              <button type="submit" className="modal-btn">확인</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}