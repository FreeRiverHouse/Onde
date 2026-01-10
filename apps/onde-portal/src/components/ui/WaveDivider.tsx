'use client'

import { motion } from 'framer-motion'

interface WaveDividerProps {
  color?: 'cream' | 'white' | 'ocean'
  flip?: boolean
  className?: string
}

const colorMap = {
  cream: '#FDF6E3',
  white: '#FFFFFF',
  ocean: '#1B4F72',
}

export default function WaveDivider({
  color = 'cream',
  flip = false,
  className = '',
}: WaveDividerProps) {
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height: '80px',
        marginTop: flip ? '-1px' : 0,
        marginBottom: flip ? 0 : '-1px',
        transform: flip ? 'rotate(180deg)' : 'none',
      }}
    >
      <motion.svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 w-full h-full"
        preserveAspectRatio="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.path
          d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
          fill={colorMap[color]}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  )
}
