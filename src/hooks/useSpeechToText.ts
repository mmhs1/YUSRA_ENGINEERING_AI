/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { calculatePitch, recognizeVoiceTone, playWakeUpChime, playDeactivateChime } from '../utils/voiceEngine';

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Wake word activation and voice-tone state
  const [wakeWordEnabled, setWakeWordEnabled] = useState(() => {
    return localStorage.getItem('yusra_wake_word_enabled') !== 'false';
  });
  const [isWokenUp, setIsWokenUp] = useState(false);
  const [detectedPitch, setDetectedPitch] = useState<number>(-1);
  const [identifiedSpeaker, setIdentifiedSpeaker] = useState<'creator' | 'user' | 'unknown'>('unknown');
  
  // Audio Context & Analyser refs for real-time Pitch analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pitchSamplesRef = useRef<number[]>([]);
  const hasTerminalErrorRef = useRef(false);

  // Calibration states
  const [isCalibrating, setIsCalibrating] = useState<'creator' | 'user' | null>(null);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = localStorage.getItem('yusra_voice_lang') || 'en-US';

        rec.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }

          // Search for Wake Word keywords "Hey Yusra", "Yusra", "হেই যুসরা", "যুসরা"
          const lowerText = currentTranscript.toLowerCase();
          const hasWakeWord = 
            lowerText.includes('hey yusra') || 
            lowerText.includes('yusra') || 
            lowerText.includes('হেই যুসরা') || 
            lowerText.includes('যুসরা') ||
            lowerText.includes('hey usra') ||
            lowerText.includes('usra') ||
            lowerText.includes('hey joshua') || 
            lowerText.includes('joshua') ||
            lowerText.includes('isra') ||
            lowerText.includes('hey isra');

          if (hasWakeWord && !isWokenUp) {
            triggerWakeEvent(lowerText);
          }

          setTranscript(currentTranscript);
        };

        rec.onerror = (event: any) => {
          console.log('Speech recognition error event:', event.error);
          if (event.error === 'not-allowed') {
            console.error('Speech recognition permission denied:', event.error);
            hasTerminalErrorRef.current = true;
            setError('microphone-permission-denied');
            setIsListening(false);
          } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.error('Speech recognition error', event.error);
            setError(event.error);
          }
        };

        rec.onend = () => {
          // If wake mode is enabled, restart recognition automatically to keep listener alert!
          if (wakeWordEnabled && !hasTerminalErrorRef.current) {
            try {
              rec.start();
            } catch (e) {
              // Ignore already started errors
            }
          } else {
            setIsListening(false);
          }
        };

        setRecognition(rec);
      } else {
        setError('Speech recognition not supported in this browser.');
      }
    }

    return () => {
      stopAudioAnalysis();
    };
  }, [wakeWordEnabled, isWokenUp]);

  // Keep Voice Recognition active in background if Wake Word is enabled
  useEffect(() => {
    if (recognition && wakeWordEnabled) {
      if (hasTerminalErrorRef.current) return;
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        // Safe check
      }
    }
  }, [recognition, wakeWordEnabled]);

  // Web Audio frequency-domain tracking for user calibration and recognition
  const startAudioAnalysis = useCallback(async () => {
    try {
      if (streamRef.current) return; // Already running

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);
      pitchSamplesRef.current = [];

      const analyze = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(dataArray);
        
        const pitch = calculatePitch(dataArray, audioCtx.sampleRate);
        if (pitch > 0) {
          setDetectedPitch(Math.round(pitch));
          pitchSamplesRef.current.push(pitch);

          // Real-time Speaker recognition
          const speaker = recognizeVoiceTone(pitch);
          setIdentifiedSpeaker(speaker.identity);
        }

        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (err) {
      console.warn('Could not launch mic analyzer for pitch:', err);
    }
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Set Wake Word activation
  const triggerWakeEvent = (currentText: string) => {
    setIsWokenUp(true);
    playWakeUpChime();
    
    // Play verbal response if set
    const savedLang = (localStorage.getItem('yusra_voice_lang') || 'en-US') as 'bn-BD' | 'en-US';
    
    // Wait for voice detection, calibrate or greet
    setTimeout(() => {
      // Clear transcript so the actual prompt begins freshly after keyword
      setTranscript('');
    }, 1200);
  };

  const toggleListening = useCallback(() => {
    hasTerminalErrorRef.current = false;
    if (isListening) {
      recognition?.stop();
      stopAudioAnalysis();
      setIsListening(false);
      setIsWokenUp(false);
    } else {
      setError(null);
      setTranscript('');
      recognition?.start();
      startAudioAnalysis();
      setIsListening(true);
    }
  }, [isListening, recognition, startAudioAnalysis, stopAudioAnalysis]);

  const toggleWakeWord = (enabled: boolean) => {
    setWakeWordEnabled(enabled);
    localStorage.setItem('yusra_wake_word_enabled', String(enabled));
    if (!enabled) {
      setIsWokenUp(false);
      stopAudioAnalysis();
      recognition?.stop();
    } else {
      hasTerminalErrorRef.current = false;
      try {
        recognition?.start();
        setIsListening(true);
      } catch (e) {}
    }
  };

  // Profile Calibration for voice tone detection
  const startVoiceCalibration = (target: 'creator' | 'user') => {
    setIsCalibrating(target);
    setCalibrationProgress(0);
    pitchSamplesRef.current = [];
    startAudioAnalysis();

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setCalibrationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Calculate average pitch
        const samples = pitchSamplesRef.current;
        if (samples.length > 0) {
          const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
          const finalPitch = Math.round(avg);
          
          if (target === 'creator') {
            localStorage.setItem('yusra_creator_pitch', String(finalPitch));
          } else {
            localStorage.setItem('yusra_user_pitch', String(finalPitch));
          }
        }
        
        setIsCalibrating(null);
        stopAudioAnalysis();
      }
    }, 300);
  };

  return {
    isListening,
    transcript,
    toggleListening,
    error,
    setTranscript,
    
    // Siri features
    wakeWordEnabled,
    toggleWakeWord,
    isWokenUp,
    setIsWokenUp,
    detectedPitch,
    identifiedSpeaker,
    
    // Calibration voice tones
    isCalibrating,
    calibrationProgress,
    startVoiceCalibration
  };
}
