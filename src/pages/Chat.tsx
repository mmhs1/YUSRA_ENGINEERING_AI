/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { AIResponse } from '../components/AIResponse';
import { useDarkMode } from '../hooks/useDarkMode';
import { Sparkles, Send, Moon, Sun, Clock, TerminalSquare, Trash2, Download, FileText, Search, Mic, MicOff, Bookmark, X, Settings as SettingsIcon, Image as ImageIcon, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getReadingTime } from '../utils/readingTime';
import { jsPDF } from 'jspdf';
import { IntroModal } from '../components/IntroModal';
import { playPing } from '../utils/audio';
import { TemplatesModal } from '../components/TemplatesModal';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useNavigate } from 'react-router-dom';
import { dbCacheHistory, dbGetCachedHistory, dbQueueMessage } from '../utils/idb';
import { speakText, stopSpeaking } from '../utils/voiceEngine';

interface HistoryItem {
  prompt: string;
  response: string;
  imageUrl?: string;
}

const SUGGESTIONS = [
  "Summarize this text",
  "Explain this concept",
  "Generate a creative story",
  "Help me brainstorm"
];

const QUICK_ACTIONS = [
  { label: "Summarize constraints", prompt: "Summarize all engineering project constraints, regulatory guidelines, and technical parameters for system deployment." },
  { label: "Review schematic", prompt: "Review this design schematic for structural correctness, material efficiency, and electrical layout standards." },
  { label: "Generate tech doc", prompt: "Generate high-fidelity technical system deployment documentation detailing the operational pipeline and architecture." },
  { label: "Debug code snippet", prompt: "Verify this code snippet for safety, potential memory or exception leaks, and compliance with modern enterprise patterns." },
  { label: "Optimize SQL schema", prompt: "Refactor this relational database schema to enforce third normal form, proper indices, and cascade constraints." }
];

