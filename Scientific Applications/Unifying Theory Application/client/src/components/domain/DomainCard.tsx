import type { DomainPack } from '../../api/client';

const roleColors: Record<string, string> = {
  Frame: 'var(--color-frame)',
  Gradient: 'var(--color-gradient)',
  Vector: 'var(--color-vector)',
};

interface DomainCardProps {
  domain: DomainPack;
  selected: boolean;
  onToggle: () => void;
}

export default function DomainCard({ domain, selected, onToggle }: DomainCardProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        ...styles.card,
        ...(selected ? styles.cardSelected : {}),
      }}
    >
      <div style={styles.header}>
        <span style={styles.name}>{domain.name}</span>
        <span style={styles.conceptCount}>{domain.concepts.length} concepts</span>
      </div>
      <p style={styles.description}>{domain.description}</p>
      <div style={styles.dots}>
        {domain.concepts.slice(0, 8).map((c, i) => (
          <span
            key={i}
            title={`${c.name}${c.suggestedRole ? ` (${c.suggestedRole})` : ''}`}
            style={{
              ...styles.dot,
              backgroundColor: c.suggestedRole
                ? roleColors[c.suggestedRole]
                : 'var(--color-text-muted)',
            }}
          />
        ))}
        {domain.concepts.length > 8 && (
          <span style={styles.moreText}>+{domain.concepts.length - 8}</span>
        )}
      </div>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: 'var(--sp-3)',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    marginBottom: 'var(--sp-2)',
    color: 'var(--color-text)',
  },
  cardSelected: {
    borderColor: 'var(--color-frame)',
    background: 'rgba(59, 130, 246, 0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--sp-1)',
  },
  name: {
    fontWeight: 600,
    fontSize: 'var(--fs-sm)',
  },
  conceptCount: {
    fontSize: 'var(--fs-xs)',
    color: 'var(--color-text-muted)',
  },
  description: {
    fontSize: 'var(--fs-xs)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--sp-2)',
    lineHeight: 1.4,
  },
  dots: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap' as const,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  moreText: {
    fontSize: 'var(--fs-xs)',
    color: 'var(--color-text-muted)',
    marginLeft: '2px',
  },
};
