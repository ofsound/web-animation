export default function LoadingPulseDots() {
  return (
    <div className="flex gap-2">
      <div className="size-3 animate-bounce rounded-full bg-accent-brand [animation-delay:0ms]" />
      <div className="size-3 animate-bounce rounded-full bg-accent-brand [animation-delay:150ms]" />
      <div className="size-3 animate-bounce rounded-full bg-accent-brand [animation-delay:300ms]" />
    </div>
  );
}
