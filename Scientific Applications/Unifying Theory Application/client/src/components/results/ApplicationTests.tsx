import type { ApplicationTest } from '../../api/client';

interface ApplicationTestsProps {
  tests: ApplicationTest[];
}

export default function ApplicationTests({ tests }: ApplicationTestsProps) {
  const passCount = tests.filter((t) => t.holds).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Application Tests</h3>
        <span
          className={`badge ${passCount === tests.length ? 'badge-success' : 'badge-warning'}`}
        >
          {passCount}/{tests.length} passed
        </span>
      </div>

      <div style={styles.list}>
        {tests.map((test, i) => (
          <div key={i} style={styles.testItem}>
            <div style={styles.testHeader}>
              <span style={styles.domainName}>{test.domain}</span>
              <span className={`badge ${test.holds ? 'badge-success' : 'badge-error'}`}>
                {test.holds ? 'Holds' : 'Fails'}
              </span>
            </div>
            <p style={styles.explanation}>{test.explanation}</p>
            <div style={styles.mappingSummary}>
              <MappingChip label="F" value={test.mapping.frame.concept} color="var(--color-frame)" />
              <MappingChip label="G" value={test.mapping.gradient.concept} color="var(--color-gradient)" />
              <MappingChip label="V" value={test.mapping.vector.concept} color="var(--color-vector)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MappingChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span style={{ ...styles.chip, borderColor: color }}>
      <span style={{ color, fontWeight: 700 }}>{label}</span>
      <span style={styles.chipValue}>{value}</span>
    </span>
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
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--sp-3)',
  },
  testItem: {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--sp-4)',
  },
  testHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--sp-2)',
  },
  domainName: {
    fontWeight: 600,
    fontSize: 'var(--fs-sm)',
  },
  explanation: {
    fontSize: 'var(--fs-sm)',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
    marginBottom: 'var(--sp-3)',
  },
  mappingSummary: {
    display: 'flex',
    gap: 'var(--sp-2)',
    flexWrap: 'wrap' as const,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--sp-1)',
    padding: '2px 8px',
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--fs-xs)',
  },
  chipValue: {
    color: 'var(--color-text-muted)',
  },
};
