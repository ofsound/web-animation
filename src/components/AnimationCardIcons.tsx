const ACTION_ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

export function IconMaximize({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <polyline points="15 3 21 3 21 9" />
      <path d="M21 3l-7 7" />
      <polyline points="9 21 3 21 3 15" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

export function IconMinimize({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <polyline points="4 14 10 14 10 20" />
      <path d="M3 21l7-7" />
      <polyline points="20 10 14 10 14 4" />
      <path d="M21 3l-7 7" />
    </svg>
  );
}

export function IconReplay({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <path d="M21 12a9 9 0 1 1-2.2-5.9" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
  );
}

export function IconReset({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function IconCopy({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export const ACTION_BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-button-neutral-border transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none";
export const ACTION_BTN_HOVER =
  "hover:border-button-neutral-border-hover hover:text-text-primary";
