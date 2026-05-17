/**
 * @file services/geminiService.ts
 * @description Core AI service layer. Provides a unified `callAI()` wrapper
 *              that transparently switches between Google's Gemini SDK and
 *              OpenRouter's REST API based on the user's API configuration.
 *
 *              Exports two main functions:
 *              - `generateProjectFlowchart()` — full project analysis pipeline
 *              - `explainCodeSnippet()` — single snippet explanation for chat
 */

import { GoogleGenAI } from '@google/genai';
import { FlowchartData, DocBook, DocChapter, ApiConfig, ArchitectureNode, ArchitectureEdge } from '../types';
import { GEMINI_MODEL_SMART } from '../constants';

// Default API key injected at build time via Vite's `define` config
const defaultApiKey = process.env.API_KEY || '';

// Lazily initialized Google GenAI client (only created when first needed)
let googleAi: GoogleGenAI | null = null;

// ─── Utility: Clean Raw AI Response ──────────────────────────────────────────

/**
 * Sanitizes raw AI text output so it can be safely parsed as JSON.
 * Handles:
 *   1. DeepSeek R1 `<think>...</think>` reasoning blocks
 *   2. Markdown code fences (```json ... ```)
 *   3. Trailing commas that break JSON.parse()
 */
const cleanJson = (text: string): string => {
    // 1. Remove <think>...</think> blocks common in DeepSeek R1 models
    let clean = text.replace(/<think>[\s\S]*?<\/think>/g, '');

    // 2. Remove Markdown code blocks
    clean = clean.replace(/```json\n/g, '').replace(/```/g, '');

    // 3. Fix trailing commas (basic heuristic)
    clean = clean.replace(/,(\s*[\}\]])/g, '$1');

    return clean.trim();
};

// ─── Utility: Extract Import Statements ──────────────────────────────────────

/**
 * Statically extracts import paths from source code to build the
 * dependency graph before any AI calls are made.
 *
 * @param content - Raw source code string
 * @param lang    - File extension (e.g. 'ts', 'py')
 * @returns Array of import path strings
 */
const getImports = (content: string, lang: string): string[] => {
    const imports: Set<string> = new Set();

    // JavaScript / TypeScript ES module imports
    if (['ts', 'tsx', 'js', 'jsx'].includes(lang)) {
        const regex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            imports.add(match[1]);
        }
    }

    // Python imports
    if (lang === 'py') {
        const regex = /^(?:from|import)\s+(\S+)/gm;
        let match;
        while ((match = regex.exec(content)) !== null) {
            imports.add(match[1]);
        }
    }

    return Array.from(imports);
};

// ─── Core AI Call Wrapper ────────────────────────────────────────────────────

/**
 * Unified AI call function that routes to either the Google Gemini SDK
 * or the OpenRouter REST API based on the user's configuration.
 *
 * Handles quota/rate-limit errors by tagging them with `isQuota = true`
 * so the UI can show the API key modal for fallback.
 *
 * @param prompt           - The full prompt string
 * @param config           - Optional API configuration override
 * @param responseMimeType - Expected response format
 * @returns Raw text response from the AI model
 */
