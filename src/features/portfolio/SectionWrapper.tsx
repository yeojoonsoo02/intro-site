'use client';

import useInView from './useInView';

interface SectionWrapperProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function SectionWrapper({ id, title, children, className = 'mb-14 sm:mb-16' }: SectionWrapperProps) {
  const { ref, inView } = useInView();

  return (
    <div
      id={id}
      ref={ref}
      role="region"
      aria-label={id}
      className={`${className} scroll-mt-24 transition-all duration-700`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      {title && (
        <h2
          className="text-sm font-bold tracking-wide mb-6"
          style={{ color: 'var(--muted)' }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
