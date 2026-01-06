'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Twitter, Instagram, Send, Clock, CheckCircle, AlertCircle, Loader2, ExternalLink, Image, Film } from 'lucide-react';
import { postTweet, type TweetResult } from '@/lib/twitter';
import { postToInstagram, checkInstagramCredentials, type InstagramPostResult, type InstagramCredentialsStatus } from '@/lib/instagram';

type Platform = 'twitter' | 'instagram';
type PostType = 'text' | 'image' | 'reel';

interface Post {
  id: string;
  content: string;
  platform: Platform;
  postType: PostType;
  imageUrl?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishedAt?: string;
  scheduledAt?: string;
  externalId?: string;
  externalUrl?: string;
  error?: string;
  metrics?: {
    likes: number;
    retweets?: number;
    comments?: number;
    shares?: number;
  };
}

export default function SocialPage() {
  const [activePlatform, setActivePlatform] = useState<Platform>('twitter');
  const [postContent, setPostContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [instagramStatus, setInstagramStatus] = useState<InstagramCredentialsStatus | null>(null);

  // Check Instagram credentials on mount
  useEffect(() => {
    checkInstagramCredentials().then(setInstagramStatus);
  }, []);

  // Load posts from localStorage on mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('onde_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  // Save posts to localStorage when they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('onde_posts', JSON.stringify(posts));
    }
  }, [posts]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handlePostToTwitter = async () => {
    if (!postContent.trim()) return;

    setIsPosting(true);
    setNotification(null);

    try {
      const result: TweetResult = await postTweet(postContent);

      if (result.success) {
        const newPost: Post = {
          id: result.tweetId || Date.now().toString(),
          content: postContent,
          platform: 'twitter',
          postType: 'text',
          status: 'published',
          publishedAt: new Date().toISOString(),
          externalId: result.tweetId,
          externalUrl: result.tweetUrl,
          metrics: { likes: 0, retweets: 0, comments: 0 },
        };
        setPosts([newPost, ...posts]);
        setPostContent('');
        setNotification({ type: 'success', message: 'Tweet pubblicato con successo!' });
      } else {
        const failedPost: Post = {
          id: Date.now().toString(),
          content: postContent,
          platform: 'twitter',
          postType: 'text',
          status: 'failed',
          publishedAt: new Date().toISOString(),
          error: result.error,
        };
        setPosts([failedPost, ...posts]);
        setNotification({ type: 'error', message: result.error || 'Errore durante la pubblicazione' });
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Errore di connessione' });
    } finally {
      setIsPosting(false);
    }
  };

  const handlePostToInstagram = async () => {
    if (!postContent.trim() || !imageUrl.trim()) return;

    setIsPosting(true);
    setNotification(null);

    try {
      const result: InstagramPostResult = await postToInstagram(imageUrl, postContent);

      if (result.success) {
        const newPost: Post = {
          id: result.postId || Date.now().toString(),
          content: postContent,
          platform: 'instagram',
          postType: 'image',
          imageUrl: imageUrl,
          status: 'published',
          publishedAt: new Date().toISOString(),
          externalId: result.postId,
          externalUrl: result.postUrl,
          metrics: { likes: 0, comments: 0, shares: 0 },
        };
        setPosts([newPost, ...posts]);
        setPostContent('');
        setImageUrl('');
        setNotification({ type: 'success', message: 'Post Instagram pubblicato!' });
      } else {
        setNotification({ type: 'error', message: result.error || 'Errore durante la pubblicazione' });
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Errore di connessione' });
    } finally {
      setIsPosting(false);
    }
  };

  const handlePost = () => {
    if (activePlatform === 'twitter') {
      handlePostToTwitter();
    } else {
      handlePostToInstagram();
    }
  };

  const getStatusIcon = (status: Post['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Post['status']) => {
    switch (status) {
      case 'published':
        return 'Pubblicato';
      case 'scheduled':
        return 'Programmato';
      case 'failed':
        return 'Fallito';
      default:
        return 'Bozza';
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    return platform === 'twitter' ? (
      <Twitter className="h-4 w-4 text-blue-500" />
    ) : (
      <Instagram className="h-4 w-4 text-pink-500" />
    );
  };

  const maxLength = activePlatform === 'twitter' ? 280 : 2200;
  const canPost = activePlatform === 'twitter'
    ? postContent.trim().length > 0 && postContent.length <= 280
    : postContent.trim().length > 0 && imageUrl.trim().length > 0;

  return (
    <>
      <Header
        title="Social Media"
        description="Gestisci i post su X/Twitter e Instagram per @FreeRiverHouse"
      />

      <div className="p-6">
        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {notification.message}
          </div>
        )}

        {/* Platform Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activePlatform === 'twitter' ? 'default' : 'outline'}
            onClick={() => setActivePlatform('twitter')}
            className="flex items-center gap-2"
          >
            <Twitter className="h-4 w-4" />
            X / Twitter
            <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">Attivo</span>
          </Button>
          <Button
            variant={activePlatform === 'instagram' ? 'default' : 'outline'}
            onClick={() => setActivePlatform('instagram')}
            className="flex items-center gap-2"
          >
            <Instagram className="h-4 w-4" />
            Instagram
            {instagramStatus?.configured ? (
              <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">Attivo</span>
            ) : (
              <span className="ml-1 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">Setup</span>
            )}
          </Button>
        </div>

        {/* Post Composer */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activePlatform === 'twitter' ? (
                <Twitter className="h-5 w-5 text-blue-500" />
              ) : (
                <Instagram className="h-5 w-5 text-pink-500" />
              )}
              {activePlatform === 'twitter' ? 'Nuovo Tweet' : 'Nuovo Post Instagram'}
            </CardTitle>
            <CardDescription>
              {activePlatform === 'twitter'
                ? 'Pubblica su @FreeRiverHouse (X/Twitter)'
                : instagramStatus?.configured
                  ? `Pubblica su @${instagramStatus.accountName || 'FreeRiverHouse'} (Instagram)`
                  : 'Configura le credenziali Instagram per pubblicare'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activePlatform === 'instagram' && !instagramStatus?.configured ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                <Instagram className="h-12 w-12 mx-auto mb-3 text-orange-500" />
                <h3 className="font-semibold text-orange-800 mb-2">Configura Instagram</h3>
                <p className="text-orange-700 text-sm mb-4">
                  Per pubblicare su Instagram, aggiungi le credenziali al file <code className="bg-orange-100 px-1 rounded">.env.local</code>:
                </p>
                <pre className="bg-orange-100 p-3 rounded text-left text-xs overflow-x-auto">
{`INSTAGRAM_ACCESS_TOKEN=your_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id`}
                </pre>
                <p className="text-orange-600 text-xs mt-3">
                  Ottieni questi valori dal Meta Developer Portal dopo aver collegato l'account Instagram Business.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activePlatform === 'instagram' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Immagine *
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://esempio.com/immagine.jpg"
                      className="w-full p-3 border rounded-lg focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                      disabled={isPosting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      L'immagine deve essere accessibile pubblicamente (HTTPS)
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {activePlatform === 'twitter' ? 'Testo del Tweet' : 'Didascalia'}
                  </label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={activePlatform === 'twitter' ? "Cosa vuoi condividere?" : "Scrivi una didascalia..."}
                    className={`w-full h-32 p-4 border rounded-lg resize-none focus:outline-none focus:ring-1 ${
                      activePlatform === 'twitter'
                        ? 'focus:border-blue-500 focus:ring-blue-500'
                        : 'focus:border-pink-500 focus:ring-pink-500'
                    }`}
                    maxLength={maxLength}
                    disabled={isPosting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    postContent.length > maxLength * 0.9
                      ? postContent.length > maxLength
                        ? 'text-red-500 font-bold'
                        : 'text-orange-500'
                      : 'text-gray-500'
                  }`}>
                    {postContent.length}/{maxLength} caratteri
                  </span>
                  <Button
                    onClick={handlePost}
                    disabled={!canPost || isPosting}
                    className={activePlatform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''}
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Pubblicando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Pubblica su {activePlatform === 'twitter' ? 'X' : 'Instagram'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Post Recenti</CardTitle>
            <CardDescription>
              Cronologia dei tuoi post su tutte le piattaforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="flex justify-center gap-2 mb-3">
                  <Twitter className="h-10 w-10 opacity-30" />
                  <Instagram className="h-10 w-10 opacity-30" />
                </div>
                <p>Nessun post ancora. Scrivi il tuo primo post!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      post.status === 'failed' ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        {getStatusIcon(post.status)}
                        <span className={`text-sm font-medium ${
                          post.status === 'failed' ? 'text-red-700' : ''
                        }`}>
                          {getStatusText(post.status)}
                        </span>
                        {post.postType === 'image' && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Image className="h-3 w-3" /> Immagine
                          </span>
                        )}
                        {post.postType === 'reel' && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Film className="h-3 w-3" /> Reel
                          </span>
                        )}
                      </div>
                      {post.publishedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(post.publishedAt).toLocaleString('it-IT')}
                        </span>
                      )}
                    </div>

                    {post.imageUrl && (
                      <div className="mb-2">
                        <img
                          src={post.imageUrl}
                          alt="Post image"
                          className="max-h-40 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <p className="text-gray-900 mb-3 whitespace-pre-wrap">{post.content}</p>

                    {post.error && (
                      <p className="text-sm text-red-600 mb-2">
                        Errore: {post.error}
                      </p>
                    )}

                    {post.metrics && post.status === 'published' && (
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{post.metrics.likes} Mi piace</span>
                        {post.metrics.retweets !== undefined && (
                          <span>{post.metrics.retweets} Retweet</span>
                        )}
                        {post.metrics.comments !== undefined && (
                          <span>{post.metrics.comments} Commenti</span>
                        )}
                        {post.metrics.shares !== undefined && (
                          <span>{post.metrics.shares} Condivisioni</span>
                        )}
                      </div>
                    )}

                    {post.externalUrl && (
                      <a
                        href={post.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-sm hover:underline mt-2 ${
                          post.platform === 'twitter' ? 'text-blue-500' : 'text-pink-500'
                        }`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Vedi su {post.platform === 'twitter' ? 'X' : 'Instagram'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
