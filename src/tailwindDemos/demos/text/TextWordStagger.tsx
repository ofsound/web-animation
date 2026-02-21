export default function TextWordStagger() {
  return (
    <p className="text-lg text-[var(--text-2)]">
      {"Modern animations with Tailwind".split(" ").map((word, i) => (
        <span
          key={i}
          className="mr-2 inline-block animate-fade-in-up"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
