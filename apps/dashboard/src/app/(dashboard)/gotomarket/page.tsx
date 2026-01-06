'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Send,
  TrendingUp,
  Loader2,
  User,
  BarChart3,
  Copy,
  Check,
  Target,
  DollarSign,
  Search,
  Award,
  BookOpen
} from 'lucide-react';
import { chatWithGTM, compareBooks, type Message } from '@/lib/gotomarket-agent';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// I 3 libri nel catalogo
const catalogBooks = [
  {
    id: 'ai-spiegata-bambini',
    title: 'AI Spiegata ai Bambini',
    genre: 'Educativo',
    ageRange: '6-8 anni',
    description: 'Il robot AIKO insegna ai bambini cosa sono le intelligenze artificiali attraverso storie divertenti.',
  },
  {
    id: 'antologia-poesia-italiana',
    title: 'Antologia di Poesia Italiana per Bambini',
    genre: 'Poesia',
    ageRange: '5-10 anni',
    description: 'Una raccolta delle più belle poesie italiane adattate per i bambini, con illustrazioni ad acquerello.',
  },
  {
    id: 'salmo-23-bambini',
    title: 'Il Salmo 23 per Bambini',
    genre: 'Spiritualità',
    ageRange: '4-8 anni',
    description: 'Il Salmo 23 raccontato ai bambini con spiegazioni semplici e illustrazioni serene.',
  },
];

export default function GoToMarketPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Ciao! Sono **Onde GTM** (Go-To-Market) 📊

Sono il tuo consulente per le strategie di mercato su Amazon KDP.

Vedo che hai **3 libri** nel catalogo:
1. 🤖 "AI Spiegata ai Bambini"
2. 📜 "Antologia di Poesia Italiana per Bambini"
3. ✝️ "Il Salmo 23 per Bambini"

Posso aiutarti a:
- 🔍 **Analizzare il mercato** per ogni libro
- 📈 **Confrontare** i progetti e scegliere il migliore
- 🏷️ **Suggerire keywords** per Amazon
- 💰 **Definire il pricing** ottimale
- 🎯 **Pianificare il lancio**

**Vuoi che analizzi i tuoi 3 libri e ti dica su quale focalizzarti prima?**`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

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

      const response = await chatWithGTM(apiMessages, catalogBooks);

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
          content: `⚠️ Errore: ${response.error || 'Impossibile generare risposta'}`,
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

  const handleCompareBooks = async () => {
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Analizza e confronta i miei 3 libri. Dimmi su quale dovrei focalizzarmi prima.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatWithGTM(
        [{ role: 'user', content: userMessage.content }],
        catalogBooks
      );

      if (response.success && response.message) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Compare error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Go-To-Market"
        description="Analisi di mercato e strategia per Amazon KDP"
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-md'
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
                        if (line.startsWith('- ') || line.startsWith('* ')) {
                          return <li key={i} className="ml-4">{line.substring(2)}</li>;
                        }
                        if (line.match(/^\d+\. /)) {
                          return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                        }
                        if (line.startsWith('---')) {
                          return <hr key={i} className="my-3 border-gray-300" />;
                        }
                        if (line.includes('|') && line.includes('-')) {
                          return null; // Skip table separators
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
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
                onClick={handleCompareBooks}
                disabled={isLoading}
                className="bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
              >
                <BarChart3 className="h-4 w-4 mr-1 text-emerald-600" />
                Confronta Libri
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Genera le keywords per "AI Spiegata ai Bambini"')}
                disabled={isLoading}
              >
                <Search className="h-4 w-4 mr-1" />
                Keywords
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Qual è la strategia di pricing migliore?')}
                disabled={isLoading}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Pricing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Come dovrei lanciare il primo libro?')}
                disabled={isLoading}
              >
                <Target className="h-4 w-4 mr-1" />
                Lancio
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
                placeholder="Chiedi analisi di mercato, keywords, pricing..."
                className="flex-1 p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="self-end bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                I Tuoi Libri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {catalogBooks.map((book, i) => (
                <div key={book.id} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {i === 0 ? '🤖' : i === 1 ? '📜' : '✝️'}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{book.title}</p>
                      <p className="text-xs text-gray-500">{book.genre} • {book.ageRange}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-4 w-4" />
                Metriche Chiave
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Libri analizzati:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mercato target:</span>
                <span className="font-medium">Amazon IT/EN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Formato:</span>
                <span className="font-medium">eBook KDP</span>
              </div>
              <hr />
              <p className="text-xs text-gray-500">
                💡 Chiedi al GTM Agent di confrontare i libri per capire su quale focalizzarti
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
