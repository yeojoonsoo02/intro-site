'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

const noop = (): (() => void) => () => {};

// 브라우저 Web Speech API 래퍼. 받아쓰기(SpeechRecognition)는 크롬·엣지·사파리에만 있어서
// 없으면 글 입력으로 대신한다. TypeScript의 DOM 타입에 SpeechRecognition이 없어 필요한 만큼만 적는다.

interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface RecognitionErrorEvent {
  error: string;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechApi {
  canListen: boolean;
  canSpeak: boolean;
  listening: boolean;
  /** 한 문장을 듣고 글로 돌려준다. 실패하면 null과 이유 */
  listen: () => Promise<{ text: string | null; error?: string }>;
  stopListening: () => void;
  /** 영어로 읽는다. 읽기가 끝나면(또는 못 읽으면) resolve */
  speak: (text: string) => Promise<void>;
  cancelSpeech: () => void;
}

export function useSpeech(): SpeechApi {
  // 서버 렌더에서는 false, 브라우저에서는 실제 지원 여부 — 하이드레이션이 어긋나지 않는다.
  const canListen = useSyncExternalStore(noop, () => recognitionCtor() !== null, () => false);
  const canSpeak = useSyncExternalStore(noop, () => 'speechSynthesis' in window, () => false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<Recognition | null>(null);

  const stopListening = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const listen = useCallback((): Promise<{ text: string | null; error?: string }> => {
    const Ctor = recognitionCtor();
    if (!Ctor) return Promise.resolve({ text: null, error: 'unsupported' });
    recRef.current?.abort();
    return new Promise((resolve) => {
      let settled = false;
      const done = (v: { text: string | null; error?: string }): void => {
        if (settled) return;
        settled = true;
        setListening(false);
        recRef.current = null;
        resolve(v);
      };
      try {
        const rec = new Ctor();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = false;
        rec.onresult = (e) => {
          const text = e.results[0]?.[0]?.transcript?.trim() ?? '';
          done({ text: text || null, error: text ? undefined : 'no-speech' });
        };
        rec.onerror = (e) => done({ text: null, error: e.error });
        rec.onend = () => done({ text: null, error: 'no-speech' });
        recRef.current = rec;
        setListening(true);
        rec.start();
      } catch {
        done({ text: null, error: 'start-failed' });
      }
    });
  }, []);

  const cancelSpeech = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // 지원하지 않는 브라우저
    }
  }, []);

  const speak = useCallback((text: string): Promise<void> => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve();
    return new Promise((resolve) => {
      try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = 0.95;
        const voice = synth.getVoices().find((v) => v.lang === 'en-US' && v.localService) ?? synth.getVoices().find((v) => v.lang.startsWith('en'));
        if (voice) u.voice = voice;
        // 일부 브라우저는 onend를 빠뜨린다 — 글자 수로 잡은 상한이 지나면 넘어간다.
        const timer = window.setTimeout(resolve, 1500 + text.length * 90);
        u.onend = () => {
          window.clearTimeout(timer);
          resolve();
        };
        u.onerror = () => {
          window.clearTimeout(timer);
          resolve();
        };
        synth.speak(u);
      } catch {
        resolve();
      }
    });
  }, []);

  useEffect(
    () => () => {
      recRef.current?.abort();
      try {
        window.speechSynthesis?.cancel();
      } catch {
        // 무시
      }
    },
    [],
  );

  return { canListen, canSpeak, listening, listen, stopListening, speak, cancelSpeech };
}
