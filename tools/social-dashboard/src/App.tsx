import { useState, useEffect, useCallback } from 'react';
import './App.css';
import type { Post, Toast, AccountType, CalendarData, CalendarPost, PostStatus } from './types';
import { TweetPreview } from './components/TweetPreview';
import { EditModal } from './components/EditModal';
import { ToastContainer } from './components/Toast';
import { SCHEDULE } from './data/accounts';

// Filter type
type FilterType = 'all' | 'onde' | 'frh' | 'magmatic' | 'approved' | 'rejected';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);

  // Load posts from JSON files
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Load from multiple calendar sources
      const sources = [
        '/data/content-queue.json',
        '/data/new-calendar-2026-01-19.json',
      ];

      const allPosts: Post[] = [];
      let postIndex = 0;

      for (const source of sources) {
        try {
          const response = await fetch(source);
          if (response.ok) {
            const data: CalendarData = await response.json();

            // Process Onde posts
            if (data.onde) {
              data.onde.forEach((p: CalendarPost) => {
                allPosts.push(normalizePost(p, 'onde', postIndex++));
              });
            }

            // Process FRH posts (could be 'frh' or 'freeriverhouse')
            const frhPosts = data.frh || data.freeriverhouse;
            if (frhPosts) {
              frhPosts.forEach((p: CalendarPost) => {
                allPosts.push(normalizePost(p, 'frh', postIndex++));
              });
            }

            // Process Magmatic posts
            if (data.magmatic) {
              data.magmatic.forEach((p: CalendarPost) => {
                allPosts.push(normalizePost(p, 'magmatic', postIndex++));
              });
            }
          }
        } catch (e) {
          console.warn(`Could not load ${source}:`, e);
        }
      }

      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      showToast('Error loading posts', 'error');
    }
    setLoading(false);
  };

  const normalizePost = (p: CalendarPost, defaultAccount: AccountType, index: number): Post => {
    const account = (p.account as AccountType) || defaultAccount;
    const scheduleSlot = index % SCHEDULE[account].length;
    const dayOffset = Math.floor(index / SCHEDULE[account].length);
    const scheduledTime = SCHEDULE[account][scheduleSlot];

    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const scheduledDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      id: p.id || `post-${index}-${Date.now()}`,
      text: p.text,
      account,
      type: p.type || 'text',
      status: (p.status as PostStatus) || 'queued',
      image: p.image,
      scheduledTime,
      scheduledDate,
      metadata: p.metadata,
    };
  };

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Handle approve
  const handleApprove = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' as PostStatus } : p))
    );
    showToast('Post approved! Added to calendar.', 'success');
  }, [showToast]);

  // Handle reject
  const handleReject = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' as PostStatus } : p))
    );
    showToast('Post rejected.', 'error');
  }, [showToast]);

  // Handle edit
  const handleEdit = useCallback((post: Post) => {
    setEditingPost(post);
  }, []);

  // Handle save edit
  const handleSaveEdit = useCallback((post: Post, newText: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, text: newText } : p))
    );
    setEditingPost(null);
    showToast('Post updated successfully.', 'success');
  }, [showToast]);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    switch (filter) {
      case 'onde':
      case 'frh':
      case 'magmatic':
        return post.account === filter;
      case 'approved':
        return post.status === 'approved';
      case 'rejected':
        return post.status === 'rejected';
      default:
        return post.status === 'queued';
    }
  });

  // Stats
  const stats = {
    total: posts.length,
    queued: posts.filter((p) => p.status === 'queued').length,
    approved: posts.filter((p) => p.status === 'approved').length,
    rejected: posts.filter((p) => p.status === 'rejected').length,
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>
            <span>Onde</span> Social Dashboard
          </h1>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Queue ({stats.queued})
            </button>
            <button
              className={`filter-tab ${filter === 'onde' ? 'active' : ''}`}
              onClick={() => setFilter('onde')}
            >
              Onde
            </button>
            <button
              className={`filter-tab ${filter === 'frh' ? 'active' : ''}`}
              onClick={() => setFilter('frh')}
            >
              FRH
            </button>
            <button
              className={`filter-tab ${filter === 'magmatic' ? 'active' : ''}`}
              onClick={() => setFilter('magmatic')}
            >
              Magmatic
            </button>
            <button
              className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved ({stats.approved})
            </button>
            <button
              className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({stats.rejected})
            </button>
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="stat">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.queued}</span>
              <span className="stat-label">Queued</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.approved}</span>
              <span className="stat-label">Approved</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">Loading...</div>
            <h3>Loading posts...</h3>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {filter === 'all' ? '📭' : filter === 'approved' ? '✨' : '🗑️'}
            </div>
            <h3>
              {filter === 'all'
                ? 'No posts in queue'
                : filter === 'approved'
                ? 'No approved posts yet'
                : filter === 'rejected'
                ? 'No rejected posts'
                : `No ${filter} posts in queue`}
            </h3>
            <p>
              {filter === 'all'
                ? 'All caught up! Add more content to the calendar.'
                : 'Posts will appear here once they match this filter.'}
            </p>
          </div>
        ) : (
          <div className="post-queue">
            {filteredPosts.map((post) => (
              <TweetPreview
                key={post.id}
                post={post}
                onApprove={handleApprove}
                onEdit={handleEdit}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      <EditModal post={editingPost} onClose={() => setEditingPost(null)} onSave={handleSaveEdit} />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
