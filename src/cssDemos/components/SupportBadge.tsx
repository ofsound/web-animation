import styles from './SupportBadge.module.css';

export type SupportLevel = 'widely-available' | 'baseline-2024' | 'new-2025' | 'experimental';

export default function SupportBadge({ level }: { level: SupportLevel }) {
  const label = {
    'widely-available': 'Widely Available',
    'baseline-2024': 'Baseline 2024',
    'new-2025': 'New 2025',
    experimental: 'Experimental',
  }[level];

  return <span className={`${styles.badge} ${styles[level]}`}>{label}</span>;
}
