
import React, { useState, useEffect } from 'react';
import type { Stream } from '../types';

interface AdminPanelProps {
  streams: Stream[];
  onAddStream: (stream: Omit<Stream, 'id'>) => void;
  onUpdateStream: (stream: Stream) => void;
  onDeleteStream: (id: number) => void;
  onSignOut: () => void;
  dbUrl: string | null;
  onSetDbUrl: (url: string) => void;
}

const initialFormState: Omit<Stream, 'id'> = {
  title: '',
  channelName: '',
  url: '',
  isLive: false,
  streamType: 'youtube',
  thumbnailUrl: '',
};

const AdminPanel: React.FC<AdminPanelProps> = ({ streams, onAddStream, onUpdateStream, onDeleteStream, onSignOut, dbUrl, onSetDbUrl }) => {
  const [formData, setFormData] = useState<Omit<Stream, 'id'>>(initialFormState);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [urlInput, setUrlInput] = useState(dbUrl || '');

  useEffect(() => {
    if (editingStream) {
      const { id, ...dataToEdit } = editingStream;
      setFormData(dataToEdit);
    } else {
      setFormData(initialFormState);
    }
  }, [editingStream]);
  
  useEffect(() => {
    setUrlInput(dbUrl || '');
  }, [dbUrl]);

  // FIX: Refactored to use a safer type guard for checkbox elements.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: target.value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStream) {
      onUpdateStream({ ...formData, id: editingStream.id });
    } else {
      onAddStream(formData);
    }
    setEditingStream(null);
    setFormData(initialFormState);
  };
  
  const handleCancelEdit = () => {
    setEditingStream(null);
    setFormData(initialFormState);
  }

  const handleDbUrlSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
        onSetDbUrl(urlInput.trim());
        alert('Cloud Sync URL saved! Your streams will now be synced across devices.');
    }
  };
  
  const inputClasses = "w-full bg-slate-800 p-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-white";
  
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-white">Admin Dashboard</h1>
        <button 
            onClick={onSignOut}
            className="font-bold py-2 px-4 rounded-lg border-2 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-300 text-sm"
            >
            Sign Out
        </button>
      </div>

      <section>
        <h2 className="text-3xl font-bold text-accent mb-4">Cloud Sync</h2>
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
          <p className="text-gray-300">
            To sync your stream list across all devices, use a free JSON storage service like <a href="https://www.npoint.io/" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent-dark">npoint.io</a>.
          </p>
          <ol className="list-decimal list-inside text-gray-400 space-y-1 text-sm pl-2">
            <li>Go to npoint.io and paste an empty array <code className="bg-slate-900 p-1 rounded text-white">[]</code> to start fresh.</li>
            <li>Click "Create" to get a unique URL.</li>
            <li>Paste that URL below and click "Save". Changes will now be saved for all users.</li>
          </ol>
          <form onSubmit={handleDbUrlSave} className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Enter your npoint.io URL" className={inputClasses} required />
            <button type="submit" className="bg-accent hover:bg-accent-dark text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex-shrink-0 w-full sm:w-auto">
              Save
            </button>
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-accent mb-4">
          {editingStream ? 'Edit Stream' : 'Add New Stream'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Stream Title" className={inputClasses} required />
          <input type="text" name="channelName" value={formData.channelName} onChange={handleInputChange} placeholder="Channel Name" className={inputClasses} required />
          <input type="url" name="url" value={formData.url} onChange={handleInputChange} placeholder="Stream URL" className={inputClasses} required />
          <input type="url" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleInputChange} placeholder="Thumbnail URL" className={inputClasses} required />
          <select name="streamType" value={formData.streamType} onChange={handleInputChange} className={inputClasses}>
            <option value="youtube">YouTube</option>
            <option value="m3u8">M3U8 (HLS)</option>
          </select>
          <div className="flex items-center space-x-3 text-white">
            <input type="checkbox" name="isLive" checked={formData.isLive} onChange={handleInputChange} id="isLiveCheckbox" className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-accent focus:ring-accent" />
            <label htmlFor="isLiveCheckbox" className="font-medium">Is Live?</label>
          </div>
          <div className="flex items-center space-x-4 pt-2">
            <button type="submit" className="bg-accent hover:bg-accent-dark text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200 w-full">
              {editingStream ? 'Update Stream' : 'Add Stream'}
            </button>
            {editingStream && (
                <button type="button" onClick={handleCancelEdit} className="bg-slate-600 hover:bg-slate-500 font-bold py-3 px-6 rounded-lg transition-colors duration-200">
                    Cancel
                </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4 text-accent">
          Manage Streams
        </h2>
        <div className="space-y-3">
          {streams.map(stream => (
            <div key={stream.id} className="bg-slate-800/50 p-4 rounded-lg flex justify-between items-center gap-4 border border-slate-700">
              <div>
                <h3 className="font-bold text-lg">{stream.title}</h3>
                <p className="text-sm text-gray-400">{stream.channelName} {stream.isLive && <span className="text-xs font-bold text-red-500 ml-2">LIVE</span>}</p>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <button onClick={() => setEditingStream(stream)} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">Edit</button>
                <button onClick={() => onDeleteStream(stream.id)} className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">Delete</button>
              </div>
            </div>
          ))}
          {streams.length === 0 && <p className="text-gray-400 text-center py-4">No streams found. Add one above or check your Cloud Sync URL.</p>}
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
