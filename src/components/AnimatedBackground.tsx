import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-neutral-50 dark:bg-[#0B0F19] transition-colors duration-500">
      {/* Ambient gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-neutral-50 via-white/80 to-indigo-50/20 dark:from-[#0B0F19] dark:via-[#0F172A]/90 dark:to-indigo-950/20" />

      {/* Glow Blob 1 - Top Left */}
      <motion.div
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ willChange: 'transform' }}
        className="absolute -top-[15%] -left-[15%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-indigo-500/12 to-purple-500/8 dark:from-indigo-600/15 dark:to-purple-600/10 blur-[100px]"
      />

      {/* Glow Blob 2 - Bottom Right */}
      <motion.div
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 50, -60, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ willChange: 'transform' }}
        className="absolute -bottom-[20%] -right-[15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-blue-500/10 to-pink-500/10 dark:from-blue-600/12 dark:to-pink-600/10 blur-[120px]"
      />

      {/* Glow Blob 3 - Ambient Center Accent */}
      <motion.div
        animate={{
          scale: [0.95, 1.15, 0.9, 0.95],
          opacity: [0.35, 0.55, 0.35, 0.35],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ willChange: 'transform' }}
        className="absolute top-[25%] left-[25%] w-[35vw] h-[35vw] rounded-full bg-indigo-200/20 dark:bg-purple-900/12 blur-[100px]"
      />
    </div>
  );
}
