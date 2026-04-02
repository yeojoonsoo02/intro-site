import { useTranslation } from 'react-i18next';

type Props = {
  text: string;
  author?: string;
  date: string;
  onDelete: () => void;
  isAdmin: boolean;
};

export default function CommentItem({ text, author, date, onDelete, isAdmin }: Props) {
  const { t } = useTranslation();
  return (
    <li className="border border-[color:var(--border)] bg-card p-3 rounded-lg flex justify-between items-start shadow-sm">
      <div className="flex-1 min-w-0">
        {author && (
          <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--primary)' }}>{author}</div>
        )}
        <div className="break-words whitespace-pre-wrap text-base text-[color:var(--foreground)] overflow-wrap-anywhere">{text}</div>
        <div className="text-xs text-muted mt-1">{date}</div>
      </div>
      {isAdmin && (
        <button
          onClick={onDelete}
          className="text-red-500 ml-3 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900 transition"
          aria-label={t('deleteComment')}
        >
          ❌
        </button>
      )}
    </li>
  );
}