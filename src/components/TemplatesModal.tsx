import { motion, AnimatePresence } from 'motion/react';
import { X, Search } from 'lucide-react';
import { useState } from 'react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: string) => void;
}

const TEMPLATES = [
  {
    title: 'Architecture Review',
    description: 'Ask the AI to review a system architecture and provide professional feedback.',
    prompt: 'Please review the following system architecture and provide detailed feedback on scalability, security, and potential bottlenecks:\n\n[Insert Architecture Details]'
  },
  {
    title: 'Explain to a Kid',
    description: 'Simplify complex concepts so that a 5-year-old can understand.',
    prompt: 'Explain the concept of [Insert Concept] in simple terms that a 5-year-old would understand, using analogies.'
  },
  {
    title: 'Creative Story',
    description: 'Start a creative story with specific constraints.',
    prompt: 'Write a creative sci-fi story about a rogue AI that learns to paint. The story should be at least three paragraphs and have a surprising twist at the end.'
  },
  {
    title: 'Code Refactoring',
    description: 'Ask for code improvement suggestions.',
    prompt: 'Please review the following code snippet and suggest improvements for readability, performance, and best practices:\n\n```\n[Insert Code]\n```'
  }
];

export function TemplatesModal({ isOpen, onClose, onSelectTemplate }: TemplatesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = TEMPLATES.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-xl z-50 flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-medium dark:text-neutral-100">Templates Library</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 transition-shadow"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectTemplate(template.prompt)}
                    className="flex flex-col text-left p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors group"
                  >
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {template.description}
                    </p>
                  </button>
                ))}
                {filteredTemplates.length === 0 && (
                  <div className="col-span-full py-8 text-center text-neutral-500 dark:text-neutral-400">
                    No templates found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
