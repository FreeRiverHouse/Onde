'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Filter, MoreVertical } from 'lucide-react';
import Link from 'next/link';

interface Book {
  id: string;
  title: string;
  author: string;
  status: 'draft' | 'editing' | 'review' | 'approved' | 'published';
  genre: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Il Viaggio Infinito',
    author: 'Marco Rossi',
    status: 'published',
    genre: 'Narrativa',
    createdAt: '2024-11-15',
    updatedAt: '2024-12-20',
  },
  {
    id: '2',
    title: 'Onde del Futuro',
    author: 'Laura Bianchi',
    status: 'review',
    genre: 'Fantascienza',
    createdAt: '2024-12-01',
    updatedAt: '2025-01-03',
  },
  {
    id: '3',
    title: 'La Casa sul Mare',
    author: 'Giuseppe Verdi',
    status: 'editing',
    genre: 'Romanzo',
    createdAt: '2025-01-02',
    updatedAt: '2025-01-05',
  },
];

export default function CatalogoPage() {
  const [books] = useState<Book[]>(mockBooks);
  const [filter, setFilter] = useState<string>('all');

  const getStatusColor = (status: Book['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'editing':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Book['status']) => {
    switch (status) {
      case 'published':
        return 'Pubblicato';
      case 'approved':
        return 'Approvato';
      case 'review':
        return 'In Revisione';
      case 'editing':
        return 'In Editing';
      default:
        return 'Bozza';
    }
  };

  const filteredBooks = filter === 'all'
    ? books
    : books.filter(b => b.status === filter);

  return (
    <>
      <Header
        title="Catalogo Libri"
        description="Gestisci il tuo catalogo editoriale"
      />

      <div className="p-6">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tutti
            </Button>
            <Button
              variant={filter === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('published')}
            >
              Pubblicati
            </Button>
            <Button
              variant={filter === 'review' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('review')}
            >
              In Revisione
            </Button>
            <Button
              variant={filter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('draft')}
            >
              Bozze
            </Button>
          </div>
          <Link href="/dashboard/catalogo/nuovo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Libro
            </Button>
          </Link>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Cover placeholder */}
                  <div className="w-20 h-28 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-indigo-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-500">{book.author}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                        {getStatusText(book.status)}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-gray-400">
                      <p>Genere: {book.genre}</p>
                      <p>Aggiornato: {new Date(book.updatedAt).toLocaleDateString('it-IT')}</p>
                    </div>

                    <Link href={`/dashboard/catalogo/${book.id}`}>
                      <Button variant="link" size="sm" className="px-0 mt-2">
                        Modifica
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <Card className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Nessun libro trovato</p>
              <Link href="/dashboard/catalogo/nuovo">
                <Button variant="link" className="mt-2">
                  Aggiungi il primo libro
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
