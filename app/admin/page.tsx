'use client';

import { useState, useEffect, useCallback } from 'react';
import videosData from '@/data/videos.json';
import configData from '@/data/config.json';
import { GALLERY_CONFIG } from '@/lib/constants';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  addedDate: string;
  membersOnly: boolean;
}

export default function AdminPage() {
  const [videos, setVideos] = useState<Video[]>(videosData.videos);
  const [config, setConfig] = useState(configData);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    thumbnail: '',
    membersOnly: false,
  });
  const [jsonOutput, setJsonOutput] = useState('');
  const [configJsonOutput, setConfigJsonOutput] = useState('');

  const updateConfigJsonOutput = useCallback((configData: typeof config) => {
    setConfigJsonOutput(JSON.stringify(configData, null, 2));
  }, []);

  const updateJsonOutput = (videosList: Video[]) => {
    const jsonData = {
      videos: videosList,
    };
    setJsonOutput(JSON.stringify(jsonData, null, 2));
  };

  useEffect(() => {
    updateJsonOutput(videos);
    updateConfigJsonOutput(config);
  }, [videos, config, updateConfigJsonOutput]);

  const handleAdd = () => {
    if (!formData.title || !formData.url) {
      alert('Please fill in title and URL');
      return;
    }

    const newVideo: Video = {
      id: String(videos.length + 1),
      title: formData.title,
      url: formData.url,
      thumbnail: formData.thumbnail || `https://i.ytimg.com/vi/${extractVideoId(formData.url)}/hqdefault.jpg`,
      addedDate: new Date().toISOString().split('T')[0],
      membersOnly: formData.membersOnly,
    };

    const updatedVideos = [...videos, newVideo];
    setVideos(updatedVideos);
    setFormData({ title: '', url: '', thumbnail: '', membersOnly: false });
  };

  const handleDelete = (id: string) => {
    const updatedVideos = videos.filter((v) => v.id !== id);
    setVideos(updatedVideos);
  };

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonOutput);
    alert('JSON copied to clipboard! You can now paste it into data/videos.json');
  };

  const handleConfigCopy = () => {
    navigator.clipboard.writeText(configJsonOutput);
    alert('Config JSON copied to clipboard! You can now paste it into data/config.json');
  };

  const updateMinimumBalance = (newBalance: number) => {
    const updatedConfig = { ...config, minimumTokenBalance: newBalance };
    setConfig(updatedConfig);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gallery Management</h1>

        {/* Config Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Gallery Configuration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Token Balance (eDMT)
              </label>
              <input
                type="number"
                value={config.minimumTokenBalance}
                onChange={(e) =>
                  updateMinimumBalance(parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-2 border rounded-lg"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current value: {config.minimumTokenBalance.toLocaleString()} eDMT tokens required for gallery access
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Config JSON</h3>
              <textarea
                value={configJsonOutput}
                readOnly
                className="w-full h-32 px-4 py-2 border rounded-lg font-mono text-xs"
              />
              <button
                onClick={handleConfigCopy}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Copy Config JSON
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Replace contents of <code className="bg-gray-100 px-1 rounded">data/config.json</code>
              </p>
            </div>
          </div>
        </div>

        {/* Video Management */}
        <h2 className="text-2xl font-semibold mb-4">Video Gallery Management</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Add New Video</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Video title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Thumbnail URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="membersOnly"
                  checked={formData.membersOnly}
                  onChange={(e) =>
                    setFormData({ ...formData, membersOnly: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="membersOnly" className="text-sm font-medium">
                  Members Only
                </label>
              </div>
              <button
                onClick={handleAdd}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg transition-colors"
              >
                Add Video
              </button>
            </div>

            {/* Video List */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">
                Current Videos ({videos.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{video.title}</p>
                      {video.membersOnly && (
                        <span className="text-xs text-purple-600">
                          Members Only
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* JSON Output */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">JSON Output</h2>
            <p className="text-sm text-gray-600 mb-4">
              Copy this JSON and replace the contents of{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">data/videos.json</code>
            </p>
            <textarea
              value={jsonOutput}
              readOnly
              className="w-full h-96 px-4 py-2 border rounded-lg font-mono text-xs"
            />
            <button
              onClick={handleCopy}
              className="mt-4 w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg transition-colors"
            >
              Copy JSON
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

