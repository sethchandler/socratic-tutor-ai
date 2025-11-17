
import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, LiveSession } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../services/audioUtils';
import { TranscriptItem, PrebuiltVoice } from '../types';
import { GEMINI_AUDIO_INPUT_PRICE_PER_SECOND, GEMINI_AUDIO_OUTPUT_PRICE_PER_SECOND } from '../constants';

export const useSocraticTutor = (systemInstruction: string, voiceName: PrebuiltVoice, apiKey: string, mode: 'student' | 'professor') => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState('Idle. Press start to begin.');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const inputAudioSecondsRef = useRef(0);
  const outputAudioSecondsRef = useRef(0);
  
  const stopSession = useCallback(async () => {
    setStatus('Stopping session...');
    setIsSessionActive(false);
    setIsPaused(false);

    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (e) {
            console.error('Error closing session:', e);
        }
        sessionPromiseRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }

    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      await inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
     
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      for (const source of audioSourcesRef.current.values()) {
          source.stop();
      }
      audioSourcesRef.current.clear();
      await outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    setStatus('Idle. Press start to begin.');
  }, []);

  const pauseSession = useCallback(() => {
    if (!isSessionActive || isPaused) return;
    scriptProcessorRef.current?.disconnect();
    setIsPaused(true);
    setStatus('Paused. Press resume to continue.');
  }, [isSessionActive, isPaused]);

  const resumeSession = useCallback(() => {
    if (!isSessionActive || !isPaused) return;
    if (mediaStreamSourceRef.current && scriptProcessorRef.current && inputAudioContextRef.current) {
        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
    }
    setIsPaused(false);
    setStatus('Listening...');
  }, [isSessionActive, isPaused]);

  const calculateCost = useCallback(() => {
    const inputCost = inputAudioSecondsRef.current * GEMINI_AUDIO_INPUT_PRICE_PER_SECOND;
    const outputCost = outputAudioSecondsRef.current * GEMINI_AUDIO_OUTPUT_PRICE_PER_SECOND;
    setEstimatedCost(inputCost + outputCost);
  }, []);


  const startSession = useCallback(async () => {
    if (!apiKey) {
      setError('API Key is missing. Please provide your API key in the configuration.');
      return;
    }

    setError(null);
    setStatus('Initializing...');
    setTranscript([]);
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';
    inputAudioSecondsRef.current = 0;
    outputAudioSecondsRef.current = 0;
    setEstimatedCost(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setIsSessionActive(true);
      setIsPaused(false);
      setStatus('Connecting to AI...');

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      const ai = new GoogleGenAI({ apiKey });
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          systemInstruction,
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName }}},
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            if (mode === 'student') {
              setStatus('Connection open. Professor is preparing...');

              if (sessionPromiseRef.current) {
                  sessionPromiseRef.current.then((session) => {
                      session.sendRealtimeInput({ text: 'I am ready, Professor.' });
                  }).catch(e => console.error("Error sending initial prompt", e));
              }
            } else {
              setStatus('Connection open. Student is ready...');
            }

            mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputBuffer = audioProcessingEvent.inputBuffer;
                const inputData = inputBuffer.getChannelData(0);
                inputAudioSecondsRef.current += inputBuffer.duration;
                calculateCost();
                
                const pcmBlob = createBlob(inputData);
                if (sessionPromiseRef.current) {
                    sessionPromiseRef.current.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    }).catch(e => console.error("Error sending audio data", e));
                }
            };
            
            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
                currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;

                // Update transcript in real-time for user speech
                setTranscript(prev => {
                    const updated = [...prev];
                    const lastEntry = updated[updated.length - 1];

                    if (lastEntry && lastEntry.speaker === 'user' && !lastEntry.final) {
                        // Update existing user entry
                        updated[updated.length - 1] = {
                            speaker: 'user',
                            text: currentInputTranscriptionRef.current.trim(),
                            final: false
                        };
                    } else if (currentInputTranscriptionRef.current.trim()) {
                        // Add new user entry
                        updated.push({
                            speaker: 'user',
                            text: currentInputTranscriptionRef.current.trim(),
                            final: false
                        });
                    }
                    return updated;
                });
            }
            if (message.serverContent?.outputTranscription) {
                currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;

                // Update transcript in real-time for professor speech
                setTranscript(prev => {
                    const updated = [...prev];
                    const lastEntry = updated[updated.length - 1];

                    if (lastEntry && lastEntry.speaker === 'professor' && !lastEntry.final) {
                        // Update existing professor entry
                        updated[updated.length - 1] = {
                            speaker: 'professor',
                            text: currentOutputTranscriptionRef.current.trim(),
                            final: false
                        };
                    } else if (currentOutputTranscriptionRef.current.trim()) {
                        // Add new professor entry
                        updated.push({
                            speaker: 'professor',
                            text: currentOutputTranscriptionRef.current.trim(),
                            final: false
                        });
                    }
                    return updated;
                });
            }

            if (message.serverContent?.turnComplete) {
                // Mark entries as final when turn is complete
                setTranscript(prev => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                        const lastEntry = updated[updated.length - 1];
                        if (!lastEntry.final) {
                            updated[updated.length - 1] = { ...lastEntry, final: true };
                        }
                        if (updated.length > 1) {
                            const secondLastEntry = updated[updated.length - 2];
                            if (!secondLastEntry.final) {
                                updated[updated.length - 2] = { ...secondLastEntry, final: true };
                            }
                        }
                    }
                    return updated;
                });

                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
            }

            const audioDataB64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioDataB64 && outputAudioContextRef.current) {
                setStatus('Professor is speaking...');
                const audioBytes = decode(audioDataB64);
                const audioBuffer = await decodeAudioData(audioBytes, outputAudioContextRef.current, 24000, 1);
                
                outputAudioSecondsRef.current += audioBuffer.duration;
                calculateCost();
                
                const now = outputAudioContextRef.current.currentTime;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);

                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current.destination);
                source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                    if (audioSourcesRef.current.size === 0 && !isPaused) {
                        setStatus('Listening...');
                    }
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
                for (const source of audioSourcesRef.current.values()) {
                    source.stop();
                }
                audioSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setStatus('Session closed.');
            stopSession();
          },
          onerror: (e) => {
            console.error('Session error:', e);
            setError('An API error occurred. Please check your key and try again.');
            setStatus('Error!');
            stopSession();
          },
        },
      });

    } catch (err) {
      console.error(err);
      setError('Failed to get microphone permissions. Please allow access and try again.');
      setStatus('Error!');
      setIsSessionActive(false);
    }
  }, [systemInstruction, stopSession, voiceName, isPaused, apiKey, calculateCost]);

  return { isSessionActive, isPaused, status, transcript, error, estimatedCost, startSession, stopSession, pauseSession, resumeSession };
};
