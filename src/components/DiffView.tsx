import React from 'react';
import { FileNode } from '../constants';
import { cn } from '../lib/utils';

export function DiffView({ file }: { file: FileNode }) {
  const content = file.content || '';
  const isConflict = content.includes('<<<<<<<');

  if (isConflict) {
    const lines = content.split('\n');
    return (
      <div className="flex flex-col h-full bg-vscode-bg font-mono text-sm overflow-y-auto">
        <div className="bg-vscode-sidebar px-4 py-2 border-b border-vscode-border flex items-center justify-between">
          <div className="text-xs font-bold text-vscode-text/60">Merge Conflict: {file.name}</div>
          <div className="flex space-x-2">
            <button className="bg-vscode-status px-3 py-1 rounded text-xs text-white">Accept Current Change</button>
            <button className="bg-vscode-status px-3 py-1 rounded text-xs text-white">Accept Incoming Change</button>
            <button className="bg-vscode-status px-3 py-1 rounded text-xs text-white">Accept Both Changes</button>
          </div>
        </div>
        <div className="flex-1 p-4">
          {lines.map((line, i) => {
            const isMarker = line.startsWith('<<<<<<<') || line.startsWith('=======') || line.startsWith('>>>>>>>');
            const isCurrent = line.includes('HEAD') || (i > 0 && lines[i-1].startsWith('<<<<<<<'));
            const isIncoming = line.includes('feature/') || (i < lines.length - 1 && lines[i+1].startsWith('>>>>>>>'));
            
            return (
              <div key={i} className={cn(
                "px-2 -mx-2",
                line.startsWith('<<<<<<<') ? "bg-blue-500/20 border-t border-blue-500/50" :
                line.startsWith('=======') ? "bg-vscode-border" :
                line.startsWith('>>>>>>>') ? "bg-emerald-500/20 border-b border-emerald-500/50" :
                ""
              )}>
                <div className="flex">
                  <div className="w-12 text-right pr-4 text-vscode-text/30 select-none">{i + 1}</div>
                  <div className={cn(
                    "flex-1",
                    isMarker ? "font-bold text-vscode-text-bright" : ""
                  )}>
                    {line}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const originalLines = content.split('\n');
  // Mock modifications
  const modifiedLines = [...originalLines];
  if (modifiedLines.length > 5) {
    modifiedLines[4] = '// MODIFIED: ' + modifiedLines[4];
    modifiedLines.splice(6, 0, '  console.log("Added line");');
  }

  return (
    <div className="flex h-full font-mono text-sm overflow-hidden">
      {/* Left Side (Original) */}
      <div className="flex-1 flex flex-col border-r border-vscode-border overflow-hidden">
        <div className="bg-vscode-sidebar px-4 py-1 text-xs border-b border-vscode-border opacity-60">Original</div>
        <div className="flex-1 overflow-auto py-2">
          {originalLines.map((line, i) => (
            <div key={i} className="flex group">
              <div className="w-12 text-right pr-4 text-vscode-text/30 select-none">{i + 1}</div>
              <div className="flex-1 px-2 whitespace-pre text-vscode-text/80">{line || ' '}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side (Modified) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-vscode-sidebar px-4 py-1 text-xs border-b border-vscode-border opacity-60">Modified</div>
        <div className="flex-1 overflow-auto py-2">
          {modifiedLines.map((line, i) => {
            const isAdded = !originalLines.includes(line);
            const isModified = originalLines[i] !== line && !isAdded;
            
            return (
              <div key={i} className={`flex group ${isAdded ? 'bg-emerald-500/10' : isModified ? 'bg-blue-500/10' : ''}`}>
                <div className="w-12 text-right pr-4 text-vscode-text/30 select-none">{i + 1}</div>
                <div className="flex-1 px-2 whitespace-pre">
                  {isAdded && <span className="text-emerald-400 mr-2">+</span>}
                  <span className={isAdded ? 'text-emerald-400' : isModified ? 'text-blue-400' : 'text-vscode-text'}>
                    {line || ' '}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
