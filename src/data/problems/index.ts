import { Problem } from '../../types/problem';
import { MODULE_1_PROBLEMS } from './module1';
import { MODULE_2_PROBLEMS } from './module2';
import { MODULE_3_PROBLEMS } from './module3';
import { MODULE_4_PROBLEMS } from './module4';
import { MODULE_5_PROBLEMS } from './module5';
import { MODULE_6_PROBLEMS } from './module6';
import { MODULE_7_PROBLEMS } from './module7';
import { MODULE_8_PROBLEMS } from './module8';
import { MODULE_9_PROBLEMS } from './module9';
import { MODULE_10_PROBLEMS } from './module10';
import { CHIMERA_LAB_PROBLEMS } from './chimeraLab';

export const ALL_PROBLEMS: Problem[] = [
  ...MODULE_1_PROBLEMS,
  ...MODULE_2_PROBLEMS,
  ...MODULE_3_PROBLEMS,
  ...MODULE_4_PROBLEMS,
  ...MODULE_5_PROBLEMS,
  ...MODULE_6_PROBLEMS,
  ...MODULE_7_PROBLEMS,
  ...MODULE_8_PROBLEMS,
  ...MODULE_9_PROBLEMS,
  ...MODULE_10_PROBLEMS,
  ...CHIMERA_LAB_PROBLEMS,
];

export const PROBLEM_MAP: Record<string, Problem> = ALL_PROBLEMS.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {} as Record<string, Problem>);

export const PROBLEMS_BY_MODULE: Record<string, Problem[]> = ALL_PROBLEMS.reduce((acc, p) => {
  if (!acc[p.moduleId]) {
    acc[p.moduleId] = [];
  }
  acc[p.moduleId].push(p);
  return acc;
}, {} as Record<string, Problem[]>);

export function getProblemById(id: string): Problem | undefined {
  return PROBLEM_MAP[id];
}

export function getNextProblem(currentId: string): Problem | undefined {
  const current = PROBLEM_MAP[currentId];
  if (!current) return undefined;
  const moduleProblems = PROBLEMS_BY_MODULE[current.moduleId] || [];
  const currentIndex = moduleProblems.findIndex(p => p.id === currentId);
  if (currentIndex >= 0 && currentIndex < moduleProblems.length - 1) {
    return moduleProblems[currentIndex + 1];
  }
  // Try first problem of next module
  const allProblems = ALL_PROBLEMS;
  const overallIndex = allProblems.findIndex(p => p.id === currentId);
  if (overallIndex >= 0 && overallIndex < allProblems.length - 1) {
    return allProblems[overallIndex + 1];
  }
  return undefined;
}

export function getPrevProblem(currentId: string): Problem | undefined {
  const allProblems = ALL_PROBLEMS;
  const overallIndex = allProblems.findIndex(p => p.id === currentId);
  if (overallIndex > 0) {
    return allProblems[overallIndex - 1];
  }
  return undefined;
}
