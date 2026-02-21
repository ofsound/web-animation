export default function TextStaggerLetters() {
  return (
    <div className="flex text-3xl font-bold text-[var(--text-1)]">
      {"ANIMATE".split("").map((char, i) => (
        <span
          key={i}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}
