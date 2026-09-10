/** 섹션 제목 — 왼쪽에 짧은 강조 획이 있는 구분선 + 명조 */
export function AboutSectionTitle({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>
      <div className="rule mb-4" aria-hidden="true" />
      <h2 className="font-serif text-[1.375rem] sm:text-2xl mb-4">{children}</h2>
    </>
  );
}
