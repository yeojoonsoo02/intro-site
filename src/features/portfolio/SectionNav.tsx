'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SECTIONS = [
  { id: 'summary', key: 'about' },
  { id: 'skills', key: 'skills' },
  { id: 'projects', key: 'projects' },
  { id: 'timeline', key: 'timeline' },
  { id: 'contact', key: 'contact' },
] as const;

export default function SectionNav() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;

    const heroObs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' },
    );
    heroObs.observe(heroEl);

    const sectionEls = SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    const sectionObs = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) {
          setActive(mostVisible.target.id);
        }
      },
      { threshold: [0.1, 0.3, 0.5], rootMargin: '-80px 0px -40% 0px' },
    );
    sectionEls.forEach((el) => sectionObs.observe(el));

    return () => {
      heroObs.disconnect();
      sectionObs.disconnect();
    };
  }, []);

  const scrollTo = (id: string): void => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      className="fixed top-[3.5rem] left-0 right-0 z-30 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
      }}
    >
      <div
        className="backdrop-blur-md border-b"
        style={{
          background: 'color-mix(in srgb, var(--background) 88%, transparent)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 py-2 min-w-max">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={
                  active === s.id
                    ? {
                        background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                        color: 'var(--primary)',
                      }
                    : { color: 'var(--muted)' }
                }
              >
                {t(s.key)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
