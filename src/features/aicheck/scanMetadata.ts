// 1단계(표시 확인)의 바이트 스캐너. 파일을 서버로 보내지 않고 브라우저에서 바이트를 직접 읽는다.
// 공식 C2PA 판독기(c2pa.ts)가 서명·내용을 읽기 전에, 여기서는 "무엇이 들어 있나"를 형식별로 훑는다:
//   JPEG  APP1(EXIF·XMP) · APP11(JUMBF = C2PA 상자) · DQT(양자화표 → 다시 저장한 품질 추정)
//   PNG   caBX(C2PA) · tEXt/zTXt/iTXt(XMP, 생성 프로그램이 남기는 프롬프트·설정)
//   WebP  C2PA · XMP · EXIF 청크
// DOM·캔버스를 쓰지 않아 Node에서도 돈다(압축 해제만 DecompressionStream이 있을 때).

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'unknown';

/** IPTC DigitalSourceType 중 "AI가 만들었다"는 값. http://cv.iptc.org/newscodes/digitalsourcetype/ */
const AI_SOURCE_TYPES: Record<string, string> = {
  trainedAlgorithmicMedia: '학습된 AI 모델로 만든 미디어',
  compositeWithTrainedAlgorithmicMedia: 'AI 생성 요소를 합성한 미디어',
  algorithmicMedia: '알고리즘으로 만든 미디어(학습 모델 아님)',
  compositeSynthetic: '합성 요소가 들어간 미디어',
};

/** AI 표시는 아니지만 파일이 스스로 밝힌 출처(예: 카메라 촬영). 판정에는 쓰지 않고 보여만 준다. */
const OTHER_SOURCE_TYPES: Record<string, string> = {
  digitalCapture: '디지털 카메라로 촬영',
  negativeFilm: '필름 스캔',
  positiveFilm: '필름 스캔',
  print: '인쇄물 스캔',
  minorHumanEdits: '사람이 조금 고침',
  humanEdits: '사람이 고침',
  composite: '여러 이미지 합성',
  screenCapture: '화면 캡처',
  dataDrivenMedia: '데이터 기반 미디어',
  digitalCreation: '사람이 디지털로 제작',
  virtualRecording: '가상 녹화',
};

/** 생성 프로그램 이름. EXIF Software나 XMP CreatorTool에 이 이름이 있으면 파일이 스스로 밝힌 것이다. */
const AI_SOFTWARE =
  /(dall[\s·-]?e|midjourney|stable[\s-]?diffusion|comfyui|automatic1111|invokeai|fooocus|novelai|firefly|imagen|gemini|chatgpt|openai|gpt-image|ideogram|leonardo\.ai|flux\.?[12]?\b|mflux|z-image|grok|sora|runway|kling|bing image creator|dreamstudio|nijijourney)/i;

/** 생성 프로그램이 PNG 글 청크에 남기는 키(값에 프롬프트·설정이 들어 있다). */
const GEN_TEXT_KEYS: Record<string, string> = {
  parameters: 'Stable Diffusion WebUI 계열 생성 설정',
  prompt: 'ComfyUI 프롬프트 그래프',
  workflow: 'ComfyUI 워크플로',
  'sd-metadata': 'InvokeAI 생성 설정',
  invokeai_metadata: 'InvokeAI 생성 설정',
  Dream: 'Dream 계열 생성 설정',
};

export interface Finding {
  /** 어디서 찾았나: 'C2PA 상자' · 'XMP' · 'EXIF' · 'PNG 글 청크' · 'JPEG 양자화표' */
  where: string;
  /** 무엇을 찾았나 (한국어 한 줄) */
  what: string;
  /** mark = 파일이 스스로 AI라고 밝힘, info = 참고 정보 */
  kind: 'mark' | 'info';
}

export interface ScanResult {
  format: ImageFormat;
  bytes: number;
  /** C2PA 매니페스트를 담는 상자(JUMBF·caBX·C2PA 청크)가 있나 */
  c2paBox: boolean;
  hasXmp: boolean;
  hasExif: boolean;
  /** XMP의 IPTC DigitalSourceType 끝 이름 (예: trainedAlgorithmicMedia) */
  digitalSourceType: string | null;
  software: string | null;
  cameraModel: string | null;
  /** JPEG 양자화표로 추정한 저장 품질(IJG 기준 1~100). JPEG가 아니면 null */
  jpegQuality: number | null;
  findings: Finding[];
}

