'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, Plus, Calendar, Target, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  contentType: 'book' | 'music';
  contentTitle: string;
  channels: string[];
  startDate: string;
  endDate?: string;
  metrics: {
    impressions: number;
    engagement: number;
    clicks: number;
  };
}

// Mock data
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Lancio Album Estate',
    description: 'Campagna promozionale per il nuovo album estivo',
    status: 'active',
    contentType: 'music',
    contentTitle: 'Summer Vibes EP',
    channels: ['twitter', 'instagram'],
    startDate: '2025-01-01',
    metrics: { impressions: 15420, engagement: 8.5, clicks: 342 },
  },
  {
    id: '2',
    name: 'Promozione Libro Gennaio',
    description: 'Lancio del nuovo romanzo',
    status: 'draft',
    contentType: 'book',
    contentTitle: 'Il Viaggio Infinito',
    channels: ['twitter'],
    startDate: '2025-01-15',
    metrics: { impressions: 0, engagement: 0, clicks: 0 },
  },
];

export default function CampagnePage() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'Attiva';
      case 'paused':
        return 'In Pausa';
      case 'completed':
        return 'Completata';
      default:
        return 'Bozza';
    }
  };

  return (
    <>
      <Header
        title="Campagne PR"
        description="Gestisci le tue campagne di marketing"
      />

      <div className="p-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button variant="outline">
              Tutte
            </Button>
            <Button variant="ghost">
              Attive
            </Button>
            <Button variant="ghost">
              Bozze
            </Button>
            <Button variant="ghost">
              Completate
            </Button>
          </div>
          <Link href="/dashboard/campagne/nuova">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuova Campagna
            </Button>
          </Link>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Campagne Attive</p>
                  <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
                </div>
                <Megaphone className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Impressioni Totali</p>
                  <p className="text-2xl font-bold">
                    {campaigns.reduce((acc, c) => acc + c.metrics.impressions, 0).toLocaleString()}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Engagement Medio</p>
                  <p className="text-2xl font-bold">
                    {(campaigns.reduce((acc, c) => acc + c.metrics.engagement, 0) / campaigns.length || 0).toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusText(campaign.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{campaign.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(campaign.startDate).toLocaleDateString('it-IT')}
                      </span>
                      <span>
                        Contenuto: {campaign.contentTitle}
                      </span>
                      <span>
                        Canali: {campaign.channels.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {campaign.status === 'active' && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Impressioni</p>
                        <p className="text-xl font-bold">{campaign.metrics.impressions.toLocaleString()}</p>
                      </div>
                    )}
                    <Link href={`/dashboard/campagne/${campaign.id}`}>
                      <Button variant="outline" size="sm" className="mt-2">
                        Dettagli
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
