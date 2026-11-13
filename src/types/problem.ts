export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  inputs: any[];
  expected: any;
  hidden?: boolean;
  description?: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface ExpectedComplexity {
  time: string;
  space: string;
}

export interface Problem {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  funcName: string;
  description: string;
  mathematicalExplanation: string;
  chimeraContext: string;
  examples: Example[];
  constraints: string[];
  expectedComplexity: ExpectedComplexity;
  starterCode: string;
  referenceSolution: string;
  editorial: string;
  hints: string[];
  testCases: TestCase[];
  defaultCustomInput: string;
  suggestedVisualizer?: string;
}

export interface ModuleInfo {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  chimeraRole: string;
  topics: string[];
  prerequisites?: string[];
  badgeColor: string;
  iconName: string;
}
