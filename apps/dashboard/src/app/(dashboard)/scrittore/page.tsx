'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Send,
  Loader2,
  User,
  Copy,
  Check,
  PenTool,
  Sparkles,
  BookOpen,
  FileText,
  List,
  Baby,
  Trash2
} from 'lucide-react';
import { chatWithWriter, generateOutline, type Message } from '@/lib/writer-agent';

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
    genre: 'Spiritualità',
    ageRange: '4-8 anni',
    chaptersCount: 6,
  },
  {
    id: 'ai-spiegata-bambini',
    title: 'AI Spiegata ai Bambini',
    genre: 'Educativo',
    ageRange: '6-8 anni',
    chaptersCount: 8,
  },
  {
    id: 'antologia-poesia-italiana',
    title: 'Antologia di Poesia Italiana per Bambini',
    genre: 'Poesia',
    ageRange: '5-10 anni',
    chaptersCount: 20,
  },
];

const STORAGE_KEY = 'onde-gianni-parola-chat';

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

export default function ScrittorePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState(availableBooks[0]);
  const [isInitialized, setIsInitialized] = useState(false);
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
      content: `📚 **Ciao! Sono Gianni Parola!**

Sono lo scrittore di Onde, e come il grande Gianni Rodari, credo che le storie per bambini siano le più importanti di tutte!

Con le parole si possono costruire castelli, inventare mondi e far volare la fantasia. Ora sono qui per aiutarti a creare il tuo libro.

**Sto lavorando su:** "${selectedBook.title}"
- Genere: ${selectedBook.genre}
- Età target: ${selectedBook.ageRange}
- Capitoli: ${selectedBook.chaptersCount}

**Come posso aiutarti?**
- 📋 Creare l'**outline** del libro
- ✍️ Scrivere i **capitoli** uno per uno
- 💡 Sviluppare **personaggi** e trame
- 🎯 Adattare il linguaggio all'**età target**

${savedMessages.length > 0 ? '📝 *Ho recuperato la nostra conversazione precedente!*' : 'Raccontami la tua idea o dimmi quale capitolo vuoi scrivere!'}`,
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

      const response = await chatWithWriter(apiMessages, {
        title: selectedBook.title,
        genre: selectedBook.genre,
        ageRange: selectedBook.ageRange,
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
          content: `⚠️ Ops! ${response.error || 'La mia penna si è inceppata...'}`,
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
      content: `📚 **Ciao! Sono Gianni Parola!**

Sono lo scrittore di Onde, e come il grande Gianni Rodari, credo che le storie per bambini siano le più importanti di tutte!

Con le parole si possono costruire castelli, inventare mondi e far volare la fantasia. Ora sono qui per aiutarti a creare il tuo libro.

**Sto lavorando su:** "${selectedBook.title}"
- Genere: ${selectedBook.genre}
- Età target: ${selectedBook.ageRange}
- Capitoli: ${selectedBook.chaptersCount}

**Come posso aiutarti?**
- 📋 Creare l'**outline** del libro
- ✍️ Scrivere i **capitoli** uno per uno
- 💡 Sviluppare **personaggi** e trame
- 🎯 Adattare il linguaggio all'**età target**

Raccontami la tua idea o dimmi quale capitolo vuoi scrivere!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  return (
    <>
      <Header
        title="Gianni Parola"
        description="Il tuo scrittore AI per libri per bambini"
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <PenTool className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <div className="prose prose-sm max-w-none">
                      {message.content.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) {
                          return <h1 key={i} className={`text-xl font-bold mt-2 mb-2 ${message.role === 'user' ? 'text-white' : ''}`}>{line.substring(2)}</h1>;
                        }
                        if (line.startsWith('## ')) {
                          return <h2 key={i} className={`text-lg font-bold mt-3 mb-1 ${message.role === 'user' ? 'text-white' : ''}`}>{line.substring(3)}</h2>;
                        }
                        if (line.startsWith('### ')) {
                          return <h3 key={i} className={`text-base font-semibold mt-2 ${message.role === 'user' ? 'text-white' : ''}`}>{line.substring(4)}</h3>;
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-bold mt-2">{line.slice(2, -2)}</p>;
                        }
                        if (line.startsWith('- ')) {
                          return <li key={i} className="ml-4">{line.substring(2)}</li>;
                        }
                        if (line.match(/^\d+\. /)) {
                          return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                        }
                        if (line.startsWith('[ILLUSTRAZIONE:')) {
                          return (
                            <div key={i} className="my-2 p-2 bg-pink-100 rounded border border-pink-200 text-pink-700 text-xs">
                              🎨 {line}
                            </div>
                          );
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <PenTool className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                    <span className="text-sm text-gray-500">Sto scrivendo...</span>
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
                onClick={() => handleQuickAction(`Crea l'outline completo per "${selectedBook.title}"`)}
                disabled={isLoading}
                className="bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
              >
                <List className="h-4 w-4 mr-1 text-indigo-600" />
                Genera Outline
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Scrivi il capitolo 1')}
                disabled={isLoading}
              >
                <FileText className="h-4 w-4 mr-1" />
                Scrivi Cap. 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Descrivi i personaggi principali del libro')}
                disabled={isLoading}
              >
                <Baby className="h-4 w-4 mr-1" />
                Personaggi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Continua a scrivere dal punto in cui siamo rimasti')}
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Continua
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
                placeholder="Descrivi cosa vuoi scrivere..."
                className="flex-1 p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="self-end bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
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
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-medium text-sm">{book.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {book.genre} • {book.ageRange}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Writing Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Info Libro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Genere:</span>
                <span className="font-medium">{selectedBook.genre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Età target:</span>
                <span className="font-medium">{selectedBook.ageRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Capitoli:</span>
                <span className="font-medium">{selectedBook.chaptersCount}</span>
              </div>
              <hr />
              <div className="text-xs text-gray-500">
                💡 Suggerimento: Per bambini {selectedBook.ageRange}, usa frasi brevi e parole semplici.
              </div>
            </CardContent>
          </Card>

          {/* Writing Tips */}
          <Card className="mt-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PenTool className="h-4 w-4 text-indigo-600" />
                Consigli di Gianni
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>📖 Inizia sempre con una frase che catturi l'attenzione</p>
              <p>🎭 Dai voce ai personaggi con dialoghi vivi</p>
              <p>🎨 Indica dove servono le illustrazioni</p>
              <p>❤️ Termina ogni capitolo con curiosità</p>
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
