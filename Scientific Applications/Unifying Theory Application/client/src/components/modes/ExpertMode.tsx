import { useState, useCallback } from 'react';
import { useDomains } from '../../hooks/useDomains';
import { useEngine } from '../../hooks/useEngine';
import Sidebar from '../layout/Sidebar';
import MainPanel from '../layout/MainPanel';
import InvariantStatement from '../results/InvariantStatement';
import MappingTable from '../results/MappingTable';
import UnifyingSchemaView from '../results/UnifyingSchemaView';
import DriftReportView from '../results/DriftReportView';
import ApplicationTests from '../results/ApplicationTests';

export default function ExpertMode() {
  const { domains, loading: domainsLoading, refetch } = useDomains();
  const { result, loading: engineLoading, error, runFullPipeline } = useEngine();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [invariantText, setInvariantText] = useState('');

  const toggleDomain = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleRun = async () => {
    const userInvariant = invariantText.trim() || undefined;
    await runFullPipeline(selectedIds, userInvariant);
  };

  return (
    <div style={styles.layout}>
      <Sidebar
        domains={domains}
        selectedIds={selectedIds}
        onToggle={toggleDomain}
        onCustomCreated={refetch}
        loading={domainsLoading}
      />
      <MainPanel>
        <div style={styles.topSection}>
          <h2 style={styles.heading}>Expert Mode</h2>
          <p style={styles.subheading}>
            Select domains, optionally inject an invariant, and run the full analysis pipeline.
          </p>

          <div style={styles.inputRow}>
            <div style={styles.invariantField}>
              <label style={styles.label}>Custom Invariant (optional)</label>
              <textarea
                className="textarea"
                value={invariantText}
                onChange={(e) => setInvariantText(e.target.value)}
                placeholder="Enter an invariant statement to test, or leave blank for auto-discovery..."
                style={{ minHeight: '100px' }}
              />
            </div>
            <div style={styles.runSection}>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleRun}
                disabled={engineLoading || selectedIds.length < 2}
                style={styles.runButton}
              >
                {engineLoading ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Running...
                  </>
                ) : (
                  'Run Analysis'
                )}
              </button>
              {selectedIds.length < 2 && (
                <p style={styles.hint}>Select at least 2 domains to run analysis</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={styles.resultsStack}>
            <InvariantStatement invariant={result.invariant} />
            <MappingTable
              mappings={result.mappings}
              violations={result.schema.balanceResult.violations}
              semanticCosts={result.schema.semanticCosts}
            />
            <UnifyingSchemaView schema={result.schema} />
            <ApplicationTests tests={result.applicationTests} />
            <DriftReportView report={result.driftReport} />
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
  topSection: {
    marginBottom: 'var(--sp-6)',
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
  },
  inputRow: {
    display: 'flex',
    gap: 'var(--sp-4)',
    alignItems: 'flex-start',
  },
  invariantField: {
    flex: 1,
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
  runSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'var(--sp-2)',
    paddingTop: '22px',
  },
  runButton: {
    minWidth: '160px',
    height: '52px',
    fontSize: 'var(--fs-base)',
  },
  hint: {
    fontSize: 'var(--fs-xs)',
    color: 'var(--color-text-muted)',
    textAlign: 'center' as const,
  },
  resultsStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--sp-6)',
  },
};