const callAI = async (
    prompt: string,
    config?: ApiConfig,
    responseMimeType: 'application/json' | 'text/plain' = 'text/plain'
): Promise<string> => {

    // ── 1. OPENROUTER PROVIDER ───────────────────────────────────────────
    if (config && config.provider === 'openrouter') {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${config.apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "CodeFlow"
                },
                body: JSON.stringify({
                    "model": config.model,
                    "messages": [
                        { "role": "user", "content": prompt }
                    ],
                    // NOTE: Some OpenRouter free-tier models don't support
                    // response_format, so we rely on prompt instructions
                    // for JSON enforcement instead of strict schema mode.
                    ...(responseMimeType === 'application/json' ? {} : {})
                })
            });

            if (!response.ok) {
                const err = await response.json();
                // Check for quota / rate-limit errors
                if (response.status === 429) {
                    const quotaErr = new Error("OpenRouter Rate Limit");
                    (quotaErr as any).isQuota = true;
                    throw quotaErr;
                }
                throw new Error(err.error?.message || "OpenRouter API Failed");
            }

            const data = await response.json();
            let text = data.choices?.[0]?.message?.content || "";

            // Clean up response — some models wrap JSON in markdown code blocks
            if (responseMimeType === 'application/json') {
                text = cleanJson(text);
            }

            return text;
        } catch (e: any) {
            console.error("OpenRouter Error", e);
            throw e;
        }
    }

    // ── 2. DEFAULT GOOGLE PROVIDER ───────────────────────────────────────
    else {
        if (!defaultApiKey) throw new Error('API Key is missing.');

        // Lazy initialization of the Google GenAI client
        if (!googleAi) {
            googleAi = new GoogleGenAI({ apiKey: defaultApiKey });
        }

        try {
            const response = await googleAi.models.generateContent({
                model: GEMINI_MODEL_SMART,
                contents: prompt,
                config: { responseMimeType: responseMimeType }
            });
            return response.text || "";
        } catch (e: any) {
            // Tag quota errors so the UI can offer a fallback
            if (e.message?.includes('429') || e.status === 429 || e.message?.toLowerCase().includes('quota')) {
                const err = new Error("Quota Exceeded");
                (err as any).isQuota = true;
                throw err;
            }
            throw e;
        }
    }
};

// =============================================================================
// MAIN EXPORT: Project Flowchart Generation Pipeline
// =============================================================================

/**
 * Full AI analysis pipeline. Takes a map of file paths → source code,
 * performs multi-step analysis, and returns a complete FlowchartData
 * payload ready for visualization.
 *
 * Pipeline steps:
 *   1. Static import analysis → dependency graph edges
 *   2. Batch the files by character count for AI processing
 *   3. For each batch, call AI to extract documentation (DocChapter[])
 *   4. Synthesize a high-level logical flow (Architecture) from summaries
 *   5. Assemble the final FlowchartData with nodes, edges, docs, and arch
 *
 * @param fileMap    - Record of file paths to source code strings
 * @param onProgress - Optional callback for UI progress messages
 * @param apiConfig  - Optional API configuration override
 * @returns Complete FlowchartData for the project
 */