function ascii(bytes: Uint8Array, start: number, len: number): string {
  let s = '';
  const end = Math.min(bytes.length, start + len);
  for (let i = start; i < end; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function latin1(bytes: Uint8Array): string {
  // 큰 파일에서도 스택이 넘치지 않게 나눠서 만든다
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 0x8000)));
  }
  return s;
}

function utf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

export function detectFormat(b: Uint8Array): ImageFormat {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.length > 8 && b[0] === 0x89 && ascii(b, 1, 3) === 'PNG') return 'png';
  if (b.length > 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') return 'webp';
  return 'unknown';
}

// ── EXIF (TIFF) ─────────────────────────────────────────────

interface ExifTags {
  software: string | null;
  make: string | null;
  model: string | null;
  description: string | null;
}

/** TIFF 헤더부터 시작하는 EXIF에서 IFD0의 Software·Make·Model·ImageDescription만 읽는다. */
export function readExif(tiff: Uint8Array): ExifTags {
  const out: ExifTags = { software: null, make: null, model: null, description: null };
  if (tiff.length < 8) return out;
  const le = tiff[0] === 0x49 && tiff[1] === 0x49;
  const be = tiff[0] === 0x4d && tiff[1] === 0x4d;
  if (!le && !be) return out;
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const u16 = (o: number): number => view.getUint16(o, le);
  const u32 = (o: number): number => view.getUint32(o, le);
  const ifd = u32(4);
  if (ifd + 2 > tiff.length) return out;
  const count = u16(ifd);
  for (let i = 0; i < count; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > tiff.length) break;
    const tag = u16(e);
    const type = u16(e + 2);
    const n = u32(e + 4);
    if (type !== 2 || n === 0) continue; // ASCII만
    const off = n <= 4 ? e + 8 : u32(e + 8);
    if (off + n > tiff.length) continue;
    const value = utf8(tiff.subarray(off, off + n)).replace(/\0+$/, '').trim();
    if (!value) continue;
    if (tag === 0x0131) out.software = value;
    else if (tag === 0x010f) out.make = value;
    else if (tag === 0x0110) out.model = value;
    else if (tag === 0x010e) out.description = value;
  }
  return out;
}

// ── JPEG 품질 추정 ────────────────────────────────────────────

/** JPEG 표준(Annex K) 밝기 양자화표. 합만 쓰므로 순서(지그재그/자연)는 상관없다. */
const STD_LUMA = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37,
  56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
];
const STD_LUMA_SUM = STD_LUMA.reduce((a, b) => a + b, 0);

/** IJG(libjpeg) 방식의 품질 → 배율 공식을 거꾸로 풀어 품질을 추정한다. 표를 직접 만든 인코더면 어긋날 수 있다. */
export function estimateJpegQuality(lumaTable: number[]): number | null {
  if (lumaTable.length !== 64) return null;
  const sum = lumaTable.reduce((a, b) => a + b, 0);
  if (sum <= 64) return 100; // 전부 1이면 최고 품질
  const scale = (sum * 100) / STD_LUMA_SUM;
  const q = scale <= 100 ? (200 - scale) / 2 : 5000 / scale;
  return Math.max(1, Math.min(100, Math.round(q)));
}

// ── 형식별 훑기 ──────────────────────────────────────────────

interface Raw {
  c2paBox: boolean;
  xmp: string[];
  exif: Uint8Array[];
  texts: { key: string; value: string }[];
  lumaTable: number[] | null;
}

