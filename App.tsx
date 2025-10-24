import React, { useState, useEffect, useCallback } from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import type { Memory, AppState, AspectRatio } from './types';
import { generateVideoFromImage } from './services/geminiService';
import { generateAndSaveVideo } from './services/videoApiService';
import { generatePrompt } from './utils/promptGenerator';
import CreateMemoryForm from './components/CreateMemoryForm';
import GeneratingScreen from './components/GeneratingScreen';
import VideoPlayer from './components/VideoPlayer';
import VideoGallery from './components/VideoGallery';
import ApiKeySelector from './components/ApiKeySelector';

// Check if we're running in production/Vercel environment
const USE_API_BACKEND = import.meta.env.PROD || import.meta.env.VITE_USE_API_BACKEND === 'true';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('VITE_CLERK_PUBLISHABLE_KEY is not set. Authentication will not work.');
}

const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('API_KEY_CHECK');
  const [memory, setMemory] = useState<Memory | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  const checkApiKey = useCallback(async () => {
    // In production (Vercel), use API backend, skip API key selection
    if (USE_API_BACKEND) {
      setAppState('FORM');
      return;
    }

    // In AI Studio environment, check for selected API key
    if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
      setAppState('FORM');
    } else {
      setAppState('API_KEY_SELECTION');
    }
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      checkApiKey();
    }
  }, [checkApiKey, isLoaded, user]);

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
      let generatedVideoUrl: string;

      if (USE_API_BACKEND && user) {
        // Use API backend (saves to Blob and Postgres)
        generatedVideoUrl = await generateAndSaveVideo(
          user.id,
          title,
          year,
          motionStyle,
          imageFile,
          aspectRatio,
          prompt
        );
      } else {
        // Use client-side generation (AI Studio environment)
        generatedVideoUrl = await generateVideoFromImage(imageFile, prompt, aspectRatio);
      }

      setVideoUrl(generatedVideoUrl);
      setAppState('RESULT');
    } catch (e: any) {
      console.error(e);
      let errorMessage = 'ビデオ生成中に予期せぬエラーが発生しました。';
      if (typeof e.message === 'string') {
        if (e.message.includes('Requested entity was not found')) {
            errorMessage = "APIキーのエラーです。お手数ですが、もう一度APIキーを選択してください。";
            setAppState('API_KEY_SELECTION');
            return;
        }
        errorMessage = `エラー: ${e.message}`;
      }
      setError(errorMessage);
      setAppState('FORM');
    }
  };

  const handleCreateAnother = () => {
    setMemory(null);
    setVideoUrl(null);
    setError(null);
    setAppState('FORM');
  };

  const handleViewGallery = () => {
    setAppState('GALLERY');
  };

  const handleBackFromGallery = () => {
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
          return (
            <VideoPlayer
              videoUrl={videoUrl}
              memory={memory}
              onCreateAnother={handleCreateAnother}
              onViewGallery={handleViewGallery}
            />
          );
        }
        handleCreateAnother();
        return null;
      case 'GALLERY':
        if (user) {
          return <VideoGallery userId={user.id} onBack={handleBackFromGallery} />;
        }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
              TimeFlow AI
            </h1>
            <p className="text-center text-gray-400 mt-1 text-sm md:text-base">AIで写真が、動き出す</p>
          </div>
          <div className="flex items-center gap-4">
            {appState !== 'GALLERY' && appState !== 'API_KEY_CHECK' && appState !== 'API_KEY_SELECTION' && (
              <button
                onClick={handleViewGallery}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm md:text-base"
              >
                ギャラリー
              </button>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <main className="p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

const LoginScreen: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
          TimeFlow AI
        </h1>
        <p className="text-gray-400 mb-8 text-lg">AIで写真が、動き出す</p>
        <SignInButton mode="modal">
          <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
            ログイン / サインアップ
          </button>
        </SignInButton>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">設定エラー</h1>
          <p>VITE_CLERK_PUBLISHABLE_KEY が設定されていません。</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <SignedOut>
        <LoginScreen />
      </SignedOut>
      <SignedIn>
        <AppContent />
      </SignedIn>
    </ClerkProvider>
  );
};

export default App;
