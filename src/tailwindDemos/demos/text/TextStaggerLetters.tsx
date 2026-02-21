export default function TextStaggerLetters() {
  return (
    <div className="flex text-3xl font-bold text-text-primary">
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