function scanJpeg(b: Uint8Array, raw: Raw): void {
  let p = 2;
  while (p + 4 <= b.length) {
    if (b[p] !== 0xff) break;
    const marker = b[p + 1];
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      p += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) break; // 영상 데이터 시작 — 메타데이터는 그 앞에만 있다
    const len = (b[p + 2] << 8) | b[p + 3];
    const start = p + 4;
    const end = Math.min(b.length, p + 2 + len);
    const seg = b.subarray(start, end);
    if (marker === 0xe1) {
      if (ascii(seg, 0, 6) === 'Exif\0\0') raw.exif.push(seg.subarray(6));
      else if (ascii(seg, 0, 29) === 'http://ns.adobe.com/xap/1.0/\0') raw.xmp.push(utf8(seg.subarray(29)));
      else if (ascii(seg, 0, 35) === 'http://ns.adobe.com/xmp/extension/\0') raw.xmp.push(utf8(seg.subarray(75)));
    } else if (marker === 0xeb) {
      // APP11: JPEG XT 상자. C2PA는 여기에 JUMBF('jumb' 상자, 'c2pa' 라벨)로 들어간다
      const s = ascii(seg, 0, Math.min(seg.length, 64));
      if (s.startsWith('JP') && (s.includes('jumb') || s.includes('c2pa'))) raw.c2paBox = true;
    } else if (marker === 0xdb && !raw.lumaTable) {
      // DQT: 여러 표가 이어질 수 있다. 첫 번째 0번 표(보통 밝기)만 쓴다
      let q = 0;
      while (q < seg.length) {
        const pq = seg[q] >> 4;
        const tq = seg[q] & 0x0f;
        const size = pq ? 128 : 64;
        if (q + 1 + size > seg.length) break;
        if (tq === 0) {
          const t: number[] = [];
          for (let i = 0; i < 64; i++) t.push(pq ? (seg[q + 1 + i * 2] << 8) | seg[q + 2 + i * 2] : seg[q + 1 + i]);
          raw.lumaTable = t;
          break;
        }
        q += 1 + size;
      }
    }
    p = end;
  }
}

async function inflate(data: Uint8Array): Promise<string | null> {
  if (typeof DecompressionStream === 'undefined') return null;
  try {
    const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate'));
    return utf8(new Uint8Array(await new Response(stream).arrayBuffer()));
  } catch {
    return null;
  }
}

async function scanPng(b: Uint8Array, raw: Raw): Promise<void> {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let p = 8;
  while (p + 8 <= b.length) {
    const len = view.getUint32(p);
    const type = ascii(b, p + 4, 4);
    const data = b.subarray(p + 8, Math.min(b.length, p + 8 + len));
    if (type === 'caBX') raw.c2paBox = true;
    else if (type === 'eXIf') raw.exif.push(data);
    else if (type === 'tEXt' || type === 'zTXt' || type === 'iTXt') {
      const nul = data.indexOf(0);
      if (nul > 0) {
        const key = latin1(data.subarray(0, nul));
        let value: string | null = null;
        if (type === 'tEXt') value = latin1(data.subarray(nul + 1));
        else if (type === 'zTXt') value = await inflate(data.subarray(nul + 2));
        else {
          // iTXt: key\0 compressed(1) method(1) lang\0 translated\0 text
          const compressed = data[nul + 1] === 1;
          let q = nul + 3;
          q = data.indexOf(0, q) + 1; // 언어 태그
          q = data.indexOf(0, q) + 1; // 번역된 키
          if (q > 0) value = compressed ? await inflate(data.subarray(q)) : utf8(data.subarray(q));
        }
        if (value !== null) {
          if (key === 'XML:com.adobe.xmp') raw.xmp.push(value);
          else raw.texts.push({ key, value });
        }
      }
    } else if (type === 'IEND') break;
    p += 12 + len;
  }
}

function scanWebp(b: Uint8Array, raw: Raw): void {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let p = 12;
  while (p + 8 <= b.length) {
    const type = ascii(b, p, 4);
    const len = view.getUint32(p + 4, true);
    const data = b.subarray(p + 8, Math.min(b.length, p + 8 + len));
    if (type === 'C2PA') raw.c2paBox = true;
    else if (type === 'XMP ') raw.xmp.push(utf8(data));
    else if (type === 'EXIF') raw.exif.push(ascii(data, 0, 6) === 'Exif\0\0' ? data.subarray(6) : data);
    p += 8 + len + (len % 2);
  }
}

/** XMP에서 DigitalSourceType 끝 이름을 뽑는다. 속성형·요소형 둘 다 받는다. */
export function digitalSourceTypeFrom(xmp: string): string | null {
  const m = xmp.match(/digitalsourcetype\/([A-Za-z]+)/i);
  return m ? m[1] : null;
}

function creatorToolFrom(xmp: string): string | null {
  const m = xmp.match(/CreatorTool(?:="([^"]+)"|>([^<]+)<)/);
  return m ? (m[1] ?? m[2] ?? null) : null;
}

