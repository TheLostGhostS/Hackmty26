interface Props {
  suggestions: string[];
  onPick: (text: string) => void;
  baseDelayMs?: number;
}

export default function QuickReplies({ suggestions, onPick, baseDelayMs = 0 }: Props) {
  return (
    <div className="flex flex-wrap gap-2 pl-[42px]">
      {suggestions.map((s, i) => (
        <button
          key={s}
          onClick={() => onPick(s)}
          className="animate-rise border border-brick/30 bg-white px-3.5 py-1.5 text-xs font-medium text-brick transition-colors hover:bg-brick hover:text-white"
          style={{ animationDelay: `${baseDelayMs + i * 90}ms` }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}