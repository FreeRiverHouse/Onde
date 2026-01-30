'use client';

import { useReaderStore } from '@/store/readerStore';

interface TocItem {
  id: string;
  href: string;
  label: string;
  subitems?: TocItem[];
}

interface TableOfContentsProps {
  items: TocItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function TableOfContents({ items, currentIndex, onSelect }: TableOfContentsProps) {
  const { settings, toggleToc } = useReaderStore();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={toggleToc}
      />
      
      {/* Panel */}
      <div className={`fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] z-50 shadow-2xl flex flex-col ${
        settings.theme === 'dark' ? 'bg-gray-800 text-white' :
        settings.theme === 'sepia' ? 'bg-sepia-200 text-sepia-900' :
        'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Table of Contents</h3>
          <button
            onClick={toggleToc}
            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        
        {/* Items */}
        <nav className="flex-1 overflow-y-auto p-2">
          {items.map((item, index) => (
            <TocItemButton
              key={item.id}
              item={item}
              index={index}
              isActive={index === currentIndex}
              onSelect={onSelect}
              settings={settings}
            />
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm opacity-70 text-center">
            {items.length} chapters
          </div>
        </div>
      </div>
    </>
  );
}

interface TocItemButtonProps {
  item: TocItem;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  settings: { theme: string };
  depth?: number;
}

function TocItemButton({ item, index, isActive, onSelect, settings, depth = 0 }: TocItemButtonProps) {
  return (
    <div style={{ paddingLeft: `${depth * 16}px` }}>
      <button
        onClick={() => onSelect(index)}
        className={`w-full text-left px-4 py-3 rounded-lg transition-colors mb-1 ${
          isActive
            ? settings.theme === 'dark' 
              ? 'bg-blue-900/50 text-blue-300'
              : 'bg-blue-100 text-blue-700'
            : 'hover:bg-black/5 dark:hover:bg-white/5'
        }`}
      >
        <span className="flex items-center gap-3">
          {isActive && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
          <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
        </span>
      </button>
      
      {item.subitems?.map((subitem, subIndex) => (
        <TocItemButton
          key={subitem.id}
          item={subitem}
          index={index + subIndex + 1}
          isActive={false}
          onSelect={onSelect}
          settings={settings}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
