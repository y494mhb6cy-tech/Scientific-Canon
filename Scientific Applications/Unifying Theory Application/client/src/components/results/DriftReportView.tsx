import type { DriftReport } from '../../api/client';

const roleColor: Record<string, string> = {
  Frame: 'var(--color-frame)',
  Gradient: 'var(--color-gradient)',
  Vector: 'var(--color-vector)',
};

interface DriftReportViewProps {
  report: DriftReport;
}

export default function DriftReportView({ report }: DriftReportViewProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Drift Report</h3>
        <span className={`badge ${report.clean ? 'badge-success' : 'badge-error'}`}>
          {report.clean ? 'Clean' : `${report.drifts.length} drift${report.drifts.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {report.clean ? (
        <p style={styles.cleanMessage}>No semantic drift detected. All mappings are consistent.</p>
      ) : (
        <div style={styles.driftList}>
          {report.drifts.map((drift, i) => (
            <div
              key={i}
              style={{
                ...styles.driftItem,
                borderLeftColor:
                  drift.severity === 'error'
                    ? 'var(--color-error)'
                    : 'var(--color-warning)',
              }}
            >
              <div style={styles.driftHeader}>
                <span
                  className={`badge ${drift.severity === 'error' ? 'badge-error' : 'badge-warning'}`}
                >
                  {drift.severity}
                </span>
                <span style={styles.driftType}>{drift.type}</span>
              </div>
              <p style={styles.driftDescription}>{drift.description}</p>
              <div style={styles.affectedRoles}>
                {drift.affectedRoles.map((r) => (
                  <span
                    key={r}
                    style={{
                      ...styles.roleTag,
                      borderColor: roleColor[r],
                      color: roleColor[r],
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>
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
  cleanMessage: {
    color: 'var(--color-success)',
    fontSize: 'var(--fs-sm)',
  },
  driftList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--sp-3)',
  },
  driftItem: {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderLeft: '3px solid',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--sp-3) var(--sp-4)',
  },
  driftHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--sp-2)',
    marginBottom: 'var(--sp-2)',
  },
  driftType: {
    fontSize: 'var(--fs-sm)',
    fontWeight: 500,
  },
  driftDescription: {
    fontSize: 'var(--fs-sm)',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
    marginBottom: 'var(--sp-2)',
  },
  affectedRoles: {
    display: 'flex',
    gap: 'var(--sp-1)',
  },
  roleTag: {
    padding: '1px 6px',
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--fs-xs)',
    fontWeight: 600,
  },
};
