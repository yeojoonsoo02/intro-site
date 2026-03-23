"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { savePrompt } from "./prompt.api";
import { useAuth } from "@/lib/AuthProvider";

const MAX_CHARS = 200;

export default function PromptBox({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [limitExhausted, setLimitExhausted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();
  const { user } = useAuth();

  const canSend = text.trim().length > 0 && !loading && !limitExhausted;

  const sendPromptWithText = async (directText?: string) => {
    const prompt = (directText ?? text).trim();
    if (!prompt || loading) return;
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setText("");
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          userInfo: user?.email ?? null,
        }),
      });
      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", text: t('errorOccurred') }]);
        return;
      }
      const data = await res.json();
      const reply = data.reply || data.text;
      if (reply) {
        setMessages((m) => [...m, { role: "assistant", text: reply }]);
        savePrompt(prompt, reply).catch(() => {});
      }
      if (typeof data.remaining === "number") {
        setRemaining(data.remaining);
        if (data.remaining === 0) setLimitExhausted(true);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ai-chat"));
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: t('errorOccurred') }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!collapsed && containerRef.current) {
      const el = containerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, collapsed, open]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    if (loading) {
      const id = setInterval(() => {
        setDots((d) => (d % 3) + 1);
      }, 500);
      return () => clearInterval(id);
    }
    setDots(1);
  }, [loading]);

  return (
    <div
      className={`fixed bottom-0 left-0 w-full backdrop-blur-md border-t p-3 transition-transform duration-300 z-40 ${
        open ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
      style={{
        background: "color-mix(in srgb, var(--card-bg) 85%, transparent)",
        borderColor: "var(--border)",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="max-w-xl mx-auto flex flex-col gap-2">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            aria-label={collapsed ? t('showConversation') : t('hideConversation')}
            onClick={() => setCollapsed((v) => !v)}
            className="text-xs px-3 py-2 rounded-md transition-colors"
            style={{
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            {collapsed ? t('showConversation') : t('hideConversation')}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 메시지 영역 */}
        {!collapsed && (
          <div
            ref={containerRef}
            className="max-h-60 sm:max-h-72 overflow-y-auto space-y-2 scroll-smooth overscroll-contain"
            role="log"
            aria-live="polite"
          >
            {messages.length === 0 && !loading && (
              <div className="py-3 space-y-2">
                <p className="text-center text-xs mb-3" style={{ color: "var(--muted)" }}>
                  {t('typeYourPrompt')}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[
                    t('suggestQ1', { defaultValue: '지금 어디야?' }),
                    t('suggestQ2', { defaultValue: '취미가 뭐야?' }),
                    t('suggestQ3', { defaultValue: '좋아하는 음식은?' }),
                    t('suggestQ4', { defaultValue: '요즘 뭐 하고 지내?' }),
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendPromptWithText(q)}
                      className="text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-70"
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--muted)",
                        background: "color-mix(in srgb, var(--foreground) 3%, transparent)",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm leading-relaxed break-keep whitespace-pre-wrap overflow-wrap-anywhere max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-xl ${
                  m.role === 'user'
                    ? 'ml-auto rounded-br-sm'
                    : 'mr-auto rounded-bl-sm'
                }`}
                style={
                  m.role === 'user'
                    ? { background: "var(--primary)", color: "var(--primary-contrast)" }
                    : { background: "color-mix(in srgb, var(--foreground) 8%, transparent)", color: "var(--foreground)" }
                }
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div
                className="text-sm max-w-[85%] sm:max-w-[75%] mr-auto px-3 py-2 rounded-xl rounded-bl-sm"
                style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)", color: "var(--muted)" }}
              >
                {t('typing')}{'.'.repeat(dots)}
              </div>
            )}
          </div>
        )}

        {/* 한도 초과 메시지 */}
        {limitExhausted && (
          <p className="text-xs text-center py-1" style={{ color: "var(--muted)" }}>
            {t('noQuestionsLeft')}
          </p>
        )}

        {/* 입력 영역 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={text}
              disabled={loading || limitExhausted}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={(e) => e.key === "Enter" && canSend && sendPromptWithText()}
              placeholder={limitExhausted ? t('noQuestionsLeft') : t('typeYourPrompt')}
              className="w-full rounded-lg px-3 py-2.5 pr-12 transition-colors disabled:opacity-50"
              style={{
                background: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontSize: "16px",
              }}
            />
            {text.length > 0 && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] tabular-nums"
                style={{ color: text.length >= MAX_CHARS ? "#ef4444" : "var(--muted)" }}
              >
                {text.length}/{MAX_CHARS}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => sendPromptWithText()}
            disabled={!canSend}
            className="text-sm px-4 py-2.5 rounded-lg font-medium transition-opacity disabled:opacity-30"
            style={{
              background: "var(--primary)",
              color: "var(--primary-contrast)",
            }}
          >
            {t('send')}
          </button>
        </div>

        {/* 하단 정보 */}
        <div className="flex justify-between items-center">
          <p className="text-[0.65rem]" style={{ color: "var(--muted)", opacity: 0.7 }}>
            {t('aiDisclaimer')}
          </p>
          {remaining !== null && !limitExhausted && (
            <p className="text-[0.65rem] tabular-nums" style={{ color: "var(--muted)" }}>
              {t('remaining', { count: remaining })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
