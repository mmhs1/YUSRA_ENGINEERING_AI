/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useLoading } from './context/LoadingContext';
import { SkeletonLoader } from './components/SkeletonLoader';
import { AIResponse } from './components/AIResponse';
import { useDarkMode } from './hooks/useDarkMode';
import { Sparkles, Send, Moon, Sun, Clock, TerminalSquare, Trash2, Download, FileText, Search, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getReadingTime } from './utils/readingTime';
import { jsPDF } from 'jspdf';
import { IntroModal } from './components/IntroModal';
import { playPing } from './utils/audio';
import { TemplatesModal } from './components/TemplatesModal';
import { useSpeechToText } from './hooks/useSpeechToText';

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
  const [showTemplates, setShowTemplates] = useState(false);

  const { isListening, transcript, toggleListening, error, setTranscript } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setPrompt(transcript);
    }
  }, [transcript]);

  const MAX_CHARS = 500;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.length > 0 || isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history.length, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const currentPrompt = prompt;
    setPrompt('');
    setIsLoading(true);

    // Simulate AI API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const simulatedResponse = `Analyzing prompt: "${currentPrompt}"\n\nThis is a simulated AI response tailored to your query. Data processing modules indicate that incorporating a cohesive layout with dark mode significantly enhances developer ergonomics and user satisfaction.`;
    
    setIsLoading(false);
    playPing();
    
    setHistory(prev => {
      return [{ prompt: currentPrompt, response: simulatedResponse }, ...prev];
    });
  };

  const selectHistory = (item: HistoryItem) => {
    // If we click a history item on sidebar, maybe populate the input, or do nothing.
    // Assuming we just want to jump to it visually, but since we map over `history`,
    // the index might be hard to guess if reversed.
    // Let's scroll to the item.
    const index = history.findIndex(i => i === item);
    if (index !== -1) {
      const reversedIndex = history.length - 1 - index;
      document.getElementById(`history-item-${reversedIndex}`)?.scrollIntoView({ behavior: 'smooth' });
    }
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

  const downloadPdfHistory = () => {
    if (history.length === 0) return;
    const doc = new jsPDF();
    let y = 15;
    
    doc.setFontSize(16);
    doc.text("AI Assistant History", 15, y);
    y += 15;
    
    doc.setFontSize(12);

    history.slice().reverse().forEach((item, index) => {
      // Check for page break
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
      
      const splitPrompt = doc.splitTextToSize(`Prompt: ${item.prompt}`, 180);
      doc.text(splitPrompt, 15, y);
      y += splitPrompt.length * 7 + 5;

      const splitResponse = doc.splitTextToSize(`Response: ${item.response}`, 180);
      doc.text(splitResponse, 15, y);
      y += splitResponse.length * 7 + 10;
    });

    doc.save("ai_history.pdf");
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200 selection:bg-neutral-200 dark:selection:bg-neutral-700">
      <IntroModal />
      <TemplatesModal 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)} 
        onSelectTemplate={(text) => {
          setPrompt(text);
          setTranscript(text);
          setShowTemplates(false);
        }} 
      />
      
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
                  className="w-full text-left p-3 rounded-lg text-sm bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 flex flex-col gap-1.5"
                  title={item.prompt}
                >
                  <span className="truncate w-full block font-medium text-neutral-800 dark:text-neutral-200">{item.prompt}</span>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Clock className="w-3 h-3" />
                    <span>{getReadingTime(item.response)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
          <button
            onClick={downloadPdfHistory}
            disabled={history.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            Export to PDF
          </button>
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
          {history.length === 0 && !isLoading && (
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

          <div className="w-full max-w-2xl flex flex-col gap-6 w-full mt-8">
            <AnimatePresence initial={false}>
              {history.slice().reverse().map((item, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4"
                  id={`history-item-${index}`}
                >
                  <div className="self-end bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-5 py-3 rounded-2xl max-w-[85%] rounded-tr-sm shadow-sm">
                    {item.prompt}
                  </div>
                  <AIResponse response={item.response} />
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex justify-center"
              >
                <SkeletonLoader />
              </motion.div>
            )}
          </div>
          <div ref={bottomRef} className="h-4 w-full shrink-0" />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 via-neutral-50 dark:via-neutral-900 to-transparent pt-10 pb-8 px-4 flex flex-col items-center">
          
          {/* Suggestion Chips */}
          <div className="w-full max-w-2xl flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1">
            <button
              type="button"
              onClick={() => setShowTemplates(true)}
              className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-900 dark:bg-neutral-100 dark:border-neutral-100 dark:text-neutral-900 text-white rounded-full transition-colors disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              Browse Templates
            </button>
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
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'}`}
              title={isListening ? "Stop listening" : "Start speaking"}
            >
              {isListening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setTranscript(e.target.value);
              }}
              maxLength={MAX_CHARS}
              placeholder="Enter your prompt here..."
              disabled={isLoading}
              className="w-full py-4 pl-12 pr-24 rounded-2xl bg-transparent outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 disabled:opacity-50"
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
