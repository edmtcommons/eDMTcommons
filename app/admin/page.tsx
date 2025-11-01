'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { AdminGate } from '@/components/AdminGate';

type VideoType = 'youtube' | 'uploaded';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  addedDate: string;
  membersOnly: boolean;
  type: VideoType;
}

export default function AdminPage() {
  const { address } = useAccount();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoType, setVideoType] = useState<VideoType>('youtube');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    thumbnail: '',
    membersOnly: false,
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);

  // Fetch videos on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('Admin: Fetching videos from /api/videos...');
        const response = await fetch('/api/videos', {
          cache: 'no-store', // Prevent browser caching
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
        const data = await response.json();
        
        console.log('Admin: Videos API response:', { ok: response.ok, hasVideos: !!data.videos, videoCount: data.videos?.length, error: data.error });
        
        if (response.ok && data.videos) {
          const mappedVideos = data.videos.map((v: any) => ({
            ...v,
            type: (v.type || 'youtube') as VideoType,
          }));
          setVideos(mappedVideos);
          console.log(`Admin: Loaded ${mappedVideos.length} videos`);
        } else {
          console.error('Admin: Failed to fetch videos:', data.error || 'Unknown error', data);
          // Fallback to empty array
          setVideos([]);
        }
      } catch (error) {
        console.error('Admin: Error fetching videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
    return '';
  };

  const fetchYouTubeTitle = async (url: string): Promise<string | null> => {
    try {
      // Use server-side API route to avoid CORS issues
      const response = await fetch(`/api/admin/youtube-title?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video information');
      }
      
      const data = await response.json();
      return data.title || null;
    } catch (error) {
      console.error('Error fetching YouTube title:', error);
      return null;
    }
  };

  const saveVideos = async (videosToSave: Video[]) => {
    if (!address) {
      alert('Wallet not connected');
      return false;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videos: videosToSave,
          walletAddress: address,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save videos');
      }

      return true;
    } catch (error) {
      console.error('Error saving videos:', error);
      alert(`Failed to save videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File, type: 'video' | 'thumbnail'): Promise<string | null> => {
    if (!address) {
      alert('Wallet not connected');
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('walletAddress', address);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const handleYouTubeUrlChange = async (url: string) => {
    // Update URL and thumbnail immediately
    setFormData({ ...formData, url, thumbnail: getYouTubeThumbnail(url), title: '' });
    
    // Fetch title if URL is valid
    const videoId = extractVideoId(url);
    if (videoId) {
      setFetchingTitle(true);
      try {
        const title = await fetchYouTubeTitle(url);
        if (title) {
          setFormData(prev => ({ ...prev, title }));
        } else {
          console.warn('Could not fetch YouTube title');
        }
      } catch (error) {
        console.error('Error fetching YouTube title:', error);
      } finally {
        setFetchingTitle(false);
      }
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, videoFile: e.target.files[0], url: '' });
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create a preview URL for the thumbnail
      const thumbnailUrl = URL.createObjectURL(file);
      setFormData({ ...formData, thumbnailFile: file, thumbnail: thumbnailUrl });
    }
  };

  const handleAdd = async () => {
    if (videoType === 'youtube') {
      if (!formData.url) {
        alert('Please provide a YouTube URL');
        return;
      }
      
      const videoId = extractVideoId(formData.url);
      if (!videoId) {
        alert('Invalid YouTube URL');
        return;
      }

      // If title is not set, fetch it now
      let title = formData.title;
      if (!title) {
        setFetchingTitle(true);
        try {
          const fetchedTitle = await fetchYouTubeTitle(formData.url);
          if (fetchedTitle) {
            title = fetchedTitle;
          } else {
            alert('Could not fetch video title. Please try again or enter a title manually.');
            setFetchingTitle(false);
            return;
          }
        } catch (error) {
          alert('Error fetching video title. Please try again or enter a title manually.');
          setFetchingTitle(false);
          return;
        } finally {
          setFetchingTitle(false);
        }
      }

      const newVideo: Video = {
        id: String(Date.now()),
        title: title,
        url: formData.url,
        thumbnail: formData.thumbnail || getYouTubeThumbnail(formData.url),
        addedDate: new Date().toISOString().split('T')[0],
        membersOnly: formData.membersOnly,
        type: 'youtube',
      };

      const updatedVideos = [...videos, newVideo];
      setVideos(updatedVideos);

      setFormData({ title: '', url: '', thumbnail: '', membersOnly: false, videoFile: null, thumbnailFile: null });
      
      // Reset file inputs
      if (videoFileRef.current) videoFileRef.current.value = '';
      if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';
    } else {
      // For uploaded videos, title is required
      if (!formData.title) {
        alert('Please fill in the video title');
        return;
      }

      if (!formData.videoFile) {
        alert('Please upload a video file');
        return;
      }

      if (!formData.thumbnailFile) {
        alert('Please upload a thumbnail image');
        return;
      }

      // Upload files first (but don't save videos to JSON yet)
      const videoUrl = await uploadFile(formData.videoFile, 'video');
      if (!videoUrl) return;

      const thumbnailUrl = await uploadFile(formData.thumbnailFile, 'thumbnail');
      if (!thumbnailUrl) return;

      const newVideo: Video = {
        id: String(Date.now()),
        title: formData.title,
        url: videoUrl,
        thumbnail: thumbnailUrl,
        addedDate: new Date().toISOString().split('T')[0],
        membersOnly: formData.membersOnly,
        type: 'uploaded',
      };

      const updatedVideos = [...videos, newVideo];
      setVideos(updatedVideos);

      setFormData({ title: '', url: '', thumbnail: '', membersOnly: false, videoFile: null, thumbnailFile: null });
      
      // Reset file inputs
      if (videoFileRef.current) videoFileRef.current.value = '';
      if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';
      
      // Revoke object URLs to free memory
      if (formData.thumbnail && formData.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(formData.thumbnail);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    const updatedVideos = videos.filter((v) => v.id !== id);
    setVideos(updatedVideos);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newVideos = [...videos];
    [newVideos[index - 1], newVideos[index]] = [newVideos[index], newVideos[index - 1]];
    setVideos(newVideos);
  };

  const handleMoveDown = (index: number) => {
    if (index === videos.length - 1) return;
    const newVideos = [...videos];
    [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
    setVideos(newVideos);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    if (draggedIndex !== index) {
      const newVideos = [...videos];
      const draggedVideo = newVideos[draggedIndex];
      newVideos.splice(draggedIndex, 1);
      newVideos.splice(index, 0, draggedVideo);
      setVideos(newVideos);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSaveAll = async () => {
    if (!address) {
      alert('Wallet not connected');
      return;
    }

    try {
      setSaving(true);
      
      // Save videos
      const videosSaved = await saveVideos(videos);
      if (!videosSaved) {
        setSaving(false);
        return;
      }

      // Wait a moment for blob to be fully committed, then refresh with force refresh
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Refresh videos from server after successful save with force refresh
      const response = await fetch('/api/videos?forceRefresh=true', {
        cache: 'no-store', // Prevent browser caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      const data = await response.json();
      if (response.ok && data.videos) {
        setVideos(data.videos.map((v: any) => ({
          ...v,
          type: (v.type || 'youtube') as VideoType,
        })));
      }

      alert('All changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGate>
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
            <div className="flex items-center gap-4">
              {saving && (
                <div className="flex items-center gap-2 text-blue-600">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
            </div>
          </div>

          {/* Video Management */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-gray-600 text-lg">Loading videos...</div>
            </div>
          ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add Video Form */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Add New Video</h2>
              
              {/* Video Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">Video Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoType('youtube');
                      setFormData({ title: '', url: '', thumbnail: '', membersOnly: false, videoFile: null, thumbnailFile: null });
                      setFetchingTitle(false);
                      if (videoFileRef.current) videoFileRef.current.value = '';
                      if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      videoType === 'youtube'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoType('uploaded');
                      setFormData({ title: '', url: '', thumbnail: '', membersOnly: false, videoFile: null, thumbnailFile: null });
                      setFetchingTitle(false);
                      if (videoFileRef.current) videoFileRef.current.value = '';
                      if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      videoType === 'uploaded'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Upload Video
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Title field - only show for uploaded videos */}
                {videoType === 'uploaded' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
                      placeholder="Video title"
                    />
                  </div>
                )}

                {/* Title field for YouTube videos - auto-fetched but editable */}
                {videoType === 'youtube' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Title {fetchingTitle ? '(fetching...)' : '(auto-fetched from YouTube)'}
                    </label>
                    {fetchingTitle ? (
                      <div className="w-full px-4 py-2 border rounded-lg bg-gray-50 flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-gray-600">Fetching title...</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
                        placeholder="Title will be fetched automatically from YouTube"
                        readOnly={false}
                      />
                    )}
                  </div>
                )}

                {videoType === 'youtube' ? (
                    <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        YouTube URL *
                      </label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    {formData.thumbnail && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Thumbnail Preview</label>
                        <img
                          src={formData.thumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Video File *
                      </label>
                      <input
                        ref={videoFileRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoFileChange}
                        className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
                      />
                      {formData.videoFile && (
                        <p className="text-xs text-gray-500 mt-1">
                          Selected: {formData.videoFile.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Thumbnail Image *
                      </label>
                      <input
                        ref={thumbnailFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
                      />
                      {formData.thumbnail && (
                        <div className="mt-2">
                          <img
                            src={formData.thumbnail}
                            alt="Thumbnail preview"
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

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
                  <label htmlFor="membersOnly" className="text-sm font-medium text-gray-700">
                    Members Only (requires minimum token balance)
                  </label>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={fetchingTitle}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {fetchingTitle ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Fetching title...</span>
                    </>
                  ) : (
                    'Add Video'
                  )}
                </button>
              </div>
            </div>

            {/* Video List with Reordering */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                Current Videos ({videos.length})
              </h2>
              
              {videos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No videos added yet. Add your first video using the form on the left.
                </p>
              ) : (
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <div
                      key={video.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-4 bg-gray-50 p-4 rounded-lg border-2 transition-colors ${
                        draggedIndex === index ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                      } cursor-move`}
                    >
                      {/* Drag Handle */}
                      <div className="flex flex-col gap-1 text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <circle cx="2" cy="2" r="1.5" />
                          <circle cx="6" cy="2" r="1.5" />
                          <circle cx="10" cy="2" r="1.5" />
                          <circle cx="2" cy="6" r="1.5" />
                          <circle cx="6" cy="6" r="1.5" />
                          <circle cx="10" cy="6" r="1.5" />
                          <circle cx="2" cy="10" r="1.5" />
                          <circle cx="6" cy="10" r="1.5" />
                          <circle cx="10" cy="10" r="1.5" />
                        </svg>
                      </div>

                      {/* Thumbnail */}
                      <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate text-gray-900">{video.title}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                            {video.type === 'youtube' ? 'YouTube' : 'Uploaded'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {video.membersOnly && (
                            <span className="text-xs text-purple-600 font-medium">
                              Members Only
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {video.addedDate}
                          </span>
                        </div>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                          title="Move up"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 4l-4 4h8L8 4z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === videos.length - 1}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                          title="Move down"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 12l4-4H4l4 4z" />
                          </svg>
                        </button>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                        title="Delete video"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6.5 2a.5.5 0 00-.5.5v1h8v-1a.5.5 0 00-.5-.5h-7zM4 4.5v12a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5v-12H4zm2 2v9a.5.5 0 001 0v-9a.5.5 0 00-1 0zm4 0v9a.5.5 0 001 0v-9a.5.5 0 00-1 0z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </main>
    </AdminGate>
  );
}
