'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// =============================================================================
// 🎨 COMMUNITY GALLERY - Showcase delle creazioni della community
// =============================================================================

// Skin interface for gallery items
interface CommunitySkin {
  id: string;
  name: string;
  author: string;
  authorAvatar?: string;
  imageData: string; // base64 PNG
  tags: string[];
  likes: number;
  downloads: number;
  views: number;
  createdAt: number;
  featured?: boolean;
  gameType: 'minecraft' | 'roblox';
  category: 'character' | 'fantasy' | 'sci-fi' | 'cute' | 'spooky' | 'gaming' | 'meme' | 'other';
}

// Categories with emojis
const CATEGORIES = [
  { id: 'all', name: 'All Skins', emoji: '🌟' },
  { id: 'character', name: 'Characters', emoji: '👤' },
  { id: 'fantasy', name: 'Fantasy', emoji: '🧙' },
  { id: 'sci-fi', name: 'Sci-Fi', emoji: '🚀' },
  { id: 'cute', name: 'Cute', emoji: '🐱' },
  { id: 'spooky', name: 'Spooky', emoji: '👻' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮' },
  { id: 'meme', name: 'Memes', emoji: '😂' },
  { id: 'other', name: 'Other', emoji: '✨' },
];

// Generate a colorful pixel skin based on seed
function generateSkinPreview(seed: string, palette?: string[]): string {
  if (typeof window === 'undefined') return '';
  
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Generate colors based on seed
  const hash = seed.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  
  const colors = palette || [
    `hsl(${Math.abs(hash % 360)}, 70%, 50%)`,
    `hsl(${Math.abs((hash * 2) % 360)}, 60%, 60%)`,
    `hsl(${Math.abs((hash * 3) % 360)}, 50%, 70%)`,
    `hsl(${Math.abs((hash * 4) % 360)}, 80%, 40%)`,
    `hsl(${Math.abs((hash * 5) % 360)}, 40%, 30%)`,
  ];
  
  // Draw skin structure
  const [primary, secondary, accent, dark, light] = colors;
  
  // Head (8-23 x, 8-15 y for front face)
  ctx.fillStyle = light;
  ctx.fillRect(8, 8, 8, 8); // face
  
  // Hair
  ctx.fillStyle = dark;
  ctx.fillRect(8, 0, 8, 8); // top
  ctx.fillRect(8, 8, 8, 2); // bangs
  
  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(10, 12, 2, 2);
  ctx.fillRect(14, 12, 2, 2);
  ctx.fillStyle = '#000000';
  ctx.fillRect(10, 12, 1, 1);
  ctx.fillRect(14, 12, 1, 1);
  
  // Body
  ctx.fillStyle = primary;
  ctx.fillRect(20, 20, 8, 12);
  
  // Detail on body
  ctx.fillStyle = accent;
  ctx.fillRect(22, 22, 4, 2);
  ctx.fillRect(22, 26, 4, 1);
  
  // Arms
  ctx.fillStyle = secondary;
  ctx.fillRect(44, 20, 4, 12);
  ctx.fillRect(36, 52, 4, 12);
  
  // Hands
  ctx.fillStyle = light;
  ctx.fillRect(44, 28, 4, 4);
  ctx.fillRect(36, 60, 4, 4);
  
  // Legs
  ctx.fillStyle = secondary;
  ctx.fillRect(4, 20, 4, 12);
  ctx.fillRect(20, 52, 4, 12);
  
  // Shoes
  ctx.fillStyle = dark;
  ctx.fillRect(4, 28, 4, 4);
  ctx.fillRect(20, 60, 4, 4);
  
  // Add some random detail pixels
  for (let i = 0; i < 15; i++) {
    const px = Math.abs((hash * (i + 10)) % 64);
    const py = Math.abs((hash * (i + 20)) % 64);
    ctx.fillStyle = accent;
    ctx.fillRect(px, py, 1, 1);
  }
  
  return canvas.toDataURL('image/png');
}

// Sample community skins for demo
const SAMPLE_COMMUNITY_SKINS: Omit<CommunitySkin, 'imageData'>[] = [
  // Featured skins
  {
    id: 'featured-1',
    name: 'Galactic Emperor',
    author: 'StarLord42',
    tags: ['space', 'emperor', 'gold'],
    likes: 1247,
    downloads: 3892,
    views: 15420,
    createdAt: Date.now() - 86400000 * 2,
    featured: true,
    gameType: 'minecraft',
    category: 'sci-fi',
  },
  {
    id: 'featured-2',
    name: 'Rainbow Slime',
    author: 'SlimeFan99',
    tags: ['slime', 'rainbow', 'cute'],
    likes: 2341,
    downloads: 5672,
    views: 21340,
    createdAt: Date.now() - 86400000 * 5,
    featured: true,
    gameType: 'minecraft',
    category: 'cute',
  },
  {
    id: 'featured-3',
    name: 'Dark Sorceress',
    author: 'MagicCaster',
    tags: ['wizard', 'dark', 'magic'],
    likes: 1876,
    downloads: 4231,
    views: 18920,
    createdAt: Date.now() - 86400000 * 3,
    featured: true,
    gameType: 'minecraft',
    category: 'fantasy',
  },
  // Regular skins
  {
    id: 'skin-1',
    name: 'Cyber Ninja',
    author: 'NeonBlade',
    tags: ['ninja', 'cyber', 'neon'],
    likes: 892,
    downloads: 2341,
    views: 8920,
    createdAt: Date.now() - 86400000 * 1,
    gameType: 'minecraft',
    category: 'sci-fi',
  },
  {
    id: 'skin-2',
    name: 'Cozy Cat',
    author: 'CatLover',
    tags: ['cat', 'cute', 'cozy'],
    likes: 1543,
    downloads: 3210,
    views: 12340,
    createdAt: Date.now() - 86400000 * 4,
    gameType: 'minecraft',
    category: 'cute',
  },
  {
    id: 'skin-3',
    name: 'Flame Knight',
    author: 'FireWarrior',
    tags: ['knight', 'fire', 'armor'],
    likes: 756,
    downloads: 1987,
    views: 7650,
    createdAt: Date.now() - 86400000 * 6,
    gameType: 'minecraft',
    category: 'fantasy',
  },
  {
    id: 'skin-4',
    name: 'Ghost Pirate',
    author: 'SeaDog',
    tags: ['pirate', 'ghost', 'spooky'],
    likes: 621,
    downloads: 1543,
    views: 6210,
    createdAt: Date.now() - 86400000 * 7,
    gameType: 'minecraft',
    category: 'spooky',
  },
  {
    id: 'skin-5',
    name: 'Pixel Pro Gamer',
    author: 'ProGamer123',
    tags: ['gamer', 'esports', 'cool'],
    likes: 432,
    downloads: 987,
    views: 4320,
    createdAt: Date.now() - 86400000 * 8,
    gameType: 'minecraft',
    category: 'gaming',
  },
  {
    id: 'skin-6',
    name: 'Sus Crewmate',
    author: 'AmongFan',
    tags: ['among-us', 'meme', 'sus'],
    likes: 3421,
    downloads: 8765,
    views: 34210,
    createdAt: Date.now() - 86400000 * 10,
    gameType: 'minecraft',
    category: 'meme',
  },
  {
    id: 'skin-7',
    name: 'Ice Queen',
    author: 'FrozenHeart',
    tags: ['ice', 'queen', 'frozen'],
    likes: 1234,
    downloads: 2876,
    views: 11230,
    createdAt: Date.now() - 86400000 * 12,
    gameType: 'minecraft',
    category: 'fantasy',
  },
  {
    id: 'skin-8',
    name: 'Banana Man',
    author: 'FruitNinja',
    tags: ['banana', 'funny', 'yellow'],
    likes: 2987,
    downloads: 6543,
    views: 29870,
    createdAt: Date.now() - 86400000 * 15,
    gameType: 'minecraft',
    category: 'meme',
  },
  {
    id: 'skin-9',
    name: 'Robo Kitty',
    author: 'TechCat',
    tags: ['robot', 'cat', 'cyber'],
    likes: 876,
    downloads: 2134,
    views: 8760,
    createdAt: Date.now() - 86400000 * 9,
    gameType: 'minecraft',
    category: 'cute',
  },
  {
    id: 'skin-10',
    name: 'Vampire Lord',
    author: 'DarkNight',
    tags: ['vampire', 'dark', 'halloween'],
    likes: 654,
    downloads: 1432,
    views: 6540,
    createdAt: Date.now() - 86400000 * 11,
    gameType: 'minecraft',
    category: 'spooky',
  },
  {
    id: 'skin-11',
    name: 'Astro Explorer',
    author: 'SpaceMan',
    tags: ['astronaut', 'space', 'nasa'],
    likes: 543,
    downloads: 1234,
    views: 5430,
    createdAt: Date.now() - 86400000 * 13,
    gameType: 'minecraft',
    category: 'sci-fi',
  },
  {
    id: 'skin-12',
    name: 'Dragon Rider',
    author: 'DragonTamer',
    tags: ['dragon', 'fantasy', 'epic'],
    likes: 1098,
    downloads: 2567,
    views: 10980,
    createdAt: Date.now() - 86400000 * 14,
    gameType: 'minecraft',
    category: 'fantasy',
  },
  {
    id: 'skin-13',
    name: 'Shiba Inu',
    author: 'DogeLover',
    tags: ['doge', 'shiba', 'cute'],
    likes: 4321,
    downloads: 9876,
    views: 43210,
    createdAt: Date.now() - 86400000 * 20,
    gameType: 'minecraft',
    category: 'meme',
  },
  {
    id: 'skin-14',
    name: 'Neon Samurai',
    author: 'CyberBlade',
    tags: ['samurai', 'neon', 'japan'],
    likes: 765,
    downloads: 1876,
    views: 7650,
    createdAt: Date.now() - 86400000 * 16,
    gameType: 'minecraft',
    category: 'character',
  },
  {
    id: 'skin-15',
    name: 'Creepy Clown',
    author: 'CircusFan',
    tags: ['clown', 'creepy', 'circus'],
    likes: 432,
    downloads: 987,
    views: 4320,
    createdAt: Date.now() - 86400000 * 17,
    gameType: 'minecraft',
    category: 'spooky',
  },
  {
    id: 'skin-16',
    name: 'Kawaii Princess',
    author: 'PinkPrincess',
    tags: ['princess', 'kawaii', 'pink'],
    likes: 2345,
    downloads: 5432,
    views: 23450,
    createdAt: Date.now() - 86400000 * 18,
    gameType: 'minecraft',
    category: 'cute',
  },
];

// Color palettes for different categories
const CATEGORY_PALETTES: Record<string, string[]> = {
  character: ['#d4a76a', '#2c1810', '#3498db', '#2c3e50', '#8b4513'],
  fantasy: ['#9b59b6', '#f1c40f', '#27ae60', '#2c3e50', '#e74c3c'],
  'sci-fi': ['#3498db', '#2ecc71', '#1abc9c', '#34495e', '#95a5a6'],
  cute: ['#ff69b4', '#ffb6c1', '#ffd700', '#87ceeb', '#98fb98'],
  spooky: ['#2c3e50', '#8e44ad', '#27ae60', '#c0392b', '#7f8c8d'],
  gaming: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
  meme: ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'],
  other: ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6'],
};

// Mini skin preview grid component
function SkinPreviewCard({ skin, onSelect, onLike, isLiked }: {
  skin: CommunitySkin;
  onSelect: () => void;
  onLike: () => void;
  isLiked: boolean;
}) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
      {/* Featured badge */}
      {skin.featured && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
          ⭐ Featured
        </div>
      )}
      
      {/* Image container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-4 overflow-hidden">
        {skin.imageData && (
          <img
            src={skin.imageData}
            alt={skin.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-4 gap-2">
          <button
            onClick={onSelect}
            className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            ✏️ Edit This Skin
          </button>
          <div className="flex gap-2 text-white/80 text-sm">
            <span>👁️ {skin.views.toLocaleString()}</span>
            <span>📥 {skin.downloads.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Game badge */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
          <span className="text-lg">{skin.gameType === 'minecraft' ? '⛏️' : '🎮'}</span>
        </div>
      </div>
      
      {/* Info section */}
      <div className="p-3">
        <h3 className="font-bold text-gray-800 truncate" title={skin.name}>
          {skin.name}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          by <span className="font-medium text-purple-600">{skin.author}</span>
        </p>
        
        {/* Tags */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {skin.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-all ${
              isLiked
                ? 'bg-red-100 text-red-500 scale-105'
                : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-400'
            }`}
          >
            <span className="transition-transform hover:scale-125">{isLiked ? '❤️' : '🤍'}</span>
            <span className="text-sm">{skin.likes.toLocaleString()}</span>
          </button>
          
          <span className="text-xs text-gray-400">
            {formatTimeAgo(skin.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Time ago formatter
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return new Date(timestamp).toLocaleDateString();
}

// Stats card component
function StatCard({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center">
      <span className="text-3xl">{emoji}</span>
      <div className="text-2xl font-bold text-gray-800 mt-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CommunityGalleryPage() {
  const router = useRouter();
  const [skins, setSkins] = useState<CommunitySkin[]>([]);
  const [likedSkins, setLikedSkins] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'trending' | 'popular' | 'newest' | 'downloads'>('trending');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize skins with generated images
  useEffect(() => {
    const initSkins = async () => {
      setIsLoading(true);
      
      // Generate images for sample skins
      const skinsWithImages: CommunitySkin[] = SAMPLE_COMMUNITY_SKINS.map(skin => ({
        ...skin,
        imageData: generateSkinPreview(
          skin.id + skin.name,
          CATEGORY_PALETTES[skin.category] || CATEGORY_PALETTES.other
        ),
      }));
      
      // Load user-uploaded skins from localStorage
      try {
        const savedSkins = localStorage.getItem('onde-community-gallery-skins');
        if (savedSkins) {
          const parsed = JSON.parse(savedSkins);
          skinsWithImages.push(...parsed);
        }
      } catch (e) {
        console.error('Failed to load community skins:', e);
      }
      
      setSkins(skinsWithImages);
      
      // Load liked skins
      try {
        const savedLikes = localStorage.getItem('onde-gallery-likes');
        if (savedLikes) {
          setLikedSkins(new Set(JSON.parse(savedLikes)));
        }
      } catch (e) {
        console.error('Failed to load likes:', e);
      }
      
      setIsLoading(false);
    };
    
    initSkins();
  }, []);

  // Filter and sort skins
  const filteredSkins = useMemo(() => {
    let result = [...skins];
    
    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(skin => skin.category === selectedCategory);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(skin =>
        skin.name.toLowerCase().includes(query) ||
        skin.author.toLowerCase().includes(query) ||
        skin.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'trending':
        // Trending = recent + popular (weighted by recency)
        result.sort((a, b) => {
          const aScore = a.likes * (1 / (1 + (Date.now() - a.createdAt) / 86400000));
          const bScore = b.likes * (1 / (1 + (Date.now() - b.createdAt) / 86400000));
          return bScore - aScore;
        });
        break;
      case 'popular':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'downloads':
        result.sort((a, b) => b.downloads - a.downloads);
        break;
    }
    
    return result;
  }, [skins, selectedCategory, searchQuery, sortBy]);

  // Featured skins
  const featuredSkins = useMemo(() => 
    skins.filter(s => s.featured).slice(0, 3),
    [skins]
  );

  // Handle like
  const handleLike = useCallback((skinId: string) => {
    setLikedSkins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skinId)) {
        newSet.delete(skinId);
        setSkins(s => s.map(skin => 
          skin.id === skinId ? { ...skin, likes: skin.likes - 1 } : skin
        ));
      } else {
        newSet.add(skinId);
        setSkins(s => s.map(skin => 
          skin.id === skinId ? { ...skin, likes: skin.likes + 1 } : skin
        ));
      }
      localStorage.setItem('onde-gallery-likes', JSON.stringify([...newSet]));
      return newSet;
    });
  }, []);

  // Handle select skin for editing
  const handleSelectSkin = useCallback((skin: CommunitySkin) => {
    // Increment views and downloads
    setSkins(s => s.map(sk => 
      sk.id === skin.id 
        ? { ...sk, downloads: sk.downloads + 1, views: sk.views + 1 } 
        : sk
    ));
    
    // Store skin data for editor to pick up
    localStorage.setItem('skin-gallery-import', JSON.stringify({
      imageData: skin.imageData,
      name: skin.name,
      timestamp: Date.now(),
    }));
    
    // Navigate to editor
    router.push('/games/skin-creator');
  }, [router]);

  // Calculate stats
  const totalStats = useMemo(() => ({
    skins: skins.length,
    creators: new Set(skins.map(s => s.author)).size,
    likes: skins.reduce((acc, s) => acc + s.likes, 0),
    downloads: skins.reduce((acc, s) => acc + s.downloads, 0),
  }), [skins]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 opacity-90" />
        <div className="absolute inset-0 bg-[url('/images/pixel-pattern.png')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/games/skin-creator"
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
            >
              <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
              <span className="font-medium">Back to Editor</span>
            </Link>
            
            <Link
              href="/games/skin-creator"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all backdrop-blur-sm"
            >
              🎨 Create Your Own
            </Link>
          </div>
          
          {/* Title */}
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 drop-shadow-lg">
              🖼️ Community Gallery
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Discover amazing skins created by our community! Get inspired, use them as templates, or share your own creations.
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl mx-auto">
            <StatCard emoji="🎨" value={totalStats.skins.toLocaleString()} label="Total Skins" />
            <StatCard emoji="👥" value={totalStats.creators.toLocaleString()} label="Creators" />
            <StatCard emoji="❤️" value={totalStats.likes.toLocaleString()} label="Total Likes" />
            <StatCard emoji="📥" value={totalStats.downloads.toLocaleString()} label="Downloads" />
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-purple-100/50" />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Section */}
        {featuredSkins.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">⭐</span> Featured Creations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredSkins.map(skin => (
                <SkinPreviewCard
                  key={skin.id}
                  skin={skin}
                  onSelect={() => handleSelectSkin(skin)}
                  onLike={() => handleLike(skin.id)}
                  isLiked={likedSkins.has(skin.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Filters & Search */}
        <section className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg mb-8 sticky top-4 z-20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search skins, creators, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
            </div>
            
            {/* Categories */}
            <div className="flex gap-2 flex-wrap justify-center">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-purple-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                  }`}
                >
                  <span className="mr-1">{cat.emoji}</span>
                  <span className="hidden sm:inline">{cat.name}</span>
                </button>
              ))}
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none bg-white font-medium"
            >
              <option value="trending">🔥 Trending</option>
              <option value="popular">❤️ Most Liked</option>
              <option value="downloads">📥 Most Downloaded</option>
              <option value="newest">🆕 Newest</option>
            </select>
          </div>
        </section>

        {/* Gallery Grid */}
        <section>
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin text-6xl mb-4">🎨</div>
              <p className="text-gray-500">Loading amazing skins...</p>
            </div>
          ) : filteredSkins.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-2xl">
              <span className="text-6xl mb-4 block">😢</span>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No skins found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredSkins.map(skin => (
                <SkinPreviewCard
                  key={skin.id}
                  skin={skin}
                  onSelect={() => handleSelectSkin(skin)}
                  onLike={() => handleLike(skin.id)}
                  isLiked={likedSkins.has(skin.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className="mt-16 text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            🚀 Share Your Creation!
          </h2>
          <p className="text-lg text-white/90 max-w-xl mx-auto mb-8">
            Created an awesome skin? Share it with the community and get featured! 
            Your skin could inspire thousands of players.
          </p>
          <Link
            href="/games/skin-creator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-black rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg text-lg"
          >
            <span>🎨</span>
            <span>Create & Upload</span>
          </Link>
        </section>

        {/* Tips */}
        <section className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>💡</span> Tips for Getting Featured
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h4 className="font-semibold text-gray-800">Be Original</h4>
                <p className="text-sm text-gray-600">Create unique designs that stand out</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <h4 className="font-semibold text-gray-800">Add Details</h4>
                <p className="text-sm text-gray-600">Small details make a big difference</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏷️</span>
              <div>
                <h4 className="font-semibold text-gray-800">Tag Properly</h4>
                <p className="text-sm text-gray-600">Use relevant tags for discoverability</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h4 className="font-semibold text-gray-800">Engage</h4>
                <p className="text-sm text-gray-600">Like and support other creators!</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-purple-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">
            Made with 💜 by Onde • 
            <Link href="/games/" className="hover:text-purple-600 ml-1">More Games</Link> •
            <Link href="/games/skin-creator" className="hover:text-purple-600 ml-1">Skin Editor</Link>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            All skins are community-created. Respect copyright and be kind! 🌟
          </p>
        </div>
      </footer>
    </div>
  );
}
