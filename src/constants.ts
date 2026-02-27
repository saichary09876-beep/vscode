export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

export interface Extension {
  id: string;
  name: string;
  publisher: string;
  description: string;
  version: string;
  installs: string;
  rating: number;
  icon: string;
  installed: boolean;
}

export interface Problem {
  id: string;
  file: string;
  line: number;
  col: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export const MOCK_FILES: FileNode[] = [
  {
    id: 'root',
    name: 'vscode-clone',
    type: 'directory',
    isOpen: true,
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'directory',
        isOpen: true,
        children: [
          {
            id: 'app-tsx',
            name: 'App.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';
import { Layout } from './components/Layout';

export default function App() {
  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Welcome to VS Code Clone</h1>
        <p className="mt-4 text-slate-400">
          This is a high-fidelity clone of VS Code built with React and Tailwind.
        </p>
      </div>
    </Layout>
  );
}`,
          },
          {
            id: 'main-tsx',
            name: 'main.tsx',
            type: 'file',
            language: 'typescript',
            content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
          },
        ],
      },
      {
        id: 'package-json',
        name: 'package.json',
        type: 'file',
        language: 'json',
        content: `{
  "name": "vscode-clone",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "lucide-react": "^0.284.0"
  }
}`,
      },
      {
        id: 'conflict-ts',
        name: 'conflict.ts',
        type: 'file',
        language: 'typescript',
        content: `<<<<<<< HEAD
export const config = {
  port: 3000,
  host: 'localhost'
};
=======
export const config = {
  port: 8080,
  host: '0.0.0.0'
};
>>>>>>> feature/new-server`,
      },
    ],
  },
];

export const MOCK_EXTENSIONS: Extension[] = [
  {
    id: 'prettier',
    name: 'Prettier - Code formatter',
    publisher: 'Prettier',
    description: 'Opinionated code formatter',
    version: '10.1.0',
    installs: '36M',
    rating: 4.5,
    icon: 'sparkles',
    installed: true,
  },
  {
    id: 'eslint',
    name: 'ESLint',
    publisher: 'Microsoft',
    description: 'Integrates ESLint JavaScript into VS Code.',
    version: '2.4.2',
    installs: '28M',
    rating: 4.8,
    icon: 'shield-check',
    installed: true,
  },
  {
    id: 'python',
    name: 'Python',
    publisher: 'Microsoft',
    description: 'IntelliSense (Pylance), Linting, Debugging (multi-threaded, remote), Jupyter Notebooks, code formatting, refactoring, unit tests, and more.',
    version: '2023.14.0',
    installs: '92M',
    rating: 4.2,
    icon: 'code-2',
    installed: false,
  },
];

export const MOCK_PROBLEMS: Problem[] = [
  { id: '1', file: 'App.tsx', line: 12, col: 5, message: 'Unused variable "count"', severity: 'warning' },
  { id: '2', file: 'main.tsx', line: 1, col: 10, message: 'Module not found: "react-dom/client"', severity: 'error' },
];

export const MENU_ITEMS = {
  File: ['New Text File', 'New File...', 'New Window', 'Open File...', 'Open Folder...', 'Save', 'Save As...', 'Exit'],
  Edit: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Find', 'Replace'],
  Selection: ['Select All', 'Expand Selection', 'Shrink Selection'],
  View: ['Command Palette...', 'Explorer', 'Search', 'Source Control', 'Run', 'Extensions', 'Output', 'Terminal'],
  Go: ['Back', 'Forward', 'Last Edit Location', 'Switch Editor', 'Go to File...', 'Go to Symbol in Editor...'],
  Run: ['Start Debugging', 'Run Without Debugging', 'Stop Debugging', 'Restart Debugging'],
  Terminal: ['New Terminal', 'Split Terminal', 'Run Active File', 'Run Selected Text'],
  Help: ['Welcome', 'Show All Commands', 'Documentation', 'Editor Playground', 'Release Notes', 'About'],
};
