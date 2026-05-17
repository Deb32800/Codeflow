/**
 * @file types.ts
 * @description Shared TypeScript interfaces and types for the entire CodeFlow
 *              application. Organized into logical sections: file handling,
 *              visualization nodes, documentation models, algorithm data,
 *              API configuration, and chat interfaces.
 */

import { Edge, Node } from 'reactflow';

// =============================================================================
// FILE HANDLING
// =============================================================================

/**
 * Represents a single file or folder extracted from a ZIP archive.
 * Used to build the project explorer tree and to feed source code into AI.
 */
export interface FileNode {
  /** Display name (basename) of the file or folder */
  name: string;
  /** Full relative path within the ZIP archive */
  path: string;
  /** Whether this node represents a directory */
  isFolder: boolean;
  /** Raw source code content (only populated for recognized code files) */
  content?: string;
  /** Child nodes if this is a folder */
  children?: FileNode[];
}

// =============================================================================
// VISUALIZATION MODES
// =============================================================================

/**
 * The four main visualization modes the user can switch between.
 * - report:    Auto-generated documentation book view
 * - flowchart: High-level architecture / logical flow diagram
 * - mindmap:   Deep hierarchical tree (File → Class → Function → Logic)
 * - algo-tree: Algorithm visualizer graph rendering mode
 */
export type VisualizationMode = 'report' | 'flowchart' | 'mindmap' | 'algo-tree';

// =============================================================================
// API CONFIGURATION
// =============================================================================

/** User-configurable API settings for AI model access */
export interface ApiConfig {
  /** Which AI provider to use */
  provider: 'google' | 'openrouter';
  /** The API key for the selected provider */
  apiKey: string;
  /** The model identifier (e.g. 'gemini-3-pro-preview') */
  model: string;
}

// =============================================================================
// VISUALIZATION NODE DATA
// =============================================================================

/**
 * Extended data payload attached to every React Flow node.
 * Contains display properties, semantic type info, hierarchy pointers,
 * and callback handlers for interactivity.
 */
export interface NodeData {
  /** Display label rendered inside the node */
  label: string;

  /**
   * Semantic type — determines the node's visual appearance.
   * Covers project viz types, logic tree types, and architecture types.
   */
  type?: 'entry' | 'process' | 'decision' | 'output' | 'component' | 'hook' | 'cluster' | 'database' | 'file' | 'class' | 'function' | 'interface' |
         'logic-if' | 'logic-loop' | 'logic-action' | 'logic-return' |
         'arch-client' | 'arch-server' | 'arch-db' | 'arch-service' | 'arch-external' |
         'arch-start' | 'arch-process' | 'arch-decision' | 'arch-end' |
         'gridNode' | 'dsNode' | 'chartNode';

  /** Additional text details shown below the label */
  details?: string[];
  /** Raw code snippet associated with this node */
  code?: string;
  /** Visual state used by the algorithm visualizer for highlighting */
  status?: 'active' | 'inactive' | 'dimmed' | 'highlighted' | 'visited' | 'frontier' | 'path';

  /** Function parameter signature string */
  params?: string;
  /** Function return type string */
  returnType?: string;
  /** Estimated complexity level */
  complexity?: string;

  // ── Hierarchy / Expand-Collapse ──
  /** ID of this node's parent (for mindmap tree relationships) */
  parentId?: string;
  /** IDs of this node's direct children */
  childIds?: string[];
  /** Whether this node's children are currently hidden */
  isCollapsed?: boolean;
  /** Whether this node has expandable children */
  hasChildren?: boolean;

  /** Data flow inputs */
  inputs?: string[];
  /** Data flow outputs */
  outputs?: string[];

  /** Hierarchical rank for layout ordering */
  rank?: number;
  /** Which visualization mode this node belongs to */
  mode?: VisualizationMode;
  /** Optional theme accent color */
  themeColor?: string;

  // ── Algorithm Visualizer Fields ──
  /** Current animation frame snapshot for algorithm viz */
  frame?: AlgoFrame;
  /** Distance label for Dijkstra / Prim algorithms */
  distance?: number | string;
  /** Heuristic score for A* algorithm */
  hScore?: number;

  // ── Callbacks ──
  /** Handler invoked when user clicks "Explain" on a code snippet */
  onExplain?: (code: string, label: string) => void;
  /** Handler invoked when user expands/collapses a node */
  onExpand?: (nodeId: string, isCollapsed: boolean) => void;
}

// =============================================================================
// ARCHITECTURE DIAGRAM
// =============================================================================

/** A single node in the AI-generated architecture diagram */
export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'client' | 'server' | 'database' | 'service' | 'external' | 'start' | 'process' | 'decision' | 'end';
  description: string;
}

/** A directed edge in the architecture diagram */
export interface ArchitectureEdge {
  source: string;
  target: string;
  label?: string;
}

// =============================================================================
// FLOWCHART DATA (Top-Level AI Output)
// =============================================================================

/**
 * Complete visualization payload returned by the AI analysis pipeline.
 * Contains React Flow nodes/edges plus optional documentation and architecture.
 */
export interface FlowchartData {
  /** Human-readable project title */
  title?: string;
  /** Brief project summary */
  summary?: string;
  /** Detected technology stack tags */
  techStack?: string[];
  /** Highlighted key features */
  keyFeatures?: string[];
  /** React Flow node list */
  nodes: Node<NodeData>[];
  /** React Flow edge list */
  edges: Edge[];
  /** Auto-generated documentation book */
  documentation?: DocBook;
  /** AI-synthesized high-level architecture diagram */
  architecture?: {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
  };
}

