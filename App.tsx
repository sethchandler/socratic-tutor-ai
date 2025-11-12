
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { DEFAULT_CLASS_MATERIALS, DEFAULT_PERSONALITY_PROFILE, GEMINI_PRICING_URL } from './constants';
import { useSocraticTutor } from './hooks/useSocraticTutor';
import FileUpload from './components/FileUpload';
import { TranscriptItem, PrebuiltVoice, PREBUILT_VOICES } from './types';
import { MicIcon, StopCircleIcon, UserIcon, BotIcon, SaveIcon, PauseIcon, PlayIcon, ChevronDownIcon, KeyIcon } from './components/Icons';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [classMaterials, setClassMaterials] = useState<string>(DEFAULT_CLASS_MATERIALS);
  const [personalityProfile, setPersonalityProfile] = useState<string>(DEFAULT_PERSONALITY_PROFILE);
  const [studentName, setStudentName] = useState<string>('Mr. Hart');
  const [voice, setVoice] = useState<PrebuiltVoice>('Zephyr');
  const [allowWebSearch, setAllowWebSearch] = useState<boolean>(false);
  const [isSaveDropdownOpen, setIsSaveDropdownOpen] = useState(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);
  const [isMaterialsVisible, setIsMaterialsVisible] = useState<boolean>(false);
  const [isPersonalityVisible, setIsPersonalityVisible] = useState<boolean>(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('google-api-key');
    if (savedKey) {
      setApiKey(savedKey);
      setTempApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('google-api-key', tempApiKey);
    setApiKey(tempApiKey);
    alert('API Key saved successfully!');
  };

  const systemInstruction = useMemo(() => {
    return `
      You are an AI simulating a professor engaging a student in a Socratic dialogue. 
      The student you are addressing is named ${studentName}. You must address them by this name.
      Your personality and demeanor should be exactly as described in the profile below.
      --- PERSONALITY PROFILE ---
      ${personalityProfile}
      ---
      You are quizzing the student on the following class materials. Your questions should be probing, challenging, and force the student to think critically and defend their answers. Do not simply provide information.
      --- CLASS MATERIALS ---
      ${classMaterials}
      ---
      Keep your responses concise and spoken. Address the user directly as your student.
      Begin the dialogue immediately by addressing ${studentName} and asking your first challenging question based on the provided materials. Do not wait for them to speak first.
      ${allowWebSearch ? `
      --- WEB SEARCH RULES ---
      If a student asks a question where you are uncertain of the answer or it requires external knowledge, you are permitted to use the web to find the answer.
      When you do this, you MUST first say something like: "That is an intriguing point, ${studentName}. Allow me a moment to consider that." or "You have raised an interesting question. Let me do justice to it by thinking about it for a moment."
      After this verbal pause, you should then provide the answer based on the information you would have found.
      ---
      ` : ''}
    `;
  }, [classMaterials, personalityProfile, studentName, allowWebSearch]);

  const {
    isSessionActive,
    isPaused,
    status,
    transcript,
    error,
    estimatedCost,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
  } = useSocraticTutor(systemInstruction, voice, apiKey);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (saveDropdownRef.current && !saveDropdownRef.current.contains(event.target as Node)) {
        setIsSaveDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileContentSelect = (setter: React.Dispatch<React.SetStateAction<string>>) => (content: string) => {
    setter(content);
  };

  const handleToggleSession = useCallback(() => {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  }, [isSessionActive, startSession, stopSession]);
  
  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  }, [isPaused, pauseSession, resumeSession]);

  const handleSaveTranscript = (format: 'txt' | 'md' | 'json') => {
    if (transcript.length === 0) return;
    setIsSaveDropdownOpen(false);

    let content = '';
    let mimeType = 'text/plain;charset=utf-8';
    let extension = format;

    const speakerName = (speaker: 'user' | 'professor') => speaker === 'user' ? studentName : 'Professor';

    switch (format) {
        case 'json':
            const jsonTranscript = transcript.map(item => ({
                speaker: speakerName(item.speaker),
                content: item.text,
            }));
            content = JSON.stringify(jsonTranscript, null, 2);
            mimeType = 'application/json;charset=utf-8';
            break;
        case 'md':
            content = transcript.map(item => {
                return `**${speakerName(item.speaker)}:**\n\n> ${item.text.replace(/\n/g, '\n> ')}\n`;
            }).join('\n---\n\n');
            break;
        case 'txt':
        default:
            content = transcript.map(item => {
                return `${speakerName(item.speaker)}:\n${item.text}\n`;
            }).join('\n');
            break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `socratic-tutor-transcript-${timestamp}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const isStartDisabled = !apiKey || isSessionActive;

  return (
    <div className="min-h-screen bg-base-100 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">Socratic Tutor AI</h1>
          <p className="text-lg text-gray-400">Engage in a voice dialogue with your AI professor.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
             <div className="bg-neutral p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-3 text-white border-b border-gray-600 pb-2 flex items-center gap-2">
                    <KeyIcon /> API Key
                </h2>
                <p className="text-sm text-gray-400 mb-2">Your Google AI API key is required and stored only in your browser's local storage.</p>
                <div className="flex gap-2">
                    <input
                      id="api-key"
                      type="password"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      disabled={isSessionActive}
                      className="flex-grow bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-accent focus:border-accent disabled:bg-gray-800 disabled:cursor-not-allowed"
                      placeholder="Enter your Google AI API Key"
                    />
                    <button
                      onClick={handleSaveApiKey}
                      disabled={!tempApiKey || isSessionActive}
                      className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white font-bold rounded-md transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                </div>
            </div>
            <div className="bg-neutral p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-3 text-white border-b border-gray-600 pb-2">Configuration</h2>
               <div className="mb-4">
                <label htmlFor="student-name" className="block text-sm font-medium text-gray-300 mb-1">
                  Student Name
                </label>
                <input
                  id="student-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={isSessionActive}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-accent focus:border-accent disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="e.g., Ms. Davis"
                />
              </div>
               <div className="mb-4">
                <label htmlFor="voice-select" className="block text-sm font-medium text-gray-300 mb-1">
                  Professor's Voice
                </label>
                <select
                  id="voice-select"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as PrebuiltVoice)}
                  disabled={isSessionActive}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-accent focus:border-accent disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                  {PREBUILT_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="allow-web-search" className="text-sm font-medium text-gray-300">
                        Allow Web Search
                    </label>
                    <label htmlFor="allow-web-search" className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="allow-web-search"
                            className="sr-only peer"
                            checked={allowWebSearch}
                            onChange={(e) => setAllowWebSearch(e.target.checked)}
                            disabled={isSessionActive}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                </div>
              </div>
              <div className="mb-4">
                {!isMaterialsVisible ? (
                    <button
                        onClick={() => setIsMaterialsVisible(true)}
                        disabled={isSessionActive}
                        className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <h3 className="font-semibold text-white">Reveal or Edit Class Materials</h3>
                        <p className="text-sm text-gray-400 mt-1">Click to view and modify the course content.</p>
                    </button>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="class-materials" className="block text-sm font-medium text-gray-300">
                                Class Materials
                            </label>
                            <button 
                                onClick={() => setIsMaterialsVisible(false)}
                                disabled={isSessionActive}
                                className="text-sm text-accent hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                Hide
                            </button>
                        </div>
                        <textarea
                            id="class-materials"
                            rows={6}
                            value={classMaterials}
                            onChange={(e) => setClassMaterials(e.target.value)}
                            disabled={isSessionActive}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-accent focus:border-accent disabled:bg-gray-800 disabled:cursor-not-allowed mb-2"
                            placeholder="Paste class materials here or upload a file..."
                        />
                        <FileUpload
                            id="materials-upload"
                            onFileContentSelect={handleFileContentSelect(setClassMaterials)}
                            disabled={isSessionActive}
                        />
                    </>
                )}
              </div>
              <div className="mb-4">
                {!isPersonalityVisible ? (
                    <button
                        onClick={() => setIsPersonalityVisible(true)}
                        disabled={isSessionActive}
                        className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <h3 className="font-semibold text-white">Reveal or Edit Professor Personality</h3>
                        <p className="text-sm text-gray-400 mt-1">Click to view and modify the professor's profile.</p>
                    </button>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="personality-profile" className="block text-sm font-medium text-gray-300">
                                Professor Personality
                            </label>
                            <button 
                                onClick={() => setIsPersonalityVisible(false)}
                                disabled={isSessionActive}
                                className="text-sm text-accent hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                Hide
                            </button>
                        </div>
                        <textarea
                            id="personality-profile"
                            rows={6}
                            value={personalityProfile}
                            onChange={(e) => setPersonalityProfile(e.target.value)}
                            disabled={isSessionActive}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-accent focus:border-accent disabled:bg-gray-800 disabled:cursor-not-allowed mb-2"
                            placeholder="Paste professor personality here or upload a file..."
                        />
                        <FileUpload
                            id="personality-upload"
                            onFileContentSelect={handleFileContentSelect(setPersonalityProfile)}
                            disabled={isSessionActive}
                        />
                    </>
                )}
              </div>
            </div>
            <div className="bg-neutral p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-3 text-white">Session Control</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSession}
                  disabled={isStartDisabled}
                  className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-md font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                    isSessionActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-accent hover:bg-green-500 text-black'
                  } disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {isSessionActive ? <StopCircleIcon /> : <MicIcon />}
                  <span>{isSessionActive ? 'Stop' : 'Start'} Session</span>
                </button>
                <button
                  onClick={handlePauseResume}
                  disabled={!isSessionActive}
                  aria-label={isPaused ? 'Resume Session' : 'Pause Session'}
                  className="flex-shrink-0 p-3 rounded-md font-bold text-lg transition-colors duration-300 bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                </button>
              </div>
              <div className="text-center mt-3">
                <p className="text-gray-400 h-6">{status}</p>
                {error && <p className="text-error mt-2">{error}</p>}
              </div>
              <div className="mt-4 border-t border-gray-600 pt-3">
                <p className="text-sm text-center text-gray-400">
                  Session Cost: <span className="font-bold text-white">${estimatedCost.toFixed(4)}</span>
                </p>
                <p className="text-xs text-center text-gray-500 mt-1">
                  This is an estimate. See <a href={GEMINI_PRICING_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">official pricing</a>.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-neutral p-4 rounded-lg shadow-lg">
             <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-3">
                <h2 className="text-xl font-semibold text-white">Transcript</h2>
                <div className="relative" ref={saveDropdownRef}>
                    <button
                        id="save-options-button"
                        onClick={() => setIsSaveDropdownOpen(prev => !prev)}
                        disabled={transcript.length === 0}
                        className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Save Transcript Options"
                        aria-haspopup="true"
                        aria-expanded={isSaveDropdownOpen}
                    >
                        <SaveIcon />
                        <ChevronDownIcon />
                    </button>
                    {isSaveDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
                             <ul className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="save-options-button">
                                <li role="none">
                                    <button onClick={() => handleSaveTranscript('json')} className="text-left w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-600" role="menuitem">Save as JSON</button>
                                </li>
                                <li role="none">
                                    <button onClick={() => handleSaveTranscript('md')} className="text-left w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-600" role="menuitem">Save as Markdown</button>
                                </li>
                                <li role="none">
                                    <button onClick={() => handleSaveTranscript('txt')} className="text-left w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-600" role="menuitem">Save as Plain Text</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <div className="h-[32rem] overflow-y-auto pr-2 space-y-4">
              {transcript.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Conversation will appear here...</p>
                </div>
              )}
              {transcript.map((item, index) => (
                <TranscriptEntry key={index} item={item} studentName={studentName} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface TranscriptEntryProps {
    item: TranscriptItem;
    studentName: string;
}

const TranscriptEntry: React.FC<TranscriptEntryProps> = ({ item, studentName }) => {
    const isUser = item.speaker === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center" title="Professor">
                    <BotIcon />
                </div>
            )}
            <div className={`max-w-md p-3 rounded-lg shadow ${isUser ? 'bg-primary text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                <p className="font-bold text-sm mb-1">{isUser ? studentName : 'Professor'}</p>
                <p className="text-sm">{item.text}</p>
            </div>
             {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center" title={studentName}>
                    <UserIcon />
                </div>
            )}
        </div>
    );
};


export default App;
