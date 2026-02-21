export default function LoadingOrbit() {
  return (
    <div className="relative flex size-24 items-center justify-center">
      <div className="size-2 rounded-full bg-text-tertiary/50" />
      <div className="absolute animate-orbit">
        <div className="size-3 rounded-full bg-accent-brand" />
      </div>
      <div className="absolute animate-orbit-reverse">
        <div className="size-2 rounded-full bg-accent-brand-secondary" />
      </div>
    </div>
  );
}
