import React, { useState, useEffect, useCallback } from 'react';
import type { Memory, AppState, AspectRatio } from './types';
import { generateVideoFromImage } from './services/geminiService';
import { generatePrompt } from './utils/promptGenerator';
import CreateMemoryForm from './components/CreateMemoryForm';
import GeneratingScreen from './components/GeneratingScreen';
import VideoPlayer from './components/VideoPlayer';
import ApiKeySelector from './components/ApiKeySelector';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('API_KEY_CHECK');
  const [memory, setMemory] = useState<Memory | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
      setAppState('FORM');
    } else {
      setAppState('API_KEY_SELECTION');
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleApiKeySelected = () => {
    setAppState('FORM');
  };

  const handleGenerationRequest = async (
    title: string,
    year: number | undefined,
    motionStyle: string,
    imageFile: File,
    aspectRatio: AspectRatio
  ) => {
    setAppState('GENERATING');
    setError(null);
    const newMemory: Memory = { title, year, motionStyle, originalPhoto: imageFile, aspectRatio };
    setMemory(newMemory);

    try {
      const prompt = generatePrompt(motionStyle, year);
      const generatedVideoUrl = await generateVideoFromImage(imageFile, prompt, aspectRatio);
      setVideoUrl(generatedVideoUrl);
      setAppState('RESULT');
    } catch (e: any) {
      console.error(e);
      let errorMessage = 'ビデオ生成中に予期せぬエラーが発生しました。';
      if (typeof e.message === 'string') {
        if (e.message.includes('Requested entity was not found')) {
            errorMessage = "APIキーのエラーです。お手数ですが、もう一度APIキーを選択してください。";
            // Reset to API key selection state
            setAppState('API_KEY_SELECTION');
            return; 
        }
        errorMessage = `エラー: ${e.message}`;
      }
      setError(errorMessage);
      setAppState('FORM'); // Go back to the form on error
    }
  };

  const handleCreateAnother = () => {
    setMemory(null);
    setVideoUrl(null);
    setError(null);
    setAppState('FORM');
  };

  const renderContent = () => {
    switch (appState) {
      case 'API_KEY_SELECTION':
        return <ApiKeySelector onApiKeySelected={handleApiKeySelected} />;
      case 'FORM':
        return <CreateMemoryForm onSubmit={handleGenerationRequest} error={error} />;
      case 'GENERATING':
        return <GeneratingScreen />;
      case 'RESULT':
        if (videoUrl && memory) {
          return <VideoPlayer videoUrl={videoUrl} memory={memory} onCreateAnother={handleCreateAnother} />;
        }
        // Fallback in case state is inconsistent
        handleCreateAnother(); 
        return null;
      case 'API_KEY_CHECK':
      default:
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 font-sans">
      <header className="py-4 px-6 md:px-8 border-b border-gray-700 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
          TimeFlow AI
        </h1>
        <p className="text-center text-gray-400 mt-1 text-sm md:text-base">AIで写真が、動き出す</p>
      </header>
      <main className="p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;