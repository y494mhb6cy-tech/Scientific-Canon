import { useState } from 'react';
import type { InvariantCandidate } from '../../api/client';

interface InvariantStatementProps {
  invariant: InvariantCandidate;
}

export default function InvariantStatement({ invariant }: InvariantStatementProps) {
  const [expanded, setExpanded] = useState(false);

  const confidenceLevel =
    invariant.confidence >= 0.8
      ? 'success'
      : invariant.confidence >= 0.5
        ? 'warning'
        : 'error';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Core Invariant</h3>
        <span className={`badge badge-${confidenceLevel}`}>
          {Math.round(invariant.confidence * 100)}% confidence
        </span>
      </div>

      <blockquote style={styles.statement}>{invariant.statement}</blockquote>

      <div style={styles.domains}>
        {invariant.domains.map((d) => (
          <span key={d} style={styles.domainTag}>
            {d}
          </span>
        ))}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        style={styles.expandBtn}
      >
        {expanded ? 'Hide rationale' : 'Show rationale'}
      </button>

      {expanded && <p style={styles.rationale}>{invariant.rationale}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--sp-6)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--sp-4)',
  },
  title: {
    fontSize: 'var(--fs-base)',
    fontWeight: 600,
  },
  statement: {
    fontSize: 'var(--fs-lg)',
    fontWeight: 500,
    lineHeight: 1.5,
    padding: 'var(--sp-4)',
    borderLeft: '3px solid var(--color-frame)',
    background: 'rgba(59, 130, 246, 0.05)',
    borderRadius: '0 var(--radius-md) var(--radius-md) 0',
    margin: '0 0 var(--sp-4) 0',
  },
  domains: {
    display: 'flex',
    gap: 'var(--sp-2)',
    flexWrap: 'wrap' as const,
    marginBottom: 'var(--sp-3)',
  },
  domainTag: {
    padding: 'var(--sp-1) var(--sp-2)',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--fs-xs)',
    color: 'var(--color-text-muted)',
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-frame)',
    fontSize: 'var(--fs-sm)',
    cursor: 'pointer',
    padding: 0,
  },
  rationale: {
    marginTop: 'var(--sp-3)',
    fontSize: 'var(--fs-sm)',
    color: 'var(--color-text-muted)',
    lineHeight: 1.6,
  },
};