// =============================================================================
// DOCUMENTATION MODEL
// =============================================================================

/** A full documentation book — the top-level container */
export interface DocBook {
  title: string;
  chapters: DocChapter[];
}

/** One chapter = one source file analyzed by the AI */
export interface DocChapter {
  /** Unique identifier (typically the file path) */
  id: string;
  /** Display title (typically the filename) */
  title: string;
  /** Full file path within the project */
  path: string;
  /** AI-generated summary of the file's purpose */
  summary: string;
  /** Categorization of the file's role */
  type: 'module' | 'component' | 'service' | 'util' | 'config';
  /** Classes discovered in this file */
  classes: DocClass[];
  /** Standalone functions discovered in this file */
  functions: DocFunction[];
  /** Import/dependency paths */
  dependencies: string[];
}

/** A class definition extracted from source code */
export interface DocClass {
  name: string;
  description: string;
  methods: DocFunction[];
}

/** A single step in a function's internal logic tree */
export interface LogicBlock {
  type: 'if' | 'loop' | 'action' | 'return' | 'error';
  /** The condition or action description */
  content: string;
  /** Nested logic blocks (e.g. inside an if-block body) */
  children?: LogicBlock[];
}

/** A function or method definition with AI-analyzed metadata */
export interface DocFunction {
  name: string;
  params: string;
  returnType: string;
  description: string;
  codeSnippet: string;
  complexity?: 'Low' | 'Medium' | 'High';
  /** Internal logic breakdown as a tree of steps */
  logic?: LogicBlock[];
}

// =============================================================================
// ANALYSIS STATE MACHINE
// =============================================================================

/** Tracks the current state of the AI analysis pipeline */
export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'success' | 'error' | 'quota_exceeded';
  /** Human-readable progress message during analysis */
  progress?: string;
  /** Error message if status is 'error' */
  error?: string;
}

// =============================================================================
// ALGORITHM VISUALIZER
// =============================================================================

/** Supported algorithm categories */
export type AlgoCategory = 'Sorting' | 'Searching' | 'Graph' | 'Tree' | 'DP' | 'Backtracking';

/** Multi-language code snippets for an algorithm */
export interface CodeSnippets {
  js: string;
  py: string;
  cpp: string;
}

/** Full algorithm definition including metadata and visualizer code */
export interface Algorithm {
  id: string;
  name: string;
  category: AlgoCategory;
  description: string;
  /** Educational content shown in the "Learn More" modal */
  learnMore: {
    definition: string;
    howItWorks: string[];
    realWorldUses: string[];
  };
  /** Big-O complexity details */
  complexityDetails: {
    timeBest: string;
    timeAvg: string;
    timeWorst: string;
    space: string;
  };
  /** Source code implementations in JS, Python, and C++ */
  code: CodeSnippets;
}

/** A single item in a sorting/searching array visualization */
export interface AlgoItem {
  /** Unique ID for React key tracking and framer-motion layout animations */
  id: string;
  /** Numeric value represented by this item */
  val: number;
}

/** A single cell in a 2D grid visualization (DP tables, mazes, N-Queens) */
export interface GridCell {
  row: number;
  col: number;
  val: number | string;
  isHighlight?: boolean;
  isActive?: boolean;
  isTarget?: boolean;
  /** Whether this cell is an impassable wall (for maze algorithms) */
  isWall?: boolean;
}

/**
 * A single animation frame in the algorithm visualizer.
 * Each frame captures a snapshot of the algorithm's state at one step.
 */
export interface AlgoFrame {
  /** Array state for sorting/searching visualizations */
  array?: AlgoItem[];

  /** 2D grid state for DP / backtracking visualizations */
  grid?: GridCell[][];
  rowLabels?: string[];
  colLabels?: string[];

  /** Indices of elements currently being compared */
  highlights?: number[];
  /** Pair of indices being swapped */
  swaps?: [number, number];
  /** Indices of already-sorted (dimmed) elements */
  dimmed?: number[];
  /** Indices of pivot elements */
  pivots?: number[];

  /** Graph nodes for graph/tree algorithm visualizations */
  graphNodes?: Node<NodeData>[];
  /** Graph edges for graph/tree algorithm visualizations */
  graphEdges?: Edge[];
  /** Node IDs that have been fully visited */
  visitedNodes?: string[];
  /** Node IDs in the frontier (to-be-explored) set */
  frontierNodes?: string[];
  /** Edge IDs that belong to the final shortest path */
  pathEdges?: string[];

  /** ID of the currently active/processing node */
  currentNode?: string;
  /** Which visual renderer to use for this frame */
  visualType?: 'array' | 'graph' | 'tree' | 'grid' | 'board' | 'stack' | 'queue';

  /** Named pointer labels (e.g. { 0: "L", 5: "R", 2: "Mid" }) */
  pointers?: { [index: number]: string };
  /** Human-readable description of what's happening in this step */
  description: string;

  // ── Educational Overlay Fields ──
  /** High-level goal for the current step */
  goal?: string;
  /** Result or outcome of this step */
  result?: string;

  // ── Code Sync ──
  /** 1-based line number to highlight in the code inspector */
  codeLine?: number;
}

// =============================================================================
// CHAT INTERFACES
// =============================================================================

/** A single message in the AI tutor chat panel */
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// =============================================================================
// OPENROUTER MODEL METADATA
// =============================================================================

/** Metadata for an OpenRouter model option */
export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture?: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
}