export async function scanMetadata(input: ArrayBuffer | Uint8Array): Promise<ScanResult> {
  const b = input instanceof Uint8Array ? input : new Uint8Array(input);
  const format = detectFormat(b);
  const raw: Raw = { c2paBox: false, xmp: [], exif: [], texts: [], lumaTable: null };
  if (format === 'jpeg') scanJpeg(b, raw);
  else if (format === 'png') await scanPng(b, raw);
  else if (format === 'webp') scanWebp(b, raw);

  const findings: Finding[] = [];
  const xmp = raw.xmp.join('\n');

  // 형식 구조 밖에 숨은 XMP(예: 확장 XMP가 잘린 경우)까지 잡으려고, 구조에서 못 찾았을 때만 원문 전체를 한 번 훑는다
  let dst = xmp ? digitalSourceTypeFrom(xmp) : null;
  if (!dst && b.length < 64 * 1024 * 1024) dst = digitalSourceTypeFrom(latin1(b.subarray(0, Math.min(b.length, 4 * 1024 * 1024))));

  if (raw.c2paBox) findings.push({ where: 'C2PA 상자', what: 'C2PA 출처 정보(매니페스트)를 담는 상자가 있음', kind: 'info' });
  if (dst) {
    if (AI_SOURCE_TYPES[dst]) findings.push({ where: 'XMP · IPTC', what: `DigitalSourceType = ${dst} (${AI_SOURCE_TYPES[dst]})`, kind: 'mark' });
    else findings.push({ where: 'XMP · IPTC', what: `DigitalSourceType = ${dst}${OTHER_SOURCE_TYPES[dst] ? ` (${OTHER_SOURCE_TYPES[dst]})` : ''}`, kind: 'info' });
  }

  const exif = raw.exif.map(readExif);
  const software = exif.find((e) => e.software)?.software ?? creatorToolFrom(xmp);
  const make = exif.find((e) => e.make)?.make ?? null;
  const model = exif.find((e) => e.model)?.model ?? null;
  const cameraModel = [make, model].filter(Boolean).join(' ') || null;
  if (software) {
    const ai = AI_SOFTWARE.test(software);
    findings.push({ where: 'EXIF · XMP 소프트웨어', what: `만든 프로그램 = "${software.slice(0, 80)}"${ai ? ' (AI 생성 도구 이름)' : ''}`, kind: ai ? 'mark' : 'info' });
  }
  const description = exif.find((e) => e.description)?.description;
  if (description && AI_SOFTWARE.test(description)) {
    findings.push({ where: 'EXIF 설명', what: `설명에 AI 생성 도구 이름: "${description.slice(0, 80)}"`, kind: 'mark' });
  }
  if (cameraModel) findings.push({ where: 'EXIF', what: `카메라 정보 = ${cameraModel} (지우거나 써넣기 쉬워 판정에는 쓰지 않음)`, kind: 'info' });

  for (const t of raw.texts) {
    const label = GEN_TEXT_KEYS[t.key];
    if (label) findings.push({ where: 'PNG 글 청크', what: `"${t.key}" — ${label}`, kind: 'mark' });
    else if (AI_SOFTWARE.test(t.value.slice(0, 2000))) findings.push({ where: 'PNG 글 청크', what: `"${t.key}"에 AI 생성 도구 이름`, kind: 'mark' });
  }

  const jpegQuality = raw.lumaTable ? estimateJpegQuality(raw.lumaTable) : null;
  if (jpegQuality !== null) {
    findings.push({
      where: 'JPEG 양자화표',
      what: `저장 품질 약 ${jpegQuality} (추정)${jpegQuality < 90 ? ' — 한 번 이상 다시 압축된 사본일 수 있음' : ''}`,
      kind: 'info',
    });
  }

  return {
    format,
    bytes: b.length,
    c2paBox: raw.c2paBox,
    hasXmp: raw.xmp.length > 0,
    hasExif: raw.exif.length > 0,
    digitalSourceType: dst,
    software,
    cameraModel,
    jpegQuality,
    findings,
  };
}

export function isAiSourceType(t: string | null | undefined): boolean {
  return !!t && t in AI_SOURCE_TYPES;
}

export function sourceTypeLabel(t: string): string {
  return AI_SOURCE_TYPES[t] ?? OTHER_SOURCE_TYPES[t] ?? t;
}
