"use client";
import { useState } from "react";
import { useTranslation } from "next-i18next";

export default function PromptBox({ open }: { open: boolean }) {
  const [text, setText] = useState("");
  const { t } = useTranslation();

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 p-4 transition-transform duration-300 z-40 ${open ? "translate-y-0" : "translate-y-full pointer-events-none"}`}
    >
      <div className="max-w-xl mx-auto flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('typeYourPrompt')}
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        />
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {t('send')}
        </button>
      </div>
    </div>
  );
}
