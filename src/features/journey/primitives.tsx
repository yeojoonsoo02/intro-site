import Image from 'next/image';

export function Era({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <span
      className="meta block mb-2"
    >
      {children}
    </span>
  );
}

interface HeadingProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Heading({ children, size = 'md' }: HeadingProps): JSX.Element {
  const cls =
    size === 'lg'
      ? 'text-xl sm:text-2xl'
      : size === 'sm'
      ? 'text-base sm:text-lg'
      : 'text-lg sm:text-xl';
  return (
    <h2
      className={`font-serif leading-tight ${cls}`}
      style={{ color: 'var(--ink)' }}
    >
      {children}
    </h2>
  );
}

export function Caption({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <p className="mt-2 text-[0.9375rem] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
      {children}
    </p>
  );
}

export function Reflection({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <p
      className="mt-3 text-base leading-[1.7] intro-p"
      style={{ color: 'var(--ink)' }}
    >
      {children}
    </p>
  );
}

interface PhotoProps {
  src: string;
  alt: string;
  aspect: string;
  sizes: string;
}

/** 사진 한 장 — group hover로 미세 줌, sizes 정확히 부여 */
export function Photo({ src, alt, aspect, sizes }: PhotoProps): JSX.Element {
  return (
    <figure
      className={`relative ${aspect} overflow-hidden group`}
      style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)' }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </figure>
  );
}
