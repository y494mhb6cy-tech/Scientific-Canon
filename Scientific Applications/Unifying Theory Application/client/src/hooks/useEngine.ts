import { useState, useCallback } from 'react';
import {
  runPipeline,
  runStep,
  auditValidate,
  type PipelineResult,
  type PipelineStep,
  type DriftReport,
  type TriadicMapping,
  type InvariantCandidate,
} from '../api/client';
import { useSession } from './useSession';

export interface AuditResult {
  driftReport: DriftReport;
  mappings: TriadicMapping[];
  invariant: InvariantCandidate;
}

export function useEngine() {
  const { sessionId } = useSession();
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [stepResult, setStepResult] = useState<PipelineStep | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runFullPipeline = useCallback(
    async (domainIds: string[], userInvariant?: string) => {
      if (!sessionId) {
        setError('No active session');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await runPipeline({ sessionId, domainIds, userInvariant });
        setResult(res.result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Pipeline failed');
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  const runPipelineStep = useCallback(
    async (step: string, data?: unknown) => {
      if (!sessionId) {
        setError('No active session');
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await runStep({ sessionId, step, data });
        setStepResult(res.step);
        return res.step;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Step failed');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  const auditText = useCallback(
    async (text: string) => {
      if (!sessionId) {
        setError('No active session');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await auditValidate({ sessionId, text });
        setAuditResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Audit failed');
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  const clearResults = useCallback(() => {
    setResult(null);
    setStepResult(null);
    setAuditResult(null);
    setError(null);
  }, []);

  return {
    result,
    stepResult,
    auditResult,
    loading,
    error,
    runFullPipeline,
    runPipelineStep,
    auditText,
    clearResults,
  };
}
