export default function LoadingPing() {
  return (
    <span className="relative flex size-5">
      <span className="absolute inline-flex size-full animate-ping-slow rounded-full bg-status-success opacity-75" />
      <span className="relative inline-flex size-5 rounded-full bg-status-success" />
    </span>
  );
}
