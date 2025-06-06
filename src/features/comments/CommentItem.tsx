type Props = {
  text: string;
  date: string;
  onDelete: () => void;
  isAdmin: boolean;
};

export default function CommentItem({ text, date, onDelete, isAdmin }: Props) {
  return (
    <li className="border p-2 mb-2 rounded flex justify-between items-center">
      <div>
        <div>{text}</div>
        <div className="text-sm text-gray-500">{date}</div>
      </div>
      {isAdmin && (
        <button onClick={onDelete} className="text-red-500 ml-4 text-sm">❌</button>
      )}
    </li>
  );
}