import React from 'react';

interface ApiKeySelectorProps {
  onApiKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onApiKeySelected }) => {
  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume selection is successful and let the parent component handle the state change.
        onApiKeySelected();
      } catch (e) {
        console.error("Error opening API key selection dialog:", e);
      }
    } else {
        alert("AI Studioの環境が見つかりませんでした。");
    }
  };

  return (
    <div className="max-w-md mx-auto text-center p-8 bg-gray-800 rounded-lg shadow-2xl">
      <h2 className="text-2xl font-bold mb-4 text-white">APIキーが必要です</h2>
      <p className="mb-6 text-gray-300">
        動画を生成するには、課金が有効になっているプロジェクトのAPIキーを選択する必要があります。
      </p>
      <button
        onClick={handleSelectKey}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
      >
        APIキーを選択
      </button>
      <p className="mt-4 text-xs text-gray-400">
        APIキーを選択するためのダイアログが開きます。課金の詳細については、{' '}
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          ai.google.dev/gemini-api/docs/billing
        </a>
        をご覧ください。
      </p>
    </div>
  );
};

export default ApiKeySelector;