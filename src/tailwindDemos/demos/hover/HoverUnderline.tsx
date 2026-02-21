export default function HoverUnderline() {
  return (
    <a className="group relative cursor-pointer text-lg font-medium text-text-secondary">
      Hover for underline
      <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-accent-brand transition-transform duration-300 group-hover:scale-x-100" />
    </a>
  );
}
