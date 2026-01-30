import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reader | Onde',
  description: 'Read our illustrated books online. Free stories for children with beautiful watercolor illustrations.',
  alternates: {
    canonical: '/reader',
  },
  openGraph: {
    title: 'Reader | Onde',
    description: 'Read illustrated books online for free. Beautiful stories for children.',
  },
}

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
