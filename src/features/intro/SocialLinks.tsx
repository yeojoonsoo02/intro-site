'use client';

export default function SocialLinks() {
  return (
    <div className="flex justify-center gap-4 mt-4 flex-wrap">
      <a
        href="https://blog.naver.com/yeojoonsoo02"
        target="_blank"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        📘 블로그
      </a>
      <a
        href="https://www.instagram.com/yeojoonsoo02/"
        target="_blank"
        className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
      >
        📸 인스타그램
      </a>
      <a
        href="https://blog.naver.com/chatgpt_krguide"
        target="_blank"
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        ▶️ 유튜브
      </a>
    </div>
  );
}