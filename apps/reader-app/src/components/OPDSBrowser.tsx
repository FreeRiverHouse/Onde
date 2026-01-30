'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  OPDSCatalog,
  OPDSFeed,
  OPDSEntry,
  DEFAULT_CATALOGS,
  fetchOPDSFeed,
  searchOPDSCatalog,
  downloadEpub,
  getNavigationLinks,
  validateOPDSCatalog,
} from '@/lib/opds';
import { useReaderStore } from '@/store/readerStore';
import { storeEpubFile } from '@/lib/epubStorage';

interface OPDSBrowserProps {
  onClose: () => void;
  theme: 'light' | 'dark' | 'sepia';
}

export function OPDSBrowser({ onClose, theme }: OPDSBrowserProps) {
  const { addBook } = useReaderStore();
  
  // UI state
  const [view, setView] = useState<'catalogs' | 'browse' | 'add-catalog'>('catalogs');
  const [catalogs, setCatalogs] = useState<OPDSCatalog[]>(DEFAULT_CATALOGS);
  const [currentCatalog, setCurrentCatalog] = useState<OPDSCatalog | null>(null);
  const [feed, setFeed] = useState<OPDSFeed | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ title: string; url: string }[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Custom catalog form
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [validating, setValidating] = useState(false);
  
  // Theme-based styles
  const bgColor = theme === 'dark' ? 'bg-gray-900' : theme === 'sepia' ? 'bg-amber-50' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-gray-100' : theme === 'sepia' ? 'text-amber-900' : 'text-gray-900';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : theme === 'sepia' ? 'bg-amber-100/50' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-gray-700' : theme === 'sepia' ? 'border-amber-200' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-gray-700' : theme === 'sepia' ? 'hover:bg-amber-100' : 'hover:bg-gray-100';
  
  // Load custom catalogs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onde-opds-catalogs');
    if (saved) {
      try {
        const custom = JSON.parse(saved) as OPDSCatalog[];
        setCatalogs([...DEFAULT_CATALOGS, ...custom]);
      } catch {
        // Ignore
      }
    }
  }, []);
  
  // Save custom catalogs
  const saveCustomCatalogs = useCallback((allCatalogs: OPDSCatalog[]) => {
    const custom = allCatalogs.filter((c) => !DEFAULT_CATALOGS.find((d) => d.id === c.id));
    localStorage.setItem('onde-opds-catalogs', JSON.stringify(custom));
  }, []);
  
  // Open a catalog
  const openCatalog = useCallback(async (catalog: OPDSCatalog) => {
    setCurrentCatalog(catalog);
    setView('browse');
    setLoading(true);
    setError(null);
    setBreadcrumbs([{ title: catalog.name, url: catalog.url }]);
    
    try {
      const result = await fetchOPDSFeed(catalog.url);
      setFeed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Navigate to a URL within the catalog
  const navigateTo = useCallback(async (url: string, title: string, addToBreadcrumbs = true) => {
    setLoading(true);
    setError(null);
    
    if (addToBreadcrumbs) {
      setBreadcrumbs((prev) => [...prev, { title, url }]);
    }
    
    try {
      const result = await fetchOPDSFeed(url);
      setFeed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Go back in breadcrumbs
  const goBack = useCallback(async (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    
    const target = newBreadcrumbs[newBreadcrumbs.length - 1];
    if (target) {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchOPDSFeed(target.url);
        setFeed(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    }
  }, [breadcrumbs]);
  
  // Search catalog
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !currentCatalog) return;
    
    setIsSearching(true);
    setLoading(true);
    setError(null);
    
    try {
      if (currentCatalog.searchUrl) {
        const result = await searchOPDSCatalog(currentCatalog, searchQuery);
        setFeed(result);
        setBreadcrumbs([
          { title: currentCatalog.name, url: currentCatalog.url },
          { title: `Search: "${searchQuery}"`, url: '' },
        ]);
      } else {
        setError('This catalog does not support search');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [searchQuery, currentCatalog]);
  
  // Download and add a book
  const handleDownload = useCallback(async (entry: OPDSEntry) => {
    if (!entry.epubUrl) {
      setError('No EPUB download available for this book');
      return;
    }
    
    setDownloadingId(entry.id);
    
    try {
      // Download the EPUB
      const blob = await downloadEpub(entry.epubUrl);
      
      // Convert blob to ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer();
      
      // Generate a unique book ID
      const bookId = crypto.randomUUID();
      
      // Store in IndexedDB
      await storeEpubFile(bookId, arrayBuffer);
      
      // Add to library
      addBook({
        id: bookId,
        title: entry.title,
        author: entry.author || 'Unknown',
        cover: entry.coverUrl,
        progress: 0,
      });
      
      // Show success (could use a toast here)
      alert(`"${entry.title}" added to your library!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download book');
    } finally {
      setDownloadingId(null);
    }
  }, [addBook]);
  
  // Add custom catalog
  const handleAddCatalog = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    
    setValidating(true);
    setError(null);
    
    try {
      const validation = await validateOPDSCatalog(customUrl);
      
      if (!validation.valid) {
        setError(validation.error || 'Invalid OPDS catalog');
        return;
      }
      
      const newCatalog: OPDSCatalog = {
        id: `custom-${Date.now()}`,
        name: customName.trim() || validation.title || 'Custom Catalog',
        url: customUrl,
        icon: '📁',
        description: 'Custom OPDS catalog',
      };
      
      const newCatalogs = [...catalogs, newCatalog];
      setCatalogs(newCatalogs);
      saveCustomCatalogs(newCatalogs);
      
      setCustomUrl('');
      setCustomName('');
      setView('catalogs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add catalog');
    } finally {
      setValidating(false);
    }
  }, [customUrl, customName, catalogs, saveCustomCatalogs]);
  
  // Remove custom catalog
  const removeCatalog = useCallback((catalogId: string) => {
    const newCatalogs = catalogs.filter((c) => c.id !== catalogId);
    setCatalogs(newCatalogs);
    saveCustomCatalogs(newCatalogs);
  }, [catalogs, saveCustomCatalogs]);
  
  // Navigation links
  const navLinks = feed ? getNavigationLinks(feed) : null;
  
  return (
    <div className={`fixed inset-0 z-50 ${bgColor} ${textColor} flex flex-col`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-3 border-b ${borderColor}`}>
        <div className="flex items-center gap-3">
          {view !== 'catalogs' && (
            <button
              onClick={() => {
                if (view === 'add-catalog') {
                  setView('catalogs');
                } else {
                  setView('catalogs');
                  setFeed(null);
                  setCurrentCatalog(null);
                  setBreadcrumbs([]);
                }
              }}
              className={`p-2 rounded-lg ${hoverBg}`}
            >
              ← Back
            </button>
          )}
          <h1 className="text-lg font-semibold">
            {view === 'catalogs' && '📚 OPDS Catalogs'}
            {view === 'browse' && currentCatalog?.name}
            {view === 'add-catalog' && 'Add Catalog'}
          </h1>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg ${hoverBg}`}
        >
          ✕
        </button>
      </header>
      
      {/* Breadcrumbs */}
      {view === 'browse' && breadcrumbs.length > 1 && (
        <div className={`px-4 py-2 border-b ${borderColor} text-sm flex flex-wrap gap-1`}>
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1">
              {idx > 0 && <span className="opacity-50">/</span>}
              {idx < breadcrumbs.length - 1 ? (
                <button
                  onClick={() => goBack(idx)}
                  className="text-blue-500 hover:underline"
                >
                  {crumb.title}
                </button>
              ) : (
                <span className="font-medium">{crumb.title}</span>
              )}
            </span>
          ))}
        </div>
      )}
      
      {/* Search bar */}
      {view === 'browse' && currentCatalog?.searchUrl && (
        <form
          onSubmit={handleSearch}
          className={`px-4 py-3 border-b ${borderColor} flex gap-2`}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${bgColor}`}
          />
          <button
            type="submit"
            disabled={loading || isSearching}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSearching ? '...' : '🔍'}
          </button>
        </form>
      )}
      
      {/* Error message */}
      {error && (
        <div className="px-4 py-3 bg-red-100 text-red-700 border-b border-red-200">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 overflow-auto p-4">
        {/* Catalogs list */}
        {view === 'catalogs' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catalogs.map((catalog) => (
                <div
                  key={catalog.id}
                  className={`${cardBg} rounded-xl p-4 border ${borderColor} cursor-pointer ${hoverBg} transition-colors relative`}
                  onClick={() => openCatalog(catalog)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{catalog.icon || '📚'}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{catalog.name}</h3>
                      {catalog.description && (
                        <p className="text-sm opacity-70 line-clamp-2">
                          {catalog.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Remove button for custom catalogs */}
                  {!DEFAULT_CATALOGS.find((d) => d.id === catalog.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove "${catalog.name}"?`)) {
                          removeCatalog(catalog.id);
                        }
                      }}
                      className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add catalog button */}
              <button
                onClick={() => setView('add-catalog')}
                className={`${cardBg} rounded-xl p-4 border-2 border-dashed ${borderColor} ${hoverBg} transition-colors flex items-center justify-center gap-2`}
              >
                <span className="text-2xl">➕</span>
                <span>Add Catalog</span>
              </button>
            </div>
            
            <p className="text-sm opacity-60 text-center">
              Browse free ebooks from public OPDS catalogs
            </p>
          </div>
        )}
        
        {/* Add catalog form */}
        {view === 'add-catalog' && (
          <form onSubmit={handleAddCatalog} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Catalog URL *
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/catalog.opds"
                required
                className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgColor}`}
              />
              <p className="text-xs opacity-60 mt-1">
                Enter the URL of an OPDS catalog feed
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Name (optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="My Catalog"
                className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgColor}`}
              />
            </div>
            
            <button
              type="submit"
              disabled={validating || !customUrl.trim()}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {validating ? 'Validating...' : 'Add Catalog'}
            </button>
          </form>
        )}
        
        {/* Browse feed */}
        {view === 'browse' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin text-4xl">📖</div>
              </div>
            ) : feed ? (
              <div className="space-y-4">
                {/* Feed title */}
                {feed.title && feed.title !== currentCatalog?.name && (
                  <h2 className="text-xl font-semibold">{feed.title}</h2>
                )}
                
                {/* Navigation subsections (if any) */}
                {feed.links.filter((l) => 
                  l.rel?.includes('subsection') || 
                  l.type?.includes('navigation')
                ).length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {feed.links
                      .filter((l) => 
                        l.rel?.includes('subsection') || 
                        l.type?.includes('navigation')
                      )
                      .map((link, idx) => (
                        <button
                          key={idx}
                          onClick={() => navigateTo(link.href, link.title || 'Section')}
                          className={`${cardBg} rounded-lg p-3 border ${borderColor} ${hoverBg} text-left`}
                        >
                          📂 {link.title || 'Browse'}
                        </button>
                      ))}
                  </div>
                )}
                
                {/* Book entries */}
                {feed.entries.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {feed.entries.map((entry) => (
                      <BookCard
                        key={entry.id}
                        entry={entry}
                        onDownload={() => handleDownload(entry)}
                        onNavigate={(url, title) => navigateTo(url, title)}
                        downloading={downloadingId === entry.id}
                        theme={theme}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center opacity-60 py-8">
                    No books found
                  </p>
                )}
                
                {/* Pagination */}
                {(navLinks?.next || navLinks?.previous) && (
                  <div className="flex justify-center gap-4 pt-4">
                    {navLinks.previous && (
                      <button
                        onClick={() => navigateTo(navLinks.previous!, 'Previous', false)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        ← Previous
                      </button>
                    )}
                    {navLinks.next && (
                      <button
                        onClick={() => navigateTo(navLinks.next!, 'Next', false)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                )}
                
                {/* Total results info */}
                {feed.totalResults && (
                  <p className="text-center text-sm opacity-60">
                    {feed.totalResults} total results
                  </p>
                )}
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

// Book card component
function BookCard({
  entry,
  onDownload,
  onNavigate,
  downloading,
  theme,
}: {
  entry: OPDSEntry;
  onDownload: () => void;
  onNavigate: (url: string, title: string) => void;
  downloading: boolean;
  theme: 'light' | 'dark' | 'sepia';
}) {
  const cardBg = theme === 'dark' ? 'bg-gray-800' : theme === 'sepia' ? 'bg-amber-100/50' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-gray-700' : theme === 'sepia' ? 'border-amber-200' : 'border-gray-200';
  
  // Check if this is a navigation entry (leads to another feed)
  const navLink = entry.links.find(
    (l) => l.type?.includes('navigation') || l.type?.includes('acquisition/borrow')
  );
  
  return (
    <div className={`${cardBg} rounded-xl overflow-hidden border ${borderColor} flex flex-col`}>
      {/* Cover image */}
      <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 relative">
        {entry.coverUrl || entry.thumbnailUrl ? (
          <img
            src={entry.coverUrl || entry.thumbnailUrl}
            alt={entry.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">
            📖
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold line-clamp-2">{entry.title}</h3>
        {entry.author && (
          <p className="text-sm opacity-70">{entry.author}</p>
        )}
        {entry.summary && (
          <p className="text-xs opacity-60 mt-1 line-clamp-2">{entry.summary}</p>
        )}
        
        {/* Categories */}
        {entry.categories && entry.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {entry.categories.slice(0, 3).map((cat, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-auto pt-3 flex gap-2">
          {entry.epubUrl ? (
            <button
              onClick={onDownload}
              disabled={downloading}
              className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-medium"
            >
              {downloading ? '⏳ Downloading...' : '📥 Add to Library'}
            </button>
          ) : navLink ? (
            <button
              onClick={() => onNavigate(navLink.href, entry.title)}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
            >
              Browse →
            </button>
          ) : (
            <span className="text-sm opacity-50">No EPUB available</span>
          )}
        </div>
      </div>
    </div>
  );
}
