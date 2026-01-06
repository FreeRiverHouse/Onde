'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, Plus, BookOpen, Sparkles, Globe, Clock, CheckCircle, Edit3, Image, Languages } from 'lucide-react';
import Link from 'next/link';

interface ChildrensBook {
  id: string;
  title: string;
  titleEn?: string;
  ageRange: { min: number; max: number; label: string };
  status: 'idea' | 'outline' | 'writing' | 'illustrating' | 'translating' | 'publishing' | 'published';
  language: 'it' | 'en' | 'both';
  chaptersTotal: number;
  chaptersCompleted: number;
  illustrationsTotal: number;
  illustrationsCompleted: number;
  coverUrl?: string;
  genre: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const mockBooks: ChildrensBook[] = [
  {
    id: 'ai-spiegata-bambini',
    title: 'AI Spiegata ai Bambini',
    titleEn: 'AI Explained to Kids',
    ageRange: { min: 6, max: 8, label: '6-8 anni' },
    status: 'idea',
    language: 'it',
    chaptersTotal: 8,
    chaptersCompleted: 0,
    illustrationsTotal: 16,
    illustrationsCompleted: 0,
    genre: 'Educativo',
    description: 'Il robot AIKO insegna ai bambini cosa sono le intelligenze artificiali attraverso storie divertenti.',
    createdAt: '2025-01-05',
    updatedAt: '2025-01-05',
  },
  {
    id: 'antologia-poesia-italiana',
    title: 'Antologia di Poesia Italiana per Bambini',
    titleEn: 'Italian Poetry Anthology for Kids',
    ageRange: { min: 5, max: 10, label: '5-10 anni' },
    status: 'idea',
    language: 'it',
    chaptersTotal: 20,
    chaptersCompleted: 0,
    illustrationsTotal: 20,
    illustrationsCompleted: 0,
    genre: 'Poesia',
    description: 'Una raccolta delle più belle poesie italiane adattate per i bambini, con illustrazioni ad acquerello.',
    createdAt: '2025-01-05',
    updatedAt: '2025-01-05',
  },
  {
    id: 'salmo-23-bambini',
    title: 'Il Salmo 23 per Bambini',
    titleEn: 'Psalm 23 for Kids',
    ageRange: { min: 4, max: 8, label: '4-8 anni' },
    status: 'idea',
    language: 'it',
    chaptersTotal: 6,
    chaptersCompleted: 0,
    illustrationsTotal: 12,
    illustrationsCompleted: 0,
    genre: 'Spiritualità',
    description: 'Il Salmo 23 raccontato ai bambini con spiegazioni semplici e illustrazioni serene.',
    createdAt: '2025-01-05',
    updatedAt: '2025-01-05',
  },
];

export default function LibriBambiniPage() {
  const [books] = useState<ChildrensBook[]>(mockBooks);
  const [filter, setFilter] = useState<string>('all');

  const getStatusColor = (status: ChildrensBook['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'publishing':
        return 'bg-blue-100 text-blue-800';
      case 'translating':
        return 'bg-purple-100 text-purple-800';
      case 'illustrating':
        return 'bg-pink-100 text-pink-800';
      case 'writing':
        return 'bg-orange-100 text-orange-800';
      case 'outline':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ChildrensBook['status']) => {
    switch (status) {
      case 'published':
        return 'Pubblicato';
      case 'publishing':
        return 'In Pubblicazione';
      case 'translating':
        return 'Traduzione';
      case 'illustrating':
        return 'Illustrazioni';
      case 'writing':
        return 'Scrittura';
      case 'outline':
        return 'Outline';
      default:
        return 'Idea';
    }
  };

  const getStatusIcon = (status: ChildrensBook['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4" />;
      case 'publishing':
        return <Globe className="h-4 w-4" />;
      case 'translating':
        return <Languages className="h-4 w-4" />;
      case 'illustrating':
        return <Image className="h-4 w-4" />;
      case 'writing':
        return <Edit3 className="h-4 w-4" />;
      case 'outline':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const filteredBooks = filter === 'all'
    ? books
    : books.filter(b => b.status === filter);

  const getProgress = (book: ChildrensBook) => {
    const chaptersProgress = book.chaptersTotal > 0
      ? (book.chaptersCompleted / book.chaptersTotal) * 100
      : 0;
    const illustrationsProgress = book.illustrationsTotal > 0
      ? (book.illustrationsCompleted / book.illustrationsTotal) * 100
      : 0;
    return Math.round((chaptersProgress + illustrationsProgress) / 2);
  };

  return (
    <>
      <Header
        title="Libri per Bambini"
        description="Crea e pubblica e-book educativi per bambini con l'aiuto dell'AI"
      />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{books.length}</p>
                  <p className="text-sm text-gray-500">Libri Totali</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Edit3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{books.filter(b => b.status === 'writing').length}</p>
                  <p className="text-sm text-gray-500">In Scrittura</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Image className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{books.filter(b => b.status === 'illustrating').length}</p>
                  <p className="text-sm text-gray-500">In Illustrazione</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{books.filter(b => b.status === 'published').length}</p>
                  <p className="text-sm text-gray-500">Pubblicati</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tutti
            </Button>
            <Button
              variant={filter === 'idea' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('idea')}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Idee
            </Button>
            <Button
              variant={filter === 'writing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('writing')}
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Scrittura
            </Button>
            <Button
              variant={filter === 'illustrating' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('illustrating')}
            >
              <Image className="h-3 w-3 mr-1" />
              Illustrazioni
            </Button>
            <Button
              variant={filter === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('published')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Pubblicati
            </Button>
          </div>
          <Link href="/libri-bambini/nuovo">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Libro
            </Button>
          </Link>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Cover placeholder */}
                  <div className="w-24 h-32 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    <Baby className="h-10 w-10 text-indigo-400" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/10 py-1 text-center">
                      <span className="text-xs text-white font-medium">{book.ageRange.label}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                      {book.title}
                    </h3>

                    <p className="text-xs text-gray-400 mt-0.5">{book.genre}</p>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                        {getStatusIcon(book.status)}
                        {getStatusText(book.status)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{getProgress(book)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${getProgress(book)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Edit3 className="h-3 w-3" />
                        {book.chaptersCompleted}/{book.chaptersTotal}
                      </span>
                      <span className="flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        {book.illustrationsCompleted}/{book.illustrationsTotal}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                  {book.description}
                </p>

                <div className="flex gap-2 mt-4">
                  <Link href={`/libri-bambini/${book.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Modifica
                    </Button>
                  </Link>
                  <Link href={`/libri-bambini/${book.id}/capitoli`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Scrivi con AI
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <Card className="py-12">
            <div className="text-center">
              <Baby className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Nessun libro trovato</p>
              <Link href="/libri-bambini/nuovo">
                <Button variant="link" className="mt-2">
                  Crea il primo libro per bambini
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
