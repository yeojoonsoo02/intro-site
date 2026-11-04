// SNS 업로드 흉내: 긴 변을 줄이고 JPEG로 다시 저장한다. 브라우저 캔버스로 하므로 실제로 다시 인코딩된 파일이 나온다.
// 캔버스는 픽셀만 옮기므로 EXIF·XMP·C2PA는 이 단계에서 전부 사라진다(실제 플랫폼은 서비스마다 다르다 — 그걸 재는 게 연구의 일부다).

export interface Compressed {
  blob: Blob;
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

export interface CompressOptions {
  /** 긴 변 최대 길이(px). 원본이 더 작으면 키우지 않는다 */
  maxEdge: number;
  /** JPEG 품질 1~100 */
  quality: number;
}

export async function recompress(source: ImageBitmap, opts: CompressOptions): Promise<Compressed> {
  const scale = Math.min(1, opts.maxEdge / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('캔버스를 쓸 수 없습니다');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // 투명한 PNG는 JPEG에서 검게 변하지 않도록 흰 바탕에 얹는다(SNS도 대개 이렇게 한다)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('JPEG로 저장하지 못했습니다'))), 'image/jpeg', opts.quality / 100),
  );
  const bitmap = await createImageBitmap(blob);
  return { blob, bitmap, width, height };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10 * 1024 ? 1 : 0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
