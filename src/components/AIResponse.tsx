import { Sparkles, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface AIResponseProps {
  response: string;
}

export function AIResponse({ response }: AIResponseProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokens = response.split(/(\s+)/);

  const container = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.02 } 
    }
  };

  const item = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm relative group"
    >
      <button 
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy to Clipboard"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white dark:text-neutral-900" />
        </div>
        <div className="pt-2 border-b border-transparent w-full">
          <h3 className="font-medium mb-2 leading-none dark:text-neutral-100">AI Assistant</h3>
          <motion.p 
            variants={container}
            initial="hidden"
            animate="visible"
            className="text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap"
          >
            {tokens.map((token, i) => {
              if (/\s+/.test(token)) {
                return String(token);
              }
              return (
                <motion.span key={i} variants={item} className="inline-block">
                  {token}
                </motion.span>
              );
            })}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
