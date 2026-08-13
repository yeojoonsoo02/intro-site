'use client';

// 소개문이 "자주 받는 질문"을 약속하는데 페이지엔 그런 게 없었다.
// 그 역할은 AI 챗봇이 하고 있으므로 여기서 바로 열 수 있게 한다.
// (챗 열림 상태는 TopBar 지역 상태라 랜딩과 같은 window 이벤트로 연결한다.)
export default function AboutChatCta({ label }: { label: string }): JSX.Element {
  return (
    <div className="mb-10 sm:mb-12">
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event('open-prompt'))}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-[1.03] active:scale-95"
        style={{
          background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
          color: 'var(--primary)',
          border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M14 9.5a2 2 0 0 1-2 2H6l-3.5 2.5v-2.5a2 2 0 0 1-1-1.7V4.5a2 2 0 0 1 2-2h8.5a2 2 0 0 1 2 2z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </button>
    </div>
  );
}
