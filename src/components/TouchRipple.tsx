import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function TouchRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Exclude right clicks
      if (e.button === 2) return;

      const target = e.target as HTMLElement;
      const isClickable = target.closest('button, a, input, select, textarea, [role="button"]');
      const size = isClickable ? 60 : 36; // Clickables get a punchier, stronger ripple

      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size
      };

      setRipples((prev) => [...prev, newRipple]);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ 
              x: ripple.x - ripple.size / 2, 
              y: ripple.y - ripple.size / 2, 
              scale: 0.1, 
              opacity: 0.6 
            }}
            animate={{ 
              scale: 2.2, 
              opacity: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => {
              setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
            }}
            style={{
              width: ripple.size,
              height: ripple.size,
            }}
            className="absolute rounded-full border border-indigo-400/30 bg-radial from-indigo-500/20 to-transparent dark:from-indigo-400/20 dark:border-indigo-300/30 shadow-[0_0_8px_rgba(99,102,241,0.15)]"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
