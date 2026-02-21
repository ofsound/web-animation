export default function Hover3dTilt() {
  return (
    <div className="group [perspective:800px]">
      <div className="rounded-2xl border border-border-subtle bg-surface-card-subtle p-6 transition-transform duration-500 ease-out group-hover:[transform:rotateX(8deg)_rotateY(-8deg)]">
        <div className="size-12 rounded-lg bg-gradient-to-br from-accent-brand to-accent-brand-secondary" />
        <p className="mt-3 text-sm text-text-secondary">Hover for 3D tilt</p>
      </div>
    </div>
  );
}
