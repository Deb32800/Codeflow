/**
 * @file constants.ts
 * @description Centralized application constants. Stores AI model identifiers,
 *              supported file extensions, layout dimensions, and color palette
 *              tokens used across the entire CodeFlow application.
 */

// ─── AI Model Configuration ─────────────────────────────────────────────────
/** Fast Gemini model — used for quick, low-latency tasks */
export const GEMINI_MODEL_FAST = 'gemini-2.5-flash';

/** Smart Gemini model — used for deep code analysis requiring higher quality */
export const GEMINI_MODEL_SMART = 'gemini-3-pro-preview';

// ─── File Handling ───────────────────────────────────────────────────────────
/** File extensions that CodeFlow recognizes as analyzable source code */
export const SUPPORTED_EXTENSIONS = [
  'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'go', 'rs', 'php', 'rb', 'html', 'css', 'json'
];

/** Maximum file size (in characters) to send to the AI for analysis */
export const MAX_FILE_SIZE_FOR_ANALYSIS = 50000;

// ─── Visualization Layout ────────────────────────────────────────────────────
/** Default width (px) for flowchart nodes used by the dagre layout engine */
export const NODE_WIDTH = 260;

/** Default height (px) for flowchart nodes used by the dagre layout engine */
export const NODE_HEIGHT = 120;

/** Minimum children count before nodes are grouped into a cluster */
export const CLUSTER_THRESHOLD = 5;

/** Presets for different visualization detail levels */
export const VIEW_MODE_CONFIG = {
  minimal:  { showFunctions: false, showLabels: false, maxNodes: 15 },
  balanced: { showFunctions: true,  showLabels: true,  maxNodes: 40 },
  detailed: { showFunctions: true,  showLabels: true,  maxNodes: 200 }
};

// ─── OpenRouter Fallback Models ──────────────────────────────────────────────
/** Fallback model list used when the OpenRouter API fetch fails */
export const OPENROUTER_MODELS = [
  { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1 Chimera', desc: 'Free Tier' },
];

// ─── Color Palette (Comic / Pastel Theme) ────────────────────────────────────
/** Semantic color tokens mapped to node types in the flowchart visualization */
export const COLORS = {
  entry:     '#bef264',  // Lime   — entry point nodes
  process:   '#bae6fd',  // Sky    — process / action nodes
  decision:  '#fbcfe8',  // Pink   — decision / branching nodes
  output:    '#fde68a',  // Yellow — output / result nodes
  component: '#ddd6fe',  // Violet — UI component nodes
  cluster:   '#e2e8f0',  // Slate  — grouping cluster nodes
  root:      '#ffffff'   // White  — root node in mindmap mode
};