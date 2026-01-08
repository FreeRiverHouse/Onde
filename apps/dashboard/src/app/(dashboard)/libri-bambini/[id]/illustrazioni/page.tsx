'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Image,
  Paintbrush,
  Sparkles,
  Check,
  Clock,
  RefreshCw,
  Download,
  ExternalLink,
  Plus,
  Wand2
} from 'lucide-react';
import Link from 'next/link';

interface Illustration {
  id: string;
  chapterNumber: number;
  title: string;
  prompt: string;
  status: 'pending' | 'generating' | 'review' | 'approved';
  imageUrl?: string;
  variations?: string[];
}

// Mock illustrations for Salmo 23
const mockIllustrations: Illustration[] = [
  {
    id: '1',
    chapterNumber: 1,
    title: 'Il Signore è il mio pastore',
    prompt: 'A warm, peaceful illustration in soft watercolor style. A gentle shepherd with kind eyes stands in a green meadow at golden hour. Fluffy white sheep around him. Diverse children playing among the sheep. Safe, warm, loving atmosphere.',
    status: 'pending',
  },
  {
    id: '2',
    chapterNumber: 2,
    title: 'Non mi manca nulla',
    prompt: 'Serene watercolor of a peaceful meadow. Fluffy white sheep resting on soft green grass near a gentle stream. Large friendly tree provides shade. Butterflies and flowers. Children lying on grass, content and peaceful.',
    status: 'pending',
  },
  {
    id: '3',
    chapterNumber: 3,
    title: 'Mi guida sulla strada giusta',
    prompt: 'Warm watercolor of a winding path through beautiful landscape. Shepherd walks ahead, beckoning. Sheep follow trustingly. Path goes through green hills with wildflowers. Children walk on path holding hands.',
    status: 'pending',
  },
  {
    id: '4',
    chapterNumber: 4,
    title: 'Non ho paura',
    prompt: 'Tender watercolor showing contrast between dark and light. Dark clouds on one side, warm golden light in center. Shepherd holds staff protectively. Sheep huddled close. Children peek out, reassured.',
    status: 'pending',
  },
  {
    id: '5',
    chapterNumber: 5,
    title: 'Una tavola piena di cose buone',
    prompt: 'Joyful watercolor of outdoor feast. Long wooden table in sunny garden. Colorful food: fruits, bread, cakes. Diverse children sit around smiling. One cup overflows with golden juice. Flowers and butterflies.',
    status: 'pending',
  },
  {
    id: '6',
    chapterNumber: 6,
    title: 'Per sempre con Dio',
    prompt: 'Magical watercolor of heavenly home. Beautiful glowing garden in distance. Path of light leads toward it. Shepherd walks with children toward light. Some skip happily. Luminous colors: golds, soft pinks, heavenly blues.',
    status: 'pending',
  },
  {
    id: 'cover',
    chapterNumber: 0,
    title: 'Copertina',
    prompt: 'Children\'s book cover. Gentle shepherd surrounded by fluffy sheep and diverse happy children in a beautiful green meadow. Soft watercolor style. Title space at top. Warm, inviting, peaceful. Professional quality.',
    status: 'pending',
  },
];

export default function IllustrazioniPage() {
  const params = useParams();
  const [illustrations, setIllustrations] = useState<Illustration[]>(mockIllustrations);
  const [selectedIllustration, setSelectedIllustration] = useState<Illustration | null>(null);

  const getStatusColor = (status: Illustration['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Illustration['status']) => {
    switch (status) {
      case 'approved':
        return 'Approvata';
      case 'review':
        return 'In Revisione';
      case 'generating':
        return 'Generazione...';
      default:
        return 'Da Creare';
    }
  };

  const completedCount = illustrations.filter(i => i.status === 'approved').length;
  const totalCount = illustrations.length;

  return (
    <>
      <Header
        title="Galleria Illustrazioni"
        description="Il Salmo 23 per Bambini"
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Image className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}/{totalCount}</p>
                  <p className="text-sm text-gray-500">Illustrazioni</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{illustrations.filter(i => i.status === 'pending').length}</p>
                  <p className="text-sm text-gray-500">Da Creare</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{illustrations.filter(i => i.status === 'review').length}</p>
                  <p className="text-sm text-gray-500">In Revisione</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-sm text-gray-500">Approvate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Link href="/illustratore">
              <Button className="bg-gradient-to-r from-pink-500 to-orange-500">
                <Paintbrush className="h-4 w-4 mr-2" />
                Chiedi a Pina Pennello
              </Button>
            </Link>
            <Button variant="outline">
              <Wand2 className="h-4 w-4 mr-2" />
              Genera Tutte
            </Button>
          </div>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Scarica Tutte
          </Button>
        </div>

        {/* Illustrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {illustrations.map((illustration) => (
            <Card key={illustration.id} className="overflow-hidden hover:shadow-lg transition-all">
              {/* Image Preview */}
              <div className="aspect-square bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center relative">
                {illustration.imageUrl ? (
                  <img
                    src={illustration.imageUrl}
                    alt={illustration.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <Image className="h-16 w-16 mx-auto text-pink-200 mb-3" />
                    <p className="text-sm text-gray-400">
                      {illustration.chapterNumber === 0 ? 'Copertina' : `Capitolo ${illustration.chapterNumber}`}
                    </p>
                  </div>
                )}

                {/* Status badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(illustration.status)}`}>
                  {getStatusText(illustration.status)}
                </div>

                {/* Chapter number */}
                {illustration.chapterNumber > 0 && (
                  <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="font-bold text-pink-600">{illustration.chapterNumber}</span>
                  </div>
                )}
                {illustration.chapterNumber === 0 && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white rounded-full shadow-md">
                    <span className="text-xs font-bold text-pink-600">COVER</span>
                  </div>
                )}
              </div>

              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{illustration.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{illustration.prompt}</p>

                <div className="flex gap-2">
                  <Link href="/illustratore" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Genera
                    </Button>
                  </Link>
                  {illustration.status === 'review' && (
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Approva
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips */}
        <Card className="mt-8 bg-gradient-to-r from-pink-50 to-orange-50 border-pink-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Paintbrush className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Suggerimento da Pina Pennello</h3>
                <p className="text-sm text-gray-600">
                  Per mantenere consistenza visiva, genera tutte le illustrazioni nella stessa sessione.
                  Inizia dalla copertina per definire lo stile, poi procedi con i capitoli in ordine.
                </p>
                <Link href="/illustratore">
                  <Button variant="link" className="px-0 mt-2 text-pink-600">
                    Parla con Pina Pennello <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
