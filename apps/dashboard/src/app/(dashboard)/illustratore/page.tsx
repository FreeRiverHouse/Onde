'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Send,
  Palette,
  Loader2,
  User,
  Copy,
  Check,
  Paintbrush,
  Sparkles,
  Image,
  Wand2,
  BookOpen,
  Baby,
  Trash2,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  chatWithPino,
  generateIllustrationPrompt,
  generateAllBookIllustrations,
  getAvailableImageAPI,
  type Message,
  type BookIllustrationSet
} from '@/lib/illustrator-agent';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Libri disponibili per contesto
const availableBooks = [
  {
    id: 'salmo-23-bambini',
    title: 'Il Salmo 23 per Bambini',
    style: {
      type: 'watercolor' as const,
      colors: ['soft green', 'sky blue', 'warm yellow', 'gentle pink'],
      mood: 'peaceful, safe, warm',
    },
    ageRange: { min: 4, max: 8 },
    characters: [
      { name: 'Il Pastore', description: 'Uomo gentile con sguardo amorevole', visualTraits: ['barba corta', 'tunica semplice', 'bastone'] },
      { name: 'Pecorelle', description: 'Morbide e bianche come cotone', visualTraits: ['occhi dolci', 'pelo soffice'] },
    ],
  },
  {
    id: 'ai-spiegata-bambini',
    title: 'AI Spiegata ai Bambini',
    style: {
      type: 'cartoon' as const,
      colors: ['electric blue', 'friendly orange', 'soft purple', 'white'],
      mood: 'fun, curious, friendly',
    },
    ageRange: { min: 6, max: 8 },
    characters: [
      { name: 'AIKO', description: 'Robot piccolo e amichevole', visualTraits: ['occhi grandi luminosi', 'corpo rotondo', 'antenne simpatiche', 'sorriso LED'] },
      { name: 'Luca', description: 'Bambino 7 anni curioso', visualTraits: ['capelli castani', 'occhiali', 'maglietta colorata'] },
      { name: 'Sofia', description: 'Sorellina 5 anni giocherellona', visualTraits: ['codini', 'vestito a fiori', 'sorriso birichino'] },
    ],
  },
];

const STORAGE_KEY = 'onde-pino-pennello-chat';

// Helper per caricare messaggi da localStorage
function loadMessagesFromStorage(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((m: ChatMessage & { timestamp: string }) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
  } catch (e) {
    console.error('Error loading chat history:', e);
  }
  return [];
}

// Helper per salvare messaggi in localStorage
function saveMessagesToStorage(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    // Non salvare il messaggio di benvenuto
    const toSave = messages.filter(m => m.id !== 'welcome');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
}

