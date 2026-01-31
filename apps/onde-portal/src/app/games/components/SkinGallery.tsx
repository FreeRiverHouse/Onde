'use client';

import { useState, useEffect } from 'react';

// Gallery skin interface
export interface GallerySkin {
  id: string;
  name: string;
  author: string;
  imageData: string; // base64 PNG
  tags: string[];
  likes: number;
  downloads: number;
  createdAt: number;
  gameType: 'minecraft' | 'roblox';
}

// Sample skins for demo (will be replaced with real backend)
const SAMPLE_SKINS: GallerySkin[] = [
  {
    id: '1',
    name: 'Cool Robot',
    author: 'SkinMaster',
    imageData: '', // Will be generated
    tags: ['robot', 'tech', 'cool'],
    likes: 42,
    downloads: 128,
    createdAt: Date.now() - 86400000,
    gameType: 'minecraft',
  },
  {
    id: '2', 
    name: 'Fire Dragon',
    author: 'DragonLord',
    imageData: '',
    tags: ['dragon', 'fire', 'fantasy'],
    likes: 89,
    downloads: 234,
    createdAt: Date.now() - 172800000,
    gameType: 'minecraft',
  },
  {
    id: '3',
    name: 'Space Explorer',
    author: 'NASAFan',
    imageData: '',
    tags: ['space', 'astronaut', 'sci-fi'],
    likes: 156,
    downloads: 512,
    createdAt: Date.now() - 259200000,
    gameType: 'minecraft',
  },
  {
    id: '4',
    name: 'Rainbow Unicorn',
    author: 'MagicGirl',
    imageData: '',
    tags: ['unicorn', 'rainbow', 'cute'],
    likes: 234,
    downloads: 789,
    createdAt: Date.now() - 345600000,
    gameType: 'minecraft',
  },
  {
    id: '5',
    name: 'Ninja Master',
    author: 'ShadowWarrior',
    imageData: '',
    tags: ['ninja', 'stealth', 'cool'],
    likes: 178,
    downloads: 456,
    createdAt: Date.now() - 432000000,
    gameType: 'minecraft',
  },
  {
    id: '6',
    name: 'Pixel Cat',
    author: 'CatLover99',
    imageData: '',
    tags: ['cat', 'cute', 'animal'],
    likes: 321,
    downloads: 987,
    createdAt: Date.now() - 518400000,
    gameType: 'minecraft',
  },
];

// Generate colorful placeholder skin
function generatePlaceholderSkin(seed: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Generate colors based on seed
  const hash = seed.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 120) % 360;
  
  // Fill background
  ctx.fillStyle = `hsl(${hue1}, 70%, 60%)`;
  ctx.fillRect(0, 0, 64, 64);
  
  // Add some pattern
  ctx.fillStyle = `hsl(${hue2}, 70%, 50%)`;
  for (let i = 0; i < 20; i++) {
    const x = Math.abs((hash * (i + 1)) % 64);
    const y = Math.abs((hash * (i + 2)) % 64);
    ctx.fillRect(x, y, 4, 4);
  }
  
  // Head area highlight
  ctx.fillStyle = `hsl(${hue1}, 60%, 70%)`;
  ctx.fillRect(8, 8, 16, 8);
  
  return canvas.toDataURL('image/png');
}

interface SkinGalleryProps {
  onSelectSkin: (imageData: string) => void;
  currentSkinData?: string;
  onUpload?: (skin: Omit<GallerySkin, 'id' | 'likes' | 'downloads' | 'createdAt'>) => void;
}

