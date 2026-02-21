export default function LoadingPulseRing() {
  return (
    <div className="relative flex size-20 items-center justify-center">
      <div className="absolute size-8 animate-pulse-ring rounded-full border-2 border-accent-brand" />
      <div className="absolute size-8 animate-pulse-ring rounded-full border-2 border-accent-brand [animation-delay:400ms]" />
      <div className="relative size-4 rounded-full bg-accent-brand" />
    </div>
  );
}
