'use client';

import { useEffect } from 'react';

// 부록의 접힌 칸(<details id>)으로 가는 링크(#research 등)를 누르면 그 칸을 펼친다.
// 처음 들어올 때 주소에 해시가 있어도 같다. 그 밖엔 아무것도 그리지 않는다.

function openFromHash(): void {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const el = document.getElementById(id);
  const details = el instanceof HTMLDetailsElement ? el : el?.closest('details');
  if (details && !details.open) {
    details.open = true;
    details.scrollIntoView({ block: 'start' });
  }
}

export default function OpenOnHash(): null {
  useEffect(() => {
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);
  return null;
}
