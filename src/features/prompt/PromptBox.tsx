"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";

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
  const [showLimit, setShowLimit] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const sendPrompt = async () => {
    const prompt = text.trim();
    if (!prompt) return;
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setText("");
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      const reply = data.reply || data.text;
      if (reply) {
        setMessages((m) => [...m, { role: "assistant", text: reply }]);
      }
      if (typeof data.remaining === "number") {
        setRemaining(data.remaining);
        if (data.remaining === 0) alert(t('noQuestionsLeft'));
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ai-chat"));
      }
    } catch (err) {
      console.error(err);
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
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
      className={`fixed bottom-0 left-0 w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-t border-gray-200 dark:border-gray-600 p-3 transition-transform duration-300 z-40 ${open ? "translate-y-0" : "translate-y-full pointer-events-none"}`}
    >
      <div className="max-w-xl mx-auto flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <button
            type="button"
            aria-label={collapsed ? t('showConversation') : t('hideConversation')}
            onClick={() => setCollapsed((v) => !v)}
            className="text-sm px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white/40 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {collapsed ? t('showConversation') : t('hideConversation')}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        {!collapsed && (
          <div
            ref={containerRef}
            className="max-h-80 overflow-y-auto space-y-2"
          >
            {messages.map((m, i) => (
              <div key={i} className="space-y-1">
                <div
                  className={`text-sm leading-relaxed break-keep whitespace-pre-wrap max-w-[75%] px-3 py-2 rounded-md ${
                    m.role === 'user'
                      ? 'ml-auto bg-blue-500 text-white'
                      : 'mr-auto bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-sm leading-relaxed break-keep whitespace-pre-wrap max-w-[75%] mr-auto bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded-md">
                {t('typing')}
                {'.'.repeat(dots)}
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              let val = e.target.value
              if (val.length > 30) {
                val = val.slice(0, 30)
                setShowLimit(true)
                if (timerRef.current) clearTimeout(timerRef.current)
                timerRef.current = setTimeout(() => setShowLimit(false), 2000)
              }
              setText(val)
            }}
            onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
            placeholder={t('typeYourPrompt')}
            className="flex-1 border border-gray-300 dark:border-gray-500 rounded-md px-3 py-2 bg-white/50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500"
          />
        <button
          type="button"
          onClick={sendPrompt}
          className="bg-blue-500/80 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-md"
        >
          {t('send')}
        </button>
        </div>
        {remaining !== null && (
          <p className="text-right text-xs text-gray-600 dark:text-gray-400">{t('remaining', { count: remaining })}</p>
        )}
        {showLimit && (
          <p className="text-xs text-red-600">{t('max30Chars')}</p>
        )}
          <p className="text-xs text-gray-400 text-center">{t('aiDisclaimer')}</p>
        </div>
      </div>
    );
  }
