'use client';

import { useEffect, useState } from 'react';
import { incrementVisitCount } from './counter';
import { useTranslation } from 'react-i18next';

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    incrementVisitCount((c) => setCount(c));
  }, []);

  return (
    <p className="text-[0.8rem] sm:text-[0.875rem]" style={{ color: "var(--muted)" }}>
      {t('visitorCount')}{' '}
      <span className="font-semibold">
        {count !== null ? count.toLocaleString(i18n.language || 'ko') : t('loading')}
      </span>
    </p>
  );
}