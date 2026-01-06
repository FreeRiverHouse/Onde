import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Music, Megaphone, Twitter, Bot, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { name: 'Libri', value: '12', icon: BookOpen, href: '/dashboard/catalogo' },
  { name: 'Release Musicali', value: '8', icon: Music, href: '/dashboard/musica' },
  { name: 'Campagne Attive', value: '3', icon: Megaphone, href: '/dashboard/campagne' },
  { name: 'Post Pubblicati', value: '47', icon: Twitter, href: '/dashboard/social' },
];

const recentActivity = [
  { type: 'tweet', message: 'Post pubblicato su @FreeRiverHouse', time: '2 ore fa' },
  { type: 'campaign', message: 'Nuova campagna "Lancio Album" creata', time: '5 ore fa' },
  { type: 'agent', message: 'Editor Agent ha completato revisione', time: '1 giorno fa' },
];

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        description="Panoramica di Onde - Casa Editrice & PR Agency"
      />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Azioni Rapide</CardTitle>
              <CardDescription>Cose che puoi fare subito</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/dashboard/social/nuovo"
                className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <Twitter className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-indigo-900">Pubblica un Tweet</span>
              </Link>
              <Link
                href="/dashboard/campagne/nuova"
                className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <Megaphone className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Crea Campagna PR</span>
              </Link>
              <Link
                href="/dashboard/agenti"
                className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                <Bot className="h-5 w-5 text-teal-600" />
                <span className="font-medium text-teal-900">Parla con un Agent</span>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Attività Recente</CardTitle>
              <CardDescription>Ultime azioni nel sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Agents Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Agents
              </CardTitle>
              <CardDescription>Stato degli agenti intelligenti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { name: 'Editor', status: 'idle', color: 'green' },
                  { name: 'Marketer', status: 'idle', color: 'green' },
                  { name: 'Branding', status: 'idle', color: 'green' },
                  { name: 'GTM', status: 'idle', color: 'green' },
                  { name: 'Social', status: 'active', color: 'blue' },
                ].map((agent) => (
                  <Link
                    key={agent.name}
                    href={`/dashboard/agenti/${agent.name.toLowerCase()}`}
                    className="flex flex-col items-center p-4 rounded-lg border hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${
                      agent.status === 'active' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Bot className={`h-6 w-6 ${
                        agent.status === 'active' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <span className="font-medium text-sm">{agent.name}</span>
                    <span className={`text-xs ${
                      agent.status === 'active' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {agent.status === 'active' ? 'Attivo' : 'Disponibile'}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
