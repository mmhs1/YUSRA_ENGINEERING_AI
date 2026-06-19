/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Voice engine for YUSRA AI Core
// Handles Text-to-Speech (Bangla & English female natural voices)
// Siri-style audio cues, and Web Audio API-based frequency analysis for voice-tone profile calibration.

export interface VocalsProfile {
  speakerName: string;
  averagePitch: number; // in Hz
  calibratedAt: number;
}

// Custom Siri-style Sound Effects using Web Audio API

export function playWakeUpChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Two-tone rising soft bell sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.18); // C6

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.04, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.55);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.error('Audio chime error:', e);
  }
}

export function playDeactivateChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Soft falling chime
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(783.99, now); // G5
    osc.frequency.exponentialRampToValueAtTime(392.00, now + 0.15); // G4

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.03, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.error('Audio chime error:', e);
  }
}

// Text-to-Speech Engine
export function speakText(text: string, lang: 'bn-BD' | 'en-US', onStart?: () => void, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Let's cancel any ongoing speech first
  window.speechSynthesis.cancel();

  // Strip Markdown markers so Yusra speaks clean, natural sentences
  const cleanedText = text
    .replace(/[\#\*\_`\[\]\-\(\)\{\}]/g, '')
    .replace(/```[\s\S]*?```/g, ' [code snippet omitted] ')
    .slice(0, 300); // Limit speech to 300 chars to avoid robotic exhaustion

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = lang;
  utterance.rate = lang === 'bn-BD' ? 1.05 : 1.0;
  utterance.pitch = 1.15; // Makes the female tone slightly sweet and friendly

  // Load voices and select preferred Bangla/English Female voice
  const voices = window.speechSynthesis.getVoices();
  let selectedVoice = null;

  if (lang === 'bn-BD') {
    // Look for Bangla Bangladesh female voices
    selectedVoice = voices.find(v => 
      (v.lang.toLowerCase() === 'bn-bd' || v.lang.toLowerCase().startsWith('bn')) &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('nora') || v.name.toLowerCase().includes('bangla'))
    ) || voices.find(v => v.lang.toLowerCase() === 'bn-bd' || v.lang.toLowerCase().startsWith('bn'));
  } else {
    // English Female voice
    selectedVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith('en') &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('google us') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('hazel'))
    ) || voices.find(v => v.lang.toLowerCase().startsWith('en'));
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Autocorrelation-based pitch analyzer for real-time Web Audio mic training
export function calculatePitch(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  // Apply a Hanning window or simple noise gate
  let activeSample = false;
  for (let i = 0; i < SIZE; i++) {
    if (Math.abs(buffer[i]) > 0.015) {
      activeSample = true;
      break;
    }
  }
  if (!activeSample) return -1; // Silent buffer

  // Simple Autocorrelation algorithm
  const r = new Float32Array(SIZE);
  for (let lag = 0; lag < SIZE; lag++) {
    let sum = 0;
    for (let i = 0; i < SIZE - lag; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    r[lag] = sum;
  }

  // Find the first zero-crossing or local dip
  let dipIndex = 0;
  for (let i = 0; i < SIZE - 1; i++) {
    if (r[i] < r[i + 1]) {
      dipIndex = i;
      break;
    }
  }
  if (dipIndex === 0) return -1;

  // Find peak after the dip
  let maxVal = -1;
  let maxIndex = -1;
  for (let i = dipIndex; i < SIZE / 2; i++) {
    if (r[i] > maxVal) {
      maxVal = r[i];
      maxIndex = i;
    }
  }

  if (maxIndex !== -1 && maxIndex > 0) {
    const freq = sampleRate / maxIndex;
    // Human vocal range: 70Hz - 500Hz
    if (freq >= 70 && freq <= 450) {
      return freq;
    }
  }
  return -1;
}

// Memorize & Recognize voice tone profile
export function recognizeVoiceTone(detectedPitch: number): { identity: 'creator' | 'user' | 'unknown'; name: string } {
  const creatorPitchStr = localStorage.getItem('yusra_creator_pitch');
  const userPitchStr = localStorage.getItem('yusra_user_pitch');

  const creatorPitch = creatorPitchStr ? parseFloat(creatorPitchStr) : 135; // Default male frequency in Hz
  const userPitch = userPitchStr ? parseFloat(userPitchStr) : 195; // Default female or generic user frequency in Hz

  // Absolute pitch differences
  const diffToCreator = Math.abs(detectedPitch - creatorPitch);
  const diffToUser = Math.abs(detectedPitch - userPitch);

  if (diffToCreator < 30 && diffToCreator <= diffToUser) {
    return { identity: 'creator', name: 'Mohammad Maynul Shaon' };
  } else if (diffToUser < 30) {
    return { identity: 'user', name: 'Calibrated User' };
  }

  // Fallback estimation
  if (detectedPitch <= 155) {
    return { identity: 'creator', name: 'Mohammad Maynul Shaon' };
  } else {
    return { identity: 'user', name: 'Calibrated User' };
  }
}