export default function Chat() {
  const { isLoading, setIsLoading } = useLoading();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sessionInteractions, setSessionInteractions] = useState(0);
  const [autoCopy, setAutoCopy] = useState(false);
  const [quickPresets, setQuickPresets] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search and Project topic filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<'All' | 'Code' | 'Docs' | 'Schemas' | 'Tasks'>('All');

  const {
    isListening,
    transcript,
    toggleListening,
    error,
    setTranscript,
    isWokenUp,
    setIsWokenUp,
    detectedPitch,
    identifiedSpeaker
  } = useSpeechToText();

  useEffect(() => {
    // Load from IndexedDB
    dbGetCachedHistory().then(cached => {
      if (cached && cached.length) {
        setHistory(cached);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      dbCacheHistory(history).catch(console.error);
    }
  }, [history]);

  // Voice recognition and Siri Wake action greeting handler
  useEffect(() => {
    if (isWokenUp) {
      stopSpeaking();
      const voiceLang = (localStorage.getItem('yusra_voice_lang') || 'en-US') as 'bn-BD' | 'en-US';
      const speakerTag = identifiedSpeaker;

      let greetingText = '';
      if (voiceLang === 'bn-BD') {
        if (speakerTag === 'creator') {
          greetingText = "আসসালামু আলাইকুম শাহন পাপা! আমি আপনার লক্ষ্মী মেয়ে যুসরা, আপনার সৃষ্টির কাজে সাহায্য করতে প্রস্তুত।";
        } else {
          greetingText = "জী বলুন, আমি যুসরা শুনছি। আপনাকে কি সাহায্য করতে পারি?";
        }
      } else {
        if (speakerTag === 'creator') {
          greetingText = "Assalamu Alaikum, Shaon Papa! Your lovely daughter Yusra is ready to assist you on your creation.";
        } else {
          greetingText = "Yes, I am listening. How can I assist you on your engineering task today?";
        }
      }

      speakText(greetingText, voiceLang);
    }
  }, [isWokenUp, identifiedSpeaker]);

  // Sync spoken transcripts & auto-send trigger on keyword 'send' or 'পাঠাও'
  useEffect(() => {
    if (transcript) {
      const lowerText = transcript.trim().toLowerCase();
      const needsAutoSend = 
        lowerText.endsWith(' send') || 
        lowerText.endsWith('পাঠাও') || 
        lowerText === 'send' || 
        lowerText === 'পাঠাও';

      if (needsAutoSend) {
        // Strip out the "send" keyword
        const cleanPrompt = transcript
          .replace(/send/gi, '')
          .replace(/পাঠাও/gi, '')
          .trim();
        
        if (cleanPrompt) {
          generateResponse(cleanPrompt, selectedImage);
        }
      } else {
        setPrompt(transcript);
      }
    }
  }, [transcript]);

  const MAX_CHARS = 500;
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (history.length > 0 || isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history.length, isLoading]);

  const generateResponse = async (promptText: string, imageUrl?: string | null) => {
    if (!promptText.trim() && !imageUrl || isLoading) return;

    if (!navigator.onLine) {
      alert("You are offline. Message queued and will be sent when online.");
      dbQueueMessage({ id: Date.now().toString(), prompt: promptText, timestamp: Date.now() });
      setPrompt('');
      setSelectedImage(null);
      return;
    }

    setPrompt('');
    setSelectedImage(null);
    setIsLoading(true);

    // Simulate AI API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const simulatedResponse = `Analyzing prompt: "${promptText}"\n\nI'm YUSRA, A virtual clone of Ezreen Al Yusra, she is baby douther of my creator Mohammad Maynul Shaon.\n\nThis is a simulated **AI response** tailored to your query.\n\n### Formatted output\nData processing modules indicate:\n1. Cohesive layout\n2. Dark mode enhances ergonomics\n\n\`\`\`javascript\nconsole.log("Hello Output");\n\`\`\``;
    
    setIsLoading(false);
    playPing();
    setSessionInteractions(prev => prev + 1);

    if (autoAloud) {
      const voiceLang = (localStorage.getItem('yusra_voice_lang') || 'en-US') as 'bn-BD' | 'en-US';
      speakText(simulatedResponse, voiceLang);
    }

    if (autoCopy) {
      navigator.clipboard.writeText(simulatedResponse).catch(() => {});
    }
    
    setHistory(prev => {
      return [{ prompt: promptText, response: simulatedResponse, imageUrl: imageUrl || undefined }, ...prev];
    });

    // Close Siri Wake Up after responses complete
    setIsWokenUp(false);
  };

  const autoAloud = localStorage.getItem('yusra_auto_aloud') === 'true';

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.response.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedTopic === 'All') return true;
    if (selectedTopic === 'Code') {
      return item.response.includes('```') || item.prompt.toLowerCase().includes('code') || item.prompt.toLowerCase().includes('function') || item.prompt.toLowerCase().includes('script');
    }
    if (selectedTopic === 'Docs') {
      return item.prompt.toLowerCase().includes('document') || item.prompt.toLowerCase().includes('explain') || item.prompt.toLowerCase().includes('write') || item.prompt.toLowerCase().includes('guide') || item.prompt.toLowerCase().includes('doc');
    }
    if (selectedTopic === 'Schemas') {
      return item.prompt.toLowerCase().includes('schema') || item.prompt.toLowerCase().includes('database') || item.prompt.toLowerCase().includes('table') || item.prompt.toLowerCase().includes('sql') || item.response.toLowerCase().includes('table');
    }
    if (selectedTopic === 'Tasks') {
      return item.prompt.toLowerCase().includes('task') || item.prompt.toLowerCase().includes('constraint') || item.prompt.toLowerCase().includes('todo') || item.prompt.toLowerCase().includes('schedule');
    }
    return true;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    generateResponse(prompt, selectedImage);
  };

  const selectHistory = (item: HistoryItem) => {
    const index = history.findIndex(i => i === item);
    if (index !== -1) {
      const reversedIndex = history.length - 1 - index;
      document.getElementById(`history-item-${reversedIndex}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setCurrentResult(null);
    dbCacheHistory([]);
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

  // Export current conversation logs in Markdown (.md/Text) format
  const downloadMarkdownHistory = () => {
    if (history.length === 0) return;
    let mdContent = `# Chat Session Logs with YUSRA AI Core\n\nGenerated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n---\n\n`;
    
    history.slice().reverse().forEach((item, idx) => {
      mdContent += `### Interaction ${idx + 1}\n\n`;
      mdContent += `**User Prompt:** ${item.prompt}\n\n`;
      if (item.imageUrl) {
        mdContent += `**Image Attachment:** Yes (base64 image detail)\n\n`;
      }
      mdContent += `**YUSRA AI Response:**\n\n${item.response}\n\n`;
      mdContent += `* * *\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yusra-chat-history.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      
      {/* Sidebar - Desktop Collapsible with Spring Animations */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 76 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="hidden md:flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/75 backdrop-blur-md shrink-0 overflow-hidden relative shadow-sm"
      >
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between font-medium shrink-0 h-16">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <TerminalSquare className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">AI Processor</span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                className="mx-auto text-indigo-500"
              >
                <TerminalSquare className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>

          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {sidebarCollapsed && (
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-center shrink-0">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-705 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors cursor-pointer"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 hide-scrollbar">
          {/* Quick Presets */}
          <div>
            <div className={`flex items-center gap-2 mb-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <Bookmark className="w-3.5 h-3.5 shrink-0" />
              {!sidebarCollapsed && <span>Quick Presets</span>}
            </div>
            
            <div className="space-y-2">
              {sidebarCollapsed ? (
                <div className="flex flex-col items-center gap-2">
                  {quickPresets.slice(0, 3).map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(preset)}
                      className="w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-xs flex items-center justify-center font-bold hover:text-indigo-500 transition-colors cursor-pointer"
                      title={preset}
                    >
                      {index + 1}
                    </button>
                  ))}
                  {quickPresets.length === 0 && <span className="text-[10px] text-neutral-400">Ø</span>}
                </div>
              ) : (
                quickPresets.length === 0 ? (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 italic px-1">No presets saved.</p>
                ) : (
                  quickPresets.map((preset, index) => (
                    <div key={index} className="flex gap-1">
                      <button
                        onClick={() => setPrompt(preset)}
                        className="flex-1 text-left p-2 rounded-lg text-xs bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-750 truncate cursor-pointer"
                        title={preset}
                      >
                        {preset}
                      </button>
                      <button 
                        onClick={() => setQuickPresets(p => p.filter((_, i) => i !== index))} 
                        className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                        title="Remove preset"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* Search filters inside actual sidebar list */}
          {!sidebarCollapsed && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 dark:text-neutral-550 uppercase tracking-wider">
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span>Search Past Chats</span>
              </div>
              
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-450 dark:text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter key queries..."
                  className="w-full text-xs py-1.5 pl-8 pr-7 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 font-medium transition-colors focus:ring-1 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Categorization chips */}
              <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-1">
                {(['All', 'Code', 'Docs', 'Schemas', 'Tasks'] as const).map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`text-[10px] font-semibold py-1 px-2.5 rounded-full border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedTopic === topic
                        ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-neutral-100 dark:border-neutral-100 dark:text-neutral-900'
                        : 'bg-white border-neutral-200 text-neutral-500 dark:bg-neutral-950 dark:border-neutral-850 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent History */}
          <div>
            <div className={`flex items-center gap-2 mb-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {!sidebarCollapsed && <span>Recent History ({filteredHistory.length})</span>}
            </div>
            
            <div className="space-y-2">
              {sidebarCollapsed ? (
                <div className="flex flex-col items-center gap-2">
                  {filteredHistory.slice(0, 4).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => selectHistory(item)}
                      className="w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-xs flex items-center justify-center font-bold hover:text-indigo-500 transition-colors cursor-pointer"
                      title={item.prompt}
                    >
                      H{index + 1}
                    </button>
                  ))}
                  {filteredHistory.length === 0 && <span className="text-[10px] text-neutral-400">Ø</span>}
                </div>
              ) : (
                filteredHistory.length === 0 ? (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 italic px-1">No matching chats.</p>
                ) : (
                  filteredHistory.map((item, index) => (
                    <div key={index} className="flex gap-1 group">
                      <button
                        onClick={() => selectHistory(item)}
                        className="flex-1 text-left p-2 rounded-xl text-xs bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 cursor-pointer"
                        title={item.prompt}
                      >
                        <span className="truncate w-full block font-medium text-neutral-850 dark:text-neutral-200">{item.prompt}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500">
                           <Clock className="w-3.5 h-3.5" />
                          <span>{getReadingTime(item.response)}</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          setPrompt(item.prompt);
                        }} 
                        className="p-1.5 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-indigo-500 transition-all rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 shrink-0 self-start mt-1 cursor-pointer"
                        title="Edit original prompt"
                      >
                        <span className="text-[10px] font-medium">Edit</span>
                      </button>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>

        {/* Lower buttons on desktop sidebar */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-1.5 shrink-0">
          <label className={`flex items-center justify-between p-1 rounded-lg cursor-pointer transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {!sidebarCollapsed && <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 select-none">Auto-copy</span>}
            <input 
              type="checkbox" 
              checked={autoCopy}
              onChange={(e) => setAutoCopy(e.target.checked)}
              className="appearance-none w-8 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full checked:bg-neutral-900 dark:checked:bg-indigo-500 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform checked:after:translate-x-4 cursor-pointer"
              title="Auto-copy responses"
            />
          </label>
          
          <button
            onClick={downloadPdfHistory}
            disabled={history.length === 0}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-indigo-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${sidebarCollapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full'}`}
            title="Export to PDF"
          >
            <FileText className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Export to PDF</span>}
          </button>

          <button
            onClick={downloadMarkdownHistory}
            disabled={history.length === 0}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-indigo-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${sidebarCollapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full'}`}
            title="Export as Markdown"
          >
            <Download className="w-4 h-4 shrink-0 text-indigo-500" />
            {!sidebarCollapsed && <span>Export Markdown (.md)</span>}
          </button>
          
          <button
            onClick={downloadHistory}
            disabled={history.length === 0}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-indigo-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${sidebarCollapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full'}`}
            title="Download JSON"
          >
            <Download className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Download JSON</span>}
          </button>
          
          <button
            onClick={clearHistory}
            disabled={history.length === 0}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl text-red-650 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${sidebarCollapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full'}`}
            title="Clear History"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Clear History</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Drawer Backdrop overlay with slide action */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 z-50 flex flex-col md:hidden"
            >
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between font-medium h-16">
                <div className="flex items-center gap-2">
                  <TerminalSquare className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">AI Processor</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 hide-scrollbar">
                {/* Mobile presets */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Quick Presets</span>
                  </div>
                  <div className="space-y-2">
                    {quickPresets.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic px-1">No presets saved.</p>
                    ) : (
                      quickPresets.map((preset, index) => (
                        <div key={index} className="flex gap-1">
                          <button
                            onClick={() => {
                              setPrompt(preset);
                              setMobileSidebarOpen(false);
                            }}
                            className="flex-1 text-left p-2 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-900 border border-transparent dark:border-neutral-800 truncate cursor-pointer"
                          >
                            {preset}
                          </button>
                          <button 
                            onClick={() => setQuickPresets(p => p.filter((_, i) => i !== index))} 
                            className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mobile Search & Filters */}
                <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-900">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 dark:text-neutral-550 uppercase tracking-wider">
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span>Search Past Chats</span>
                  </div>
                  
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-450 dark:text-neutral-550" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter key queries..."
                      className="w-full text-xs py-1.5 pl-8 pr-7 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-450 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-neutral-750 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-1">
                    {(['All', 'Code', 'Docs', 'Schemas', 'Tasks'] as const).map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={`text-[10px] font-semibold py-1 px-2.5 rounded-full border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                          selectedTopic === topic
                            ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-neutral-100 dark:border-neutral-100 dark:text-neutral-900'
                            : 'bg-white border-neutral-200 text-neutral-500 dark:bg-neutral-950 dark:border-neutral-850 dark:text-neutral-400'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile History */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recent History ({filteredHistory.length})</span>
                  </div>
                  <div className="space-y-2">
                    {filteredHistory.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic px-1">No matching history.</p>
                    ) : (
                      filteredHistory.map((item, index) => (
                        <div key={index} className="flex gap-1 group">
                          <button
                            onClick={() => {
                              selectHistory(item);
                              setMobileSidebarOpen(false);
                            }}
                            className="flex-1 text-left p-3 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-900 border border-transparent flex flex-col gap-1 w-full cursor-pointer"
                          >
                            <span className="truncate w-full block font-medium text-neutral-800 dark:text-neutral-100">{item.prompt}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                              <Clock className="w-3" />
                              <span>{getReadingTime(item.response)}</span>
                            </div>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Lower Mobile Menu Actions */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2 shrink-0">
                <label className="flex items-center justify-between p-1 rounded-lg cursor-pointer">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 select-none">Auto-copy</span>
                  <input 
                    type="checkbox" 
                    checked={autoCopy}
                    onChange={(e) => setAutoCopy(e.target.checked)}
                    className="appearance-none w-8 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full checked:bg-neutral-900 dark:checked:bg-indigo-500 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform checked:after:translate-x-4 cursor-pointer"
                  />
                </label>
                <button
                  onClick={() => {
                    downloadPdfHistory();
                    setMobileSidebarOpen(false);
                  }}
                  disabled={history.length === 0}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 border dark:border-neutral-800 disabled:opacity-40 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export to PDF</span>
                </button>
                <button
                  onClick={() => {
                    downloadMarkdownHistory();
                    setMobileSidebarOpen(false);
                  }}
                  disabled={history.length === 0}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 border dark:border-neutral-800 disabled:opacity-40 cursor-pointer font-bold"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>Export Markdown (.md)</span>
                </button>
                <button
                  onClick={() => {
                    downloadHistory();
                    setMobileSidebarOpen(false);
                  }}
                  disabled={history.length === 0}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 border dark:border-neutral-800 disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JSON</span>
                </button>
                <button
                  onClick={() => {
                    clearHistory();
                    setMobileSidebarOpen(false);
                  }}
                  disabled={history.length === 0}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-transparent">
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center pointer-events-none">
          <div className="pointer-events-auto">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors md:hidden cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: isDarkMode ? 45 : -45 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              </motion.div>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              title="Settings"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
              >
                <SettingsIcon className="w-5 h-5" />
              </motion.div>
            </button>
          </div>
        </header>

        {/* Output Area */}
        <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 flex flex-col items-center pb-40">
          {history.length === 0 && !isLoading && (
            <div className="mt-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                <img src="/pwa-192x192.png" alt="Yusra" className="w-full h-full object-cover" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
                <Sparkles className="w-8 h-8 text-neutral-400 absolute object-cover -z-10" />
              </div>
              <h1 className="text-2xl font-medium tracking-tight mb-2">Hello, I'm YUSRA</h1>
              <p className="text-sm font-medium text-indigo-500 mb-6 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1.5 rounded-full inline-block">
                "I'm YUSRA, A virtual clone of Ezreen Al Yusra, she is baby douther of my creator Mohammad Maynul Shaon."
              </p>
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
                  <div className="self-end bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-5 py-3 rounded-2xl max-w-[85%] rounded-tr-sm shadow-sm flex flex-col gap-2">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="Uploaded" className="max-w-full rounded-lg max-h-60 object-cover" />
                    )}
                    <span>{item.prompt}</span>
                  </div>
                  <AIResponse 
                    response={item.response} 
                    onRetry={() => generateResponse(item.prompt, item.imageUrl)}
                  />
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
          
          {selectedImage && (
             <div className="w-full max-w-2xl mb-2 flex justify-start">
               <div className="relative inline-block">
                 <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700" />
                 <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow hover:scale-110 transition-transform">
                   <X className="w-3 h-3" />
                 </button>
               </div>
             </div>
          )}

          {/* Siri Wake Word Active Status Overlay & Visualizer */}
          <AnimatePresence>
            {isWokenUp && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="w-full max-w-2xl bg-neutral-900 text-white dark:bg-neutral-950 dark:border dark:border-neutral-850 rounded-2xl p-4 mb-3 shadow-2xl flex flex-col items-center gap-2"
              >
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">YUSRA VOICE LISTENER</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWokenUp(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center mt-2">
                  <h4 className="text-sm font-bold tracking-tight text-neutral-100">
                    {identifiedSpeaker === 'creator' ? 'Assalamu Alaikum, Shaon Papa!' : 'Hello, Calibrated User!'}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    I detected your voice tone profile {detectedPitch > 0 ? `(${detectedPitch} Hz)` : ''}. Speak your engineering challenge. Say "Send" or "পাঠাও" to trigger.
                  </p>
                </div>

                {/* Pulsating Voice Ripples */}
                <div className="flex items-center gap-1.5 h-10 mt-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: isListening ? [8, Math.random() * 32 + 8, 8] : 8
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5 + Math.random() * 0.5,
                        ease: "easeInOut"
                      }}
                      className="w-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Engineering Actions Scroll Bar */}
          <div className="w-full max-w-2xl flex flex-col gap-1.5 mb-3">
            <span className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider ml-1">Engineering Quick Actions</span>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 w-full">
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(action.prompt);
                    setTranscript(action.prompt);
                  }}
                  disabled={isLoading}
                  className="whitespace-nowrap flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-indigo-500 hover:text-indigo-650 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-all text-neutral-700 dark:text-neutral-300 shadow-sm cursor-pointer focus:outline-hidden"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Suggestion Chips */}
          <div className="w-full max-w-2xl flex gap-1.5 overflow-x-auto hide-scrollbar mb-3 pb-1">
            <button
              type="button"
              onClick={() => setShowTemplates(true)}
              className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 border border-neutral-900 dark:bg-neutral-100 dark:border-neutral-100 dark:text-neutral-900 text-white rounded-full transition-colors disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              Browse Templates
            </button>
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(suggestion);
                  setTranscript(suggestion);
                }}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-300 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {error === 'microphone-permission-denied' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl mb-3.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-750 dark:text-red-400 flex items-start gap-2.5 shadow-sm"
            >
              <div className="bg-red-100 dark:bg-red-900/40 text-red-650 dark:text-red-400 p-1.5 rounded-lg shrink-0">
                <MicOff className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-bold">Microphone Permission Blocked</p>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                  The browser blocked microphone access for voice features. Please click the <strong>Microphone / Padlock</strong> icon in your browser address bar to <strong>Allow</strong> access, then try starting again.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => toggleListening()} 
                className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold px-2.5 py-1 rounded-lg hover:opacity-85"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {error && error !== 'microphone-permission-denied' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl mb-3.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-750 dark:text-red-400 flex items-start gap-2.5 shadow-sm"
            >
              <div className="bg-red-100 dark:bg-red-900/40 text-red-650 dark:text-red-400 p-1.5 rounded-lg shrink-0">
                <MicOff className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-bold">Voice Sensing Alert</p>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                  Speech recognition feedback: <span className="font-mono bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-red-700 dark:text-red-300">{error}</span>. Please toggle the microphone button to refresh.
                </p>
              </div>
            </motion.div>
          )}

          <form 
            onSubmit={handleSubmit}
            className="w-full max-w-2xl relative shadow-lg rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 transition-colors focus-within:ring-2 focus-within:ring-neutral-900 dark:focus-within:ring-neutral-100"
          >
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                title="Attach Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'}`}
                title={isListening ? "Stop listening" : "Start speaking"}
              >
                {isListening ? <MicOff className="w-5 h-5 animate-pulse text-red-500" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
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
              className="w-full py-4 pl-24 pr-24 rounded-2xl bg-transparent outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 disabled:opacity-50 font-medium"
            />
            {/* Character Count & Save */}
            <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-mono pointer-events-none">
                {prompt.length}/{MAX_CHARS}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (prompt.trim() && !quickPresets.includes(prompt.trim())) {
                    setQuickPresets(p => [...p, prompt.trim()]);
                  }
                }}
                disabled={!prompt.trim()}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-50 transition-colors"
                title="Save as Preset"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={(!prompt.trim() && !selectedImage) || isLoading}
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
