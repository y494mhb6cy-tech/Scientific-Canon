import type { TriadicMapping, BalanceViolation, SemanticCost } from '../../api/client';

interface MappingTableProps {
  mappings: TriadicMapping[];
  violations?: BalanceViolation[];
  semanticCosts?: { domain: string; cost: SemanticCost }[];
}

const roleColor: Record<string, string> = {
  Frame: 'var(--color-frame)',
  Gradient: 'var(--color-gradient)',
  Vector: 'var(--color-vector)',
};

export default function MappingTable({ mappings, violations, semanticCosts }: MappingTableProps) {
  const costMap = new Map(semanticCosts?.map((sc) => [sc.domain, sc.cost]));

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Triadic Mappings</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Domain</th>
              <th style={{ ...styles.th, color: roleColor.Frame }}>Frame</th>
              <th style={{ ...styles.th, color: roleColor.Gradient }}>Gradient</th>
              <th style={{ ...styles.th, color: roleColor.Vector }}>Vector</th>
              <th style={styles.th}>Delta-S</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m, i) => {
              const cost = costMap.get(m.domain);
              return (
                <tr key={i}>
                  <td style={styles.td}>
                    <span style={styles.domainName}>{m.domain}</span>
                  </td>
                  <td style={styles.td}>
                    <RoleCell role={m.frame} color={roleColor.Frame} />
                  </td>
                  <td style={styles.td}>
                    <RoleCell role={m.gradient} color={roleColor.Gradient} />
                  </td>
                  <td style={styles.td}>
                    <RoleCell role={m.vector} color={roleColor.Vector} />
                  </td>
                  <td style={styles.td}>
                    {cost !== undefined ? (
                      <span
                        style={{
                          ...styles.deltaS,
                          color:
                            cost.deltaS < 0.3
                              ? 'var(--color-success)'
                              : cost.deltaS < 0.6
                                ? 'var(--color-warning)'
                                : 'var(--color-error)',
                        }}
                      >
                        {cost.deltaS.toFixed(3)}
                      </span>
                    ) : (
                      <span style={styles.naCost}>--</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {violations && violations.length > 0 && (
        <div style={styles.violations}>
          {violations.map((v, i) => (
            <div key={i} className="alert alert-warning" style={{ marginTop: 'var(--sp-2)' }}>
              <strong>{v.type}:</strong> {v.description}
              <span style={styles.affectedRoles}>
                {v.roles.map((r) => (
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
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleCell({ role, color }: { role: { concept: string; confidence: number }; color: string }) {
  return (
    <div style={styles.roleCell}>
      <span style={{ ...styles.concept, color }}>{role.concept}</span>
      <span style={styles.confidence}>{Math.round(role.confidence * 100)}%</span>
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
  title: {
    fontSize: 'var(--fs-base)',
    fontWeight: 600,
    marginBottom: 'var(--sp-4)',
  },
  tableWrap: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: 'var(--sp-3) var(--sp-4)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 'var(--fs-xs)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted)',
  },
  td: {
    padding: 'var(--sp-3) var(--sp-4)',
    borderBottom: '1px solid var(--color-border)',
    verticalAlign: 'top' as const,
  },
  domainName: {
    fontWeight: 500,
    fontSize: 'var(--fs-sm)',
  },
  roleCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  concept: {
    fontWeight: 500,
    fontSize: 'var(--fs-sm)',
  },
  confidence: {
    fontSize: 'var(--fs-xs)',
    color: 'var(--color-text-muted)',
  },
  deltaS: {
    fontFamily: 'monospace',
    fontWeight: 600,
    fontSize: 'var(--fs-sm)',
  },
  naCost: {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--fs-sm)',
  },
  violations: {
    marginTop: 'var(--sp-4)',
  },
  affectedRoles: {
    display: 'inline-flex',
    gap: 'var(--sp-1)',
    marginLeft: 'var(--sp-2)',
  },
  roleTag: {
    padding: '1px 6px',
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--fs-xs)',
    fontWeight: 600,
  },
};