export default function IllustratorePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState(availableBooks[0]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
    name: string;
    status: string;
  } | null>(null);
  const [generationResult, setGenerationResult] = useState<BookIllustrationSet | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Carica messaggi salvati all'avvio
  useEffect(() => {
    const savedMessages = loadMessagesFromStorage();
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `🎨 **Ciao! Sono Pina Pennello!**

Sono l'illustratore di Onde, e adoro creare immagini magiche per i libri dei bambini!

Ho 30 anni di esperienza nel trasformare storie in illustrazioni che fanno sognare i piccoli lettori.

**Sto lavorando su:** "${selectedBook.title}"

Lo stile scelto è **${selectedBook.style.type}** con colori ${selectedBook.style.colors.slice(0, 3).join(', ')}. Perfetto per bambini ${selectedBook.ageRange.min}-${selectedBook.ageRange.max} anni!

**Come posso aiutarti?**
- 🖼️ Creare illustrazioni per i capitoli
- 🎭 Definire l'aspetto dei personaggi
- 🌈 Scegliere palette colori
- ✨ Generare prompt per DALL-E 3

${savedMessages.length > 0 ? '🎨 *Ho recuperato la nostra conversazione precedente!*' : 'Dimmi cosa vuoi illustrare!'}`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage, ...savedMessages]);
    setIsInitialized(true);
  }, [selectedBook]);

  // Salva messaggi quando cambiano
  useEffect(() => {
    if (isInitialized) {
      saveMessagesToStorage(messages);
    }
  }, [messages, isInitialized]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiMessages: Message[] = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: 'user', content: userMessage.content });

      const response = await chatWithPino(apiMessages, {
        bookTitle: selectedBook.title,
        style: selectedBook.style,
        characters: selectedBook.characters,
      });

      if (response.success && response.message) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Ops! ${response.error || 'Qualcosa è andato storto con i miei pennelli...'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => handleSend(), 100);
  };

  const handleClearChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `🎨 **Ciao! Sono Pina Pennello!**

Sono l'illustratore di Onde, e adoro creare immagini magiche per i libri dei bambini!

Ho 30 anni di esperienza nel trasformare storie in illustrazioni che fanno sognare i piccoli lettori.

**Sto lavorando su:** "${selectedBook.title}"

Lo stile scelto è **${selectedBook.style.type}** con colori ${selectedBook.style.colors.slice(0, 3).join(', ')}. Perfetto per bambini ${selectedBook.ageRange.min}-${selectedBook.ageRange.max} anni!

**Come posso aiutarti?**
- 🖼️ Creare illustrazioni per i capitoli
- 🎭 Definire l'aspetto dei personaggi
- 🌈 Scegliere palette colori
- ✨ Generare prompt per DALL-E 3

Dimmi cosa vuoi illustrare!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  return (
    <>
      <Header
        title="Pina Pennello"
        description="Il tuo illustratore AI per libri per bambini"
      />

      <div className="flex h-[calc(100vh-140px)]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Paintbrush className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-pink-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <div className="prose prose-sm max-w-none">
                      {message.content.split('\n').map((line, i) => {
                        if (line.startsWith('```prompt')) {
                          return <div key={i} className="mt-2 text-xs text-pink-600 font-mono">📋 PROMPT:</div>;
                        }
                        if (line.startsWith('```') && !line.includes('prompt')) {
                          return null;
                        }
                        if (line.startsWith('# ')) {
                          return <h1 key={i} className={`text-xl font-bold mt-2 mb-2 ${message.role === 'user' ? 'text-white' : ''}`}>{line.substring(2)}</h1>;
                        }
                        if (line.startsWith('## ')) {
                          return <h2 key={i} className={`text-lg font-bold mt-3 mb-1 ${message.role === 'user' ? 'text-white' : ''}`}>{line.substring(3)}</h2>;
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-bold mt-2">{line.slice(2, -2)}</p>;
                        }
                        if (line.startsWith('- ')) {
                          return <li key={i} className="ml-4">{line.substring(2)}</li>;
                        }
                        if (line.trim() === '') {
                          return <br key={i} />;
                        }
                        const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: boldParsed }} />;
                      })}
                    </div>
                  </div>

                  {message.role === 'assistant' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copiato!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copia
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                  <Paintbrush className="h-4 w-4 text-white animate-bounce" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
                    <span className="text-sm text-gray-500">Sto dipingendo...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-2 border-t bg-gray-50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(`Crea l'illustrazione per il capitolo 1 di "${selectedBook.title}"`)}
                disabled={isLoading}
                className="bg-pink-50 border-pink-200 hover:bg-pink-100"
              >
                <Image className="h-4 w-4 mr-1 text-pink-600" />
                Illustra Cap. 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Crea la scheda personaggio per il personaggio principale')}
                disabled={isLoading}
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Scheda Personaggio
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Che palette colori consigli per questo libro?')}
                disabled={isLoading}
              >
                <Palette className="h-4 w-4 mr-1" />
                Palette Colori
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Genera il prompt DALL-E per la copertina')}
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Prompt Copertina
              </Button>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Descrivi la scena da illustrare..."
                className="flex-1 p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="self-end bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-gray-50 p-4 hidden lg:block">
          {/* Book Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Libro Attivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedBook.id === book.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <p className="font-medium text-sm">{book.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {book.style.type} • {book.ageRange.min}-{book.ageRange.max} anni
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Style Info */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Stile Attuale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo:</span>
                <span className="font-medium capitalize">{selectedBook.style.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mood:</span>
                <span className="font-medium">{selectedBook.style.mood.split(',')[0]}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-2">Colori:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedBook.style.colors.map((color, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 rounded text-xs"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Characters */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Baby className="h-4 w-4" />
                Personaggi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedBook.characters.map((char, i) => (
                <div key={i} className="p-2 bg-white rounded border">
                  <p className="font-medium text-sm">{char.name}</p>
                  <p className="text-xs text-gray-500">{char.visualTraits.join(', ')}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Clear Chat Button */}
          <Button
            variant="outline"
            className="w-full mt-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={handleClearChat}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cancella Chat
          </Button>
        </div>
      </div>
    </>
  );
}
