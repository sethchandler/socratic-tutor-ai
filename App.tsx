
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { DEFAULT_CLASS_MATERIALS, DEFAULT_PERSONALITY_PROFILE, DEFAULT_STUDENT_PERSONALITY, GEMINI_PRICING_URL } from './constants';
import { useSocraticTutor } from './hooks/useSocraticTutor';
import FileUpload from './components/FileUpload';
import { TranscriptItem, PrebuiltVoice, PREBUILT_VOICES } from './types';
import { MicIcon, StopCircleIcon, UserIcon, BotIcon, SaveIcon, PauseIcon, PlayIcon, ChevronDownIcon, KeyIcon, ExpandIcon, CloseIcon } from './components/Icons';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [mode, setMode] = useState<'student' | 'professor'>('student');
  const [classMaterials, setClassMaterials] = useState<string>(DEFAULT_CLASS_MATERIALS);
  const [personalityProfile, setPersonalityProfile] = useState<string>(DEFAULT_PERSONALITY_PROFILE);
  const [studentPersonality, setStudentPersonality] = useState<string>(DEFAULT_STUDENT_PERSONALITY);
  const [studentName, setStudentName] = useState<string>('Mr. Hart');
  const [professorName, setProfessorName] = useState<string>('Professor Kingsfield');
  const [voice, setVoice] = useState<PrebuiltVoice>('Zephyr');
  const [allowWebSearch, setAllowWebSearch] = useState<boolean>(false);
  const [isSaveDropdownOpen, setIsSaveDropdownOpen] = useState(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);
  const [isMaterialsVisible, setIsMaterialsVisible] = useState<boolean>(false);
  const [isPersonalityVisible, setIsPersonalityVisible] = useState<boolean>(false);
  const [isStudentPersonalityVisible, setIsStudentPersonalityVisible] = useState<boolean>(false);
  const [expandedEditor, setExpandedEditor] = useState<'materials' | 'professor' | 'student' | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

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
    if (mode === 'student') {
      return `
        You are an AI simulating a professor engaging a student in a Socratic dialogue.
        You are ${professorName}, and the student you are addressing is named ${studentName}. You must address them by this name.
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
    } else {
      // Professor mode - AI plays the student
      return `
        You are an AI simulating a student in a Socratic dialogue with a professor.
        You are ${studentName}, and the professor addressing you is named ${professorName}.
        Your personality and learning style should be exactly as described in the profile below.
        --- STUDENT PERSONALITY ---
        ${studentPersonality}
        ---
        You are being quizzed on the following class materials. Listen to the professor's questions and respond thoughtfully, demonstrating your understanding while occasionally showing confusion or needing clarification.
        You may occasionally ask questions of ${professorName} for clarification when genuinely confused.
        --- CLASS MATERIALS ---
        ${classMaterials}
        ---
        Keep your responses concise and spoken. Respond naturally as a student would in conversation.
        Wait for the professor to ask you the first question. Do not speak first.
      `;
    }
  }, [mode, classMaterials, personalityProfile, studentPersonality, studentName, professorName, allowWebSearch]);

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
  } = useSocraticTutor(systemInstruction, voice, apiKey, mode);

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

  // Auto-scroll transcript to bottom when new content arrives
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

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

    const speakerName = (speaker: 'user' | 'professor') => {
      if (mode === 'student') {
        return speaker === 'user' ? studentName : 'Professor';
      } else {
        return speaker === 'user' ? professorName : 'Student';
      }
    };

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
  const isStopDisabled = !isSessionActive;

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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('student')}
                    disabled={isSessionActive}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                      mode === 'student'
                        ? 'bg-accent text-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    AI Professor
                  </button>
                  <button
                    onClick={() => setMode('professor')}
                    disabled={isSessionActive}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                      mode === 'professor'
                        ? 'bg-accent text-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    AI Student
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {mode === 'student' ? 'You are the student, AI is the professor' : 'You are the professor, AI is the student'}
                </p>
              </div>
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
                  placeholder="e.g., Mr. Hart"
                />
              </div>
               <div className="mb-4">
                <label htmlFor="professor-name" className="block text-sm font-medium text-gray-300 mb-1">
                  Professor Name
                </label>
                <input
                  id="professor-name"
                  type="text"
                  value={professorName}
                  onChange={(e) => setProfessorName(e.target.value)}
                  disabled={isSessionActive}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-accent focus:border-accent disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="e.g., Professor Kingsfield"
                />
              </div>
               <div className="mb-4">
                <label htmlFor="voice-select" className="block text-sm font-medium text-gray-300 mb-1">
                  AI Voice
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
                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={() => setExpandedEditor('materials')}
                                    disabled={isSessionActive}
                                    className="text-gray-300 hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Expand editor"
                                >
                                    <ExpandIcon />
                                </button>
                                <button
                                    onClick={() => setIsMaterialsVisible(false)}
                                    disabled={isSessionActive}
                                    className="text-sm text-accent hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                    Hide
                                </button>
                            </div>
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
              {mode === 'student' && (
                <div className="mb-4">
                  {!isPersonalityVisible ? (
                      <button
                          onClick={() => setIsPersonalityVisible(true)}
                          disabled={isSessionActive}
                          className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <h3 className="font-semibold text-white">Reveal or Edit Professor Personality</h3>
                          <p className="text-sm text-gray-400 mt-1">Click to view and modify the AI professor's profile.</p>
                      </button>
                  ) : (
                      <>
                          <div className="flex justify-between items-center mb-1">
                              <label htmlFor="personality-profile" className="block text-sm font-medium text-gray-300">
                                  Professor Personality
                              </label>
                              <div className="flex gap-2 items-center">
                                  <button
                                      onClick={() => setExpandedEditor('professor')}
                                      disabled={isSessionActive}
                                      className="text-gray-300 hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Expand editor"
                                  >
                                      <ExpandIcon />
                                  </button>
                                  <button
                                      onClick={() => setIsPersonalityVisible(false)}
                                      disabled={isSessionActive}
                                      className="text-sm text-accent hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                                  >
                                      Hide
                                  </button>
                              </div>
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
              )}
              {mode === 'professor' && (
                <div className="mb-4">
                  {!isStudentPersonalityVisible ? (
                      <button
                          onClick={() => setIsStudentPersonalityVisible(true)}
                          disabled={isSessionActive}
                          className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <h3 className="font-semibold text-white">Reveal or Edit Student Personality</h3>
                          <p className="text-sm text-gray-400 mt-1">Click to view and modify the AI student's profile.</p>
                      </button>
                  ) : (
                      <>
                          <div className="flex justify-between items-center mb-1">
                              <label htmlFor="student-personality" className="block text-sm font-medium text-gray-300">
                                  Student Personality
                              </label>
                              <div className="flex gap-2 items-center">
                                  <button
                                      onClick={() => setExpandedEditor('student')}
                                      disabled={isSessionActive}
                                      className="text-gray-300 hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Expand editor"
                                  >
                                      <ExpandIcon />
                                  </button>
                                  <button
                                      onClick={() => setIsStudentPersonalityVisible(false)}
                                      disabled={isSessionActive}
                                      className="text-sm text-accent hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                                  >
                                      Hide
                                  </button>
                              </div>
                          </div>
                          <textarea
                              id="student-personality"
                              rows={6}
                              value={studentPersonality}
                              onChange={(e) => setStudentPersonality(e.target.value)}
                              disabled={isSessionActive}
                              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-accent focus:border-accent disabled:bg-gray-800 disabled:cursor-not-allowed mb-2"
                              placeholder="Paste student personality here or upload a file..."
                          />
                          <FileUpload
                              id="student-personality-upload"
                              onFileContentSelect={handleFileContentSelect(setStudentPersonality)}
                              disabled={isSessionActive}
                          />
                      </>
                  )}
                </div>
              )}
            </div>
            <div className="bg-neutral p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-3 text-white">Session Control</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSession}
                  disabled={isSessionActive ? isStopDisabled : isStartDisabled}
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
                <TranscriptEntry key={index} item={item} mode={mode} studentName={studentName} professorName={professorName} />
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </main>
      </div>
      {expandedEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-600">
              <h3 className="text-xl font-semibold text-white">
                {expandedEditor === 'materials' && 'Edit Class Materials'}
                {expandedEditor === 'professor' && 'Edit Professor Personality'}
                {expandedEditor === 'student' && 'Edit Student Personality'}
              </h3>
              <button
                onClick={() => setExpandedEditor(null)}
                className="p-2 hover:bg-gray-700 rounded-md transition-colors"
                aria-label="Close editor"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <textarea
                value={
                  expandedEditor === 'materials' ? classMaterials :
                  expandedEditor === 'professor' ? personalityProfile :
                  studentPersonality
                }
                onChange={(e) => {
                  if (expandedEditor === 'materials') setClassMaterials(e.target.value);
                  else if (expandedEditor === 'professor') setPersonalityProfile(e.target.value);
                  else setStudentPersonality(e.target.value);
                }}
                disabled={isSessionActive}
                className="w-full h-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-3 focus:ring-accent focus:border-accent disabled:bg-gray-800 disabled:cursor-not-allowed resize-none font-mono text-sm"
                placeholder={
                  expandedEditor === 'materials' ? 'Enter class materials here...' :
                  expandedEditor === 'professor' ? 'Enter professor personality here...' :
                  'Enter student personality here...'
                }
              />
            </div>
            <div className="p-4 border-t border-gray-600 flex justify-end">
              <button
                onClick={() => setExpandedEditor(null)}
                className="px-6 py-2 bg-accent text-black rounded-md hover:bg-green-500 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TranscriptEntryProps {
    item: TranscriptItem;
    mode: 'student' | 'professor';
    studentName: string;
    professorName: string;
}

const TranscriptEntry: React.FC<TranscriptEntryProps> = ({ item, mode, studentName, professorName }) => {
    const isUser = item.speaker === 'user';
    const userName = mode === 'student' ? studentName : professorName;
    const aiName = mode === 'student' ? 'Professor' : 'Student';

    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center" title={aiName}>
                    <BotIcon />
                </div>
            )}
            <div className={`max-w-md p-3 rounded-lg shadow ${isUser ? 'bg-primary text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                <p className="font-bold text-sm mb-1">{isUser ? userName : aiName}</p>
                <p className="text-sm">{item.text}</p>
            </div>
             {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center" title={userName}>
                    <UserIcon />
                </div>
            )}
        </div>
    );
};


export default App;
