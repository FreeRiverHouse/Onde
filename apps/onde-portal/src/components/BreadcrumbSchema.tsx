import Script from 'next/script'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

/**
 * Generates JSON-LD BreadcrumbList schema for SEO.
 * 
 * Usage:
 * <BreadcrumbSchema items={[
 *   { name: 'Home', url: 'https://onde.la' },
 *   { name: 'Books', url: 'https://onde.la/libri' },
 *   { name: 'Meditations', url: 'https://onde.la/libri/meditations' },
 * ]} />
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Visual breadcrumb component with schema.
 */
export function Breadcrumb({ items }: BreadcrumbSchemaProps) {
  return (
    <>
      <BreadcrumbSchema items={items} />
      <nav aria-label="Breadcrumb" className="text-sm text-onde-ocean/60">
        <ol className="flex items-center gap-2 flex-wrap">
          {items.map((item, index) => (
            <li key={item.url} className="flex items-center gap-2">
              {index > 0 && <span className="text-onde-ocean/30">/</span>}
              {index === items.length - 1 ? (
                <span className="text-onde-ocean font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <a 
                  href={item.url}
                  className="hover:text-onde-coral transition-colors"
                >
                  {item.name}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

export default BreadcrumbSchema
