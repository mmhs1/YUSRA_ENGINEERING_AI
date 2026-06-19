import { Sparkles, Copy, Check, Clock, ChevronDown, ChevronUp, BotMessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { getReadingTime } from '../utils/readingTime';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIResponseProps {
  response: string;
}

export function AIResponse({ response }: AIResponseProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const readingTime = getReadingTime(response);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm relative group flex flex-col transition-all duration-300"
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleCopy}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-700 rounded-lg transition-colors"
          title="Copy to Clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-700 rounded-lg transition-colors"
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-start gap-4 flex-1">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
          <BotMessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="pt-2 border-transparent w-full pr-20">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium leading-none dark:text-neutral-100">AI Assistant</h3>
          </div>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.5 } }}
                  className="text-neutral-600 dark:text-neutral-300 leading-relaxed py-1"
                >
                  <div className="markdown-body prose dark:prose-invert max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]}>{response}</Markdown>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {expanded && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="border-t border-neutral-100 dark:border-neutral-700 mt-4 pt-3 flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 ml-[56px]"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{readingTime}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
