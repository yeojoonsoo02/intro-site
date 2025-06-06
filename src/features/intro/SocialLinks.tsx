'use client';

export default function SocialLinks() {
  return (
    <div className="flex justify-center gap-3 mt-3 flex-wrap w-full">
      <a
        href="https://blog.naver.com/yeojoonsoo02"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-[110px] px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium text-center"
      >
        📘 블로그
      </a>
      <a
        href="https://www.instagram.com/yeojoonsoo02/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-[110px] px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition text-sm font-medium text-center"
      >
        📸 인스타그램
      </a>
      <a
        href="https://blog.naver.com/chatgpt_krguide"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-[110px] px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium text-center"
      >
        ▶️ 유튜브
      </a>
    </div>
  );
}