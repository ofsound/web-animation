export default function Hover3dTilt() {
  return (
    <div className="group [perspective:800px]">
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--surface-3)] p-6 transition-transform duration-500 ease-out group-hover:[transform:rotateX(8deg)_rotateY(-8deg)]">
        <div className="size-12 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400" />
        <p className="mt-3 text-sm text-[var(--text-2)]">Hover for 3D tilt</p>
      </div>
    </div>
  );
}
