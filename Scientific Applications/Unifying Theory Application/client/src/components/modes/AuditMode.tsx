import { useState } from 'react';
import { useEngine } from '../../hooks/useEngine';
import MainPanel from '../layout/MainPanel';
import InvariantStatement from '../results/InvariantStatement';
import MappingTable from '../results/MappingTable';
import DriftReportView from '../results/DriftReportView';

export default function AuditMode() {
  const { auditResult, loading, error, auditText } = useEngine();
  const [text, setText] = useState('');

  const handleValidate = async () => {
    if (!text.trim()) return;
    await auditText(text.trim());
  };

  return (
    <div style={styles.layout}>
      <MainPanel>
        <h2 style={styles.heading}>Audit Mode</h2>
        <p style={styles.subheading}>
          Paste a theory text below to validate its structural coherence against the
          Frame-Gradient-Vector triad. The engine will detect semantic drift, extract
          mappings, and identify the core invariant.
        </p>

        <div style={styles.inputSection}>
          <label style={styles.label}>Theory Text</label>
          <textarea
            className="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your theory, hypothesis, or conceptual framework here..."
            style={{ minHeight: '240px', fontSize: 'var(--fs-sm)' }}
          />
          <div style={styles.actions}>
            <span style={styles.charCount}>{text.length} characters</span>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleValidate}
              disabled={loading || !text.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Validating...
                </>
              ) : (
                'Validate'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginTop: 'var(--sp-4)' }}>
            {error}
          </div>
        )}

        {auditResult && (
          <div style={styles.resultsStack}>
            <DriftReportView report={auditResult.driftReport} />
            <InvariantStatement invariant={auditResult.invariant} />
            <MappingTable mappings={auditResult.mappings} />
          </div>
        )}
      </MainPanel>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  heading: {
    fontSize: 'var(--fs-2xl)',
    fontWeight: 700,
    marginBottom: 'var(--sp-2)',
  },
  subheading: {
    fontSize: 'var(--fs-sm)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--sp-6)',
    maxWidth: '700px',
    lineHeight: 1.6,
  },
  inputSection: {
    marginBottom: 'var(--sp-6)',
  },
  label: {
    display: 'block',
    fontSize: 'var(--fs-xs)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--sp-2)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--sp-3)',
  },
  charCount: {
    fontSize: 'var(--fs-xs)',
    color: 'var(--color-text-muted)',
  },
  resultsStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--sp-6)',
    marginTop: 'var(--sp-6)',
    paddingTop: 'var(--sp-6)',
    borderTop: '1px solid var(--color-border)',
  },
};
