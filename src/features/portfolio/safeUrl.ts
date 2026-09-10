// 관리자가 넣은 URL만 렌더하지만, 계정이 뚫렸을 때 javascript:·data: 링크나
// CSS url() 인젝션이 그대로 방문자에게 나가지 않도록 https만 통과시킨다.
export function safeHttpsUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
