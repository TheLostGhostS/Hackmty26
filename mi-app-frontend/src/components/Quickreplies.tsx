interface Props {
  suggestions: string[];
  onPick: (text: string) => void;
  baseDelayMs?: number;
}

export default function QuickReplies({ suggestions, onPick, baseDelayMs = 0 }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {suggestions.map((s, i) => (
        <button
          key={s}
          onClick={() => onPick(s)}
          className="animate-rise rounded-full border-2 border-blush bg-white px-4 py-1.5 text-sm font-medium text-brick transition-all hover:-translate-y-0.5 hover:border-brick hover:bg-brick hover:text-white"
          style={{ animationDelay: `${baseDelayMs + i * 90}ms` }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}