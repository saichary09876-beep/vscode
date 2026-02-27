import React, { useState } from 'react';
import { Search, Code, Monitor, Settings as SettingsIcon, Layers, Puzzle } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const [view, setView] = useState<'ui' | 'json'>('ui');
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col h-full bg-vscode-bg">
      <div className="flex items-center justify-between px-8 py-4 border-b border-vscode-border">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl">Settings</h1>
          <div className="flex bg-vscode-sidebar rounded p-0.5">
            <button 
              onClick={() => setView('ui')}
              className={cn("px-3 py-1 text-xs rounded", view === 'ui' ? "bg-vscode-active text-vscode-text-bright" : "hover:bg-vscode-hover")}
            >
              User
            </button>
            <button 
              onClick={() => setView('json')}
              className={cn("px-3 py-1 text-xs rounded", view === 'json' ? "bg-vscode-active text-vscode-text-bright" : "hover:bg-vscode-hover")}
            >
              Workspace
            </button>
          </div>
        </div>
        <div className="relative w-96">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-vscode-text/40" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search settings"
            className="w-full bg-vscode-sidebar border border-vscode-border rounded px-8 py-1 text-sm focus:outline-none focus:border-vscode-status"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-vscode-border py-4 overflow-y-auto">
          <SettingsNavItem icon={SettingsIcon} label="Commonly Used" active />
          <SettingsNavItem icon={Code} label="Text Editor" />
          <SettingsNavItem icon={Monitor} label="Window" />
          <SettingsNavItem icon={Layers} label="Features" />
          <SettingsNavItem icon={Monitor} label="Application" />
          <SettingsNavItem icon={Puzzle} label="Extensions" />
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-8">
          {view === 'ui' ? (
            <>
              <section className="space-y-4">
                <h2 className="text-lg text-vscode-text-bright">Text Editor</h2>
                <SettingItem 
                  label="Editor: Auto Save" 
                  description="Controls auto save of dirty files."
                  type="select"
                  options={['off', 'afterDelay', 'onFocusChange', 'onWindowChange']}
                  value="off"
                />
                <SettingItem 
                  label="Editor: Font Family" 
                  description="Controls the font family."
                  type="text"
                  value="'Cascadia Code', 'Consolas', monospace"
                />
                <SettingItem 
                  label="Editor: Font Size" 
                  description="Controls the font size in pixels."
                  type="number"
                  value={14}
                />
              </section>

              <section className="space-y-4">
                <h2 className="text-lg text-vscode-text-bright">Files</h2>
                <SettingItem 
                  label="Files: Auto Guess Encoding" 
                  description="When enabled, the editor will attempt to guess the character set encoding when opening files."
                  type="checkbox"
                  value={false}
                />
              </section>
            </>
          ) : (
            <div className="font-mono text-sm bg-vscode-sidebar p-4 rounded border border-vscode-border h-full overflow-auto whitespace-pre">
{`{
  "editor.fontSize": 14,
  "editor.fontFamily": "'Cascadia Code', 'Consolas', monospace",
  "editor.autoSave": "off",
  "files.autoGuessEncoding": false,
  "workbench.colorTheme": "Default Dark Modern",
  "terminal.integrated.fontSize": 12
}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsNavItem({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center px-4 py-1.5 text-sm cursor-pointer transition-colors",
      active ? "text-vscode-status bg-vscode-active/20 border-l-2 border-vscode-status" : "hover:bg-vscode-hover"
    )}>
      <Icon size={16} className="mr-2" />
      <span>{label}</span>
    </div>
  );
}

function SettingItem({ label, description, type, options, value }: any) {
  return (
    <div className="space-y-2 max-w-2xl">
      <div className="font-medium text-vscode-text-bright">{label}</div>
      <div className="text-sm text-vscode-text/60">{description}</div>
      {type === 'text' || type === 'number' ? (
        <input 
          type={type}
          defaultValue={value}
          className="w-full bg-vscode-sidebar border border-vscode-border rounded px-2 py-1 text-sm focus:outline-none focus:border-vscode-status"
        />
      ) : type === 'select' ? (
        <select className="w-full bg-vscode-sidebar border border-vscode-border rounded px-2 py-1 text-sm focus:outline-none focus:border-vscode-status">
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'checkbox' ? (
        <input type="checkbox" defaultChecked={value} className="rounded bg-vscode-sidebar border-vscode-border text-vscode-status focus:ring-vscode-status" />
      ) : null}
    </div>
  );
}
