'use client';

import { useEffect, useState } from 'react';
import { incrementVisitCount } from './counter';
import { useTranslation } from 'next-i18next';

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    incrementVisitCount((c) => setCount(c));
  }, []);

  return (
    <p className="text-[0.875rem] text-[#A1A1AA]">
      {t('visitorCount')}{' '}
      <span className="font-semibold">
        {count !== null ? count : t('loading')}
      </span>
    </p>
  );
}