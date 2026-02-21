import type { CategoryIconName } from "../types/demo";

interface CategoryIconProps {
  icon: CategoryIconName;
  className?: string;
}

export function CategoryIcon({ icon, className = "size-4" }: CategoryIconProps) {
  const commonProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (icon) {
    case "pointer":
      return (
        <svg {...commonProps}>
          <path d="M5 3l14 8-6 2-2 6-6-16Z" />
          <path d="M13 13l4 4" />
        </svg>
      );
    case "spark":
      return (
        <svg {...commonProps}>
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <path d="m6.2 6.2 2.8 2.8" />
          <path d="m15 15 2.8 2.8" />
          <path d="m6.2 17.8 2.8-2.8" />
          <path d="m15 9 2.8-2.8" />
        </svg>
      );
    case "loader":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" opacity="0.25" />
          <path d="M20 12a8 8 0 0 0-8-8" />
        </svg>
      );
    case "type":
      return (
        <svg {...commonProps}>
          <path d="M4 6h16" />
          <path d="M12 6v12" />
          <path d="M8 18h8" />
        </svg>
      );
    case "layers":
      return (
        <svg {...commonProps}>
          <path d="m12 3 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 17 8 4 8-4" />
        </svg>
      );
    default:
      return null;
  }
}
