'use client';

import { useEffect, useState } from 'react';
import { incrementVisitCount } from './counter';

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    incrementVisitCount((c) => setCount(c));
  }, []);

  return (
    <p className="text-xs sm:text-sm text-gray-500 mt-2 mb-1">
      👀 총 방문자 수:{' '}
      <span className="font-semibold">
        {count !== null ? count : '로딩 중...'}
      </span>
    </p>
  );
}