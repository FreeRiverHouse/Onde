'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Music,
  Megaphone,
  Bot,
  Settings,
  Home,
  Twitter,
  Baby,
  TrendingUp,
  Paintbrush,
  PenTool,
  LayoutDashboard,
  Dices,
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: '🎰 Betting', href: '/betting', icon: Dices },
  { name: 'Kanban Agenti', href: '/kanban', icon: LayoutDashboard },
  { name: 'Catalogo', href: '/catalogo', icon: BookOpen },
  { name: 'Libri Bambini', href: '/libri-bambini', icon: Baby },
  { name: 'Gianni Parola', href: '/scrittore', icon: PenTool },
  { name: 'Pina Pennello', href: '/illustratore', icon: Paintbrush },
  { name: 'Go-To-Market', href: '/gotomarket', icon: TrendingUp },
  { name: 'Musica', href: '/musica', icon: Music },
  { name: 'Campagne PR', href: '/campagne', icon: Megaphone },
  { name: 'Social', href: '/social', icon: Twitter },
  { name: 'AI Agents', href: '/agenti', icon: Bot },
  { name: 'Impostazioni', href: '/impostazioni', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
          <span className="text-xl font-bold text-white">Onde Studio</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Account selector */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold">
            FR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Free River House
            </p>
            <p className="text-xs text-gray-400 truncate">
              @FreeRiverHouse
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
