export default function LoadingDualRing() {
  return (
    <div className="relative flex size-12 items-center justify-center">
      <div className="absolute size-10 animate-spin rounded-full border-2 border-transparent border-t-accent" />
      <div className="absolute size-7 animate-spin-reverse rounded-full border-2 border-transparent border-t-cyan-glow" />
    </div>
  );
}
