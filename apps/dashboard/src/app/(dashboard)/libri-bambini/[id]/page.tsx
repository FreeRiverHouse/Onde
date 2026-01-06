'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Edit3,
  Image,
  Languages,
  Globe,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  Play,
  Settings,
  Download,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Chapter {
  id: string;
  number: number;
  title: string;
  titleEn?: string;
  status: 'pending' | 'writing' | 'review' | 'approved';
  wordCount: number;
  targetWordCount: number;
  illustrationsCount: number;
  illustrationsApproved: number;
}

interface BookDetails {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  genre: string;
  ageRange: string;
  status: string;
  language: string;
  illustrationStyle: string;
  colorPalette: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

// Mock data for "AI Spiegata ai Bambini"
const mockBook: BookDetails = {
  id: 'ai-spiegata-bambini',
  title: 'AI Spiegata ai Bambini',
  titleEn: 'AI Explained to Kids',
  description: 'Il robot AIKO insegna ai bambini cosa sono le intelligenze artificiali attraverso storie divertenti e illustrazioni colorate.',
  genre: 'Educativo',
  ageRange: '6-8 anni',
  status: 'writing',
  language: 'both',
  illustrationStyle: 'Cartoon',
  colorPalette: 'Colori Caldi',
  chapters: [
    { id: '1', number: 1, title: 'Ciao, sono AIKO!', titleEn: 'Hello, I\'m AIKO!', status: 'approved', wordCount: 520, targetWordCount: 500, illustrationsCount: 2, illustrationsApproved: 2 },
    { id: '2', number: 2, title: 'Come fa AIKO a parlare?', titleEn: 'How does AIKO talk?', status: 'review', wordCount: 480, targetWordCount: 500, illustrationsCount: 2, illustrationsApproved: 1 },
    { id: '3', number: 3, title: 'AIKO impara!', titleEn: 'AIKO learns!', status: 'writing', wordCount: 250, targetWordCount: 500, illustrationsCount: 2, illustrationsApproved: 0 },
    { id: '4', number: 4, title: 'I giochi di AIKO', titleEn: 'AIKO\'s games', status: 'pending', wordCount: 0, targetWordCount: 500, illustrationsCount: 2, illustrationsApproved: 0 },
    { id: '5', number: 5, title: 'AIKO ci aiuta', titleEn: 'AIKO helps us', status: 'pending', wordCount: 0, targetWordCount: 500, illustrationsCount: 2, illustrationsApproved: 0 },
    { id: '6', number: 6, title: 'Quando AIKO non capisce', titleEn: 'When AIKO doesn\'t understand', status: 'pending', wordCount: 0, targetWordCount: 500, illustrationsCount: 2, illustrationsApproved: 0 },
    { id: '7', number: 7, title: 'Tu e AIKO', titleEn: 'You and AIKO', status: 'pending', wordCount: 0, targetWordCount: 500, illustrationsCount: 2, illustrationsApproved: 0 },
    { id: '8', number: 8, title: 'Il futuro con AIKO', titleEn: 'The future with AIKO', status: 'pending', wordCount: 0, targetWordCount: 500, illustrationsCount: 2, illustrationsApproved: 0 },
  ],
  createdAt: '2025-01-05',
  updatedAt: '2025-01-05',
};

export default function BookDetailPage() {
  const params = useParams();
  const [book] = useState<BookDetails>(mockBook);

  const getChapterStatusColor = (status: Chapter['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'writing':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChapterStatusText = (status: Chapter['status']) => {
    switch (status) {
      case 'approved':
        return 'Approvato';
      case 'review':
        return 'In Revisione';
      case 'writing':
        return 'In Scrittura';
      default:
        return 'Da Fare';
    }
  };

  const totalWords = book.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  const targetWords = book.chapters.reduce((sum, ch) => sum + ch.targetWordCount, 0);
  const completedChapters = book.chapters.filter(ch => ch.status === 'approved').length;
  const totalIllustrations = book.chapters.reduce((sum, ch) => sum + ch.illustrationsCount, 0);
  const approvedIllustrations = book.chapters.reduce((sum, ch) => sum + ch.illustrationsApproved, 0);

  return (
    <>
      <Header
        title={book.title}
        description={book.description}
      />

      <div className="p-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Edit3 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedChapters}/{book.chapters.length}</p>
                  <p className="text-sm text-gray-500">Capitoli Completati</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalWords.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Parole Scritte</p>
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
                  <p className="text-2xl font-bold">{approvedIllustrations}/{totalIllustrations}</p>
                  <p className="text-sm text-gray-500">Illustrazioni</p>
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
                  <p className="text-2xl font-bold">{Math.round((totalWords / targetWords) * 100)}%</p>
                  <p className="text-sm text-gray-500">Progresso Totale</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chapters List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Capitoli</CardTitle>
                    <CardDescription>Clicca su un capitolo per modificarlo</CardDescription>
                  </div>
                  <Link href={`/libri-bambini/${book.id}/scrivi`}>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-500">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Scrivi con AI
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {book.chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/libri-bambini/${book.id}/capitoli?c=${chapter.number}`}
                      className="block"
                    >
                      <div className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                        chapter.status === 'writing' ? 'border-orange-300 bg-orange-50' : ''
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              chapter.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : chapter.status === 'review'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : chapter.status === 'writing'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-100 text-gray-500'
                            }`}>
                              {chapter.status === 'approved' ? <CheckCircle className="h-4 w-4" /> : chapter.number}
                            </div>
                            <div>
                              <h4 className="font-medium">{chapter.title}</h4>
                              <p className="text-xs text-gray-500">{chapter.titleEn}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{chapter.wordCount}/{chapter.targetWordCount}</p>
                              <p className="text-xs text-gray-500">parole</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChapterStatusColor(chapter.status)}`}>
                              {getChapterStatusText(chapter.status)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Word count progress bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full transition-all ${
                                chapter.status === 'approved'
                                  ? 'bg-green-500'
                                  : chapter.status === 'review'
                                    ? 'bg-yellow-500'
                                    : 'bg-indigo-500'
                              }`}
                              style={{ width: `${Math.min((chapter.wordCount / chapter.targetWordCount) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dettagli Libro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Genere:</span>
                  <span className="font-medium">{book.genre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Età target:</span>
                  <span className="font-medium">{book.ageRange}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lingua:</span>
                  <span className="font-medium">{book.language === 'both' ? 'IT + EN' : book.language.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Stile:</span>
                  <span className="font-medium">{book.illustrationStyle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Colori:</span>
                  <span className="font-medium">{book.colorPalette}</span>
                </div>
                <hr />
                <Button variant="outline" className="w-full" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Modifica Impostazioni
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Azioni Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/libri-bambini/${book.id}/scrivi`}>
                  <Button className="w-full justify-start bg-gradient-to-r from-indigo-500 to-purple-500 mb-2" size="sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Scrivi con AI
                  </Button>
                </Link>
                <Link href={`/libri-bambini/${book.id}/capitoli`}>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editor Capitoli
                  </Button>
                </Link>
                <Link href={`/libri-bambini/${book.id}/illustrazioni`}>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Image className="h-4 w-4 mr-2" />
                    Galleria Illustrazioni
                  </Button>
                </Link>
                <Link href={`/libri-bambini/${book.id}/traduzioni`}>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Languages className="h-4 w-4 mr-2" />
                    Traduzioni
                  </Button>
                </Link>
                <hr className="my-2" />
                <Button variant="outline" className="w-full justify-start" size="sm" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Esporta EPUB
                </Button>
                <Link href={`/libri-bambini/${book.id}/pubblica`}>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500" size="sm">
                    <Globe className="h-4 w-4 mr-2" />
                    Pubblica su Amazon
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* AI Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Attività AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Capitolo 3 in scrittura</p>
                      <p className="text-gray-500 text-xs">Writer Agent - 2 min fa</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Capitolo 2 revisionato</p>
                      <p className="text-gray-500 text-xs">Editor Agent - 15 min fa</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Image className="h-4 w-4 text-pink-500 mt-0.5" />
                    <div>
                      <p className="font-medium">2 illustrazioni generate</p>
                      <p className="text-gray-500 text-xs">Illustrator Agent - 1 ora fa</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
