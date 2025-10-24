import React, { useState } from 'react';
import type { MotionStyle, AspectRatio, VideoModel } from '../types';

interface CreateMemoryFormProps {
  onSubmit: (
    title: string,
    year: number | undefined,
    motionStyle: MotionStyle,
    imageFile: File,
    aspectRatio: AspectRatio,
    videoModel: VideoModel
  ) => void;
  error: string | null;
}

const STYLES: { id: MotionStyle; label: string; icon: string }[] = [
  { id: 'zoom', label: '優しいズーム', icon: '🔍' },
  { id: 'pan', label: '横移動', icon: '↔️' },
  { id: 'depth', label: '立体感', icon: '🧊' },
  { id: 'ambient', label: '環境の動き', icon: '🍃' },
  { id: 'portrait', label: '人物フォーカス', icon: '👤' }
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; icon: React.ReactNode }[] = [
    {id: '16:9', label: '横長', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3C1.9 6 1 6.9 1 8v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"></path></svg> },
    {id: '9:16', label: '縦長', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg> }
];

const MODELS: { id: VideoModel; label: string; description: string }[] = [
  { id: 'veo-3.1-fast-generate-preview', label: 'Veo 3.1 Fast (Preview)', description: '最高速・高品質（推奨）' },
  { id: 'veo-3.0-fast-generate-preview', label: 'Veo 3.0 Fast (Preview)', description: '高速・Preview版' },
  { id: 'veo-3.0-generate-preview', label: 'Veo 3.0 (Preview)', description: 'バランス型・Preview版' },
  { id: 'veo-3.0-fast-generate', label: 'Veo 3.0 Fast', description: '高速・安定版' },
  { id: 'veo-3.0-generate', label: 'Veo 3.0', description: 'バランス型・安定版' },
  { id: 'veo-2.0-generate-001', label: 'Veo 2.0', description: '旧バージョン' }
];

const CreateMemoryForm: React.FC<CreateMemoryFormProps> = ({ onSubmit, error }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [motionStyle, setMotionStyle] = useState<MotionStyle>('zoom');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [videoModel, setVideoModel] = useState<VideoModel>('veo-3.1-fast-generate-preview');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !title) {
      alert('動画を作成するには、写真とタイトルが必要です。');
      return;
    }
    setIsLoading(true);
    const yearNum = year ? parseInt(year, 10) : undefined;
    onSubmit(title, yearNum, motionStyle, imageFile, aspectRatio, videoModel);
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-300 mb-2">1. 写真を選ぶ</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded-lg" />
              ) : (
                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <div className="flex text-sm text-gray-500 justify-center">
                <label htmlFor="photo-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500 px-3 py-1">
                  <span>ファイルをアップロード</span>
                  <input id="photo-upload" name="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF (最大10MB)</p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">2. タイトルを付ける</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：おばあちゃんの結婚式"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-300">3. 年代（任意）</label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="例：1955"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
            <h3 className="text-sm font-medium text-gray-300">4. 動画の向きを選ぶ</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
                {ASPECT_RATIOS.map((ratio) => (
                    <button type="button" key={ratio.id} onClick={() => setAspectRatio(ratio.id)} className={`flex items-center justify-center p-4 rounded-lg transition-all ${aspectRatio === ratio.id ? 'bg-blue-600 text-white ring-2 ring-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        {ratio.icon}
                        {ratio.label}
                    </button>
                ))}
            </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300">5. AIモデルを選ぶ</h3>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {MODELS.map((model) => (
              <button
                type="button"
                key={model.id}
                onClick={() => setVideoModel(model.id)}
                className={`text-left p-4 rounded-lg transition-all ${videoModel === model.id ? 'bg-blue-600 text-white ring-2 ring-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <div className="font-semibold">{model.label}</div>
                <div className="text-xs opacity-80 mt-1">{model.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300">6. 動きのスタイルを選ぶ</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-2">
            {STYLES.map((style) => (
              <button
                type="button"
                key={style.id}
                onClick={() => setMotionStyle(style.id)}
                className={`text-center p-3 rounded-lg transition-all ${motionStyle === style.id ? 'bg-blue-600 text-white ring-2 ring-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <div className="text-2xl">{style.icon}</div>
                <div className="text-xs font-semibold mt-1">{style.label}</div>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="p-3 bg-red-800 text-red-100 border border-red-700 rounded-md text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isLoading || !imageFile || !title}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '生成中...' : '✨ 動画を作成する'}
        </button>
      </form>
    </div>
  );
};

export default CreateMemoryForm;