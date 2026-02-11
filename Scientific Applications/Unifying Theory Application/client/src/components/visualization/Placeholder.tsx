export default function Placeholder() {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <h3 style={styles.title}>Visualization Coming in Phase 2</h3>
      <p style={styles.description}>
        Interactive graphs, force-directed triadic layouts, and animated drift
        visualizations will be available in the next release.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--sp-12)',
    background: 'var(--color-surface)',
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center' as const,
  },
  icon: {
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--sp-4)',
    opacity: 0.5,
  },
  title: {
    fontSize: 'var(--fs-lg)',
    fontWeight: 600,
    marginBottom: 'var(--sp-2)',
  },
  description: {
    fontSize: 'var(--fs-sm)',
    color: 'var(--color-text-muted)',
    maxWidth: '400px',
    lineHeight: 1.5,
  },
};
