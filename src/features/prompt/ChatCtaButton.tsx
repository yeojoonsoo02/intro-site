'use client';

// 페이지 어디서든 AI 챗을 여는 버튼. 챗 열림 상태는 TopBar 지역 상태라 window 이벤트로 연결한다.
// 홈에서는 유일한 강조 버튼(primary), 소개 페이지에서는 보조(ghost)로 쓴다.
export default function ChatCtaButton({
  label,
  variant = 'primary',
  className = '',
}: {
  label: string;
  variant?: 'primary' | 'ghost';
  className?: string;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-prompt'))}
      className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M14 9.5a2 2 0 0 1-2 2H6l-3.5 2.5v-2.5a2 2 0 0 1-1-1.7V4.5a2 2 0 0 1 2-2h8.5a2 2 0 0 1 2 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}
