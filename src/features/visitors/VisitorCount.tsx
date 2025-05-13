'use client';

import { useEffect, useState } from 'react';
import { incrementVisitCount } from './counter';

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    incrementVisitCount((c) => setCount(c));
  }, []);

  return (
    <p className="text-sm text-gray-500">
      👀 총 방문자 수: {count !== null ? count : '로딩 중...'}
    </p>
  );
}