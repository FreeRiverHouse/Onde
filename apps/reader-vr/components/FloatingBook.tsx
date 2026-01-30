'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useBookStore, SAMPLE_PAGES } from '@/store/bookStore';

interface FloatingBookProps {
  currentPage: number;
  fontSize: number;
  distance: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function FloatingBook({ 
  currentPage, 
  fontSize, 
  distance,
  onNextPage,
  onPrevPage,
}: FloatingBookProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Get book content from store
  const { currentBook, getCurrentPageContent } = useBookStore();
  
  // Get current page content
  const pageContent = currentBook ? getCurrentPageContent() : null;
  
  // Use EPUB content if available, otherwise fall back to sample pages
  const text = pageContent?.text || SAMPLE_PAGES[currentPage % SAMPLE_PAGES.length];
  const totalPages = currentBook?.totalPages || SAMPLE_PAGES.length;
  const displayPage = pageContent ? currentPage + 1 : (currentPage % SAMPLE_PAGES.length) + 1;
  
  // Chapter info for EPUB books
  const chapterInfo = pageContent 
    ? `${pageContent.chapter} (${pageContent.pageInChapter + 1}/${pageContent.totalPagesInChapter})`
    : null;
  
  // Subtle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = 1.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.4, -distance]}>
      {/* Book panel background */}
      <RoundedBox 
        args={[1.4, 1.8, 0.05]} 
        radius={0.02}
        smoothness={4}
        position={[0, 0, -0.03]}
      >
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8}
          metalness={0.1}
        />
      </RoundedBox>
      
      {/* Page texture/inner */}
      <RoundedBox 
        args={[1.3, 1.7, 0.02]} 
        radius={0.01}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#f5f5dc" 
          roughness={0.9}
          metalness={0}
        />
      </RoundedBox>
      
      {/* Chapter title for EPUB books */}
      {chapterInfo && (
        <Text
          position={[0, 0.75, 0.02]}
          fontSize={0.022}
          maxWidth={1.15}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          {chapterInfo}
        </Text>
      )}
      
      {/* Main text content */}
      <Text
        position={[0, chapterInfo ? 0.05 : 0.1, 0.02]}
        fontSize={fontSize}
        maxWidth={1.15}
        lineHeight={1.5}
        letterSpacing={0.01}
        textAlign="left"
        anchorX="center"
        anchorY="middle"
        color="#1a1a1a"
        font="/fonts/Merriweather-Regular.ttf"
        overflowWrap="break-word"
      >
        {text}
      </Text>
      
      {/* Page number */}
      <Text
        position={[0, -0.8, 0.02]}
        fontSize={0.025}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        Page {displayPage} of {totalPages}
      </Text>
      
      {/* Book title if EPUB loaded */}
      {currentBook && (
        <Text
          position={[0, -0.72, 0.02]}
          fontSize={0.018}
          color="#888888"
          anchorX="center"
          anchorY="middle"
        >
          {currentBook.metadata.title} — {currentBook.metadata.author}
        </Text>
      )}
      
      {/* Navigation arrows (clickable in VR) */}
      <group position={[-0.55, -0.8, 0.03]}>
        <mesh onClick={onPrevPage}>
          <planeGeometry args={[0.08, 0.08]} />
          <meshBasicMaterial color="#333333" transparent opacity={currentPage > 0 ? 0.8 : 0.3} />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.04}
          color="white"
        >
          ←
        </Text>
      </group>
      
      <group position={[0.55, -0.8, 0.03]}>
        <mesh onClick={onNextPage}>
          <planeGeometry args={[0.08, 0.08]} />
          <meshBasicMaterial color="#333333" transparent opacity={currentPage < totalPages - 1 ? 0.8 : 0.3} />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.04}
          color="white"
        >
          →
        </Text>
      </group>
    </group>
  );
}
