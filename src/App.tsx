/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useLoading } from './context/LoadingContext';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const { isLoading, setIsLoading } = useLoading();
  const [result, setResult] = useState<string | null>(null);

  const handleFetchAI = async () => {
    setIsLoading(true);
    setResult(null);

    // Simulate AI API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    setResult("This is the generated response from the AI. The universe is vast and full of mysteries. By implementing this clean skeleton loader, you've ensured a smooth and pleasant user experience during data retrieval.");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      <main className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium tracking-tight mb-4">AI Interface Processor</h1>
          <p className="text-neutral-500 max-w-md mx-auto">
            Initiate the processor to fetch data. The global loading state will handle the UI transitions seamlessly.
          </p>
        </div>

        <button
          onClick={handleFetchAI}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800"
        >
          <Sparkles className="w-5 h-5" />
          {isLoading ? 'Processing...' : 'Generate Insights'}
        </button>

        <div className="w-full mt-12 flex flex-col items-center min-h-[200px]">
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="w-full"
            >
              <SkeletonLoader />
            </motion.div>
          )}
          
          {!isLoading && result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl p-6 bg-white border border-neutral-200 rounded-xl shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="pt-2 border-b border-transparent">
                  <h3 className="font-medium mb-2 leading-none">AI Assistant</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {result}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
