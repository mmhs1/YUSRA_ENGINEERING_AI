import { Sparkles, Copy, Check, Clock, ChevronDown, ChevronUp, BotMessageSquare, FileText, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { getReadingTime } from '../utils/readingTime';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const isInline = inline || !match;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isInline) {
    return <code className={className} {...props}>{children}</code>;
  }

  return (
    <div className="relative group/code mt-4 mb-4 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-700">
      <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-800 border-b border-neutral-700">
        <span className="text-xs text-neutral-400 font-mono">{match?.[1] || 'code'}</span>
        <button
          onClick={handleCopyCode}
          className="text-neutral-400 hover:text-white transition-colors p-1"
          title="Copy code"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm text-neutral-100 font-mono">
        <code className={className} {...props}>
          {children}
        </code>
      </div>
    </div>
  );
};

interface AIResponseProps {
  response: string;
  onRetry?: () => void;
}

export function AIResponse({ response, onRetry }: AIResponseProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const readingTime = getReadingTime(response);
  const wordCount = response.trim().split(/\s+/).length;

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
                    <Markdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{response}</Markdown>
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
          className="border-t border-neutral-100 dark:border-neutral-700 mt-4 pt-3 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 ml-[56px]"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{readingTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{wordCount} words</span>
            </div>
          </div>
          {onRetry && (
            <button onClick={onRetry} className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
