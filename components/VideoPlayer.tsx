import React from 'react';
import type { Memory } from '../types';

interface VideoPlayerProps {
  videoUrl: string;
  memory: Memory;
  onCreateAnother: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, memory, onCreateAnother }) => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full bg-black rounded-lg shadow-2xl overflow-hidden">
        <video
          key={videoUrl}
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full h-auto"
          style={{aspectRatio: memory.aspectRatio.replace(':', '/')}}
        >
          お使いのブラウザはビデオ再生に対応していません。
        </video>
      </div>
      <div className="text-center mt-6 w-full">
        <h2 className="text-3xl font-bold text-white">{memory.title}</h2>
        {memory.year && (
          <p className="text-lg text-gray-400 mt-2">📅 {memory.year}年</p>
        )}
      </div>
      <button
        onClick={onCreateAnother}
        className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
      >
        別の想い出を作成する
      </button>
    </div>
  );
};

export default VideoPlayer;