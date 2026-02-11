import type { PipelineStep, PipelineResult } from './engine.types.js';

export type ModeType = 'guided' | 'expert' | 'audit';

export interface SessionState {
  mode: ModeType;
  selectedDomains: string[];
  currentStep: number;
  steps: PipelineStep[];
  result: PipelineResult | null;
  error: string | null;
}

export interface Session {
  id: string;
  createdAt: string;
  state: SessionState;
}
