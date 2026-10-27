// components/AnimatedContent.tsx
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedContentProps {
  children: ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function AnimatedContent({
  children,
  distance = 50,
  direction = 'vertical',
  reverse = false,
  duration = 0.6,
  delay = 0,
  className = '',
}: AnimatedContentProps) {
  const axis = direction === 'vertical' ? 'y' : 'x';
  const movement = reverse ? -distance : distance;

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        [axis]: movement,
      }}
      whileInView={{
        opacity: 1,
        [axis]: 0,
      }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
