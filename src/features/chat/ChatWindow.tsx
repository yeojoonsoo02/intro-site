"use client";
import { useState } from "react";
import { useTranslation } from "next-i18next";

export default function ChatWindow() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const { t } = useTranslation();

  const sendPrompt = async () => {
    const prompt = text.trim();
    if (!prompt) return;
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setText("");
    try {
      const url =
        process.env.NEXT_PUBLIC_GEMINI_API_URL ??
        "https://gemini-api-565729687872.asia-northeast3.run.app/chat";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
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
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
          placeholder={t("typeYourPrompt")}
          className="flex-1 border border-gray-300 dark:border-gray-500 rounded-md px-3 py-2 bg-white/50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500"
        />
        <button
          type="button"
          onClick={sendPrompt}
          className="bg-blue-500/80 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-md"
        >
          {t("send")}
        </button>
      </div>
    </div>
  );
}
