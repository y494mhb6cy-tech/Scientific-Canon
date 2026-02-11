import type { UnifyingSchema } from '../../api/client';

interface UnifyingSchemaViewProps {
  schema: UnifyingSchema;
}

export default function UnifyingSchemaView({ schema }: UnifyingSchemaViewProps) {
  const balanced = schema.balanceResult.balanced;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Unifying Schema</h3>
        <span className={`badge ${balanced ? 'badge-success' : 'badge-warning'}`}>
          {balanced ? 'Balanced' : 'Imbalanced'}
        </span>
      </div>

      <div style={styles.schemaBlock}>
        <code style={styles.schemaCode}>{schema.schemaForm}</code>
      </div>

      <div style={styles.invariant}>
        <span style={styles.label}>Invariant:</span>
        <span>{schema.invariant}</span>
      </div>

      {schema.semanticCosts.length > 0 && (
        <div style={styles.costsSection}>
          <h4 style={styles.subtitle}>Semantic Costs</h4>
          <div style={styles.costsGrid}>
            {schema.semanticCosts.map((sc) => (
              <div key={sc.domain} style={styles.costCard}>
                <div style={styles.costHeader}>
                  <span style={styles.costDomain}>{sc.domain}</span>
                  <span
                    style={{
                      ...styles.costValue,
                      color:
                        sc.cost.deltaS < 0.3
                          ? 'var(--color-success)'
                          : sc.cost.deltaS < 0.6
                            ? 'var(--color-warning)'
                            : 'var(--color-error)',
                    }}
                  >
                    Delta-S: {sc.cost.deltaS.toFixed(3)}
                  </span>
                </div>
                <div style={styles.breakdown}>
                  {sc.cost.breakdown.map((b, i) => (
                    <div key={i} style={styles.breakdownItem}>
                      <span
                        style={{
                          color:
                            b.role === 'Frame'
                              ? 'var(--color-frame)'
                              : b.role === 'Gradient'
                                ? 'var(--color-gradient)'
                                : 'var(--color-vector)',
                          fontWeight: 600,
                          fontSize: 'var(--fs-xs)',
                        }}
                      >
                        {b.role}
                      </span>
                      <span style={styles.fit}>fit: {b.fit.toFixed(2)}</span>
                      <span style={styles.strain}>{b.strain}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!balanced && schema.balanceResult.violations.length > 0 && (
        <div style={styles.violationsList}>
          <h4 style={styles.subtitle}>Balance Violations</h4>
          {schema.balanceResult.violations.map((v, i) => (
            <div key={i} className="alert alert-warning" style={{ marginBottom: 'var(--sp-2)' }}>
              <strong>{v.type}:</strong> {v.description}
            </div>
          ))}
        </div>
      )}
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
  subtitle: {
    fontSize: 'var(--fs-sm)',
    fontWeight: 600,
    marginBottom: 'var(--sp-3)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  schemaBlock: {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--sp-4)',
    marginBottom: 'var(--sp-4)',
    overflowX: 'auto' as const,
  },
  schemaCode: {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontSize: 'var(--fs-sm)',
    color: 'var(--color-text)',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
  invariant: {
    fontSize: 'var(--fs-sm)',
    marginBottom: 'var(--sp-4)',
    color: 'var(--color-text-muted)',
  },
  label: {
    fontWeight: 600,
    marginRight: 'var(--sp-2)',
  },
  costsSection: {
    marginTop: 'var(--sp-4)',
    paddingTop: 'var(--sp-4)',
    borderTop: '1px solid var(--color-border)',
  },
  costsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 'var(--sp-3)',
  },
  costCard: {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--sp-3)',
  },
  costHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--sp-2)',
  },
  costDomain: {
    fontWeight: 500,
    fontSize: 'var(--fs-sm)',
  },
  costValue: {
    fontFamily: 'monospace',
    fontWeight: 600,
    fontSize: 'var(--fs-xs)',
  },
  breakdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--sp-1)',
  },
  breakdownItem: {
    display: 'flex',
    gap: 'var(--sp-2)',
    alignItems: 'center',
    fontSize: 'var(--fs-xs)',
  },
  fit: {
    color: 'var(--color-text-muted)',
    fontFamily: 'monospace',
  },
  strain: {
    color: 'var(--color-text-muted)',
    fontStyle: 'italic' as const,
  },
  violationsList: {
    marginTop: 'var(--sp-4)',
    paddingTop: 'var(--sp-4)',
    borderTop: '1px solid var(--color-border)',
  },
};
