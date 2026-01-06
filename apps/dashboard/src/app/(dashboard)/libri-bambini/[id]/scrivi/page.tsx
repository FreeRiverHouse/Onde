'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Send,
  Sparkles,
  BookOpen,
  Loader2,
  User,
  Bot,
  Copy,
  Check,
  Download,
  RefreshCw,
  FileText,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { chatWithWriter, generateOutline, generateChapter, type Message } from '@/lib/writer-agent';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Mock book data
const mockBook = {
  id: 'ai-spiegata-bambini',
  title: 'AI Spiegata ai Bambini',
  genre: 'Educativo',
  ageRange: '6-8 anni',
  chaptersCount: 8,
  description: 'Il robot AIKO insegna ai bambini cosa sono le intelligenze artificiali.',
};

export default function ScriviConAIPage() {
  const params = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const book = mockBook;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Ciao! Sono **Onde Writer** 📚

Sono qui per aiutarti a scrivere **"${book.title}"**.

Da quello che vedo, è un libro **${book.genre.toLowerCase()}** per bambini di **${book.ageRange}**.

Come vuoi procedere?

1. 📋 **Creare l'outline** - Definiamo insieme la struttura dei ${book.chaptersCount} capitoli
2. ✍️ **Scrivere direttamente** - Iniziamo dal primo capitolo
3. 💬 **Discutere le idee** - Parliamo prima del contenuto

Dimmi cosa preferisci, o raccontami di più sul libro!`,
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
      // Convert to API format
      const apiMessages: Message[] = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: 'user', content: userMessage.content });

      const response = await chatWithWriter(apiMessages, {
        title: book.title,
        genre: book.genre,
        ageRange: book.ageRange,
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
    inputRef.current?.focus();
  };

  const handleGenerateOutline = async () => {
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Genera l'outline completo per "${book.title}"`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await generateOutline(
        book.title,
        book.description,
        book.genre,
        book.ageRange,
        book.chaptersCount
      );

      let responseContent: string;

      if (result.success && result.outline) {
        const outline = result.outline;
        responseContent = `# Outline: ${outline.title}\n\n`;
        responseContent += `**Descrizione:** ${outline.description}\n\n`;
        responseContent += `**Età target:** ${outline.targetAge}\n\n`;
        responseContent += `## Capitoli\n\n`;
        outline.chapters.forEach(ch => {
          responseContent += `### ${ch.number}. ${ch.title}\n${ch.summary}\n\n`;
        });
        responseContent += `---\n\nTi piace questa struttura? Posso modificarla o iniziare a scrivere i capitoli!`;
      } else {
        responseContent = `⚠️ Errore nella generazione: ${result.error}`;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Outline error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateChapter = async (chapterNumber: number) => {
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Scrivi il capitolo ${chapterNumber}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await generateChapter(
        book.title,
        chapterNumber,
        `Capitolo ${chapterNumber}`,
        `Contenuto del capitolo ${chapterNumber} del libro`,
        book.ageRange,
        500
      );

      let responseContent: string;

      if (result.success && result.content) {
        responseContent = result.content;
        responseContent += `\n\n---\n\n✅ Capitolo ${chapterNumber} completato! Vuoi che lo modifichi o passo al prossimo?`;
      } else {
        responseContent = `⚠️ Errore: ${result.error}`;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chapter error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Scrivi con AI"
        description={`Writer Agent per "${book.title}"`}
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
                    <Sparkles className="h-4 w-4 text-white" />
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
                        if (line.startsWith('- ') || line.startsWith('* ')) {
                          return <li key={i} className="ml-4">{line.substring(2)}</li>;
                        }
                        if (line.match(/^\d+\. /)) {
                          return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                        }
                        if (line.startsWith('[ILLUSTRAZIONE:')) {
                          return (
                            <div key={i} className="my-2 p-2 bg-pink-100 text-pink-800 rounded-lg text-sm flex items-center gap-2">
                              🎨 {line}
                            </div>
                          );
                        }
                        if (line.startsWith('---')) {
                          return <hr key={i} className="my-3 border-gray-300" />;
                        }
                        if (line.trim() === '') {
                          return <br key={i} />;
                        }
                        // Handle bold text
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
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
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
                onClick={handleGenerateOutline}
                disabled={isLoading}
              >
                <FileText className="h-4 w-4 mr-1" />
                Genera Outline
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateChapter(1)}
                disabled={isLoading}
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Scrivi Cap. 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Descrivi i personaggi principali del libro')}
              >
                Personaggi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('Suggerisci delle illustrazioni per questo libro')}
              >
                Illustrazioni
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
                placeholder="Scrivi un messaggio... (Invio per inviare)"
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {book.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Genere:</span>
                <span>{book.genre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Età:</span>
                <span>{book.ageRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Capitoli:</span>
                <span>{book.chaptersCount}</span>
              </div>
              <hr />
              <Link href={`/libri-bambini/${book.id}/capitoli`}>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Vai all'Editor
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Suggerimenti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>💡 Chiedi al Writer di creare l'outline prima di scrivere</p>
              <p>💡 Puoi modificare i capitoli dopo averli generati</p>
              <p>💡 Specifica lo stile che preferisci (es: "più divertente")</p>
              <p>💡 Copia il contenuto generato nell'editor</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
