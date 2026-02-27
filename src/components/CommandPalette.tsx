import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

const COMMANDS = [
  { id: 'new-file', label: 'File: New Text File', shortcut: 'Ctrl+N' },
  { id: 'open-file', label: 'File: Open File...', shortcut: 'Ctrl+O' },
  { id: 'save-file', label: 'File: Save', shortcut: 'Ctrl+S' },
  { id: 'settings', label: 'Preferences: Open Settings (UI)', shortcut: 'Ctrl+,' },
  { id: 'theme', label: 'Preferences: Color Theme', shortcut: 'Ctrl+K Ctrl+T' },
  { id: 'terminal', label: 'Terminal: Toggle Terminal', shortcut: 'Ctrl+` ' },
  { id: 'ai', label: 'AI: Ask Gemini', shortcut: 'Ctrl+Alt+G' },
];

export function CommandPalette({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (cmd: string) => void }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    if (e.key === 'ArrowUp') setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    if (e.key === 'Enter') {
      if (filteredCommands[selectedIndex]) {
        onSelect(filteredCommands[selectedIndex].id);
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50" onClick={onClose}>
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-[600px] bg-vscode-sidebar rounded-lg shadow-2xl border border-vscode-border overflow-hidden"
          >
            <div className="p-2">
              <input 
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="w-full bg-vscode-bg border border-vscode-status rounded px-3 py-1.5 text-sm focus:outline-none"
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto pb-2">
              {filteredCommands.map((cmd, i) => (
                <div 
                  key={cmd.id}
                  onClick={() => { onSelect(cmd.id); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={cn(
                    "flex items-center justify-between px-4 py-1.5 cursor-pointer text-sm",
                    i === selectedIndex ? "bg-vscode-status text-white" : "text-vscode-text hover:bg-vscode-hover"
                  )}
                >
                  <span>{cmd.label}</span>
                  <span className={cn("text-xs opacity-60", i === selectedIndex ? "text-white" : "")}>{cmd.shortcut}</span>
                </div>
              ))}
              {filteredCommands.length === 0 && (
                <div className="px-4 py-4 text-center text-vscode-text/40 text-sm">No matching commands</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
