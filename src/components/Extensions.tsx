import React, { useState } from 'react';
import { Search, Star, Download, ShieldCheck, Globe, Sparkles, Code2 } from 'lucide-react';
import { MOCK_EXTENSIONS, Extension } from '../constants';
import { cn } from '../lib/utils';

export function Extensions({ onSelect }: { onSelect: (ext: Extension) => void }) {
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col h-full bg-vscode-sidebar border-r border-vscode-border">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-vscode-text/40" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Extensions in Marketplace"
            className="w-full bg-vscode-bg border border-vscode-border rounded px-8 py-1 text-xs focus:outline-none focus:border-vscode-status"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-vscode-text/60">Installed</div>
        {MOCK_EXTENSIONS.filter(e => e.installed).map(ext => (
          <ExtensionItem key={ext.id} extension={ext} onClick={() => onSelect(ext)} />
        ))}
        
        <div className="px-4 py-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-vscode-text/60">Recommended</div>
        {MOCK_EXTENSIONS.filter(e => !e.installed).map(ext => (
          <ExtensionItem key={ext.id} extension={ext} onClick={() => onSelect(ext)} />
        ))}
      </div>
    </div>
  );
}

function ExtensionItem({ extension, onClick }: { extension: Extension, onClick: () => void }) {
  const Icon = extension.icon === 'sparkles' ? Sparkles : extension.icon === 'shield-check' ? ShieldCheck : Code2;
  
  return (
    <div 
      onClick={onClick}
      className="flex items-start p-4 hover:bg-vscode-hover cursor-pointer group"
    >
      <div className="w-10 h-10 bg-vscode-bg rounded flex items-center justify-center mr-3 shrink-0 border border-vscode-border group-hover:border-vscode-status">
        <Icon size={20} className="text-vscode-status" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="font-bold text-xs truncate text-vscode-text-bright">{extension.name}</div>
          {extension.installed && <ShieldCheck size={12} className="text-blue-400" />}
        </div>
        <div className="text-[11px] text-vscode-text/60 truncate">{extension.publisher}</div>
        <div className="text-[11px] text-vscode-text/80 line-clamp-2 mt-1 leading-tight">{extension.description}</div>
      </div>
    </div>
  );
}

export function ExtensionDetail({ extension, onBack }: { extension: Extension, onBack: () => void }) {
  const Icon = extension.icon === 'sparkles' ? Sparkles : extension.icon === 'shield-check' ? ShieldCheck : Code2;

  return (
    <div className="flex flex-col h-full bg-vscode-bg overflow-y-auto">
      <div className="p-8 flex items-start space-x-8 border-b border-vscode-border">
        <div className="w-32 h-32 bg-vscode-sidebar rounded flex items-center justify-center shrink-0 border border-vscode-border">
          <Icon size={64} className="text-vscode-status" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-vscode-text-bright">{extension.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="text-vscode-status hover:underline cursor-pointer">{extension.publisher}</span>
              <span className="text-vscode-text/40">|</span>
              <div className="flex items-center">
                <Download size={14} className="mr-1" />
                <span>{extension.installs}</span>
              </div>
              <span className="text-vscode-text/40">|</span>
              <div className="flex items-center">
                <Star size={14} className="mr-1 text-yellow-500" />
                <span>{extension.rating}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {extension.installed ? (
              <>
                <button className="bg-vscode-active hover:bg-vscode-hover px-4 py-1 text-sm rounded">Uninstall</button>
                <button className="bg-vscode-status hover:bg-blue-600 px-4 py-1 text-sm rounded text-white">Disable</button>
              </>
            ) : (
              <button className="bg-vscode-status hover:bg-blue-600 px-6 py-1 text-sm rounded text-white">Install</button>
            )}
          </div>
          <p className="text-vscode-text/80">{extension.description}</p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-bold border-b border-vscode-border pb-2">Details</h2>
            <p>This extension provides comprehensive support for {extension.name.split(' ')[0]}. It includes features like IntelliSense, linting, debugging, and more.</p>
            <h3 className="text-lg font-bold mt-4">Features</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>High-performance code analysis</li>
              <li>Intelligent code completion</li>
              <li>Advanced debugging support</li>
              <li>Seamless integration with VS Code</li>
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase text-vscode-text/40">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-vscode-sidebar px-2 py-0.5 rounded text-xs">Programming Languages</span>
              <span className="bg-vscode-sidebar px-2 py-0.5 rounded text-xs">Linters</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase text-vscode-text/40">Resources</h3>
            <ul className="text-xs space-y-1 text-vscode-status">
              <li className="hover:underline cursor-pointer flex items-center"><Globe size={12} className="mr-2" /> Marketplace</li>
              <li className="hover:underline cursor-pointer flex items-center"><Globe size={12} className="mr-2" /> Repository</li>
              <li className="hover:underline cursor-pointer flex items-center"><Globe size={12} className="mr-2" /> License</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase text-vscode-text/40">Extension ID</h3>
            <div className="text-xs font-mono text-vscode-text/60">{extension.publisher.toLowerCase()}.{extension.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
