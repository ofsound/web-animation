export type SupportLevel = 'widely-available' | 'baseline-2024' | 'new-2025' | 'experimental';
export default function SupportBadge({ level }: {
    level: SupportLevel;
}): import("react/jsx-runtime").JSX.Element;
