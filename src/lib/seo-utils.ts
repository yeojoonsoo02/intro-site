/**
 * JSON-LD 안전 직렬화. </script> 등 HTML break-out 시퀀스를 차단해
 * dangerouslySetInnerHTML 사용 시 XSS 표면을 제거한다.
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/<\/script/gi, '<\\/script')
    .replace(/<!--/g, '<\\!--')
    // U+2028/U+2029는 JSON에선 유효하지만 스크립트 파싱 시 줄바꿈으로 해석돼 깨질 수 있다.
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
