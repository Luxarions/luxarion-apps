export type ActiveTab = 'viewport' | 'container' | 'security' | 'tests' | 'playground' | 'constants';

export interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  durationMs?: number;
  error?: string;
  logs?: string[];
}

export interface RegisteredService {
  name: string;
  lifetime: 'singleton' | 'factory' | 'transient' | 'instance' | 'alias';
  target?: string;
  resolved: boolean;
  isChild?: boolean;
}

export interface CodePreset {
  id: string;
  name: string;
  description: string;
  code: string;
}