export const generateProjectFlowchart = async (
    fileMap: Record<string, string>,
    onProgress?: (msg: string) => void,
    apiConfig?: ApiConfig
): Promise<FlowchartData> => {

    const files = Object.entries(fileMap);
    const totalFiles = files.length;

    if (onProgress) onProgress(`Scanning ${totalFiles} files for structure...`);

    // ── Step 1: Static dependency analysis ───────────────────────────────
    const dependencyGraph: Record<string, string[]> = {};
    const structuralEdges: any[] = [];

    files.forEach(([path, content]) => {
        const ext = path.split('.').pop() || '';
        const imports = getImports(content, ext);
        dependencyGraph[path] = imports;

        // Resolve import paths to actual files in the project
        imports.forEach(imp => {
            const target = files.find(f => f[0].includes(imp.split('/').pop()!));
            if (target) {
                structuralEdges.push({
                    id: `e-${path}-${target[0]}`,
                    source: path,
                    target: target[0],
                    animated: true,
                    style: { stroke: '#94a3b8', strokeWidth: 1 }
                });
            }
        });
    });

    // ── Step 2: Batch files for AI processing ────────────────────────────
    // We batch by total character count to stay within AI context limits
    const BATCH_SIZE_CHARS = 25000;
    let currentBatch: { path: string, content: string }[] = [];
    let currentBatchSize = 0;
    const batches = [];

    for (const [path, content] of files) {
        if (content.length > BATCH_SIZE_CHARS) {
            // Oversized files get their own batch (truncated)
            batches.push([{ path, content: content.slice(0, BATCH_SIZE_CHARS) }]);
        } else if (currentBatchSize + content.length > BATCH_SIZE_CHARS) {
            // Current batch is full — start a new one
            batches.push(currentBatch);
            currentBatch = [{ path, content }];
            currentBatchSize = content.length;
        } else {
            currentBatch.push({ path, content });
            currentBatchSize += content.length;
        }
    }
    if (currentBatch.length > 0) batches.push(currentBatch);

    // ── Step 3: AI analysis — extract documentation per batch ────────────
    const chapters: DocChapter[] = [];

    for (let i = 0; i < batches.length; i++) {
        if (onProgress) onProgress(`Analyzing Logic Batch ${i + 1}/${batches.length}...`);

        const batchContext = batches[i].map(f => `\n--- FILE: ${f.path} ---\n${f.content}`).join('\n');

        const prompt = `
        You are a Deep Code Analysis Engine. 
        Analyze these source files. Return a JSON structure representing the code.
        CRITICAL: For every function, break down its INTERNAL LOGIC into a tree of steps (logic).
        
        Files to Analyze:
        ${batches[i].map(f => f.path).join(', ')}

        Output JSON (Array of DocChapter):
        [
          {
            "id": "file_path",
            "title": "filename",
            "path": "full_path",
            "summary": "Technical summary.",
            "type": "module",
            "classes": [
              {
                "name": "ClassName",
                "description": "Description",
                "methods": [
                   {
                     "name": "methodName",
                     "params": "args",
                     "returnType": "Void",
                     "description": "What it does.",
                     "codeSnippet": "code",
                     "complexity": "Low" | "Medium" | "High",
                     "logic": [
                        { "type": "if", "content": "isUserLoggedIn?", "children": [ ... ] },
                        { "type": "loop", "content": "For each item in list", "children": [ ... ] },
                        { "type": "action", "content": "Calculate total" },
                        { "type": "return", "content": "Return result" }
                     ]
                   }
                ]
              }
            ],
            "functions": [
               {
                 "name": "funcName",
                 "params": "args",
                 "returnType": "Type",
                 "description": "Desc",
                 "codeSnippet": "code",
                 "complexity": "Medium",
                 "logic": [
                    { "type": "action", "content": "Validate input" },
                    { "type": "if", "content": "Input is valid", "children": [ 
                        { "type": "action", "content": "Process data" }
                    ]}
                 ]
               }
            ]
          }
        ]

        SOURCE CODE:
        ${batchContext}
      `;

        try {
            const responseText = await callAI(prompt, apiConfig, 'application/json');
            const batchChapters = JSON.parse(cleanJson(responseText || '[]')) as DocChapter[];
            chapters.push(...batchChapters);

        } catch (err: any) {
            console.error("Batch Analysis Error", err);

            // Re-throw quota errors so the UI can handle them
            if (err.isQuota) throw err;

            // For other errors, create placeholder chapters so the UI isn't empty
            batches[i].forEach(f => {
                chapters.push({
                    id: f.path,
                    title: f.path.split('/').pop()!,
                    path: f.path,
                    summary: "Analysis failed.",
                    type: 'module',
                    classes: [],
                    functions: [],
                    dependencies: []
                });
            });
        }
    }

    // ── Step 4: Synthesize high-level logical flow (Architecture) ─────────
    if (onProgress) onProgress("Synthesizing Logical Flow...");

    let architectureData = undefined;

    try {
        const summaryContext = chapters.map(c => `- File: ${c.path} (${c.type})\n  Summary: ${c.summary}`).join('\n');
        const archPrompt = `
         You are a Logic Flow Architect.
         Based on the following file summaries, construct a flowchart that represents the **LOGICAL EXECUTION FLOW** of the application.
         
         CRITICAL RULES:
         1. Do NOT just list the files or classes. NO CLASS DIAGRAMS.
         2. Show the *thinking* or *process* of the app as it executes.
         3. Nodes must be ACTION STEPS (e.g. "Validate Input", "Fetch Data"), not FILE NAMES.
         4. Use 'start' for entry and 'end' for exit.
         
         Node Types to use:
         - 'start': The entry point (e.g., "App Init", "User Request").
         - 'process': An action (e.g., "Validate Data", "Calculate Score").
         - 'decision': A branching point (e.g., "Is Authorized?", "Data Found?").
         - 'database': Interaction with storage (e.g., "Save to DB").
         - 'end': The final output (e.g., "Return JSON", "Render UI").
         
         Project Summaries:
         ${summaryContext}
         
         Output JSON:
         {
            "nodes": [
                { "id": "n1", "label": "Start App", "type": "start", "description": "Initialize" },
                { "id": "n2", "label": "Check Config", "type": "process", "description": "Load env vars" },
                { "id": "n3", "label": "Config Valid?", "type": "decision", "description": "Verify keys" },
                { "id": "n4", "label": "Start Server", "type": "end", "description": "Listen on 3000" }
            ],
            "edges": [
                { "source": "n1", "target": "n2" },
                { "source": "n2", "target": "n3" },
                { "source": "n3", "target": "n4", "label": "Yes" }
            ]
         }
      `;

        const archResponse = await callAI(archPrompt, apiConfig, 'application/json');
        architectureData = JSON.parse(cleanJson(archResponse || '{}'));

        // Basic validation — ensure we got a valid node array
        if (!architectureData?.nodes || !Array.isArray(architectureData.nodes)) {
            architectureData = undefined;
        }

    } catch (e) {
        console.error("Architecture Synthesis Failed", e);
        // Non-fatal: we continue without architecture data, falling back to file graph
    }

    // ── Step 5: Assemble final FlowchartData ─────────────────────────────
    if (onProgress) onProgress(`Constructing Visualization...`);

    const docBook: DocBook = {
        title: "Project Documentation",
        chapters: chapters
    };

    // Build base flowchart nodes from documentation chapters
    const visualNodes: any[] = [];
    const visualEdges: any[] = [...structuralEdges];

    chapters.forEach(chap => {
        // File-level node
        visualNodes.push({
            id: chap.path,
            type: 'custom',
            data: { label: chap.title, type: 'file', details: [chap.summary], mode: 'flowchart' },
            position: { x: 0, y: 0 }
        });

        // Class-level nodes (flattened for the flowchart view)
        chap.classes.forEach(cls => {
            const clsId = `${chap.path}::${cls.name}`;
            visualNodes.push({
                id: clsId,
                type: 'custom',
                data: { label: cls.name, type: 'class', details: [cls.description], mode: 'flowchart' },
                position: { x: 0, y: 0 }
            });
            visualEdges.push({ id: `e-${chap.path}-${clsId}`, source: chap.path, target: clsId, animated: true });
        });
    });

    return {
        title: "Project Analysis",
        summary: "Generated by CodeFlow.",
        nodes: visualNodes,
        edges: visualEdges,
        documentation: docBook,
        architecture: architectureData
    };
};

// =============================================================================
// EXPORT: Code Snippet Explanation (for Chat Panel)
// =============================================================================

/**
 * Sends a code snippet to the AI for a plain-English explanation.
 * Used by the Chat Panel's "Explain" button.
 *
 * @param code         - The code snippet to explain
 * @param contextLabel - A label describing where the code is from
 * @param apiConfig    - Optional API configuration override
 * @returns Plain text explanation
 */
export const explainCodeSnippet = async (
    code: string,
    contextLabel: string,
    apiConfig?: ApiConfig
): Promise<string> => {
    const prompt = `Explain this code snippet from ${contextLabel} in simple terms. \n\n${code}`;
    try {
        const responseText = await callAI(prompt, apiConfig);
        return responseText || "No explanation.";
    } catch (e: any) {
        if (e.isQuota) throw e;
        return "Error explaining code.";
    }
};