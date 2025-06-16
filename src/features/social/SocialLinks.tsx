'use client';

const SNS = [
  {
    href: 'https://blog.naver.com/yeojoonsoo02',
    label: '여준수 블로그',
    color: '#03c75a',
    icon: (
      <span className="relative flex items-center justify-center w-6 h-6">
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect width="24" height="24" rx="5" fill="#03c75a" />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-white text-[0.75rem] select-none"
          style={{ fontFamily: 'sans-serif', letterSpacing: '-1px', transform: 'translateX(-1px)' }}
        >
          N
        </span>
      </span>
    ),
  },
  {
    href: 'https://www.instagram.com/yeojoonsoo02/',
    label: '여준수 인스타그램',
    color: '#e1306c',
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect width="24" height="24" rx="6" fill="#e1306c" />
        <circle cx="12" cy="12" r="5" stroke="#fff" strokeWidth="2" fill="none" />
        <circle cx="18" cy="6" r="1.2" fill="#fff" />
      </svg>
    ),
  },
  {
    href: 'https://open.kakao.com/o/somekakaolink',
    label: '여준수 카카오톡',
    color: '#fee500',
    icon: (
      <span className="relative flex items-center justify-center w-6 h-6">
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <ellipse cx="12" cy="10" rx="10" ry="8" fill="#fee500" />
          <path d="M7 17 L5 22 L13 18 Z" fill="#fee500" transform="rotate(-10 8 20)" />
        </svg>
      </span>
    ),
  },
{
  href: 'https://github.com/yeojoonsoo02/intro-site',
  label: '프로젝트(GitHub)',
  icon: (
    <span className="relative flex items-center justify-center w-6 h-6">
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="12"
          fill="#18181b"
          className="dark:fill-[#e4e4e7]"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48
          0-.24-.01-.87-.01-1.7-2.78.62-4.02-1.36-4.02-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62
          1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07
          0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7
          0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.7.12 2.5.35
          1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75
          0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9
          0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48
          C19.13 20.54 22 16.74 22 12.26 22 6.58 17.52 2 12 2z"
          fill="#ffffff"
          className="dark:fill-[#18181b]"
        />
      </svg>
    </span>
  ),
}
];

export default function SocialLinks({ colored = false }: { colored?: boolean }) {
  return (
    <nav className="flex justify-center items-center gap-4 sm:gap-5 mt-4 flex-wrap w-full">
      {SNS.map(({ href, label, color, icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="sns-icon transition-colors"
          style={colored ? { color, background: color + '22' } : undefined}
        >
          <span className="sr-only">{label}</span>
          <span className="flex items-center justify-center">{icon}</span>
        </a>
      ))}
      <style jsx>{`
        .sns-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: none;
          width: 2.4rem;
          height: 2.4rem;
          transition: color 0.18s, background 0.18s;
          color: var(--muted);
        }
        .sns-icon:hover {
          color: var(--primary);
          background: rgba(37, 99, 235, 0.08);
        }
        @media (max-width: 600px) {
          .sns-icon {
            width: 2rem;
            height: 2rem;
          }
        }
      `}</style>
    </nav>
  );
}