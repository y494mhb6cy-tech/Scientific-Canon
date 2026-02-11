import { useState, useCallback } from 'react';
import { useDomains } from '../../hooks/useDomains';
import { useEngine } from '../../hooks/useEngine';
import Sidebar from '../layout/Sidebar';
import MainPanel from '../layout/MainPanel';
import DomainSelector from '../domain/DomainSelector';
import InvariantStatement from '../results/InvariantStatement';
import MappingTable from '../results/MappingTable';
import UnifyingSchemaView from '../results/UnifyingSchemaView';
import DriftReportView from '../results/DriftReportView';
import ApplicationTests from '../results/ApplicationTests';
import type { DomainConcept, InvariantCandidate, TriadicMapping } from '../../api/client';

const STEP_LABELS = [
  'Select Domains',
  'Review Concepts',
  'Choose Invariant',
  'Review Mappings',
  'Results',
];

export default function GuidedMode() {
  const { domains, loading: domainsLoading, refetch } = useDomains();
  const { result, loading: engineLoading, error, runPipelineStep, runFullPipeline } = useEngine();

  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Step 1 data: concepts per domain
  const [conceptsByDomain, setConceptsByDomain] = useState<
    Record<string, DomainConcept[]>
  >({});

  // Step 2 data: invariant candidates + user selection
  const [candidates, setCandidates] = useState<InvariantCandidate[]>([]);
  const [selectedInvariant, setSelectedInvariant] = useState<string>('');
  const [customInvariant, setCustomInvariant] = useState('');

  // Step 3 data: mappings preview
  const [previewMappings, setPreviewMappings] = useState<TriadicMapping[]>([]);

  const toggleDomain = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleNext = async () => {
    if (step === 0) {
      // Move to concept review: run extraction step
      const res = await runPipelineStep('extract_concepts', { domainIds: selectedIds });
      if (res) {
        setConceptsByDomain(res.data as Record<string, DomainConcept[]>);
      }
      setStep(1);
    } else if (step === 1) {
      // Move to invariant selection: run candidate generation
      const res = await runPipelineStep('generate_invariants', { domainIds: selectedIds });
      if (res) {
        const data = res.data as { candidates: InvariantCandidate[] };
        setCandidates(data.candidates || []);
      }
      setStep(2);
    } else if (step === 2) {
      // Move to mapping review: run mapping step
      const invariant = customInvariant.trim() || selectedInvariant;
      const res = await runPipelineStep('map_roles', {
        domainIds: selectedIds,
        invariant,
      });
      if (res) {
        const data = res.data as { mappings: TriadicMapping[] };
        setPreviewMappings(data.mappings || []);
      }
      setStep(3);
    } else if (step === 3) {
      // Run full pipeline to get complete results
      const invariant = customInvariant.trim() || selectedInvariant || undefined;
      await runFullPipeline(selectedIds, invariant);
      setStep(4);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div style={styles.layout}>
      <MainPanel>
        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          {STEP_LABELS.map((label, i) => (
            <div
              key={i}
              style={{
                ...styles.stepItem,
                ...(i === step ? styles.stepActive : {}),
                ...(i < step ? styles.stepCompleted : {}),
              }}
            >
              <div
                style={{
                  ...styles.stepCircle,
                  ...(i === step ? styles.stepCircleActive : {}),
                  ...(i < step ? styles.stepCircleCompleted : {}),
                }}
              >
                {i < step ? '\u2713' : i + 1}
              </div>
              <span style={styles.stepLabel}>{label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)' }}>
            {error}
          </div>
        )}

        {/* Step Content */}
        <div style={styles.stepContent}>
          {step === 0 && (
            <div>
              <h2 style={styles.heading}>Select Domains to Unify</h2>
              <p style={styles.subheading}>
                Choose at least 2 domains to find structural invariants across them.
              </p>
              <div style={styles.domainGrid}>
                <DomainSelector
                  domains={domains}
                  selectedIds={selectedIds}
                  onToggle={toggleDomain}
                  onCustomCreated={refetch}
                  loading={domainsLoading}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={styles.heading}>Review Extracted Concepts</h2>
              <p style={styles.subheading}>
                These concepts were extracted from your selected domains.
              </p>
              {Object.entries(conceptsByDomain).map(([domainId, concepts]) => {
                const domain = domains.find((d) => d.id === domainId);
                return (
                  <div key={domainId} style={styles.conceptDomain}>
                    <h3 style={styles.conceptDomainName}>
                      {domain?.name || domainId}
                    </h3>
                    <div style={styles.conceptList}>
                      {concepts.map((c, i) => (
                        <div key={i} style={styles.conceptItem}>
                          <span style={styles.conceptName}>{c.name}</span>
                          <span style={styles.conceptDesc}>{c.description}</span>
                          {c.suggestedRole && (
                            <span
                              style={{
                                ...styles.conceptRole,
                                color:
                                  c.suggestedRole === 'Frame'
                                    ? 'var(--color-frame)'
                                    : c.suggestedRole === 'Gradient'
                                      ? 'var(--color-gradient)'
                                      : 'var(--color-vector)',
                              }}
                            >
                              {c.suggestedRole}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={styles.heading}>Select or Write an Invariant</h2>
              <p style={styles.subheading}>
                Choose a candidate invariant or write your own.
              </p>
              <div style={styles.candidateList}>
                {candidates.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedInvariant(c.statement);
                      setCustomInvariant('');
                    }}
                    style={{
                      ...styles.candidateCard,
                      ...(selectedInvariant === c.statement
                        ? styles.candidateSelected
                        : {}),
                    }}
                  >
                    <div style={styles.candidateStatement}>{c.statement}</div>
                    <div style={styles.candidateMeta}>
                      <span className="badge badge-info">
                        {Math.round(c.confidence * 100)}%
                      </span>
                      <span style={styles.candidateRationale}>{c.rationale}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div style={styles.customInvariantSection}>
                <label style={styles.fieldLabel}>Or write a custom invariant:</label>
                <textarea
                  className="textarea"
                  value={customInvariant}
                  onChange={(e) => {
                    setCustomInvariant(e.target.value);
                    setSelectedInvariant('');
                  }}
                  placeholder="Enter your invariant statement..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={styles.heading}>Review Triadic Mappings</h2>
              <p style={styles.subheading}>
                Review how concepts from each domain map to the Frame-Gradient-Vector triad.
              </p>
              <MappingTable mappings={previewMappings} />
            </div>
          )}

          {step === 4 && result && (
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
        </div>

        {/* Loading Overlay */}
        {engineLoading && (
          <div style={styles.loadingOverlay}>
            <div className="spinner spinner-lg" />
            <p style={styles.loadingText}>Processing...</p>
          </div>
        )}

        {/* Navigation */}
        <div style={styles.nav}>
          {step > 0 && step < 4 && (
            <button className="btn" onClick={handleBack} disabled={engineLoading}>
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 4 && (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleNext}
              disabled={
                engineLoading ||
                (step === 0 && selectedIds.length < 2) ||
                (step === 2 && !selectedInvariant && !customInvariant.trim())
              }
            >
              {step === 3 ? 'Run Full Analysis' : 'Next'}
            </button>
          )}
        </div>
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
  stepIndicator: {
    display: 'flex',
    gap: 'var(--sp-1)',
    marginBottom: 'var(--sp-6)',
    padding: 'var(--sp-4)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
  },
  stepItem: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--sp-2)',
    padding: 'var(--sp-2)',
    borderRadius: 'var(--radius-md)',
    opacity: 0.5,
  },
  stepActive: {
    opacity: 1,
    background: 'rgba(59, 130, 246, 0.1)',
  },
  stepCompleted: {
    opacity: 0.8,
  },
  stepCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--fs-xs)',
    fontWeight: 700,
    background: 'var(--color-bg)',
    border: '2px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    flexShrink: 0,
  },
  stepCircleActive: {
    background: 'var(--color-frame)',
    borderColor: 'var(--color-frame)',
    color: 'white',
  },
  stepCircleCompleted: {
    background: 'var(--color-success)',
    borderColor: 'var(--color-success)',
    color: 'white',
  },
  stepLabel: {
    fontSize: 'var(--fs-xs)',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
  },
  stepContent: {
    minHeight: '400px',
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
  domainGrid: {
    maxWidth: '600px',
  },
  conceptDomain: {
    marginBottom: 'var(--sp-6)',
  },
  conceptDomainName: {
    fontSize: 'var(--fs-lg)',
    fontWeight: 600,
    marginBottom: 'var(--sp-3)',
  },
  conceptList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--sp-2)',
  },
  conceptItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--sp-3)',
    padding: 'var(--sp-3)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
  },
  conceptName: {
    fontWeight: 600,
    fontSize: 'var(--fs-sm)',
    minWidth: '120px',
  },
  conceptDesc: {
    flex: 1,
    fontSize: 'var(--fs-sm)',
    color: 'var(--color-text-muted)',
  },
  conceptRole: {
    fontSize: 'var(--fs-xs)',
    fontWeight: 700,
  },
  candidateList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--sp-3)',
    marginBottom: 'var(--sp-6)',
  },
  candidateCard: {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: 'var(--sp-4)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    color: 'var(--color-text)',
  },
  candidateSelected: {
    borderColor: 'var(--color-frame)',
    background: 'rgba(59, 130, 246, 0.08)',
  },
  candidateStatement: {
    fontSize: 'var(--fs-base)',
    fontWeight: 500,
    marginBottom: 'var(--sp-2)',
    lineHeight: 1.5,
  },
  candidateMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--sp-2)',
  },
  candidateRationale: {
    fontSize: 'var(--fs-xs)',
    color: 'var(--color-text-muted)',
  },
  customInvariantSection: {
    marginTop: 'var(--sp-4)',
  },
  fieldLabel: {
    display: 'block',
    fontSize: 'var(--fs-xs)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--sp-2)',
  },
  resultsStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--sp-6)',
  },
  loadingOverlay: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--sp-8)',
    gap: 'var(--sp-4)',
  },
  loadingText: {
    fontSize: 'var(--fs-sm)',
    color: 'var(--color-text-muted)',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--sp-6) 0 0',
    marginTop: 'var(--sp-6)',
    borderTop: '1px solid var(--color-border)',
  },
};
