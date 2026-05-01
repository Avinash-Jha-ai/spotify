import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';
import { uploadSong, getMySongs, deleteSong } from '../service/song.api';
import { Upload, Music, LogOut, CheckCircle2, AlertCircle, Trash2, Heart, Play, Clock } from 'lucide-react';

export default function Dashboard() {
    const user = useSelector(state => state.auth.user);
    const { handleLogout } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [mySongs, setMySongs] = useState([]);
    const [loadingSongs, setLoadingSongs] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        artist: '',
    });
    const [files, setFiles] = useState({
        song: null,
    });

    useEffect(() => {
        fetchMySongs();
    }, []);

    const fetchMySongs = async () => {
        try {
            const data = await getMySongs();
            setMySongs(data.songs || []);
        } catch (err) {
            console.error("Failed to fetch tracks:", err);
        } finally {
            setLoadingSongs(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!files.song) {
            setUploadStatus({ type: 'error', message: 'Please select a song file.' });
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('artist', formData.artist);
        data.append('song', files.song);

        setIsUploading(true);
        setUploadStatus(null);

        try {
            await uploadSong(data);
            setUploadStatus({ type: 'success', message: 'Song uploaded successfully!' });
            setFormData({ title: '', description: '', artist: '' });
            setFiles({ song: null });
            fetchMySongs(); // Refresh list
        } catch (err) {
            console.error("Upload failed details:", err.response?.data || err);
            setUploadStatus({ type: 'error', message: err?.response?.data?.message || 'Failed to upload song.' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (songId) => {
        if (!window.confirm("Are you sure you want to delete this track?")) return;
        try {
            await deleteSong(songId);
            setMySongs(mySongs.filter(s => s._id !== songId));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete track.");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Inter',sans-serif]">
            <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                            <Music className="text-white" size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter italic">SPOTIFY <span className="text-red-600 not-italic">BACKSTAGE</span></h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-white/5 p-1.5 pr-4 rounded-full border border-white/10">
                            <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full border border-red-500/30" />
                            <span className="text-sm font-bold">{user?.username}</span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-600/10 text-gray-400 hover:text-red-500 rounded-full transition-colors group"
                            title="Logout"
                        >
                            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Upload Form */}
                <div className="lg:col-span-1 space-y-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight mb-2 uppercase italic">Release <span className="text-red-600">New Track</span></h2>
                        <p className="text-gray-500 text-sm">Publish your latest masterpiece to the world.</p>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full"></div>

                        {uploadStatus && (
                            <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 border ${uploadStatus.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-200' : 'bg-red-500/10 border-red-500/50 text-red-200'}`}>
                                {uploadStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <span className="text-xs font-bold uppercase tracking-wider">{uploadStatus.message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Audio File</label>
                                <div className="relative group">
                                    <input 
                                        type="file" 
                                        name="song"
                                        required
                                        accept="audio/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="h-48 border-2 border-dashed border-white/10 group-hover:border-red-500/50 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/5 transition-all">
                                        {files.song ? (
                                            <div className="flex flex-col items-center p-4 text-center">
                                                <Music className="text-red-500 mb-2" size={32} />
                                                <span className="text-xs font-bold truncate max-w-[200px]">{files.song.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                                                <span className="text-xs font-bold text-gray-400">Upload MP3/WAV</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Title</label>
                                <input 
                                    type="text" 
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors text-sm font-bold"
                                    placeholder="Use file name if empty"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Artists</label>
                                <input 
                                    type="text" 
                                    name="artist"
                                    value={formData.artist}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors text-sm font-bold"
                                    placeholder="Comma separated"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isUploading}
                                className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isUploading ? 'Mastering...' : 'Publish Track'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Track List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight mb-2 uppercase italic">Your <span className="text-red-600">Discography</span></h2>
                            <p className="text-gray-500 text-sm">Manage and monitor your uploaded tracks.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-red-600">{mySongs.length}</p>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Tracks</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loadingSongs ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                                <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading tracks...</p>
                            </div>
                        ) : mySongs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                                <Music className="text-gray-700 mb-4" size={48} />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No tracks uploaded yet</p>
                            </div>
                        ) : (
                            mySongs.map((song) => (
                                <div key={song._id} className="group bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex items-center gap-6 hover:bg-white/[0.03] hover:border-red-600/30 transition-all">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-2xl relative shrink-0">
                                        <img src={song.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play size={24} fill="white" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-lg truncate group-hover:text-red-500 transition-colors">{song.title}</h4>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{song.artist.join(", ")}</p>
                                        <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                            <span className="flex items-center gap-1.5"><Heart size={12} className="text-red-600" /> {song.likes || 0} Likes</span>
                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(song.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(song._id)}
                                        className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-90"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
