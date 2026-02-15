import { Metadata } from 'next';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Trading Terminal | Onde',
  description: 'Kalshi & Polymarket Betting Dashboard',
};

export default function BettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary name="Betting Dashboard">
      {children}
    </ErrorBoundary>
  );
}
