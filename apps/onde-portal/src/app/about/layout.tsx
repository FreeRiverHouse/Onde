import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Onde - AI-Native Publishing House',
  description: 'Discover Onde, an AI-native publishing house based in Los Angeles. We craft beautifully illustrated books where artificial intelligence meets human creativity.',
  openGraph: {
    title: 'About Onde - AI-Native Publishing House',
    description: 'Where AI creativity meets human curation. Learn about our mission to make classic literature accessible and beautiful.',
    type: 'website',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