export default function SkinGallery({ onSelectSkin, currentSkinData, onUpload }: SkinGalleryProps) {
  const [skins, setSkins] = useState<GallerySkin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'likes' | 'downloads' | 'newest'>('likes');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState('');
  const [likedSkins, setLikedSkins] = useState<Set<string>>(new Set());

  // Initialize skins with generated images
  useEffect(() => {
    const skinsWithImages = SAMPLE_SKINS.map(skin => ({
      ...skin,
      imageData: generatePlaceholderSkin(skin.id + skin.name),
    }));
    
    // Load community skins from localStorage
    const savedSkins = localStorage.getItem('onde-gallery-skins');
    if (savedSkins) {
      try {
        const parsed = JSON.parse(savedSkins);
        skinsWithImages.push(...parsed);
      } catch (e) {
        console.error('Failed to parse saved skins:', e);
      }
    }
    
    setSkins(skinsWithImages);
    
    // Load liked skins
    const savedLikes = localStorage.getItem('onde-gallery-likes');
    if (savedLikes) {
      try {
        setLikedSkins(new Set(JSON.parse(savedLikes)));
      } catch (e) {
        console.error('Failed to parse saved likes:', e);
      }
    }
  }, []);

  // Filter and sort skins
  const filteredSkins = skins
    .filter(skin => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        skin.name.toLowerCase().includes(query) ||
        skin.author.toLowerCase().includes(query) ||
        skin.tags.some(tag => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'likes': return b.likes - a.likes;
        case 'downloads': return b.downloads - a.downloads;
        case 'newest': return b.createdAt - a.createdAt;
        default: return 0;
      }
    });

  const handleLike = (skinId: string) => {
    const newLiked = new Set(likedSkins);
    if (newLiked.has(skinId)) {
      newLiked.delete(skinId);
      setSkins(skins.map(s => s.id === skinId ? { ...s, likes: s.likes - 1 } : s));
    } else {
      newLiked.add(skinId);
      setSkins(skins.map(s => s.id === skinId ? { ...s, likes: s.likes + 1 } : s));
    }
    setLikedSkins(newLiked);
    localStorage.setItem('onde-gallery-likes', JSON.stringify([...newLiked]));
  };

  const handleDownload = (skin: GallerySkin) => {
    // Increment download count
    setSkins(skins.map(s => s.id === skin.id ? { ...s, downloads: s.downloads + 1 } : s));
    
    // Load into editor
    onSelectSkin(skin.imageData);
  };

  const handleUpload = () => {
    if (!currentSkinData || !uploadName.trim()) return;
    
    const newSkin: GallerySkin = {
      id: `user-${Date.now()}`,
      name: uploadName.trim(),
      author: uploadAuthor.trim() || 'Anonymous',
      imageData: currentSkinData,
      tags: uploadTags.split(',').map(t => t.trim()).filter(Boolean),
      likes: 0,
      downloads: 0,
      createdAt: Date.now(),
      gameType: 'minecraft',
    };
    
    const updatedSkins = [...skins, newSkin];
    setSkins(updatedSkins);
    
    // Save to localStorage (community skins only)
    const communitySkins = updatedSkins.filter(s => s.id.startsWith('user-'));
    localStorage.setItem('onde-gallery-skins', JSON.stringify(communitySkins));
    
    // Reset form
    setShowUploadModal(false);
    setUploadName('');
    setUploadTags('');
    setUploadAuthor('');
    
    if (onUpload) {
      onUpload(newSkin);
    }
  };

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🖼️</span>
          <h2 className="text-2xl font-bold text-gray-800">Community Gallery</h2>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
            {skins.length} skins
          </span>
        </div>
        
        {/* Search & Sort */}
        <div className="flex gap-2 flex-wrap justify-center">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search skins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-full border-2 border-gray-200 focus:border-purple-400 outline-none w-48"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 rounded-full border-2 border-gray-200 focus:border-purple-400 outline-none bg-white"
          >
            <option value="likes">🔥 Most Liked</option>
            <option value="downloads">📥 Most Downloaded</option>
            <option value="newest">🆕 Newest</option>
          </select>
          
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={!currentSkinData}
            className={`px-4 py-2 rounded-full font-bold transition-all ${
              currentSkinData
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            📤 Upload Your Skin
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredSkins.map((skin) => (
          <div
            key={skin.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 overflow-hidden group"
          >
            {/* Skin Preview */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 p-2">
              {skin.imageData && (
                <img
                  src={skin.imageData}
                  alt={skin.name}
                  className="w-full h-full object-contain image-rendering-pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleDownload(skin)}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
                  title="Use this skin"
                >
                  📥 Use
                </button>
              </div>
              
              {/* Game badge */}
              <span className="absolute top-1 right-1 text-lg" title={skin.gameType}>
                {skin.gameType === 'minecraft' ? '⛏️' : '🎮'}
              </span>
            </div>
            
            {/* Info */}
            <div className="p-2">
              <h3 className="font-bold text-sm truncate" title={skin.name}>
                {skin.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">by {skin.author}</p>
              
              {/* Tags */}
              <div className="flex gap-1 mt-1 flex-wrap">
                {skin.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between mt-2 text-xs">
                <button
                  onClick={() => handleLike(skin.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${
                    likedSkins.has(skin.id)
                      ? 'bg-red-100 text-red-500'
                      : 'bg-gray-100 text-gray-500 hover:bg-red-50'
                  }`}
                >
                  {likedSkins.has(skin.id) ? '❤️' : '🤍'} {skin.likes}
                </button>
                <span className="text-gray-400">📥 {skin.downloads}</span>
              </div>
              
              <p className="text-xs text-gray-400 mt-1">{formatDate(skin.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredSkins.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl">🎨</span>
          <p className="text-gray-500 mt-4">No skins found. Try a different search!</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">📤 Upload Your Skin</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Preview */}
            {currentSkinData && (
              <div className="mb-4 flex justify-center">
                <img
                  src={currentSkinData}
                  alt="Your skin"
                  className="w-32 h-32 border-4 border-purple-200 rounded-xl"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Skin Name *
                </label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g., Cool Dragon"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 outline-none"
                  maxLength={30}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={uploadAuthor}
                  onChange={(e) => setUploadAuthor(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 outline-none"
                  maxLength={20}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="e.g., dragon, fire, cool"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 outline-none"
                />
              </div>
              
              <button
                onClick={handleUpload}
                disabled={!uploadName.trim()}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                  uploadName.trim()
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                🚀 Share with Community!
              </button>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              By uploading, you agree to share your skin with the community 💜
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
