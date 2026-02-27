import React from 'react';
import { FileCode, Plus, FolderOpen, Github, ArrowRight } from 'lucide-react';

export function Welcome({ onOpenFile }: { onOpenFile: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-vscode-bg p-12 overflow-y-auto">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-light text-vscode-text-bright mb-2">Visual Studio Code</h1>
            <p className="text-xl text-vscode-text/60">Editing evolved</p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Start</h2>
            <ul className="space-y-2">
              <WelcomeLink icon={Plus} label="New File..." />
              <WelcomeLink icon={FolderOpen} label="Open File..." onClick={onOpenFile} />
              <WelcomeLink icon={Github} label="Clone Git Repository..." />
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium">Recent</h2>
            <div className="text-sm text-vscode-text/40 italic">No recent folders</div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Walkthroughs</h2>
            <div className="bg-vscode-sidebar p-4 rounded border border-vscode-border hover:border-vscode-status cursor-pointer transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-vscode-text-bright">Get Started with VS Code</div>
                  <div className="text-xs text-vscode-text/60">Discover the best customizations...</div>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium">Help</h2>
            <ul className="space-y-2 text-sm text-vscode-status hover:underline cursor-pointer">
              <li>Printable keyboard cheat sheet</li>
              <li>Introductory videos</li>
              <li>Tips and Tricks</li>
              <li>Product documentation</li>
              <li>GitHub repository</li>
              <li>Stack Overflow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeLink({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
  return (
    <li 
      onClick={onClick}
      className="flex items-center text-vscode-status hover:underline cursor-pointer group"
    >
      <Icon size={18} className="mr-2 text-vscode-text/60 group-hover:text-vscode-status" />
      <span>{label}</span>
    </li>
  );
}
