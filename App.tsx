/**
 * @file App.tsx
 * @description Root application component for CodeFlow. Manages the top-level
 *              application state machine (Landing → Project Viz | Algo Viz)
 *              and orchestrates the full analysis pipeline:
 *
 *              1. User uploads a ZIP → extractZipFile()
 *              2. Files are batched and sent to AI → generateProjectFlowchart()
 *              3. Results populate the FlowchartCanvas, ReportView, and sidebar
 *
 *              Also handles API configuration (Google Gemini / OpenRouter)
 *              and quota-exceeded recovery flow.
 */

import React, { useState } from 'react';
import { extractZipFile } from './services/zipService';
import { generateProjectFlowchart } from './services/geminiService';
import { FileNode, FlowchartData, AnalysisState, VisualizationMode, ApiConfig } from './types';
import { FileTree } from './components/FileTree';
import { FlowchartCanvas } from './components/FlowchartCanvas';
import { FileUploader } from './components/FileUploader';
import { CodePanel } from './components/CodePanel';
import { ChatPanel } from './components/ChatPanel';
import { LandingPage } from './components/LandingPage';
import { AlgorithmVisualizer } from './components/AlgorithmVisualizer';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Menu, ChevronLeft, Boxes, Book, Search, FileText, ChevronRight } from 'lucide-react';
import { Node } from 'reactflow';

/** Top-level navigation modes */
type AppMode = 'landing' | 'project-viz' | 'algo-viz';

