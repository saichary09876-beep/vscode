import React, { useState, useEffect, useRef } from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  Play, 
  Blocks, 
  Settings as SettingsIcon, 
  UserCircle, 
  ChevronRight, 
  ChevronDown, 
  FileCode, 
  Folder, 
  X,
  Plus,
  Terminal as TerminalIcon,
  Sparkles,
  Send,
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  SplitSquareVertical,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { MOCK_FILES, FileNode, MOCK_PROBLEMS, Extension, MOCK_EXTENSIONS } from './constants';

// Components
import { Welcome } from './components/Welcome';
import { Settings } from './components/Settings';
import { Extensions, ExtensionDetail } from './components/Extensions';
import { DiffView } from './components/DiffView';
import { CommandPalette } from './components/CommandPalette';
import { MenuBar } from './components/Menus';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type SidebarTab = 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'ai';
type PanelTab = 'terminal' | 'problems' | 'output' | 'debug-console';

export default function App() {
  // Layout State
  const [activeTab, setActiveTab] = useState<SidebarTab>('explorer');
  const [activePanel, setActivePanel] = useState<PanelTab>('terminal');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ id: string, message: string, type: 'info' | 'error' }[]>([]);
  
  // Editor State
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [files, setFiles] = useState<FileNode[]>(MOCK_FILES);
  const [viewMode, setViewMode] = useState<'editor' | 'welcome' | 'settings' | 'extension-detail' | 'diff'>('welcome');
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);
  
  // AI State
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Search State
  const [globalSearch, setGlobalSearch] = useState('');

  // Debug State
  const [isDebugPaused, setIsDebugPaused] = useState(false);
  const [debugLayout, setDebugLayout] = useState<'standard' | 'split' | 'minimalist'>('standard');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsPanelOpen(!isPanelOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen]);

  const toggleFolder = (id: string) => {
    const updateFiles = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === id) return { ...node, isOpen: !node.isOpen };
        if (node.children) return { ...node, children: updateFiles(node.children) };
        return node;
      });
    };
    setFiles(updateFiles(files));
  };

  const openFile = (file: FileNode) => {
    if (file.type === 'directory') {
      toggleFolder(file.id);
      return;
    }
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles([...openFiles, file]);
    }
    setActiveFile(file);
    setViewMode('editor');
  };

  const closeFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f.id !== id);
    setOpenFiles(newOpenFiles);
    if (activeFile?.id === id) {
      if (newOpenFiles.length > 0) {
        setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
      } else {
        setActiveFile(null);
        setViewMode('welcome');
      }
    }
  };

  const addNotification = (message: string, type: 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleCommand = (cmdId: string) => {
    switch (cmdId) {
      case 'settings': setViewMode('settings'); break;
      case 'terminal': setIsPanelOpen(!isPanelOpen); break;
      case 'ai': setActiveTab('ai'); setIsSidebarOpen(true); break;
      case 'new-file': addNotification('New file created (mock)'); break;
      default: addNotification(`Executed command: ${cmdId}`);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAiLoading) return;

    const userMsg = aiInput;
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiLoading(true);

    try {
      const context = activeFile ? `Current file: ${activeFile.name}\nContent:\n${activeFile.content}\n\n` : '';
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: context + userMsg,
        config: {
          systemInstruction: "You are a helpful coding assistant integrated into a VS Code clone. Provide concise, accurate code explanations and suggestions. Use markdown for code blocks.",
        }
      });
      
      setAiMessages(prev => [...prev, { role: 'assistant', content: response.text || 'Sorry, I could not generate a response.' }]);
    } catch (error) {
      console.error(error);
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to Gemini API.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const startDebugging = () => {
    setIsDebugPaused(true);
    if (debugLayout === 'minimalist') {
      setIsSidebarOpen(false);
      setIsPanelOpen(false);
    }
    if (debugLayout === 'split') {
      setActivePanel('debug-console');
      setIsPanelOpen(true);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-vscode-bg text-vscode-text font-sans overflow-hidden select-none" onClick={() => setActiveMenu(null)}>
      {/* Menu Bar */}
      <MenuBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onAction={(a) => addNotification(`Action: ${a}`)} />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Activity Bar */}
        <div className="flex w-12 flex-col items-center bg-vscode-activity py-2 space-y-4 border-r border-vscode-border z-30">
          <ActivityIcon icon={Files} active={activeTab === 'explorer'} onClick={() => { setActiveTab('explorer'); setIsSidebarOpen(true); }} />
          <ActivityIcon icon={Search} active={activeTab === 'search'} onClick={() => { setActiveTab('search'); setIsSidebarOpen(true); }} />
          <ActivityIcon icon={GitBranch} active={activeTab === 'git'} onClick={() => { setActiveTab('git'); setIsSidebarOpen(true); }} />
          <ActivityIcon icon={Play} active={activeTab === 'debug'} onClick={() => { setActiveTab('debug'); setIsSidebarOpen(true); }} />
          <ActivityIcon icon={Blocks} active={activeTab === 'extensions'} onClick={() => { setActiveTab('extensions'); setIsSidebarOpen(true); }} />
          <ActivityIcon icon={Sparkles} active={activeTab === 'ai'} onClick={() => { setActiveTab('ai'); setIsSidebarOpen(true); }} />
          <div className="flex-1" />
          <ActivityIcon icon={UserCircle} />
          <ActivityIcon icon={SettingsIcon} onClick={() => setViewMode('settings')} />
        </div>

        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 260 }}
              exit={{ width: 0 }}
              className="flex flex-col bg-vscode-sidebar border-r border-vscode-border overflow-hidden z-20"
            >
              <div className="flex h-9 items-center px-4 text-[11px] font-bold uppercase tracking-wider text-vscode-text/60 justify-between">
                <span>{activeTab}</span>
                <X size={14} className="cursor-pointer hover:text-white" onClick={() => setIsSidebarOpen(false)} />
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'explorer' && (
                  <div className="py-2">
                    <FileTree nodes={files} onSelect={openFile} activeId={activeFile?.id} />
                  </div>
                )}
                {activeTab === 'search' && (
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold opacity-60">Search</div>
                      <input 
                        value={globalSearch}
                        onChange={e => setGlobalSearch(e.target.value)}
                        className="w-full bg-vscode-bg border border-vscode-border rounded px-2 py-1 text-xs focus:outline-none focus:border-vscode-status"
                        placeholder="Search"
                      />
                    </div>
                    {globalSearch && (
                      <div className="space-y-1">
                        <div className="text-[10px] opacity-40">3 results in 2 files</div>
                        <div className="text-xs hover:bg-vscode-hover p-1 rounded cursor-pointer">
                          <div className="font-bold">App.tsx</div>
                          <div className="opacity-60 truncate">... {globalSearch} ...</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'git' && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase opacity-60">Source Control</span>
                      <div className="flex space-x-2">
                        <Play size={14} className="cursor-pointer" />
                        <GitBranch size={14} className="cursor-pointer" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold opacity-40">Changes</div>
                      {openFiles.map(f => (
                        <div key={f.id} className="flex items-center justify-between text-xs hover:bg-vscode-hover p-1 rounded cursor-pointer group" onClick={() => setViewMode('diff')}>
                          <div className="flex items-center">
                            <FileCode size={14} className="mr-2 text-blue-400" />
                            <span>{f.name}</span>
                          </div>
                          <span className="text-yellow-500 font-bold group-hover:hidden">M</span>
                          <div className="hidden group-hover:flex space-x-1">
                            <Plus size={14} />
                            <X size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'debug' && (
                  <div className="flex flex-col h-full">
                    <div className="p-4 space-y-4 border-b border-vscode-border">
                      <div className="flex space-x-2 mb-2">
                        <button 
                          onClick={() => setDebugLayout('standard')}
                          className={cn("flex-1 py-1 text-[10px] rounded border border-vscode-border", debugLayout === 'standard' ? "bg-vscode-active" : "hover:bg-vscode-hover")}
                        >
                          Standard
                        </button>
                        <button 
                          onClick={() => setDebugLayout('split')}
                          className={cn("flex-1 py-1 text-[10px] rounded border border-vscode-border", debugLayout === 'split' ? "bg-vscode-active" : "hover:bg-vscode-hover")}
                        >
                          Split
                        </button>
                        <button 
                          onClick={() => setDebugLayout('minimalist')}
                          className={cn("flex-1 py-1 text-[10px] rounded border border-vscode-border", debugLayout === 'minimalist' ? "bg-vscode-active" : "hover:bg-vscode-hover")}
                        >
                          Minimal
                        </button>
                      </div>
                      <button 
                        onClick={() => isDebugPaused ? setIsDebugPaused(false) : startDebugging()}
                        className={cn(
                          "w-full py-1.5 rounded text-xs font-bold transition-colors",
                          isDebugPaused ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-vscode-status hover:bg-blue-600 text-white"
                        )}
                      >
                        {isDebugPaused ? 'Continue (F5)' : 'Start Debugging'}
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <DebugSection title="Variables">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between"><span className="opacity-60">this:</span> <span>Object</span></div>
                          <div className="flex justify-between"><span className="opacity-60">activeFile:</span> <span>{activeFile?.name || 'null'}</span></div>
                        </div>
                      </DebugSection>
                      <DebugSection title="Watch" />
                      <DebugSection title="Call Stack">
                        <div className="text-[11px] opacity-60 italic">Not paused</div>
                      </DebugSection>
                      <DebugSection title="Breakpoints">
                        <div className="flex items-center space-x-2 text-[11px]">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span>App.tsx: 42</span>
                        </div>
                      </DebugSection>
                    </div>
                  </div>
                )}
                {activeTab === 'extensions' && (
                  <Extensions onSelect={(ext) => { setSelectedExtension(ext); setViewMode('extension-detail'); }} />
                )}
                {activeTab === 'ai' && (
                  <div className="flex flex-col h-full p-4">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 text-xs">
                      {aiMessages.length === 0 && (
                        <div className="text-vscode-text/40 italic">Ask Gemini for help with your code...</div>
                      )}
                      {aiMessages.map((msg, i) => (
                        <div key={i} className={cn(
                          "p-2 rounded",
                          msg.role === 'user' ? "bg-vscode-active ml-4" : "bg-vscode-hover mr-4"
                        )}>
                          <div className="font-bold mb-1 opacity-60">{msg.role === 'user' ? 'You' : 'Gemini'}</div>
                          <div className="prose prose-invert prose-xs">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                      {isAiLoading && <div className="animate-pulse text-vscode-text/40">Gemini is thinking...</div>}
                    </div>
                    <form onSubmit={handleAiSubmit} className="relative">
                      <input 
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="Ask Gemini..."
                        className="w-full bg-vscode-bg border border-vscode-border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-vscode-status pr-8"
                      />
                      <button type="submit" className="absolute right-2 top-1.5 text-vscode-text/60 hover:text-vscode-text">
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor Area */}
        <div className="flex flex-1 flex-col min-w-0 bg-vscode-bg relative">
          {/* Breadcrumbs */}
          <div className="flex h-8 items-center px-4 text-xs text-vscode-text/40 space-x-1 border-b border-vscode-border bg-vscode-bg/50">
            <span className="hover:text-vscode-text cursor-pointer">vscode-clone</span>
            <ChevronRight size={12} />
            <span className="hover:text-vscode-text cursor-pointer">src</span>
            <ChevronRight size={12} />
            <span className="text-vscode-text">{activeFile?.name || 'Welcome'}</span>
          </div>

          {/* Tabs */}
          <div className="flex h-9 bg-vscode-sidebar border-b border-vscode-border overflow-x-auto no-scrollbar">
            {openFiles.map(file => (
              <div 
                key={file.id}
                onClick={() => { setActiveFile(file); setViewMode('editor'); }}
                className={cn(
                  "group flex items-center h-full px-3 border-r border-vscode-border cursor-pointer min-w-[120px] max-w-[200px] text-xs transition-colors",
                  activeFile?.id === file.id && viewMode === 'editor' ? "bg-vscode-bg border-t border-t-vscode-status" : "bg-vscode-sidebar hover:bg-vscode-hover"
                )}
              >
                <FileCode size={14} className="mr-2 text-blue-400 shrink-0" />
                <span className="truncate flex-1">{file.name}</span>
                <button 
                  onClick={(e) => closeFile(e, file.id)}
                  className={cn(
                    "ml-2 p-0.5 rounded hover:bg-vscode-active opacity-0 group-hover:opacity-100 transition-opacity",
                    activeFile?.id === file.id && "opacity-100"
                  )}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Main Viewport */}
          <div className="flex-1 overflow-hidden relative">
            {viewMode === 'welcome' && <Welcome onOpenFile={() => setActiveTab('explorer')} />}
            {viewMode === 'settings' && <Settings />}
            {viewMode === 'extension-detail' && selectedExtension && <ExtensionDetail extension={selectedExtension} onBack={() => setViewMode('welcome')} />}
            {viewMode === 'diff' && activeFile && <DiffView file={activeFile} />}
            {viewMode === 'editor' && activeFile && (
              <div className="flex h-full font-mono text-sm">
                <div className="w-12 bg-vscode-bg border-r border-vscode-border py-4 text-right pr-4 text-vscode-text/30 select-none">
                  {activeFile.content?.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <div className="flex-1 overflow-auto p-4 whitespace-pre">
                  <code className="block">
                    {activeFile.content?.split('\n').map((line, i) => (
                      <div key={i} className="hover:bg-vscode-hover px-2 -mx-2 rounded">
                        {line || ' '}
                      </div>
                    ))}
                  </code>
                </div>
              </div>
            )}
            
            {/* Debug Toolbar */}
            {isDebugPaused && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-vscode-sidebar border border-vscode-border rounded shadow-2xl flex items-center p-1 space-x-1 z-40">
                <div className="p-1 hover:bg-vscode-hover rounded cursor-pointer text-emerald-400"><Play size={16} /></div>
                <div className="p-1 hover:bg-vscode-hover rounded cursor-pointer text-blue-400"><ChevronRight size={16} /></div>
                <div className="p-1 hover:bg-vscode-hover rounded cursor-pointer text-blue-400"><ChevronDown size={16} /></div>
                <div className="p-1 hover:bg-vscode-hover rounded cursor-pointer text-amber-400"><Play size={16} className="rotate-180" /></div>
                <div className="w-px h-4 bg-vscode-border mx-1" />
                <div className="p-1 hover:bg-vscode-hover rounded cursor-pointer text-red-500" onClick={() => setIsDebugPaused(false)}><X size={16} /></div>
              </div>
            )}
          </div>

          {/* Bottom Panel */}
          <AnimatePresence>
            {isPanelOpen && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 240 }}
                exit={{ height: 0 }}
                className="bg-vscode-bg border-t border-vscode-border overflow-hidden flex flex-col z-10"
              >
                <div className="flex h-9 items-center px-4 border-b border-vscode-border text-[11px] font-bold uppercase tracking-wider space-x-6">
                  <PanelTabBtn label="Terminal" active={activePanel === 'terminal'} onClick={() => setActivePanel('terminal')} />
                  <PanelTabBtn label="Problems" active={activePanel === 'problems'} onClick={() => setActivePanel('problems')} count={MOCK_PROBLEMS.length} />
                  <PanelTabBtn label="Output" active={activePanel === 'output'} onClick={() => setActivePanel('output')} />
                  <PanelTabBtn label="Debug Console" active={activePanel === 'debug-console'} onClick={() => setActivePanel('debug-console')} />
                  <div className="flex-1" />
                  <div className="flex items-center space-x-2">
                    <Maximize2 size={12} className="cursor-pointer hover:text-white" />
                    <X size={14} className="cursor-pointer hover:text-white" onClick={() => setIsPanelOpen(false)} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                  {activePanel === 'terminal' && (
                    <div className="space-y-1">
                      <div className="text-emerald-400">user@vscode-clone:~/project$ <span className="text-vscode-text">npm start</span></div>
                      <div className="mt-1">Starting development server...</div>
                      <div className="text-blue-400 mt-1">Ready on http://localhost:3000</div>
                      <div className="animate-pulse mt-1">_</div>
                    </div>
                  )}
                  {activePanel === 'problems' && (
                    <div className="space-y-2">
                      {MOCK_PROBLEMS.map(p => (
                        <div key={p.id} className="flex items-start space-x-2 hover:bg-vscode-hover p-1 rounded cursor-pointer">
                          {p.severity === 'error' ? <AlertCircle size={14} className="text-red-500 mt-0.5" /> : <AlertTriangle size={14} className="text-amber-500 mt-0.5" />}
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-vscode-text-bright">{p.message}</span>
                              <span className="opacity-40">{p.file} [{p.line}, {p.col}]</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activePanel === 'output' && <div className="text-vscode-text/40 italic">No output yet...</div>}
                  {activePanel === 'debug-console' && <div className="text-vscode-text/40 italic">Debug console initialized.</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex h-6 items-center justify-between bg-vscode-status px-3 text-[11px] text-white shrink-0 z-40">
        <div className="flex items-center space-x-4">
          <div className="flex items-center hover:bg-white/10 px-1 cursor-pointer">
            <GitBranch size={12} className="mr-1" />
            <span>main*</span>
          </div>
          <div className="flex items-center hover:bg-white/10 px-1 cursor-pointer">
            <AlertCircle size={12} className="mr-1" />
            <span>0</span>
            <AlertTriangle size={12} className="mx-1" />
            <span>{MOCK_PROBLEMS.filter(p => p.severity === 'warning').length}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hover:bg-white/10 px-1 cursor-pointer">Ln 1, Col 1</div>
          <div className="hover:bg-white/10 px-1 cursor-pointer">Spaces: 2</div>
          <div className="hover:bg-white/10 px-1 cursor-pointer">UTF-8</div>
          <div className="hover:bg-white/10 px-1 cursor-pointer">TypeScript JSX</div>
          <div className="hover:bg-white/10 px-1 cursor-pointer" onClick={() => setIsPanelOpen(!isPanelOpen)}>
            <TerminalIcon size={12} />
          </div>
          <div className="relative">
            <Bell size={12} className="cursor-pointer" />
            {notifications.length > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-vscode-status" />}
          </div>
        </div>
      </div>

      {/* Overlays */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelect={handleCommand}
      />

      {/* Notification Center */}
      <div className="fixed bottom-8 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div 
              key={n.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-vscode-sidebar border border-vscode-border rounded shadow-2xl p-4 flex items-start space-x-3"
            >
              {n.type === 'error' ? <AlertCircle size={16} className="text-red-500" /> : <Info size={16} className="text-blue-400" />}
              <div className="flex-1 text-xs">{n.message}</div>
              <X size={14} className="cursor-pointer opacity-40 hover:opacity-100" onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActivityIcon({ icon: Icon, active, onClick }: { icon: any, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative flex h-12 w-full items-center justify-center cursor-pointer transition-colors",
        active ? "text-vscode-text-bright" : "text-vscode-text/40 hover:text-vscode-text-bright"
      )}
    >
      {active && <div className="absolute left-0 h-full w-0.5 bg-vscode-text-bright" />}
      <Icon size={24} strokeWidth={1.5} />
    </div>
  );
}

function FileTree({ nodes, onSelect, activeId, level = 0 }: { nodes: FileNode[], onSelect: (node: FileNode) => void, activeId?: string, level?: number }) {
  return (
    <div className="flex flex-col">
      {nodes.map(node => (
        <React.Fragment key={node.id}>
          <div 
            onClick={() => onSelect(node)}
            className={cn(
              "flex items-center h-6 px-4 cursor-pointer text-xs transition-colors",
              activeId === node.id ? "bg-vscode-active text-vscode-text-bright" : "hover:bg-vscode-hover"
            )}
            style={{ paddingLeft: `${(level + 1) * 12}px` }}
          >
            {node.type === 'directory' ? (
              <>
                {node.isOpen ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
                <Folder size={14} className="mr-2 text-blue-400" />
              </>
            ) : (
              <FileCode size={14} className="mr-2 text-blue-400 ml-4" />
            )}
            <span className="truncate">{node.name}</span>
          </div>
          {node.type === 'directory' && node.isOpen && node.children && (
            <FileTree nodes={node.children} onSelect={onSelect} activeId={activeId} level={level + 1} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function PanelTabBtn({ label, active, onClick, count }: { label: string, active: boolean, onClick: () => void, count?: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "h-full flex items-center transition-colors",
        active ? "text-vscode-text border-b border-vscode-text" : "text-vscode-text/40 hover:text-vscode-text"
      )}
    >
      {label}
      {count !== undefined && <span className="ml-2 bg-vscode-active px-1.5 rounded-full text-[9px]">{count}</span>}
    </button>
  );
}

function DebugSection({ title, children }: { title: string, children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-vscode-border/30">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center h-6 px-2 bg-vscode-sidebar/50 cursor-pointer hover:bg-vscode-hover text-[11px] font-bold uppercase"
      >
        {isOpen ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
        {title}
      </div>
      {isOpen && children && <div className="p-4">{children}</div>}
    </div>
  );
}
