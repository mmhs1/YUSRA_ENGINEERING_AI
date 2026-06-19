/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, LogOut, Mic, Check, Volume2, Award, User, RefreshCw } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { dbClearQueuedMessages } from '../utils/idb';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { speakText } from '../utils/voiceEngine';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function Settings() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const {
    wakeWordEnabled,
    toggleWakeWord,
    detectedPitch,
    identifiedSpeaker,
    isCalibrating,
    calibrationProgress,
    startVoiceCalibration
  } = useSpeechToText();

  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'en-US'>(() => {
    return (localStorage.getItem('yusra_voice_lang') as 'bn-BD' | 'en-US') || 'en-US';
  });

  const [autoAloud, setAutoAloud] = useState(() => {
    return localStorage.getItem('yusra_auto_aloud') === 'true';
  });

  const [creatorCalibratedPitch, setCreatorCalibratedPitch] = useState<number>(() => {
    const p = localStorage.getItem('yusra_creator_pitch');
    return p ? parseInt(p) : 135;
  });

  const [userCalibratedPitch, setUserCalibratedPitch] = useState<number>(() => {
    const p = localStorage.getItem('yusra_user_pitch');
    return p ? parseInt(p) : 195;
  });

  useEffect(() => {
    localStorage.setItem('yusra_voice_lang', voiceLang);
  }, [voiceLang]);

  useEffect(() => {
    localStorage.setItem('yusra_auto_aloud', String(autoAloud));
  }, [autoAloud]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const handleClearData = async () => {
    if (window.confirm("Are you sure you want to clear all local data?")) {
      await dbClearQueuedMessages();
      localStorage.removeItem('chat_history');
      alert("Local data cleared.");
    }
  };

  const handleSpeakTest = () => {
    if (voiceLang === 'bn-BD') {
      speakText("আসসালামু আলাইকুম, আমি যুসরা। আমি আপনাকে সাহায্য করতে প্রস্তুত।", 'bn-BD');
    } else {
      speakText("Hello there, I am Yusra. I am fully initialized and ready to execute your tasks.", 'en-US');
    }
  };

  // Poll calibrated pitch values when calibrating completes
  useEffect(() => {
    if (isCalibrating === null) {
      const cre = localStorage.getItem('yusra_creator_pitch');
      const usr = localStorage.getItem('yusra_user_pitch');
      if (cre) setCreatorCalibratedPitch(parseInt(cre));
      if (usr) setUserCalibratedPitch(parseInt(usr));
    }
  }, [isCalibrating]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0B0F19] text-neutral-900 dark:text-neutral-100 p-4 md:p-8 transition-colors duration-500">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Chat</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight">System Settings</h1>
        </header>

        <div className="space-y-6">
          {/* Appearance Section */}
          <section className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-6">
            <h2 className="text-sm font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Interface</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Dark Mode Canvas</h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">Toggle aesthetic dark theme on or off.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={toggleDarkMode} />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-700 peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </section>

          {/* Voice Engine Section */}
          <section className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">YUSRA VOICE CORES</h2>
              <button
                onClick={handleSpeakTest}
                className="flex items-center gap-1 text-xs py-1.5 px-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-lg transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Voice Tone</span>
              </button>
            </div>

            {/* Vocal Choice */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setVoiceLang('bn-BD')}
                className={`p-4 rounded-2xl border text-left transition-all ${voiceLang === 'bn-BD' ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/25' : 'border-neutral-200 dark:border-neutral-800'}`}
              >
                <span className="block text-xs font-semibold text-neutral-400">NATIVE BANGLA</span>
                <span className="block font-bold text-sm text-neutral-800 dark:text-neutral-100">Yusra Bangla Female</span>
                <span className="block text-[10px] text-neutral-500 mt-1">Bangla (Bangladesh)</span>
              </button>

              <button
                onClick={() => setVoiceLang('en-US')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${voiceLang === 'en-US' ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/25' : 'border-neutral-200 dark:border-neutral-800'}`}
              >
                <span className="block text-xs font-semibold text-neutral-400">ENGLISH ACCENT</span>
                <span className="block font-bold text-sm text-neutral-800 dark:text-neutral-100">Yusra English Female</span>
                <span className="block text-[10px] text-neutral-500 mt-1">US English Accent</span>
              </button>
            </div>

            {/* Auto Read Aloud */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Auto Speak Responses</h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">Enable automatic spoken audio outputs for prompt results.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoAloud} onChange={(e) => setAutoAloud(e.target.checked)} />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-700 peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            {/* Siri-style background wake word active toggle */}
            <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Siri Wake-on-Voice Word</h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">Listen continuously for "Hey Yusra" or "Yusra" in background.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={wakeWordEnabled} onChange={(e) => toggleWakeWord(e.target.checked)} />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-700 peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </section>

          {/* Voice Memorizer / Pitch profile Calibration */}
          <section className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Voice Tone Signature Engine</h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Calibrate and register pitch frequencies (in Hz) to memorize users.</p>
            </div>

            {/* Calibration display */}
            {isCalibrating && (
              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 border-dashed text-center">
                <p className="text-xs font-semibold text-indigo-500 animate-pulse">RECONSTRUCTING SPECTRUM PROFILE FOR {isCalibrating.toUpperCase()}...</p>
                <p className="text-[10px] text-neutral-500 mt-1">Please speak clearly: "Hey Yusra, represent my voice!"</p>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mt-3 max-w-sm mx-auto">
                  <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${calibrationProgress}%` }} />
                </div>
              </div>
            )}

            {/* Realtime voice indicators if speaking */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${detectedPitch > 0 ? 'bg-green-500 animate-ping' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Mic Pitch Frequency:</span>
              </div>
              <div className="flex gap-4">
                <span>{detectedPitch > 0 ? `${detectedPitch} Hz` : 'No Speech detected'}</span>
                {detectedPitch > 0 && (
                  <span className="font-bold text-indigo-500">
                    Recognized: {identifiedSpeaker === 'creator' ? 'Maynul Shaon (Creator)' : 'Standard User'}
                  </span>
                )}
              </div>
            </div>

            {/* Calibrate action triggers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    CREATOR ID
                  </span>
                  <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">{creatorCalibratedPitch} Hz</span>
                </div>
                <p className="text-[10px] text-neutral-400">Calibration for creator Mohammad Maynul Shaon (Male low frequency profile).</p>
                <button
                  type="button"
                  onClick={() => startVoiceCalibration('creator')}
                  disabled={isCalibrating !== null}
                  className="mt-2 w-full py-2 px-3 text-xs font-semibold bg-neutral-900 border hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Calibrate Creator</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    USER ID
                  </span>
                  <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">{userCalibratedPitch} Hz</span>
                </div>
                <p className="text-[10px] text-neutral-400">Calibration for regular authorized users (Higher pitch/female vocal profile).</p>
                <button
                  type="button"
                  onClick={() => startVoiceCalibration('user')}
                  disabled={isCalibrating !== null}
                  className="mt-2 w-full py-2 px-3 text-xs font-semibold bg-neutral-900 border hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Calibrate User</span>
                </button>
              </div>
            </div>
          </section>

          {/* Destructive Clearance actions */}
          <section className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">System Safety</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Clear Storage Cache</h3>
                <p className="text-xs text-neutral-450 dark:text-neutral-500">Deletes current cached interactions and queued messages locally.</p>
              </div>
              <button 
                onClick={handleClearData}
                type="button"
                className="p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/45 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-800 my-4" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Sign Out</h3>
                <p className="text-xs text-neutral-450 dark:text-neutral-500">Terminate the current active admin session on this client.</p>
              </div>
              <button 
                onClick={handleLogout}
                type="button"
                className="p-2.5 text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
