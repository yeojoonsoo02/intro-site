'use client';

interface SectionWrapperProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

// 진입 애니메이션을 전 섹션에 똑같이 걸던 것을 없앴다 — 페이지가 처음부터 다 보여야 한다.
export default function SectionWrapper({ id, title, children, className = 'mb-16 sm:mb-20' }: SectionWrapperProps) {
  return (
    <section id={id} aria-labelledby={title ? `${id}-title` : undefined} className={`${className} scroll-mt-24`}>
      {title && (
        <h2
          id={`${id}-title`}
          className="text-[22px] sm:text-[24px] font-semibold leading-tight mb-6"
          style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
