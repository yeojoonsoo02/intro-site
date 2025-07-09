"use client";
import { useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const sendPrompt = async () => {
    const prompt = text.trim();
    if (!prompt) return;
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setText("");
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ai-chat"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-t border-gray-200 dark:border-gray-600 p-3 transition-transform duration-300 z-40 ${open ? "translate-y-0" : "translate-y-full pointer-events-none"}`}
    >
      <div className="max-w-xl mx-auto flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="text-xs underline"
          >
            {collapsed ? t('showConversation') : t('hideConversation')}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="text-xl"
          >
            ×
          </button>
        </div>
        {!collapsed && (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm max-w-xs px-3 py-2 rounded-md ${
                  m.role === "user"
                    ? "ml-auto bg-blue-500 text-white"
                    : "mr-auto bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
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
      </div>
    </div>
  );
}
