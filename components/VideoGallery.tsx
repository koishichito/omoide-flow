import React, { useState, useEffect } from 'react';
import type { SavedVideo } from '../types';

interface VideoGalleryProps {
  userId: string;
  onBack: () => void;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ userId, onBack }) => {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<SavedVideo | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, [userId]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/get-videos?userId=${encodeURIComponent(userId)}`);

      if (!response.ok) {
        throw new Error('動画の取得に失敗しました');
      }

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      setError(err.message || '動画の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('この動画を削除してもよろしいですか？')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch('/api/delete-video', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId, userId }),
      });

      if (!response.ok) {
        throw new Error('動画の削除に失敗しました');
      }

      // Remove from list and close modal
      setVideos(videos.filter(v => v.id !== videoId));
      setSelectedVideo(null);
    } catch (err: any) {
      console.error('Error deleting video:', err);
      alert(err.message || '動画の削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = (video: SavedVideo) => {
    const link = document.createElement('a');
    link.href = video.video_url;
    link.download = `${video.title}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          戻る
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">マイギャラリー</h2>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          戻る
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-xl mb-4">まだ動画がありません</p>
          <p>最初の想い出を作成してみましょう！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
              onClick={() => setSelectedVideo(video)}
            >
              <video
                src={video.video_url}
                className="w-full h-48 object-cover"
                style={{ aspectRatio: video.aspect_ratio.replace(':', '/') }}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white truncate">{video.title}</h3>
                {video.year && (
                  <p className="text-sm text-gray-400 mt-1">📅 {video.year}年</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(video.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedVideo.title}</h3>
                  {selectedVideo.year && (
                    <p className="text-gray-400 mt-1">📅 {selectedVideo.year}年</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                loop
                className="w-full rounded-lg mb-4"
                style={{ aspectRatio: selectedVideo.aspect_ratio.replace(':', '/') }}
              />

              <div className="flex gap-4">
                <button
                  onClick={() => handleDownload(selectedVideo)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  ダウンロード
                </button>
                <button
                  onClick={() => handleDelete(selectedVideo.id)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? '削除中...' : '削除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
