export default function HoverUnderline() {
  return (
    <a className="group relative cursor-pointer text-lg font-medium text-[var(--text-2)]">
      Hover for underline
      <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
    </a>
  );
}
