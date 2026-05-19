export default function Loading() {
  return (
    <div
      className="min-h-[40vh] flex items-center justify-center"
      aria-busy="true"
      role="status"
    >
      <div
        className="h-6 w-6 rounded-full border-2 border-gray-200 dark:border-gray-700 animate-spin"
        style={{ borderTopColor: 'var(--primary)' }}
        aria-hidden
      />
      <span className="sr-only">불러오는 중</span>
    </div>
  );
}
