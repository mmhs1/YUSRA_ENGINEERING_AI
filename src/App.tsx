/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useLoading } from './context/LoadingContext';
import { SkeletonLoader } from './components/SkeletonLoader';
import { AIResponse } from './components/AIResponse';
import { useDarkMode } from './hooks/useDarkMode';
import { Sparkles, Send, Moon, Sun, Clock, TerminalSquare, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryItem {
  prompt: string;
  response: string;
}

const SUGGESTIONS = [
  "Summarize this text",
  "Explain this concept",
  "Generate a creative story",
  "Help me brainstorm"
];

export default function App() {
  const { isLoading, setIsLoading } = useLoading();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<string | null>(null);

  const MAX_CHARS = 500;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentResult || isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentResult, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const currentPrompt = prompt;
    setPrompt('');
    setIsLoading(true);
    setCurrentResult(null);

    // Simulate AI API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const simulatedResponse = `Analyzing prompt: "${currentPrompt}"\n\nThis is a simulated AI response tailored to your query. Data processing modules indicate that incorporating a cohesive layout with dark mode significantly enhances developer ergonomics and user satisfaction.`;
    
    setCurrentResult(simulatedResponse);
    setIsLoading(false);
    
    setHistory(prev => {
      const newHistory = [{ prompt: currentPrompt, response: simulatedResponse }, ...prev];
      return newHistory.slice(0, 5); // Keep only last 5 items
    });
  };

  const selectHistory = (item: HistoryItem) => {
    setCurrentResult(item.response);
  };

  const clearHistory = () => {
    setHistory([]);
    setCurrentResult(null);
  };

  const downloadHistory = () => {
    if (history.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ai_history.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200 selection:bg-neutral-200 dark:selection:bg-neutral-700">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 font-medium">
          <TerminalSquare className="w-5 h-5 text-neutral-500" />
          <span>AI Processor</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            <span>Recent History</span>
          </div>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-500 italic">No history yet.</p>
            ) : (
              history.map((item, index) => (
                <button
                  key={index}
                  onClick={() => selectHistory(item)}
                  className="w-full text-left p-3 rounded-lg text-sm bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors truncate border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                  title={item.prompt}
                >
                  {item.prompt}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
          <button
            onClick={downloadHistory}
            disabled={history.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
          <button
            onClick={clearHistory}
            disabled={history.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        
        {/* Header */}
        <header className="absolute top-0 right-0 p-4 z-10">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Output Area */}
        <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 flex flex-col items-center pb-40">
          {!isLoading && !currentResult && (
            <div className="mt-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-neutral-400" />
              </div>
              <h1 className="text-2xl font-medium tracking-tight mb-2">How can I help you today?</h1>
              <p className="text-neutral-500 max-w-md">
                Enter a custom prompt below to initiate the generation sequence and preview the results.
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {isLoading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full mt-8 flex justify-center"
              >
                <SkeletonLoader />
              </motion.div>
            )}

            {!isLoading && currentResult && (
              <motion.div 
                key="result"
                className="w-full mt-8 flex justify-center"
              >
                <AIResponse response={currentResult} />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4 w-full shrink-0" />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 via-neutral-50 dark:via-neutral-900 to-transparent pt-10 pb-8 px-4 flex flex-col items-center">
          
          {/* Suggestion Chips */}
          <div className="w-full max-w-2xl flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1">
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(suggestion)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-300 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form 
            onSubmit={handleSubmit}
            className="w-full max-w-2xl relative shadow-lg rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 transition-colors focus-within:ring-2 focus-within:ring-neutral-900 dark:focus-within:ring-neutral-100"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={MAX_CHARS}
              placeholder="Enter your prompt here..."
              disabled={isLoading}
              className="w-full py-4 pl-6 pr-24 rounded-2xl bg-transparent outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 disabled:opacity-50"
            />
            {/* Character Count */}
            <div className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-mono pointer-events-none">
              {prompt.length}/{MAX_CHARS}
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
