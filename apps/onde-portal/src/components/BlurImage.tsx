'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface BlurImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
  fallbackColor?: string
}

/**
 * Image component with blur placeholder effect.
 * Shows a colored placeholder while loading, then fades in the image.
 */
export function BlurImage({ 
  fallbackColor = '#E8F4F8',
  className = '',
  alt,
  ...props 
}: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div 
      className="relative overflow-hidden"
      style={{ backgroundColor: fallbackColor }}
    >
      <Image
        {...props}
        alt={alt}
        className={`
          transition-opacity duration-500 ease-out
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        onLoad={() => setIsLoaded(true)}
      />
      
      {/* Shimmer effect while loading */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          }}
        />
      )}
    </div>
  )
}

/**
 * Book cover with blur placeholder optimized for book aspect ratio.
 */
export function BookCoverImage({ 
  src, 
  alt, 
  className = '',
  ...props 
}: BlurImageProps) {
  return (
    <BlurImage
      src={src}
      alt={alt}
      fallbackColor="#f8f4e8"
      className={`object-cover ${className}`}
      {...props}
    />
  )
}

export default BlurImage
