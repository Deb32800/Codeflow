import React, { useState, useMemo } from 'react';
import { DocBook, DocChapter, DocFunction } from '../types';
import { 
    Book, Search, Menu, ChevronRight, Box, Code2, 
    FileText, Layers, Hash, Braces, ArrowRight 
} from 'lucide-react';

interface ReportViewProps {
  // We now expect the full FlowchartData which contains the `documentation` book
  documentation?: DocBook; 
  onExplainCode?: (code: string, label: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ documentation, onExplainCode }) => {
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
      documentation?.chapters[0]?.id || null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeChapter = useMemo(() => 
      documentation?.chapters.find(c => c.id === activeChapterId), 
  [documentation, activeChapterId]);

  const filteredChapters = useMemo(() => {
      if (!documentation) return [];
      if (!searchTerm) return documentation.chapters;
      return documentation.chapters.filter(c => 
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          c.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [documentation, searchTerm]);

  if (!documentation) {
      return (
          <div className="flex items-center justify-center h-full text-slate-400">
              Generating Documentation Book...
          </div>
      );
  }

  return (
    <div className="flex h-full bg-white overflow-hidden font-sans">
        
        {/* SIDEBAR NAVIGATION */}
        <div className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-slate-50 border-r border-slate-200 transform transition-transform duration-300
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col
        `}>
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-white">
                <Book className="text-blue-600 mr-2" size={20} />
                <span className="font-bold text-slate-800 tracking-tight">Project Docs</span>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search modules..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                </div>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
                {filteredChapters.map(chapter => (
                    <button
                        key={chapter.id}
                        onClick={() => {
                            setActiveChapterId(chapter.id);
                            setMobileMenuOpen(false);
                        }}
                        className={`
                            w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-colors
                            ${activeChapterId === chapter.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}
                        `}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={16} className={activeChapterId === chapter.id ? 'text-blue-500' : 'text-slate-400'} />
                            <div className="truncate">
                                <div className="font-semibold text-sm truncate">{chapter.title}</div>
                                <div className="text-[10px] opacity-70 uppercase tracking-wider">{chapter.type}</div>
                            </div>
                        </div>
                        {activeChapterId === chapter.id && <ChevronRight size={14} />}
                    </button>
                ))}
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
            
            {/* Mobile Header */}
            <div className="md:hidden h-14 border-b border-slate-200 flex items-center px-4 bg-white shrink-0">
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 mr-2">
                    <Menu size={20} />
                </button>
                <span className="font-bold">{activeChapter?.title || 'Documentation'}</span>
            </div>

            {/* Content Scroll */}
            {activeChapter ? (
                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        
                        {/* Chapter Header */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <div className="flex items-center gap-3 mb-4 text-blue-600">
                                <Layers size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">{activeChapter.type}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                                {activeChapter.title}
                            </h1>
                            <p className="text-xl text-slate-500 leading-relaxed">
                                {activeChapter.summary}
                            </p>
                            
                            {/* Metadata Pill */}
                            <div className="mt-6 flex flex-wrap gap-2">
                                <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-mono border border-slate-200">
                                    {activeChapter.path}
                                </div>
                            </div>
                        </div>

                        {/* Classes Section */}
                        {activeChapter.classes.map((cls, idx) => (
                            <div key={idx} className="mb-16">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                                        <Box size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">{cls.name}</h2>
                                </div>
                                
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8">
                                    <p className="text-slate-700">{cls.description}</p>
                                </div>

                                <div className="space-y-6">
                                    {cls.methods.map((method, mIdx) => (
                                        <FunctionCard 
                                            key={mIdx} 
                                            func={method} 
                                            onExplain={onExplainCode} 
                                            parentName={cls.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Standalone Functions Section */}
                        {activeChapter.functions.length > 0 && (
                            <div className="mb-16">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                        <Code2 size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">Module Functions</h2>
                                </div>
                                <div className="space-y-6">
                                    {activeChapter.functions.map((func, fIdx) => (
                                        <FunctionCard 
                                            key={fIdx} 
                                            func={func} 
                                            onExplain={onExplainCode}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Footer */}
                        <div className="mt-20 pt-10 border-t border-slate-100 text-center text-slate-400 text-sm">
                            Generated Documentation • {new Date().toLocaleDateString()}
                        </div>

                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Book size={48} className="mb-4 opacity-20" />
                    <p>Select a module to view documentation</p>
                </div>
            )}

        </div>
    </div>
  );
};

// --- Helper Component for Function Display ---

const FunctionCard: React.FC<{ 
    func: DocFunction, 
    onExplain?: (code: string, label: string) => void,
    parentName?: string 
}> = ({ func, onExplain, parentName }) => {
    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow group">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="font-mono text-sm text-slate-700 font-bold">
                    <span className="text-purple-600">{func.name}</span>
                    <span className="text-slate-400">(</span>
                    <span className="text-slate-500">{func.params}</span>
                    <span className="text-slate-400">)</span>
                    <span className="text-slate-300 mx-2">→</span>
                    <span className="text-orange-600">{func.returnType}</span>
                </div>
                {func.complexity && (
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border 
                        ${func.complexity === 'High' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}
                    `}>
                        {func.complexity} Complexity
                    </span>
                )}
            </div>

            <div className="p-6">
                <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                    {func.description}
                </p>

                {func.codeSnippet && (
                    <div className="relative mt-4">
                        <div className="absolute top-0 right-0 p-2">
                             <button 
                                onClick={() => onExplain && onExplain(func.codeSnippet, func.name)}
                                className="text-[10px] font-bold bg-white/10 hover:bg-white/20 text-blue-200 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                             >
                                 <ArrowRight size={10} /> Explain
                             </button>
                        </div>
                        <pre className="bg-slate-900 text-blue-50 p-4 rounded-lg text-xs font-mono overflow-x-auto custom-scrollbar leading-loose">
                            {func.codeSnippet}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};