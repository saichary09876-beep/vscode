import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_ITEMS } from '../constants';
import { cn } from '../lib/utils';

export function MenuBar({ activeMenu, setActiveMenu, onAction }: { activeMenu: string | null, setActiveMenu: (menu: string | null) => void, onAction: (action: string) => void }) {
  const menus = Object.keys(MENU_ITEMS);

  return (
    <div className="flex h-9 bg-vscode-bg border-b border-vscode-border px-2 items-center space-x-1 select-none z-40">
      <div className="flex items-center px-2 mr-4">
        <div className="w-4 h-4 bg-vscode-status rounded-sm mr-2" />
      </div>
      {menus.map(menu => (
        <div key={menu} className="relative">
          <button 
            onMouseEnter={() => activeMenu && setActiveMenu(menu)}
            onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
            className={cn(
              "px-3 py-1 text-xs rounded hover:bg-vscode-hover transition-colors",
              activeMenu === menu ? "bg-vscode-hover text-vscode-text-bright" : "text-vscode-text"
            )}
          >
            {menu}
          </button>
          <AnimatePresence>
            {activeMenu === menu && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 top-full mt-1 w-64 bg-vscode-sidebar border border-vscode-border rounded shadow-2xl py-1 z-50"
              >
                {(MENU_ITEMS as any)[menu].map((item: string, i: number) => (
                  <div key={i}>
                    {item === '---' ? (
                      <div className="h-px bg-vscode-border my-1 mx-2" />
                    ) : (
                      <div 
                        onClick={() => { onAction(item); setActiveMenu(null); }}
                        className="px-4 py-1 text-xs text-vscode-text hover:bg-vscode-status hover:text-white cursor-pointer flex justify-between items-center"
                      >
                        <span>{item}</span>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
