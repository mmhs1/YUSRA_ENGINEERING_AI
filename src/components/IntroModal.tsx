import { motion, AnimatePresence } from 'motion/react';
import { X, Bot, BookOpen, Clock, FileDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export function IntroModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-6 relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                title="Close intro"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center mb-6">
                <Bot className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />
              </div>
              
              <h2 className="text-2xl font-medium tracking-tight mb-2 dark:text-neutral-100">
                Welcome to AI Processor
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                Your personal AI assistant is ready. Here are a few ways to get the most out of it:
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg shrink-0">
                    <BookOpen className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Custom Prompts</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Use the input field at the bottom to ask questions, summarize text, or brainstorm ideas. Use the quick suggestions to get started fast.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg shrink-0">
                    <Clock className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">History & Reading Time</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Access past interactions in the sidebar. We automatically calculate the estimated reading time for every AI response for your convenience.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg shrink-0">
                    <FileDown className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Export Capabilities</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Download your entire conversation history as raw JSON or a beautifully formatted PDF document.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full mt-10 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
