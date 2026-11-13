import { Problem } from '../../types/problem';

export const MODULE_2_PROBLEMS: Problem[] = [
  {
    id: 'm2-p1',
    moduleId: 'module-2',
    order: 1,
    title: 'Simulate a Markov Chain Walk for K Steps',
    difficulty: 'Easy',
    tags: ['Markov Chains', 'Random Walk', 'Simulation'],
    funcName: 'simulate_markov_walk',
    description: `A **discrete-time Markov chain** is defined by a set of states $S = \\{0, 1, \\dots, n-1\\}$ and a row-stochastic transition matrix $P \\in \\mathbb{R}^{n \\times n}$, where $P_{ij} = \\mathbb{P}(X_{t+1} = j \\mid X_t = i)$.

You are given:
- Transition matrix $P$.
- Starting state $s_0$.
- Step count $K$.
- A predefined list of pseudo-random uniform floats \`random_draws\` of length $K$, where each float $u \\in [0.0, 1.0)$.

Simulate the chain deterministically using the **Inverse Transform Sampling** rule:
At state $i$, with next state probabilities $P_{i0}, P_{i1}, \\dots, P_{i(n-1)}$, compute the cumulative distribution $C_{ik} = \\sum_{m=0}^k P_{im}$. Given random draw $u$, choose the smallest state $j$ such that $u < C_{ij}$.

Return the list of visited states of length $K + 1$: \`[s_0, s_1, s_2, \\dots, s_K]\`.`,
    mathematicalExplanation: `The Markov property states that the conditional probability distribution of future states depends solely on the current state:
$$\\mathbb{P}(X_{t+1} = j \\mid X_t = i, X_{t-1} = i_{t-1}, \\dots, X_0 = i_0) = \\mathbb{P}(X_{t+1} = j \\mid X_t = i) = P_{ij}$$
Inverse transform sampling partitions the interval $[0, 1)$ into disjoint intervals $I_j = [\\sum_{m=0}^{j-1} P_{im}, \\sum_{m=0}^j P_{im})$. Selecting $j$ such that $u \\in I_j$ generates state transitions conforming to distribution $P_{i\\cdot}$.`,
    chimeraContext: `Simulation-based random walks over knowledge graphs are used in Chimera for deep-walk embedding pre-training and empirical reachability sampling when exact power iteration is too costly.`,
    examples: [
      {
        input: 'P = [[0.0, 1.0], [0.5, 0.5]], s0 = 0, K = 3, random_draws = [0.2, 0.1, 0.8]',
        output: '[0, 1, 0, 1]',
        explanation: 'From state 0, P[0] = [0, 1]. Draw 0.2 selects state 1. From 1, P[1] = [0.5, 0.5]. Cumulative is [0.5, 1.0]. Draw 0.1 < 0.5 selects 0. From 0, draw 0.8 selects 1.'
      }
    ],
    constraints: [
      '2 <= n <= 50',
      '1 <= K <= 100',
      'len(random_draws) == K'
    ],
    expectedComplexity: {
      time: 'O(K \\cdot n)',
      space: 'O(K)'
    },
    starterCode: `def simulate_markov_walk(P: list[list[float]], s0: int, K: int, random_draws: list[float]) -> list[int]:
    """
    Simulates a Markov chain for K steps using inverse transform sampling.
    
    Args:
        P: n x n row-stochastic matrix.
        s0: Initial state ID.
        K: Number of transitions.
        random_draws: List of floats in [0, 1) of length K.
        
    Returns:
        List of state IDs of length K + 1 starting with s0.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def simulate_markov_walk(P: list[list[float]], s0: int, K: int, random_draws: list[float]) -> list[int]:
    path = [s0]
    curr = s0
    for step in range(K):
        u = random_draws[step]
        row = P[curr]
        cum = 0.0
        next_state = len(row) - 1
        for j, p in enumerate(row):
            cum += p
            if u < cum - 1e-9: # numerical safety
                next_state = j
                break
        path.append(next_state)
        curr = next_state
    return path
`,
    editorial: `### Algorithmic Approach

1. Initialize \`path = [s0]\` and \`curr = s0\`.
2. For each step $t \\in [0, K-1]$ with uniform draw $u$:
   - Compute running cumulative sum across the transition probabilities of row \`curr\`.
   - As soon as \`u < cumulative_sum\`, set \`next_state = j\` and break.
   - Append \`next_state\` to \`path\` and update \`curr = next_state\`.
3. Return \`path\` of length $K + 1$.`,
    hints: [
      'Cumulative distribution: for state row [0.2, 0.3, 0.5], cumulative thresholds are 0.2, 0.5, 1.0.',
      'Check if u < cum; the first index satisfying this condition is the chosen transition.',
      'Always append the current state to the path sequence.'
    ],
    testCases: [
      {
        inputs: [[[0.0, 1.0], [0.5, 0.5]], 0, 3, [0.2, 0.1, 0.8]],
        expected: [0, 1, 0, 1]
      },
      {
        inputs: [[[0.5, 0.5], [0.5, 0.5]], 1, 2, [0.1, 0.9]],
        expected: [1, 0, 1]
      },
      {
        inputs: [[[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]], 2, 2, [0.5, 0.5]],
        expected: [2, 2, 2]
      },
      {
        inputs: [[[0.0, 0.5, 0.5], [1.0, 0.0, 0.0], [0.5, 0.5, 0.0]], 0, 3, [0.3, 0.1, 0.8]],
        expected: [0, 1, 0, 2],
        hidden: true
      }
    ],
    defaultCustomInput: '[[0.0, 1.0], [0.5, 0.5]], 0, 3, [0.2, 0.1, 0.8]',
    suggestedVisualizer: 'markov-walk'
  },
  {
    id: 'm2-p2',
    moduleId: 'module-2',
    order: 2,
    title: 'Calculate Probability Distribution After K Transitions',
    difficulty: 'Easy',
    tags: ['Matrix Multiplication', 'State Distribution', 'Markov Chains'],
    funcName: 'dist_after_k_steps',
    description: `Given an initial probability row vector $p_0 \\in \\mathbb{R}^n$ (where $\\sum p_0[i] = 1.0$), an $n \\times n$ row-stochastic transition matrix $P$, and a non-negative integer $K$:

Compute the exact probability distribution vector $p_K$ after exactly $K$ state transitions:
$$p_K = p_0 P^K$$

Return $p_K$ as a list of floats of length $n$, rounded to 4 decimal places.`,
    mathematicalExplanation: `By the Chapman-Kolmogorov equations, the marginal state probability at step $t+1$ is given by:
$$p_{t+1}[j] = \\sum_{i=0}^{n-1} p_t[i] P_{ij} \\implies p_{t+1} = p_t P$$
Applying this recursively $K$ times yields:
$$p_K = p_0 P^K$$
For moderate $K$, iterative vector-matrix multiplication $p \\leftarrow p P$ achieves $O(K n^2)$ complexity without explicitly computing dense matrix powers.`,
    chimeraContext: `In Graph RAG, propagating probability from seed entities across $K$ hops is equivalent to computing $p_K$. $K=2$ or $K=3$ captures immediate and secondary relational context while avoiding topic drift.`,
    examples: [
      {
        input: 'p0 = [1.0, 0.0], P = [[0.5, 0.5], [0.2, 0.8]], K = 1',
        output: '[0.5, 0.5]',
        explanation: 'p1 = [1.0, 0.0] * P = [0.5, 0.5].'
      },
      {
        input: 'p0 = [1.0, 0.0], P = [[0.5, 0.5], [0.2, 0.8]], K = 2',
        output: '[0.35, 0.65]',
        explanation: 'p2 = [0.5, 0.5] * P = [0.5*0.5 + 0.5*0.2, 0.5*0.5 + 0.5*0.8] = [0.35, 0.65].'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      '0 <= K <= 500',
      'sum(p0) == 1.0',
      'P is strictly row-stochastic'
    ],
    expectedComplexity: {
      time: 'O(K \\cdot n^2)',
      space: 'O(n)'
    },
    starterCode: `def dist_after_k_steps(p0: list[float], P: list[list[float]], K: int) -> list[float]:
    """
    Computes p_K = p0 * (P^K).
    
    Args:
        p0: Initial probability distribution of length n.
        P: n x n transition matrix.
        K: Number of transitions.
        
    Returns:
        p_K as a list of floats rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def dist_after_k_steps(p0: list[float], P: list[list[float]], K: int) -> list[float]:
    n = len(p0)
    curr = list(p0)
    for _ in range(K):
        next_p = [0.0] * n
        for i in range(n):
            ci = curr[i]
            if ci == 0.0:
                continue
            for j in range(n):
                next_p[j] += ci * P[i][j]
        curr = next_p
    return [round(x, 4) for x in curr]
`,
    editorial: `### Algorithmic Approach

1. If $K == 0$, return $[\\text{round}(x, 4) \\text{ for } x \\in p_0]$.
2. Initialize \`curr = p0\`.
3. Loop $K$ times:
   - Compute \`next_p[j] = sum(curr[i] * P[i][j] for i in range(n))\`.
   - Update \`curr = next_p\`.
4. Return the rounded distribution vector. Time complexity is $O(K n^2)$, space is $O(n)$.`,
    hints: [
      'Iterate K times, each time computing new_p[j] = sum(p[i] * P[i][j]).',
      'Watch the order of multiplication: p is on the left, so column j of P receives from all rows i.',
      'Check edge case K = 0: return p0 directly.'
    ],
    testCases: [
      {
        inputs: [[1.0, 0.0], [[0.5, 0.5], [0.2, 0.8]], 1],
        expected: [0.5, 0.5]
      },
      {
        inputs: [[1.0, 0.0], [[0.5, 0.5], [0.2, 0.8]], 2],
        expected: [0.35, 0.65]
      },
      {
        inputs: [[0.5, 0.5], [[1.0, 0.0], [0.0, 1.0]], 10],
        expected: [0.5, 0.5]
      },
      {
        inputs: [[0.2, 0.5, 0.3], [[0.1, 0.9, 0.0], [0.0, 0.2, 0.8], [0.5, 0.0, 0.5]], 3],
        expected: [0.185, 0.334, 0.481],
        hidden: true
      }
    ],
    defaultCustomInput: '[1.0, 0.0], [[0.5, 0.5], [0.2, 0.8]], 2',
    suggestedVisualizer: 'stationary-plot'
  },
  {
    id: 'm2-p3',
    moduleId: 'module-2',
    order: 3,
    title: 'K-Step Transition Probability via Binary Exponentiation',
    difficulty: 'Medium',
    tags: ['Matrix Exponentiation', 'Divide and Conquer', 'Markov Chains'],
    funcName: 'k_step_transition_prob',
    description: `Given an $n \\times n$ transition matrix $P$, starting state $A$, destination state $B$, and a large integer $K$:

Find the exact transition probability $(P^K)_{AB}$ of moving from state $A$ to state $B$ in exactly $K$ steps.

Because $K$ can be as large as $10^9$, an $O(K)$ loop will result in a Time Limit Exceeded. You must implement **Binary Exponentiation (Repeated Squaring)** on matrices to compute $P^K$ in $O(n^3 \\log K)$ time.

Return the probability rounded to 4 decimal places.`,
    mathematicalExplanation: `Binary exponentiation exploits the property:
$$P^K = \\begin{cases} I & K = 0 \\\\ (P^{K/2})^2 & K \\text{ is even} \\\\ P \\cdot P^{K-1} & K \\text{ is odd} \\end{cases}$$
Matrix multiplication $C = A \\cdot B$ takes $O(n^3)$. With $\\lfloor \\log_2 K \\rfloor$ squarings, the total complexity is $O(n^3 \\log K)$, which comfortably handles $K = 10^9$.`,
    chimeraContext: `In asymptotic graph reachability analysis, computing $(P^K)_{AB}$ without simulating millions of steps enables rapid pre-filtering of candidate entity paths across distant knowledge graph clusters.`,
    examples: [
      {
        input: 'P = [[0.7, 0.3], [0.4, 0.6]], A = 0, B = 1, K = 2',
        output: '0.39',
        explanation: 'P^2 = [[0.61, 0.39], [0.52, 0.48]]. Probability from 0 to 1 in 2 steps is 0.39.'
      }
    ],
    constraints: [
      '1 <= n <= 30',
      '0 <= A, B < n',
      '0 <= K <= 10^9'
    ],
    expectedComplexity: {
      time: 'O(n^3 \\log K)',
      space: 'O(n^2)'
    },
    starterCode: `def k_step_transition_prob(P: list[list[float]], A: int, B: int, K: int) -> float:
    """
    Computes (P^K)[A][B] in O(n^3 log K) time using matrix exponentiation.
    
    Args:
        P: n x n transition matrix.
        A: Start state.
        B: Destination state.
        K: Step count (up to 10^9).
        
    Returns:
        Probability as float rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def k_step_transition_prob(P: list[list[float]], A: int, B: int, K: int) -> float:
    n = len(P)
    
    def mat_mul(X, Y):
        res = [[0.0 for _ in range(n)] for _ in range(n)]
        for i in range(n):
            for k in range(n):
                x_ik = X[i][k]
                if x_ik == 0.0:
                    continue
                for j in range(n):
                    res[i][j] += x_ik * Y[k][j]
        return res

    # Identity matrix
    res = [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]
    base = [row[:] for row in P]
    
    curr_k = K
    while curr_k > 0:
        if curr_k % 2 == 1:
            res = mat_mul(res, base)
        base = mat_mul(base, base)
        curr_k //= 2
        
    return round(res[A][B], 4)
`,
    editorial: `### Algorithmic Approach: Repeated Squaring

1. Write a helper function \`mat_mul(X, Y)\` that multiplies two $n \\times n$ matrices in $O(n^3)$ time.
2. Initialize \`res\` as the $n \\times n$ identity matrix $I$.
3. While $K > 0$:
   - If $K \\% 2 == 1$: multiply \`res = mat_mul(res, base)\`.
   - Square \`base = mat_mul(base, base)\`.
   - Integer divide $K //= 2$.
4. Return \`round(res[A][B], 4)\`.
5. Number of multiplications is at most $2 \\log_2 K$. For $K = 10^9$, $\\log_2 K \\approx 30$, requiring only $\\approx 60$ matrix multiplications.`,
    hints: [
      'Write a function to multiply two n x n matrices.',
      'Use the standard binary exponentiation algorithm: if K is odd, res = res * base; then base = base * base and K //= 2.',
      'Initialize res as the identity matrix (1 on the main diagonal, 0 elsewhere).'
    ],
    testCases: [
      {
        inputs: [[[0.7, 0.3], [0.4, 0.6]], 0, 1, 2],
        expected: 0.39
      },
      {
        inputs: [[[1.0, 0.0], [0.5, 0.5]], 1, 0, 1000000000],
        expected: 1.0
      },
      {
        inputs: [[[0.5, 0.5], [0.5, 0.5]], 0, 0, 50],
        expected: 0.5
      },
      {
        inputs: [[[0.1, 0.9], [0.8, 0.2]], 0, 0, 3],
        expected: 0.449,
        hidden: true
      }
    ],
    defaultCustomInput: '[[0.7, 0.3], [0.4, 0.6]], 0, 1, 2',
    suggestedVisualizer: 'matrix-heatmap'
  },
  {
    id: 'm2-p4',
    moduleId: 'module-2',
    order: 4,
    title: 'Numerical Detection of Stationary Distribution',
    difficulty: 'Medium',
    tags: ['Stationary Distribution', 'Power Method', 'Convergence'],
    funcName: 'find_stationary_numerical',
    description: `A probability distribution $\\pi \\in \\mathbb{R}^n$ is a **stationary distribution** (or steady-state distribution) of a Markov chain if:
$$\\pi P = \\pi \\quad \\text{and} \\quad \\sum_{i=0}^{n-1} \\pi_i = 1.0$$

Given an $n \\times n$ row-stochastic transition matrix $P$, starting distribution $p_0 = [\\frac{1}{n}, \\dots, \\frac{1}{n}]$, convergence tolerance $\\text{tol} = 10^{-6}$, and maximum iterations $\\text{max\\_iter} = 1000$:

Iteratively compute $p^{(t+1)} = p^{(t)} P$ until the $L_1$ norm difference satisfies:
$$\\|p^{(t+1)} - p^{(t)}\\|_1 = \\sum_{i=0}^{n-1} |p^{(t+1)}_i - p^{(t)}_i| < \\text{tol}$$

Return a tuple \`(pi, iterations)\`, where \`pi\` is the stationary distribution vector with values rounded to 4 decimal places, and \`iterations\` is the number of power iterations executed. If it fails to converge within \`max_iter\`, return \`(pi, -1)\`.`,
    mathematicalExplanation: `The stationary distribution $\\pi$ is the **left eigenvector** of $P$ corresponding to the dominant eigenvalue $\\lambda_1 = 1$.
The Perron-Frobenius theorem guarantees that for any irreducible and aperiodic Markov chain:
1. $\\lambda_1 = 1$ is simple (multiplicity 1).
2. The spectral radius $\\rho(P) = 1$.
3. All other eigenvalues satisfy $|\\lambda_i| < 1$.
4. The iterate $p^{(t)} = p_0 P^t$ converges geometrically at rate $O(|\\lambda_2|^t)$ to $\\pi$, independent of $p_0$.`,
    chimeraContext: `Personalized PageRank is essentially computing the stationary distribution of a modified Markov chain with teleportation. Understanding $L_1$ norm convergence is crucial for tuning early stopping in Chimera's retrieval latency budget.`,
    examples: [
      {
        input: 'P = [[0.7, 0.3], [0.4, 0.6]]',
        output: '([0.5714, 0.4286], 15)',
        explanation: 'Stationary distribution solves pi * P = pi, yielding pi = [4/7, 3/7] = [0.5714, 0.4286]. Converges in ~15 iterations.'
      }
    ],
    constraints: [
      '2 <= n <= 50',
      'P is row-stochastic'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot n^2)',
      space: 'O(n)'
    },
    starterCode: `def find_stationary_numerical(P: list[list[float]], tol: float = 1e-6, max_iter: int = 1000) -> tuple[list[float], int]:
    """
    Finds stationary distribution numerically using power iteration.
    
    Args:
        P: n x n row-stochastic matrix.
        tol: L1 convergence threshold.
        max_iter: Max iteration limit.
        
    Returns:
        (pi, iterations_count)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def find_stationary_numerical(P: list[list[float]], tol: float = 1e-6, max_iter: int = 1000) -> tuple[list[float], int]:
    n = len(P)
    p = [1.0 / n] * n
    
    for it in range(1, max_iter + 1):
        p_next = [0.0] * n
        for i in range(n):
            pi_val = p[i]
            if pi_val == 0.0:
                continue
            for j in range(n):
                p_next[j] += pi_val * P[i][j]
                
        # L1 norm difference
        l1_diff = sum(abs(p_next[i] - p[i]) for i in range(n))
        p = p_next
        if l1_diff < tol:
            return [round(x, 4) for x in p], it
            
    return [round(x, 4) for x in p], -1
`,
    editorial: `### Algorithmic Approach

1. Initialize probability vector $p = [1/n, 1/n, \\dots, 1/n]$.
2. In each iteration $t$:
   - Multiply $p_{next} = p P$.
   - Calculate $L_1$ distance: $\\text{diff} = \\sum_{i=0}^{n-1} |p_{next}[i] - p[i]|$.
   - If $\\text{diff} < \\text{tol}$, return $(\\text{round}(p_{next}), t)$.
   - Otherwise, update $p = p_{next}$.
3. If loop finishes without meeting tolerance, return $(\\text{round}(p), -1)$.`,
    hints: [
      'Initialize p = [1.0 / n] * n.',
      'Multiply p by P: next_p[j] = sum(p[i] * P[i][j]).',
      'Compute L1 norm: sum(abs(next_p[i] - p[i]) for i in range(n)). Stop when < tol.'
    ],
    testCases: [
      {
        inputs: [[[0.7, 0.3], [0.4, 0.6]]],
        expected: [[0.5714, 0.4286], 15]
      },
      {
        inputs: [[[0.5, 0.5], [0.5, 0.5]]],
        expected: [[0.5, 0.5], 2]
      },
      {
        inputs: [[[0.8, 0.2, 0.0], [0.3, 0.4, 0.3], [0.1, 0.2, 0.7]]],
        expected: [[0.5217, 0.2609, 0.2174], 30]
      }
    ],
    defaultCustomInput: '[[0.7, 0.3], [0.4, 0.6]]',
    suggestedVisualizer: 'stationary-plot'
  },
  {
    id: 'm2-p5',
    moduleId: 'module-2',
    order: 5,
    title: 'Exact Stationary Distribution via Linear Algebra',
    difficulty: 'Medium',
    tags: ['Linear Algebra', 'Linear Systems', 'NumPy'],
    funcName: 'solve_stationary_exact',
    description: `Rather than iterating until convergence, we can solve for the stationary distribution $\\pi$ directly by formulating a system of linear equations.

The condition $\\pi P = \\pi$ can be rewritten as:
$$\\pi (P - I) = \\mathbf{0}^T \\iff (P^T - I) \\pi^T = \\mathbf{0}$$
Since $(P^T - I)$ is singular (columns sum to 0), we replace the last row of the system with the normalization constraint $\\sum_{i=0}^{n-1} \\pi_i = 1.0$:
$$M \\pi^T = \\mathbf{b}$$
where $M$ is $(P^T - I)$ with the last row replaced by $[1, 1, \\dots, 1]$, and $\\mathbf{b} = [0, 0, \\dots, 0, 1]^T$.

Implement \`solve_stationary_exact\` using Python/NumPy to solve this linear system directly.
Return the distribution $\\pi$ as a list of floats rounded to 4 decimal places.`,
    mathematicalExplanation: `The stationary vector $\\pi$ is a normalized basis vector for the null space $\\text{null}(P^T - I)$.
Replacing the redundant equation with $\\mathbf{1}^T \\pi^T = 1$ creates an invertible $n \\times n$ matrix $M$:
$$M_{ij} = \\begin{cases} P_{ji} - \\delta_{ij} & i < n - 1 \\\\ 1 & i = n - 1 \\end{cases}, \\quad b_i = \\begin{cases} 0 & i < n - 1 \\\\ 1 & i = n - 1 \\end{cases}$$
Solving $M \\pi = b$ via Gaussian elimination or LU factorization takes $O(n^3)$ time and produces an exact analytical result.`,
    chimeraContext: `For small graph partitions or cluster centroids in Chimera, exact linear solving eliminates iteration overhead and precision drift.`,
    examples: [
      {
        input: 'P = [[0.7, 0.3], [0.4, 0.6]]',
        output: '[0.5714, 0.4286]',
        explanation: 'M = [[-0.3, 0.4], [1.0, 1.0]], b = [0.0, 1.0]. Solving gives pi = [4/7, 3/7] = [0.5714, 0.4286].'
      }
    ],
    constraints: [
      '2 <= n <= 50',
      'P is an irreducible Markov transition matrix'
    ],
    expectedComplexity: {
      time: 'O(n^3)',
      space: 'O(n^2)'
    },
    starterCode: `def solve_stationary_exact(P: list[list[float]]) -> list[float]:
    """
    Solves for exact stationary distribution pi by solving (P^T - I) * pi = 0 with sum(pi) = 1.
    
    Args:
        P: n x n row-stochastic matrix.
        
    Returns:
        pi as list of floats rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def solve_stationary_exact(P: list[list[float]]) -> list[float]:
    import numpy as np
    n = len(P)
    P_mat = np.array(P, dtype=float)
    
    # Form M = (P^T - I)
    M = P_mat.T - np.eye(n)
    
    # Replace last row with all ones
    M[-1, :] = 1.0
    
    # Target vector b = [0, 0, ..., 1]
    b = np.zeros(n, dtype=float)
    b[-1] = 1.0
    
    pi = np.linalg.solve(M, b)
    return [round(float(x), 4) for x in pi]
`,
    editorial: `### Algorithmic Approach

1. Form $M = P^T - I$. Notice that $P^T$ has column sums of $1$, so $P^T - I$ has column sums of $0$.
2. To enforce $\\sum \\pi_i = 1$, replace row $n-1$ of $M$ with all ones: \`M[-1, :] = 1.0\`.
3. Set right-hand side vector $b = [0, 0, \\dots, 0, 1]$.
4. Solve $M \\pi = b$ using \`numpy.linalg.solve(M, b)\`.
5. Round values to 4 decimal places and return as a Python list.`,
    hints: [
      'Use numpy: import numpy as np.',
      'Form M = np.array(P).T - np.eye(n).',
      'Replace M[-1, :] = 1.0 and set b = np.zeros(n); b[-1] = 1.0.',
      'Solve with np.linalg.solve(M, b).'
    ],
    testCases: [
      {
        inputs: [[[0.7, 0.3], [0.4, 0.6]]],
        expected: [0.5714, 0.4286]
      },
      {
        inputs: [[[0.5, 0.5], [0.5, 0.5]]],
        expected: [0.5, 0.5]
      },
      {
        inputs: [[[0.8, 0.2, 0.0], [0.3, 0.4, 0.3], [0.1, 0.2, 0.7]]],
        expected: [0.5217, 0.2609, 0.2174]
      },
      {
        inputs: [[[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]]],
        expected: [0.3333, 0.3333, 0.3333],
        hidden: true
      }
    ],
    defaultCustomInput: '[[0.7, 0.3], [0.4, 0.6]]',
    suggestedVisualizer: 'matrix-heatmap'
  },
  {
    id: 'm2-p6',
    moduleId: 'module-2',
    order: 6,
    title: 'Identify Periodic Markov Chains',
    difficulty: 'Hard',
    tags: ['Periodicity', 'GCD', 'Markov Theory'],
    funcName: 'is_periodic',
    description: `A state $i$ in a Markov chain has **period** $d(i)$:
$$d(i) = \\gcd \\{ k \\ge 1 \\mid (P^k)_{ii} > 0 \\}$$

- If $d(i) = 1$, state $i$ is **aperiodic**.
- If $d(i) > 1$, state $i$ is **periodic** with period $d(i)$.
In an irreducible Markov chain, all states have the same period. The entire chain is periodic if $d > 1$.

Given an irreducible $n \\times n$ transition matrix $P$:
Determine if the chain is periodic.
Return a tuple \`(is_periodic: bool, period: int)\`.`,
    mathematicalExplanation: `A chain is periodic if state visits can only recur at multiples of integer $d > 1$.
For instance, a bipartite graph with transitions alternating between sets $A$ and $B$ has period $d=2$: starting in $A$, returning to $A$ requires an even number of steps ($2, 4, 6, \\dots$).
Periodicity prevents convergence: the probability distribution $p^{(t)}$ oscillates indefinitely instead of converging to $\\pi$, which is why PageRank adds the teleportation factor $\\alpha < 1$ (introducing self-loops to guarantee aperiodicity).`,
    chimeraContext: `Knowledge graphs with alternating entity types (e.g. Entity $\\to$ Relation $\\to$ Entity) form bipartite or periodic structures. Recognizing periodicity explains why standard power iteration may oscillate without a damping factor.`,
    examples: [
      {
        input: 'P = [[0.0, 1.0], [1.0, 0.0]]',
        output: '(True, 2)',
        explanation: 'Starting at 0: 0 -> 1 -> 0 -> 1 -> 0. Returns to 0 only at steps 2, 4, 6... gcd(2, 4, ...) = 2. The chain is periodic with period 2.'
      },
      {
        input: 'P = [[0.5, 0.5], [0.2, 0.8]]',
        output: '(False, 1)',
        explanation: 'P[0][0] = 0.5 > 0, so 1 is in the return set. gcd(1, ...) = 1. Aperiodic.'
      }
    ],
    constraints: [
      '2 <= n <= 30',
      'P is irreducible row-stochastic matrix'
    ],
    expectedComplexity: {
      time: 'O(n^3 \\cdot \\text{limit})',
      space: 'O(n^2)'
    },
    starterCode: `def is_periodic(P: list[list[float]]) -> tuple[bool, int]:
    """
    Determines if an irreducible Markov chain is periodic and finds its period d.
    
    Args:
        P: n x n irreducible row-stochastic matrix.
        
    Returns:
        (is_periodic: bool, period: int)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def is_periodic(P: list[list[float]]) -> tuple[bool, int]:
    import math
    n = len(P)
    
    # In an irreducible chain, all states share the same period. We compute d for state 0.
    # Check powers P^k for k in 1..2*n
    def mat_mul(X, Y):
        res = [[0.0 for _ in range(n)] for _ in range(n)]
        for i in range(n):
            for k in range(n):
                if X[i][k] > 0:
                    for j in range(n):
                        res[i][j] += X[i][k] * Y[k][j]
        return res

    curr = [row[:] for row in P]
    return_steps = []
    
    for k in range(1, 2 * n + 1):
        if curr[0][0] > 1e-9:
            return_steps.append(k)
        curr = mat_mul(curr, P)
        
    if not return_steps:
        return False, 1
        
    d = return_steps[0]
    for step in return_steps[1:]:
        d = math.gcd(d, step)
        if d == 1:
            break
            
    return (d > 1, d)
`,
    editorial: `### Algorithmic Approach

1. For an irreducible chain, the period is identical for all states. We can analyze state $0$.
2. Compute powers $P^k$ for $k = 1, 2, \\dots, 2n$.
3. Collect all step counts $k$ where $(P^k)_{00} > 0$.
4. Compute the greatest common divisor $\\text{gcd}$ of these step counts: $d = \\gcd(k_1, k_2, \\dots)$.
5. If $d > 1$, the chain is periodic with period $d$. If $d = 1$, the chain is aperiodic.`,
    hints: [
      'Since the chain is irreducible, computing the period for state 0 is sufficient.',
      'Calculate matrix powers P, P^2, P^3 ... up to 2*n.',
      'Check if (P^k)[0][0] > 0, and compute the gcd of all such k.'
    ],
    testCases: [
      {
        inputs: [[[0.0, 1.0], [1.0, 0.0]]],
        expected: [true, 2]
      },
      {
        inputs: [[[0.5, 0.5], [0.2, 0.8]]],
        expected: [false, 1]
      },
      {
        inputs: [[[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]]],
        expected: [true, 3]
      },
      {
        inputs: [[[0.0, 1.0, 0.0], [0.5, 0.0, 0.5], [1.0, 0.0, 0.0]]],
        expected: [false, 1],
        hidden: true
      }
    ],
    defaultCustomInput: '[[0.0, 1.0], [1.0, 0.0]]',
    suggestedVisualizer: 'stationary-plot'
  },
  {
    id: 'm2-p7',
    moduleId: 'module-2',
    order: 7,
    title: 'Check Graph Irreducibility',
    difficulty: 'Medium',
    tags: ['Irreducibility', 'Graph Connectivity', 'Markov Theory'],
    funcName: 'is_irreducible',
    description: `A Markov chain is **irreducible** if every state can be reached from every other state in a finite number of transitions:
$$\\forall i, j \\in S, \\quad \\exists k \\ge 1 \\text{ such that } (P^k)_{ij} > 0$$

In graph terms, the state transition graph forms a **single strongly connected component** spanning all $n$ nodes.

Given an $n \\times n$ row-stochastic matrix $P$:
Return \`True\` if the Markov chain is irreducible, and \`False\` otherwise.`,
    mathematicalExplanation: `Irreducibility guarantees that the Markov chain does not break apart into independent sub-chains or have transient states that are deserted forever.
By the Perron-Frobenius theorem, irreducibility ensures a strictly positive stationary distribution $\\pi_i > 0$ for all $i$.
Computationally, this is equivalent to checking if all nodes belong to a single Strongly Connected Component ($|\\text{SCC}| == 1$).`,
    chimeraContext: `If a knowledge graph is reducible, a random walk will get trapped in absorbing clusters or never visit disconnected components. In Chimera, this justifies why Personalized PageRank incorporates a restart probability $(1 - \\alpha) > 0$.`,
    examples: [
      {
        input: 'P = [[0.0, 1.0], [1.0, 0.0]]',
        output: 'True',
        explanation: '0 reaches 1 and 1 reaches 0. Single SCC of size 2. Irreducible.'
      },
      {
        input: 'P = [[1.0, 0.0], [0.5, 0.5]]',
        output: 'False',
        explanation: 'State 0 is an absorbing state; from state 0 you can never reach state 1. Reducible.'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      'P is row-stochastic'
    ],
    expectedComplexity: {
      time: 'O(n^2)',
      space: 'O(n)'
    },
    starterCode: `def is_irreducible(P: list[list[float]]) -> bool:
    """
    Checks if a Markov chain transition matrix is irreducible.
    
    Args:
        P: n x n row-stochastic matrix.
        
    Returns:
        True if irreducible, False otherwise.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def is_irreducible(P: list[list[float]]) -> bool:
    n = len(P)
    if n <= 1:
        return True
        
    # Check if all nodes can reach each other:
    # 1. Check if node 0 can reach all other nodes (forward reachability)
    # 2. Check if all other nodes can reach node 0 (backward reachability)
    from collections import deque
    
    # Forward BFS from 0
    visited_fwd = set([0])
    q = deque([0])
    while q:
        curr = q.popleft()
        for j in range(n):
            if P[curr][j] > 0 and j not in visited_fwd:
                visited_fwd.add(j)
                q.append(j)
                
    if len(visited_fwd) != n:
        return False
        
    # Backward BFS to 0 (follow edges where P[j][curr] > 0)
    visited_bwd = set([0])
    q = deque([0])
    while q:
        curr = q.popleft()
        for i in range(n):
            if P[i][curr] > 0 and i not in visited_bwd:
                visited_bwd.add(i)
                q.append(i)
                
    return len(visited_bwd) == n
`,
    editorial: `### Algorithmic Approach

To check if a directed graph forms a single SCC:
1. Run a Forward BFS from node 0. If it cannot visit all $n$ nodes, the graph is not irreducible.
2. Run a Backward BFS to node 0 (reversing edge directions). If not all nodes can reach node 0, the graph is not irreducible.
3. If both forward and backward reachability encompass all $n$ nodes, then all nodes are mutually reachable.
4. Total time complexity is $O(n^2)$ (scanning the matrix rows and columns) with $O(n)$ space.`,
    hints: [
      'A graph is irreducible if and only if it forms a single strongly connected component.',
      'You only need to check two things: can node 0 reach everyone? And can everyone reach node 0?',
      'Use BFS for both checks.'
    ],
    testCases: [
      {
        inputs: [[[0.0, 1.0], [1.0, 0.0]]],
        expected: true
      },
      {
        inputs: [[[1.0, 0.0], [0.5, 0.5]]],
        expected: false
      },
      {
        inputs: [[[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]]],
        expected: true
      },
      {
        inputs: [[[0.5, 0.5, 0.0], [0.5, 0.5, 0.0], [0.0, 0.0, 1.0]]],
        expected: false,
        hidden: true
      }
    ],
    defaultCustomInput: '[[0.0, 1.0], [1.0, 0.0]]',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm2-p8',
    moduleId: 'module-2',
    order: 8,
    title: 'Stationary Distribution Non-Convergence Analysis',
    difficulty: 'Medium',
    tags: ['Convergence', 'Eigenvalues', 'Oscillation'],
    funcName: 'check_convergence_behavior',
    description: `A common misconception is that if a Markov chain possesses a stationary distribution $\\pi$, then the iterate $p^{(t)} = p_0 P^t$ will always converge to $\\pi$ from any initial distribution $p_0$.

This is **false** in two major cases:
1. **Periodic chains:** $p^{(t)}$ oscillates without converging (e.g. $[1, 0] P^t$ alternates between $[1, 0]$ and $[0, 1]$).
2. **Reducible chains:** Multiple stationary distributions exist, and the limit depends on the initial state $p_0$.

Given a transition matrix $P$:
Return a string classifying its convergence behavior from arbitrary initial distributions:
- \`"CONVERGENT"\`: Irreducible and aperiodic; converges to a unique stationary distribution from any $p_0$.
- \`"OSCILLATING"\`: Periodic; oscillates for at least one initial distribution.
- \`"REDUCIBLE"\`: Has multiple components or transient states; long-term behavior depends on initial state.`,
    mathematicalExplanation: `The Fundamental Theorem of Markov Chains states that $p_0 P^t \\to \\pi$ for all $p_0$ if and only if the chain is **both irreducible and aperiodic**.
- If reducible: the transition matrix has multiple communicating classes with eigenvalues equal to 1.
- If periodic: complex eigenvalues lie on the unit circle ($|\\lambda| = 1, \\lambda \\neq 1$), causing eternal phase oscillation.`,
    chimeraContext: `Explains the theoretical necessity of PageRank\'s damping factor: adding teleportation transforms any arbitrary graph into a strictly irreducible and aperiodic chain, ensuring guaranteed convergence.`,
    examples: [
      {
        input: 'P = [[0.7, 0.3], [0.4, 0.6]]',
        output: '"CONVERGENT"',
        explanation: 'Irreducible and aperiodic. Converges to [4/7, 3/7] from any starting state.'
      },
      {
        input: 'P = [[0.0, 1.0], [1.0, 0.0]]',
        output: '"OSCILLATING"',
        explanation: 'Irreducible but periodic with period 2. Starts oscillate between [1,0] and [0,1].'
      },
      {
        input: 'P = [[1.0, 0.0], [0.0, 1.0]]',
        output: '"REDUCIBLE"',
        explanation: 'Two disconnected absorbing states. Any distribution is stationary; depends on p0.'
      }
    ],
    constraints: [
      '2 <= n <= 30',
      'P is row-stochastic'
    ],
    expectedComplexity: {
      time: 'O(n^3)',
      space: 'O(n^2)'
    },
    starterCode: `def check_convergence_behavior(P: list[list[float]]) -> str:
    """
    Classifies convergence behavior: 'CONVERGENT', 'OSCILLATING', or 'REDUCIBLE'.
    
    Args:
        P: n x n row-stochastic matrix.
        
    Returns:
        One of 'CONVERGENT', 'OSCILLATING', 'REDUCIBLE'.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def check_convergence_behavior(P: list[list[float]]) -> str:
    import math
    from collections import deque
    n = len(P)
    
    # 1. Check irreducibility
    # Check forward from 0
    visited_fwd = set([0])
    q = deque([0])
    while q:
        curr = q.popleft()
        for j in range(n):
            if P[curr][j] > 0 and j not in visited_fwd:
                visited_fwd.add(j)
                q.append(j)
    if len(visited_fwd) != n:
        return "REDUCIBLE"
        
    visited_bwd = set([0])
    q = deque([0])
    while q:
        curr = q.popleft()
        for i in range(n):
            if P[i][curr] > 0 and i not in visited_bwd:
                visited_bwd.add(i)
                q.append(i)
    if len(visited_bwd) != n:
        return "REDUCIBLE"
        
    # 2. Check periodicity
    def mat_mul(X, Y):
        res = [[0.0 for _ in range(n)] for _ in range(n)]
        for i in range(n):
            for k in range(n):
                if X[i][k] > 0:
                    for j in range(n):
                        res[i][j] += X[i][k] * Y[k][j]
        return res

    curr = [row[:] for row in P]
    return_steps = []
    for k in range(1, 2 * n + 1):
        if curr[0][0] > 1e-9:
            return_steps.append(k)
        curr = mat_mul(curr, P)
        
    if not return_steps:
        return "OSCILLATING"
        
    d = return_steps[0]
    for step in return_steps[1:]:
        d = math.gcd(d, step)
        if d == 1:
            break
            
    if d > 1:
        return "OSCILLATING"
        
    return "CONVERGENT"
`,
    editorial: `### Algorithmic Approach

1. First, test for **irreducibility**:
   - Run forward and backward reachability from state 0.
   - If either fails to visit all $n$ nodes, the chain is not a single SCC $\\to$ return \`"REDUCIBLE"\`.
2. Second, test for **periodicity**:
   - Compute matrix powers up to $2n$ and find the GCD of return steps $(P^k)_{00} > 0$.
   - If $d > 1$, the chain is periodic $\\to$ return \`"OSCILLATING"\`.
3. If the chain is both irreducible and aperiodic $\\to$ return \`"CONVERGENT"\`.`,
    hints: [
      'Check if the graph is irreducible first. If not, return "REDUCIBLE".',
      'If irreducible, calculate the period d of state 0.',
      'If d > 1, return "OSCILLATING", otherwise return "CONVERGENT".'
    ],
    testCases: [
      {
        inputs: [[[0.7, 0.3], [0.4, 0.6]]],
        expected: 'CONVERGENT'
      },
      {
        inputs: [[[0.0, 1.0], [1.0, 0.0]]],
        expected: 'OSCILLATING'
      },
      {
        inputs: [[[1.0, 0.0], [0.0, 1.0]]],
        expected: 'REDUCIBLE'
      },
      {
        inputs: [[[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]]],
        expected: 'OSCILLATING',
        hidden: true
      }
    ],
    defaultCustomInput: '[[0.7, 0.3], [0.4, 0.6]]',
    suggestedVisualizer: 'stationary-plot'
  },
  {
    id: 'm2-p9',
    moduleId: 'module-2',
    order: 9,
    title: 'Empirical Visit Frequencies vs Theoretical Stationary Probabilities',
    difficulty: 'Easy',
    tags: ['Simulation', 'Total Variation Distance', 'Statistics'],
    funcName: 'compare_empirical_stationary',
    description: `The Ergodic Theorem states that for an ergodic Markov chain, the long-run fraction of time spent in state $i$ converges almost surely to its theoretical stationary probability $\\pi_i$:
$$\\lim_{N \\to \\infty} \\frac{1}{N} \\sum_{t=1}^N \\mathbb{I}(X_t = i) = \\pi_i$$

Given a simulated state trajectory \`walk\` of $N$ states (e.g. $[0, 1, 0, 1, 2, \\dots]$) and the theoretical stationary distribution $\\pi$ of length $n$:
1. Compute the **empirical visit frequency** $f_i = \\frac{\\text{count}(i)}{N}$ for each state $i \\in [0, n-1]$.
2. Compute the **Total Variation Distance (TVD)** between empirical distribution $f$ and theoretical $\\pi$:
   $$\\text{TVD}(f, \\pi) = \\frac{1}{2} \\sum_{i=0}^{n-1} |f_i - \\pi_i|$$

Return a tuple \`(empirical_frequencies, round(tvd, 4))\`.`,
    mathematicalExplanation: `Total Variation Distance measures the maximum difference in probability that the two distributions can assign to any event $A \\subseteq S$:
$$\\text{TVD}(f, \\pi) = \\sup_{A \\subseteq S} |f(A) - \\pi(A)| = \\frac{1}{2} \\|f - \\pi\\|_1$$
As the walk length $N$ increases, the Central Limit Theorem for Markov chains dictates that $\\text{TVD}(f, \\pi)$ decays as $O(1/\\sqrt{N})$.`,
    chimeraContext: `Validates simulation accuracy when running Monte-Carlo random walks for graph sampling versus closed-form linear algebra solutions in Chimera.`,
    examples: [
      {
        input: 'walk = [0, 1, 0, 1], pi = [0.5, 0.5]',
        output: '([0.5, 0.5], 0.0)',
        explanation: 'State 0 visited 2 times (2/4 = 0.5), state 1 visited 2 times (0.5). TVD = 0.5 * (|0.5 - 0.5| + |0.5 - 0.5|) = 0.0.'
      }
    ],
    constraints: [
      '2 <= n <= 50',
      '1 <= len(walk) <= 10000',
      'len(pi) == n'
    ],
    expectedComplexity: {
      time: 'O(|walk| + n)',
      space: 'O(n)'
    },
    starterCode: `def compare_empirical_stationary(walk: list[int], pi: list[float]) -> tuple[list[float], float]:
    """
    Computes empirical state frequencies and TVD against theoretical stationary distribution.
    
    Args:
        walk: List of visited state IDs.
        pi: Theoretical stationary distribution of length n.
        
    Returns:
        (empirical_frequencies, tvd)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def compare_empirical_stationary(walk: list[int], pi: list[float]) -> tuple[list[float], float]:
    n = len(pi)
    total_steps = len(walk)
    counts = [0] * n
    for state in walk:
        if 0 <= state < n:
            counts[state] += 1
            
    f = [round(c / total_steps, 4) for c in counts]
    tvd = 0.5 * sum(abs(f[i] - pi[i]) for i in range(n))
    return f, round(tvd, 4)
`,
    editorial: `### Algorithmic Approach

1. Count occurrences of each state $i \\in [0, n-1]$ in the trajectory.
2. Divide each count by the length of the walk $N$ to obtain $f_i$.
3. Compute the Total Variation Distance: $\\text{TVD} = 0.5 \\times \\sum_{i=0}^{n-1} |f_i - \\pi_i|$.
4. Return \`(f, round(tvd, 4))\`.`,
    hints: [
      'Count occurrences using an array counts = [0] * n.',
      'Empirical frequency is count / len(walk).',
      'Total Variation Distance is 0.5 * sum(abs(f[i] - pi[i])).'
    ],
    testCases: [
      {
        inputs: [[0, 1, 0, 1], [0.5, 0.5]],
        expected: [[0.5, 0.5], 0.0]
      },
      {
        inputs: [[0, 0, 0, 1], [0.5, 0.5]],
        expected: [[0.75, 0.25], 0.25]
      },
      {
        inputs: [[0, 1, 2, 0, 1, 2], [0.3333, 0.3333, 0.3334]],
        expected: [[0.3333, 0.3333, 0.3333], 0.0001]
      }
    ],
    defaultCustomInput: '[0, 1, 0, 1], [0.5, 0.5]',
    suggestedVisualizer: 'markov-walk'
  }
];
