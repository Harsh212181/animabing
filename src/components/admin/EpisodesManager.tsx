  // src/components/admin/EpisodesManager.tsx - UPDATED FOR MULTIPLE DOWNLOAD LINKS

import React, { useState, useEffect } from 'react';
import type { Anime, Episode, Chapter } from '../../types';
import axios from 'axios';
import Spinner from '../Spinner';
import SearchableDropdown from './SearchableDropdown';

// ✅ Define DownloadLink interface locally
interface DownloadLink {
  name: string;
  url: string;
  quality?: string;
  type?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const token = localStorage.getItem('adminToken') || '';

const EpisodesManager: React.FC = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newItem, setNewItem] = useState({
    number: 1,
    title: '',
    session: 1,
    downloadLinks: [{ name: 'Download Link 1', url: '', quality: '', type: 'direct' }] as DownloadLink[]
  });
  const [loading, setLoading] = useState(true);
  const [animesLoading, setAnimesLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [selectedSession, setSelectedSession] = useState<number>(1);
  const [editingItem, setEditingItem] = useState<Episode | Chapter | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const isManga = selectedAnime?.contentType === 'Manga';

  // Get available sessions
  const getAvailableSessions = () => {
    const items = isManga ? chapters : episodes;
    const sessions = new Set<number>();
    items.forEach(item => sessions.add(item.session || 1));
    return Array.from(sessions).sort((a, b) => a - b);
  };

  // Filter items by session
  const filteredItems = (isManga ? chapters : episodes).filter(item => (item.session || 1) === selectedSession);

  useEffect(() => {
    fetchAnimes();
  }, []);

  // ✅ REFRESH FUNCTION
  const handleRefresh = async () => {
    setAnimesLoading(true);
    try {
      // 1. Refresh anime list
      const { data } = await axios.get(`${API_BASE}/admin/protected/anime-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedAnimes = data.map((a: any) => ({
        ...a,
        id: a._id || a.id
      }));
      
      setAnimes(updatedAnimes);
      
      // 2. If selected anime exists, refresh episodes/chapters
      if (selectedAnime) {
        const updatedSelectedAnime = updatedAnimes.find((a: Anime) => a.id === selectedAnime.id);
        
        if (updatedSelectedAnime) {
          setSelectedAnime(updatedSelectedAnime);
          await fetchContent(updatedSelectedAnime.id);
        } else {
          setSelectedAnime(null);
          setEpisodes([]);
          setChapters([]);
          alert('Previously selected content was removed from the list.');
        }
      }
      
      alert('Content refreshed successfully!');
    } catch (err: any) {
      console.error('❌ Refresh error:', err.response?.data || err.message);
      alert('Failed to refresh content');
    } finally {
      setAnimesLoading(false);
    }
  };

  const fetchAnimes = async () => {
    setAnimesLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/admin/protected/anime-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnimes(data.map((a: any) => ({
        ...a,
        id: a._id || a.id
      })));
    } catch (err: any) {
      console.error('❌ Animes load error:', err.response?.data || err.message);
      alert('Failed to load animes');
    } finally {
      setAnimesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAnime) {
      fetchContent(selectedAnime.id);
    } else {
      setEpisodes([]);
      setChapters([]);
    }
  }, [selectedAnime]);

  const fetchContent = async (contentId: string) => {
    setLoading(true);
    try {
      if (isManga) {
        const { data } = await axios.get(`${API_BASE}/chapters/${contentId}`);
        setChapters(data);
        const lastChapter = data.filter((ch: Chapter) => (ch.session || 1) === selectedSession);
        setNewItem(prev => ({
          ...prev,
          number: lastChapter.length > 0 ? Math.max(...lastChapter.map((ch: Chapter) => ch.chapterNumber)) + 1 : 1,
          session: selectedSession,
          downloadLinks: [{ name: 'Download Link 1', url: '', quality: '', type: 'direct' }]
        }));
      } else {
        const { data } = await axios.get(`${API_BASE}/episodes/${contentId}`);
        setEpisodes(data);
        const lastEpisode = data.filter((ep: Episode) => (ep.session || 1) === selectedSession);
        setNewItem(prev => ({
          ...prev,
          number: lastEpisode.length > 0 ? Math.max(...lastEpisode.map((ep: Episode) => ep.episodeNumber)) + 1 : 1,
          session: selectedSession,
          downloadLinks: [{ name: 'Download Link 1', url: '', quality: '', type: 'direct' }]
        }));
      }
    } catch (err: any) {
      console.error('❌ Content load error:', err.response?.data || err.message);
      alert('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Item
  const handleEditItem = (item: Episode | Chapter) => {
    setEditingItem(item);
    setIsEditing(true);
    
    // ✅ Get downloadLinks from item (cast to any to access downloadLinks)
    const itemData = item as any;
    const downloadLinks: DownloadLink[] = itemData.downloadLinks || [];
    
    // If no download links, add one default
    const linksToSet = downloadLinks.length > 0 
      ? downloadLinks 
      : [{ name: 'Download Link 1', url: '', quality: '', type: 'direct' }];
    
    setNewItem({
      number: isManga ? (item as Chapter).chapterNumber : (item as Episode).episodeNumber,
      title: item.title || '',
      session: item.session || 1,
      downloadLinks: linksToSet
    });
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItem(null);
    const nextNumber = getNextAvailableNumber();
    setNewItem({
      number: nextNumber,
      title: '',
      session: selectedSession,
      downloadLinks: [{ name: 'Download Link 1', url: '', quality: '', type: 'direct' }]
    });
  };

  // Get next available number
  const getNextAvailableNumber = () => {
    if (filteredItems.length === 0) return 1;
    const numbers = filteredItems.map(item => isManga ? (item as Chapter).chapterNumber : (item as Episode).episodeNumber);
    return Math.max(...numbers) + 1;
  };

  // ✅ Add a new download link
  const handleAddDownloadLink = () => {
    if (newItem.downloadLinks.length >= 5) {
      alert('Maximum 5 download links allowed');
      return;
    }
    
    setNewItem(prev => ({
      ...prev,
      downloadLinks: [
        ...prev.downloadLinks,
        { 
          name: `Download Link ${prev.downloadLinks.length + 1}`, 
          url: '', 
          quality: '', 
          type: 'direct' 
        }
      ]
    }));
  };

  // ✅ Remove a download link
  const handleRemoveDownloadLink = (index: number) => {
    if (newItem.downloadLinks.length <= 1) {
      alert('At least one download link is required');
      return;
    }
    
    setNewItem(prev => ({
      ...prev,
      downloadLinks: prev.downloadLinks.filter((_, i) => i !== index)
    }));
  };

  // ✅ Update download link
  const handleUpdateDownloadLink = (index: number, field: keyof DownloadLink, value: string) => {
    setNewItem(prev => ({
      ...prev,
      downloadLinks: prev.downloadLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  // ✅ Validate download links
  const validateDownloadLinks = (): boolean => {
    const links = newItem.downloadLinks;
    
    if (links.length === 0) {
      alert('At least one download link is required');
      return false;
    }
    
    if (links.length > 5) {
      alert('Maximum 5 download links allowed');
      return false;
    }
    
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (!link.name.trim()) {
        alert(`Download link ${i + 1} must have a name`);
        return false;
      }
      if (!link.url.trim()) {
        alert(`Download link ${i + 1} must have a URL`);
        return false;
      }
      if (!link.url.startsWith('http')) {
        alert(`Download link ${i + 1} must be a valid URL starting with http:// or https://`);
        return false;
      }
    }
    
    return true;
  };

  // Add/Edit Item Function
  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnime) {
      alert('Please select content first');
      return;
    }

    // ✅ Validate download links
    if (!validateDownloadLinks()) {
      return;
    }

    setAddingItem(true);
    try {
      if (isEditing && editingItem) {
        await handleUpdateItem();
      } else {
        await handleAddItem();
      }
    } catch (err: any) {
      console.error('❌ Operation error:', err.response?.data || err.message);
      alert(`Failed to ${isEditing ? 'update' : 'add'} ${isManga ? 'chapter' : 'episode'}`);
    } finally {
      setAddingItem(false);
    }
  };

  const handleAddItem = async () => {
    const endpoint = isManga ? '/chapters' : '/episodes';
    const requestBody = isManga
      ? {
          mangaId: selectedAnime.id,
          chapterNumber: newItem.number,
          title: newItem.title || `Chapter ${newItem.number}`,
          session: newItem.session,
          downloadLinks: newItem.downloadLinks // ✅ Send downloadLinks array
        }
      : {
          animeId: selectedAnime.id,
          episodeNumber: newItem.number,
          title: newItem.title || `Episode ${newItem.number}`,
          session: newItem.session,
          downloadLinks: newItem.downloadLinks // ✅ Send downloadLinks array
        };

    await axios.post(`${API_BASE}${endpoint}`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    alert(`${isManga ? 'Chapter' : 'Episode'} added successfully!`);
    resetForm();
    fetchContent(selectedAnime.id);
  };

  // Update Item Function
  const handleUpdateItem = async () => {
    if (!editingItem) return;

    const endpoint = isManga ? '/chapters' : '/episodes';
    const requestBody = isManga
      ? {
          mangaId: selectedAnime.id,
          chapterNumber: (editingItem as Chapter).chapterNumber,
          title: newItem.title || `Chapter ${newItem.number}`,
          session: newItem.session,
          downloadLinks: newItem.downloadLinks // ✅ Send downloadLinks array
        }
      : {
          animeId: selectedAnime.id,
          episodeNumber: (editingItem as Episode).episodeNumber,
          title: newItem.title || `Episode ${newItem.number}`,
          session: newItem.session,
          downloadLinks: newItem.downloadLinks // ✅ Send downloadLinks array
        };

    await axios.patch(`${API_BASE}${endpoint}`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    alert(`${isManga ? 'Chapter' : 'Episode'} updated successfully!`);
    resetForm();
    fetchContent(selectedAnime.id);
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditingItem(null);
    const nextNumber = getNextAvailableNumber();
    setNewItem({
      number: nextNumber,
      title: '',
      session: selectedSession,
      downloadLinks: [{ name: 'Download Link 1', url: '', quality: '', type: 'direct' }]
    });
  };

  const handleDeleteItem = async (itemId: string, itemNumber: number, session: number) => {
    if (!confirm(`Are you sure you want to delete ${isManga ? 'chapter' : 'episode'} ${itemNumber}?`)) return;

    try {
      const endpoint = isManga ? '/chapters' : '/episodes';
      await axios.delete(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          [isManga ? 'mangaId' : 'animeId']: selectedAnime?.id,
          [isManga ? 'chapterNumber' : 'episodeNumber']: itemNumber,
          session: session
        }
      });

      alert(`${isManga ? 'Chapter' : 'Episode'} deleted successfully!`);
      if (selectedAnime) {
        fetchContent(selectedAnime.id);
      }
    } catch (err: any) {
      console.error('❌ Delete error:', err.response?.data || err.message);
      alert(err.response?.data?.error || `Failed to delete ${isManga ? 'chapter' : 'episode'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage {isManga ? 'Chapters' : 'Episodes'}</h2>
        <button
          onClick={handleRefresh}
          disabled={animesLoading}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
        >
          {animesLoading ? (
            <>
              <Spinner size="sm" />
              Refreshing...
            </>
          ) : (
            '🔄 Refresh Content'
          )}
        </button>
      </div>

      {/* Content Selection */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Select {isManga ? 'Manga' : 'Anime/Movie'} *
        </label>
        <SearchableDropdown
          animes={animes}
          selectedAnime={selectedAnime}
          onAnimeSelect={setSelectedAnime}
          loading={animesLoading}
        />
      </div>

      {/* Selected Content Info */}
      {selectedAnime && (
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-2">
            Selected: {selectedAnime.title}
          </h3>
          <div className="flex gap-4 text-sm text-slate-300">
            <span>Type: {selectedAnime.contentType}</span>
            <span>Status: {selectedAnime.status}</span>
            <span>Total {isManga ? 'Chapters' : 'Episodes'}: {isManga ? chapters.length : episodes.length}</span>
          </div>
        </div>
      )}

      {/* Session Selector */}
      {selectedAnime && getAvailableSessions().length > 0 && (
        <div className="bg-slate-700/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Session
          </label>
          <div className="flex flex-wrap gap-2">
            {getAvailableSessions().map(session => (
              <button
                key={session}
                onClick={() => {
                  setSelectedSession(session);
                  setNewItem(prev => ({ ...prev, session }));
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedSession === session
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
              >
                Session {session}
              </button>
            ))}
            <button
              onClick={() => {
                const newSession = Math.max(...getAvailableSessions(), 0) + 1;
                setSelectedSession(newSession);
                setNewItem(prev => ({ ...prev, session: newSession, number: 1 }));
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
            >
              + New Session
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {selectedAnime && (
        <form onSubmit={handleSubmitItem} className="bg-slate-700/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit' : 'Add New'} {isManga ? 'Chapter' : 'Episode'} {getAvailableSessions().length > 1 && `(Session ${selectedSession})`}
            {isEditing && <span className="text-yellow-400 ml-2">- Editing #{editingItem ? (isManga ? (editingItem as Chapter).chapterNumber : (editingItem as Episode).episodeNumber) : ''}</span>}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {isManga ? 'Chapter' : 'Episode'} Number *
              </label>
              <input
                type="number"
                value={newItem.number}
                onChange={(e) => setNewItem({
                  ...newItem,
                  number: Math.max(1, parseInt(e.target.value) || 1)
                })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                min="1"
                required
                disabled={isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Session *
              </label>
              <input
                type="number"
                value={newItem.session}
                onChange={(e) => setNewItem({
                  ...newItem,
                  session: Math.max(1, parseInt(e.target.value) || 1)
                })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                min="1"
                required
              />
            </div>
          </div>

          {/* ✅ DOWNLOAD LINKS SECTION - UPDATED FOR MULTIPLE LINKS */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Download Links (Required) *
              </label>
              <button
                type="button"
                onClick={handleAddDownloadLink}
                disabled={newItem.downloadLinks.length >= 5}
                className="text-xs bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-2 py-1 rounded"
              >
                + Add Link (Max 5)
              </button>
            </div>
            
            <div className="space-y-3">
              {newItem.downloadLinks.map((link, index) => (
                <div key={index} className="bg-slate-800/70 p-3 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300 font-medium">Download Link {index + 1}</span>
                    {newItem.downloadLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDownloadLink(index)}
                        className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Link Name *</label>
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => handleUpdateDownloadLink(index, 'name', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                        placeholder="e.g., Download Link 1, Server 1, etc."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Quality (Optional)</label>
                      <input
                        type="text"
                        value={link.quality || ''}
                        onChange={(e) => handleUpdateDownloadLink(index, 'quality', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                        placeholder="e.g., 720p, HD, 1080p"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-xs text-slate-400 mb-1">Download URL *</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleUpdateDownloadLink(index, 'url', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                      placeholder="https://example.com/download/video.mp4"
                      required
                    />
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-xs text-slate-400 mb-1">Type (Optional)</label>
                    <select
                      value={link.type || 'direct'}
                      onChange={(e) => handleUpdateDownloadLink(index, 'type', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="direct">Direct Download</option>
                      <option value="server">Server Download</option>
                      <option value="google_drive">Google Drive</option>
                      <option value="mega">Mega.nz</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-slate-400 text-xs mt-2">
              💡 You can add up to 5 download links. At least one link with name and URL is required.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {isManga ? 'Chapter' : 'Episode'} Title
            </label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder={`Optional - defaults to '${isManga ? 'Chapter' : 'Episode'} X'`}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={addingItem || !selectedAnime}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {addingItem ? (
                <>
                  <Spinner size="sm" />
                  {isEditing ? 'Updating' : 'Adding'} {isManga ? 'Chapter' : 'Episode'}...
                </>
              ) : (
                `${isEditing ? 'Update' : 'Add'} ${isManga ? 'Chapter' : 'Episode'}`
              )}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Download Links Tips */}
          <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
            <h4 className="text-blue-400 font-semibold mb-2">🔗 Multiple Download Links:</h4>
            <div className="text-blue-300 text-sm space-y-1">
              <p>• <strong>Minimum 1, Maximum 5</strong> download links per episode/chapter</p>
              <p>• Each link must have a <strong>name</strong> and <strong>URL</strong></p>
              <p>• Use <strong>quality</strong> field to indicate video quality (HD, 720p, 1080p)</p>
              <p>• <strong>Type</strong> helps categorize the download source</p>
              <p>• Users will see all links and can choose which one to download</p>
            </div>
          </div>
        </form>
      )}

      {/* Items List */}
      {selectedAnime && (
        <div className="bg-slate-800/50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {isManga ? 'Chapters' : 'Episodes'} List {getAvailableSessions().length > 1 && `(Session ${selectedSession})`}
              ({filteredItems.length})
            </h3>
            {loading && <Spinner size="sm" />}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" text={`Loading ${isManga ? 'chapters' : 'episodes'}...`} />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No {isManga ? 'chapters' : 'episodes'} added yet for Session {selectedSession}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-slate-700/30 rounded-lg overflow-hidden">
                <thead className="bg-slate-600/50">
                  <tr>
                    <th className="p-3 text-left text-slate-300 font-medium">#</th>
                    <th className="p-3 text-left text-slate-300 font-medium">Session</th>
                    <th className="p-3 text-left text-slate-300 font-medium">Title</th>
                    <th className="p-3 text-left text-slate-300 font-medium">Download Links</th>
                    <th className="p-3 text-left text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredItems.map((item: any) => {
                    const downloadLinks: DownloadLink[] = item.downloadLinks || [];
                    return (
                      <tr key={item._id} className="hover:bg-slate-600/30 transition-colors">
                        <td className="p-3 font-mono text-slate-300">
                          {isManga ? item.chapterNumber : item.episodeNumber}
                        </td>
                        <td className="p-3">
                          <span className="text-blue-400 bg-blue-600/20 px-2 py-1 rounded text-xs">
                            S{item.session || 1}
                          </span>
                        </td>
                        <td className="p-3 text-white">{item.title}</td>
                        <td className="p-3">
                          {downloadLinks.length > 0 ? (
                            <div className="space-y-1">
                              {downloadLinks.slice(0, 2).map((link, idx) => (
                                <div key={idx} className="text-xs">
                                  <span className="text-blue-400 font-medium">{link.name}:</span>
                                  <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 ml-1 truncate block max-w-xs"
                                    title={link.url}
                                  >
                                    {link.url.substring(0, 40)}...
                                  </a>
                                </div>
                              ))}
                              {downloadLinks.length > 2 && (
                                <div className="text-green-400 text-xs">
                                  + {downloadLinks.length - 2} more link{downloadLinks.length - 2 > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-sm">No download links</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition-colors"
                              title="Edit"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id, isManga ? item.chapterNumber : item.episodeNumber, item.session || 1)}
                              className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition-colors"
                              title="Delete"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EpisodesManager;