export default function App() {
  // ─── Navigation State ──────────────────────────────────────────────
  const [mode, setMode] = useState<AppMode>('landing');

  // ─── Visualization State (lifted from FlowchartCanvas) ─────────────
  const [vizMode, setVizMode] = useState<VisualizationMode>('report');

  // ─── Project Data State ────────────────────────────────────────────
  const [fileStructure, setFileStructure] = useState<FileNode[] | null>(null);
  const [flatFileMap, setFlatFileMap] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [flowchartData, setFlowchartData] = useState<FlowchartData | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({ status: 'idle' });
  const [projectName, setProjectName] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(false);

  // ─── Sidebar Search ────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');

  // ─── API Configuration ─────────────────────────────────────────────
  const [apiConfig, setApiConfig] = useState<ApiConfig | undefined>(undefined);

  // ─── Chat / Code Explanation ────────────────────────────────────────
  const [chatContext, setChatContext] = useState<{ code: string, label: string } | null>(null);

  // ─── Setup Modal (upfront API key entry from landing page) ─────────
  const [showSetupModal, setShowSetupModal] = useState(false);

  // ═══════════════════════════════════════════════════════════════════
  // HELPER: Recursively find a FileNode by its path in the tree
  // ═══════════════════════════════════════════════════════════════════
  const findNodeByPath = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findNodeByPath(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  // ═══════════════════════════════════════════════════════════════════
  // HANDLER: ZIP file upload — triggers the full analysis pipeline
  // ═══════════════════════════════════════════════════════════════════
  const handleZipUpload = async (file: File) => {
    try {
      setAnalysisState({ status: 'analyzing', progress: "Unpacking Archive..." });
      setProjectName(file.name.replace('.zip', ''));
      setFlowchartData(null);

      // Step 1: Extract ZIP → file tree + flat content map
      const { rootNodes, fileMap } = await extractZipFile(file);
      setFileStructure(rootNodes);
      setFlatFileMap(fileMap);

      // Step 2: Send to AI for analysis
      await runAnalysis(fileMap, apiConfig);

    } catch (error) {
      setAnalysisState({ status: 'error', error: 'Failed to parse ZIP file.' });
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // HANDLER: Run AI analysis (separated to support retry after quota)
  // ═══════════════════════════════════════════════════════════════════
  const runAnalysis = async (fileMap: Record<string, string>, config?: ApiConfig) => {
    try {
      const data = await generateProjectFlowchart(fileMap, (msg) => {
        setAnalysisState({ status: 'analyzing', progress: msg });
      }, config);

      setFlowchartData(data);
      setAnalysisState({ status: 'success' });
    } catch (error: any) {
      console.error("Analysis Error:", error);
      if (error.isQuota) {
        // Show the API key modal so the user can switch providers
        setAnalysisState({ status: 'quota_exceeded' });
      } else {
        setAnalysisState({ status: 'error', error: error.message || 'AI Analysis Failed' });
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // HANDLER: API configuration save (from modal) — retries if needed
  // ═══════════════════════════════════════════════════════════════════
  const handleApiConfigSave = (config: ApiConfig) => {
    setApiConfig(config);
    // If files are already loaded, automatically retry with the new key
    if (Object.keys(flatFileMap).length > 0) {
      setAnalysisState({ status: 'analyzing', progress: "Retrying with new key..." });
      runAnalysis(flatFileMap, config);
    } else {
      setAnalysisState({ status: 'idle' });
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // HANDLER: File selection from sidebar tree
  // ═══════════════════════════════════════════════════════════════════
  const handleFileSelectFromTree = (node: FileNode) => {
    setSelectedFile(node);
    if (!node.isFolder) setShowCodePanel(true);
  };

  // ═══════════════════════════════════════════════════════════════════
  // HANDLER: Node click on the flowchart canvas — opens code panel
  // ═══════════════════════════════════════════════════════════════════
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (!fileStructure || node.data.type === 'cluster') return;
    let foundNode = findNodeByPath(fileStructure, node.id);
    if (!foundNode) {
      // Heuristic: try matching by label when path doesn't match directly
      const label = node.data.label;
      const match = Object.keys(flatFileMap).find(path => path.includes(label));
      if (match) foundNode = findNodeByPath(fileStructure, match);
    }
    if (foundNode && !foundNode.isFolder) {
      setSelectedFile(foundNode);
      setShowCodePanel(true);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // HANDLER: "Explain" button — opens the AI chat panel
  // ═══════════════════════════════════════════════════════════════════
  const handleExplainCode = (code: string, label: string) => {
    setChatContext({ code, label });
  };

  // ═══════════════════════════════════════════════════════════════════
  // HANDLER: Reset — clears all project state for a fresh start
  // ═══════════════════════════════════════════════════════════════════
  const handleReset = () => {
    setFileStructure(null);
    setFlatFileMap({});
    setSelectedFile(null);
    setFlowchartData(null);
    setAnalysisState({ status: 'idle' });
    setProjectName('');
    setChatContext(null);
    setVizMode('report');
    setSearchTerm('');
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: Landing Page
  // ═══════════════════════════════════════════════════════════════════
  if (mode === 'landing') {
    return (
      <>
        <LandingPage
          onStartProject={() => setMode('project-viz')}
          onStartAlgo={() => setMode('algo-viz')}
          onOpenSettings={() => setShowSetupModal(true)}
        />
        {showSetupModal && (
          <ApiKeyModal
            isSetup={true}
            onSave={(config) => {
              setApiConfig(config);
              setShowSetupModal(false);
            }}
            onCancel={() => setShowSetupModal(false)}
          />
        )}
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: Algorithm Visualizer (standalone mode)
  // ═══════════════════════════════════════════════════════════════════
  if (mode === 'algo-viz') {
    return <AlgorithmVisualizer onBack={() => setMode('landing')} />;
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: Project Visualization (main workspace)
  // ═══════════════════════════════════════════════════════════════════
  const isExplorerVisible = !sidebarCollapsed && vizMode !== 'report';

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">

      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-16 z-40 bg-white border-b-2 border-black flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Back to landing */}
          <button onClick={() => setMode('landing')} className="p-2 hover:bg-slate-100 rounded-lg border-2 border-transparent hover:border-black transition-all">
            <ChevronLeft size={20} className="text-black" />
          </button>

          {/* Toggle sidebar (disabled in report mode) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-2 hover:bg-slate-100 rounded-lg border-2 border-transparent hover:border-black transition-all ${vizMode === 'report' ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={vizMode === 'report'}
            title={vizMode === 'report' ? "Explorer hidden in Report mode" : "Toggle Sidebar"}
          >
            <Menu size={20} className="text-black" />
          </button>

          {/* App logo and title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center">
              <Boxes size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">CodeFlow</span>
          </div>

          {/* Active project name badge */}
          {projectName && (
            <div className="px-3 py-1 bg-yellow-100 border border-yellow-300 rounded text-xs font-bold text-yellow-800">
              {projectName}
            </div>
          )}
        </div>

        {/* Right side: New Project button */}
        <div className="flex items-center gap-3">
          {fileStructure && (
            <button onClick={handleReset} className="px-4 py-2 text-xs font-bold border-2 border-black bg-white hover:bg-red-50 hover:text-red-600 rounded-lg shadow-comic-sm active:translate-y-[2px] active:shadow-none transition-all">
              NEW PROJECT
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content Area (below top bar) ──────────────────────── */}
      <div className="flex w-full h-full pt-16">

        {/* ── Left Sidebar: Project Explorer / Module List ──────────── */}
        <div className={`
          flex-shrink-0 bg-white border-r-2 border-black flex flex-col transition-all duration-300 relative z-30
          ${isExplorerVisible ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'}
        `}>
           {flowchartData?.documentation ? (
             /* Module list view (when documentation is available) */
             <div className="flex flex-col h-full bg-slate-50">
                {/* Header */}
                <div className="h-14 flex items-center px-4 border-b border-black bg-white shrink-0">
                    <Book className="text-blue-600 mr-2" size={18} />
                    <span className="font-bold text-sm tracking-tight uppercase">Modules</span>
                </div>

                {/* Search input */}
                <div className="p-3 shrink-0 border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-bold focus:outline-none focus:border-black transition-all"
                        />
                    </div>
                </div>

                {/* Module list */}
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar">
                    {flowchartData.documentation.chapters
                        .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(chapter => {
                        const isActive = selectedFile?.path === chapter.path;
                        return (
                            <button
                                key={chapter.id}
                                onClick={() => {
                                    if(fileStructure) {
                                        const node = findNodeByPath(fileStructure, chapter.path);
                                        if (node) handleFileSelectFromTree(node);
                                    }
                                }}
                                className={`
                                    w-full text-left px-3 py-3 rounded-lg flex items-center justify-between group transition-all border-2
                                    ${isActive
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'border-transparent text-gray-500 hover:bg-white hover:border-black hover:text-black'}
                                `}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText size={16} className={isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-black'} />
                                    <div className="truncate">
                                        <div className="font-bold text-xs truncate">{chapter.title}</div>
                                        <div className="text-[9px] opacity-60 uppercase tracking-wider font-mono">{chapter.type}</div>
                                    </div>
                                </div>
                                {isActive && <ChevronRight size={14} />}
                            </button>
                        );
                    })}
                    {flowchartData.documentation.chapters.length === 0 && (
                        <div className="text-center p-4 text-xs text-gray-400 font-bold">No modules found</div>
                    )}
                </div>
             </div>
           ) : (
             /* Fallback: raw file tree explorer */
             <>
                <div className="p-4 border-b-2 border-black bg-slate-50">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Project Explorer</div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {!fileStructure ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-40">
                        <p className="text-xs font-bold">NO FILES LOADED</p>
                    </div>
                    ) : (
                    <div className="py-2">
                        <FileTree
                        nodes={fileStructure}
                        onSelectFile={handleFileSelectFromTree}
                        selectedPath={selectedFile?.path}
                        />
                    </div>
                    )}
                </div>
             </>
           )}
        </div>

        {/* ── Main Canvas Area ──────────────────────────────────────── */}
        <div className="flex-1 relative bg-slate-50 flex flex-col">
          {!fileStructure ? (
            /* Upload prompt (initial state) */
            <div className="flex-1 flex items-center justify-center">
              <FileUploader onFileLoaded={handleZipUpload} />
            </div>
          ) : (
            <>
              {/* Loading overlay during AI analysis */}
              {analysisState.status === 'analyzing' && (
                <LoadingOverlay message={analysisState.progress || "Thinking..."} />
              )}

              {/* Quota exceeded → show API key modal */}
              {analysisState.status === 'quota_exceeded' && (
                <ApiKeyModal
                  onSave={handleApiConfigSave}
                  onCancel={() => setAnalysisState({ status: 'error', error: 'Quota Exceeded. Operation Cancelled.' })}
                />
              )}

              {/* Error state */}
              {analysisState.status === 'error' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                  <div className="border-2 border-black bg-white p-8 text-center max-w-md shadow-comic rounded-xl">
                    <div className="text-2xl mb-2">💥</div>
                    <div className="text-black font-bold text-lg mb-2">Oops! Something exploded.</div>
                    <p className="text-gray-500 text-sm mb-6">{analysisState.error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:scale-105 transition-transform"
                    >
                      TRY AGAIN
                    </button>
                  </div>
                </div>
              )}

              {/* Flowchart / Report / Mindmap canvas */}
              <div className="w-full h-full">
                <FlowchartCanvas
                  initialData={flowchartData}
                  mode={vizMode}
                  onModeChange={setVizMode}
                  onNodeClick={handleNodeClick}
                  onExplainCode={handleExplainCode}
                />
              </div>
            </>
          )}
        </div>

        {/* ── Right Panel: Source Code Viewer ───────────────────────── */}
        {showCodePanel && selectedFile && (
          <CodePanel
            file={selectedFile}
            onClose={() => setShowCodePanel(false)}
          />
        )}

        {/* ── Right Panel: AI Chat / Explanation ───────────────────── */}
        {chatContext && (
          <ChatPanel
            contextCode={chatContext.code}
            contextLabel={chatContext.label}
            onClose={() => setChatContext(null)}
            apiConfig={apiConfig}
          />
        )}

      </div>
    </div>
  );
}