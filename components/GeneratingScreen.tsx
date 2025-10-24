import React, { useState, useEffect } from 'react';

const messages = [
  "AIアーティストが準備運動中です...",
  "懐かしい雰囲気のフィルターを探しています...",
  "ピクセルにダンスを教えています...",
  "想い出のための音楽を作曲中です...",
  "魔法のスパイスを少し加えています...",
  "感動的な傑作を仕上げています...",
];

const GeneratingScreen: React.FC = () => {
    const [message, setMessage] = useState(messages[0]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                return messages[(currentIndex + 1) % messages.length];
            });
        }, 4000);

        // Simulate a slow, non-linear progress bar
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) {
                    clearInterval(progressInterval);
                    return 95;
                }
                const increment = Math.random() * 5;
                return Math.min(prev + increment, 95);
            });
        }, 1500);

        return () => {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh]">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-gray-600 animate-spin"></div>
                <div className="absolute inset-2 rounded-full bg-gray-800 flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
            </div>
            
            <h2 className="text-2xl font-bold mt-8 text-white">想い出に命を吹き込んでいます...</h2>
            <p className="mt-2 text-gray-400">{message}</p>
            <div className="w-full max-w-md bg-gray-700 rounded-full h-2.5 mt-8">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 1.5s ease-in-out' }}></div>
            </div>
            <p className="mt-4 text-sm text-gray-500">1〜2分ほどかかります。このページを閉じないでください。</p>
        </div>
    );
};

export default GeneratingScreen;