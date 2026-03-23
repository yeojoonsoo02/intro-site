'use client';

import { useTranslation } from 'react-i18next';
import type { PortfolioHero } from '@/features/portfolio/portfolio.model';

const inputStyle = {
  background: 'var(--input-bg)',
  color: 'var(--foreground)',
  border: '1px solid var(--input-border)',
};

type Props = {
  data: PortfolioHero;
  onChange: (data: PortfolioHero) => void;
};

export default function HeroEditor({ data, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1" style={{ color: 'var(--muted)' }}>
          {t('headline')}
        </label>
        <input
          className="w-full rounded-lg px-3 py-2 text-sm"
          style={inputStyle}
          value={data.headline}
          onChange={(e) => onChange({ ...data, headline: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1" style={{ color: 'var(--muted)' }}>
          {t('subline')}
        </label>
        <textarea
          className="w-full rounded-lg px-3 py-2 text-sm"
          style={inputStyle}
          rows={3}
          value={data.subline}
          onChange={(e) => onChange({ ...data, subline: e.target.value })}
        />
      </div>
    </div>
  );
}
