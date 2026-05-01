import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, VolumeX, Volume1, X, Calendar, User, Info, Share2, Heart, ArrowLeft, Disc, Plus, Search, Library, ListMusic, Trash2, Camera, Check, Move, LogOut } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getHomeSongs, likeSong, getSongsByArtist, getLikedSongs, searchSongs } from '../service/song.api';
import { createPlaylist, getUserPlaylists, getPlaylistById, addSongToPlaylist, deletePlaylist } from '../service/playlist.api';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { logout } from '../../auth/service/auth.api';
import { setUser } from '../../auth/states/auth.slice';

export default function Home() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const [songs, setSongs] = useState([]);
    const [randomSongs, setRandomSongs] = useState([]);
    const [displaySongs, setDisplaySongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [viewingSong, setViewingSong] = useState(null);
    const [activeArtist, setActiveArtist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [likedSongIds, setLikedSongIds] = useState(new Set());
    const [viewMode, setViewMode] = useState('home'); // 'home', 'artist', 'liked', 'playlist'
    const [visibleCount, setVisibleCount] = useState(10);
    const [playlists, setPlaylists] = useState([]);
    const [activePlaylist, setActivePlaylist] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
    const [songToAssign, setSongToAssign] = useState(null);
    
    // Banner Cropping State
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [playlistForm, setPlaylistForm] = useState({ name: '', description: '', thumbnailFile: null, bannerFile: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [likedSongs, setLikedSongs] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentLikedSlide, setCurrentLikedSlide] = useState(0);
    const [currentPlaylistSlide, setCurrentPlaylistSlide] = useState(0);

    const slides = [
        {
            title: "Late Night",
            subtitle: "Frequencies",
            description: "Resonate with the curated sounds of the underground. Discover tracks that define your nocturnal narrative.",
            image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2000&auto=format&fit=crop",
            tag: "Global Discovery",
            color: "red-600"
        },
        {
            title: "Your Sonic",
            subtitle: "Archive",
            description: "Revisit the tracks that defined your journey. Your personal collection, curated by emotion.",
            image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2000&auto=format&fit=crop",
            tag: "Personal Library",
            color: "indigo-500"
        },
        {
            title: "Curated",
            subtitle: "Vaults",
            description: "Explore your hand-picked collections. Every playlist is a distinct sonic universe.",
            image: "https://images.unsplash.com/photo-1514525253361-bee8a187499b?q=80&w=2000&auto=format&fit=crop",
            tag: "Playlist Collections",
            color: "red-600"
        }
    ];
    const audioRef = useRef(null);

    useEffect(() => {
        if (viewMode === 'home') {
            const timer = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % slides.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [viewMode, slides.length]);

    useEffect(() => {
        if (viewMode === 'home' && likedSongs.length > 0) {
            const timer = setInterval(() => {
                setCurrentLikedSlide(prev => (prev + 1) % Math.min(likedSongs.length, 5));
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [viewMode, likedSongs.length]);

    useEffect(() => {
        if (viewMode === 'home' && playlists.length > 0) {
            const timer = setInterval(() => {
                setCurrentPlaylistSlide(prev => (prev + 1) % playlists.length);
            }, 7000);
            return () => clearInterval(timer);
        }
    }, [viewMode, playlists.length]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [songsRes, likedRes, playlistsRes] = await Promise.all([
                    getHomeSongs().catch(err => ({ success: false, latestSongs: [] })),
                    getLikedSongs().catch(err => ({ success: false, songs: [] })),
                    getUserPlaylists().catch(err => ({ success: false, playlists: [] }))
                ]);
                
                if (songsRes.success) {
                    const latestSongs = songsRes.latestSongs || [];
                    const rndSongs = songsRes.randomSongs || [];
                    setSongs(latestSongs);
                    setRandomSongs(rndSongs);
                    setDisplaySongs(latestSongs);
                }
                
                if (likedRes.success && likedRes.songs) {
                    setLikedSongIds(new Set(likedRes.songs.map(s => s._id)));
                    setLikedSongs(likedRes.songs);
                }

                if (playlistsRes.success) {
                    setPlaylists(playlistsRes.playlists || []);
                }
            } catch (err) {
                console.error("Failed to fetch initial data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (currentSong && audioRef.current) {
            audioRef.current.src = currentSong.song;
            audioRef.current.volume = volume;
            if (isPlaying) {
                audioRef.current.play().catch(err => console.error("Playback failed:", err));
            }
        }
    }, [currentSong]);

    const handlePlaySong = (song, e) => {
        if (e) e.stopPropagation();
        if (currentSong?._id === song._id) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(err => console.error("Playback failed:", err));
                setIsPlaying(true);
            }
        } else {
            setCurrentSong(song);
            setIsPlaying(true);
        }
    };

    const handleLike = async (songId, e) => {
        if (e) e.stopPropagation();
        try {
            const res = await likeSong(songId);
            if (res.success) {
                const newLikedIds = new Set(likedSongIds);
                if (newLikedIds.has(songId)) {
                    newLikedIds.delete(songId);
                    setLikedSongs(prev => prev.filter(s => s._id !== songId));
                } else {
                    newLikedIds.add(songId);
                    // We need the full song object, find it in current lists
                    const fullSong = [...songs, ...randomSongs, ...displaySongs].find(s => s._id === songId);
                    if (fullSong) setLikedSongs(prev => [fullSong, ...prev]);
                }
                setLikedSongIds(newLikedIds);

                // Update song like counts in display
                const updateSongs = (list) => list.map(s => {
                    if (s._id === songId) {
                        return { 
                            ...s, 
                            likes: res.message === "song liked" ? (s.likes || 0) + 1 : Math.max(0, (s.likes || 1) - 1)
                        };
                    }
                    return s;
                });
                setSongs(updateSongs(songs));
                setDisplaySongs(updateSongs(displaySongs));
                
                if (viewingSong?._id === songId) {
                    setViewingSong(prev => ({
                        ...prev,
                        likes: res.message === "song liked" ? (prev.likes || 0) + 1 : Math.max(0, (prev.likes || 1) - 1)
                    }));
                }
                
                if (currentSong?._id === songId) {
                    setCurrentSong(prev => ({
                        ...prev,
                        likes: res.message === "song liked" ? (prev.likes || 0) + 1 : Math.max(0, (prev.likes || 1) - 1)
                    }));
                }
            }
        } catch (err) {
            console.error("Like failed:", err);
        }
    };

    const handleArtistClick = async (artistName, e) => {
        if (e) e.stopPropagation();
        setLoading(true);
        try {
            const res = await getSongsByArtist(artistName);
            if (res.success) {
                setViewMode('artist');
                setActiveArtist(artistName);
                setDisplaySongs(res.songs);
                setViewingSong(null); // Close modal if open
            }
        } catch (err) {
            console.error("Fetch artist songs failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim()) {
            setLoading(true);
            try {
                const res = await searchSongs(query);
                if (res.success) {
                    setDisplaySongs(res.songs);
                    setViewMode('search');
                }
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        } else {
            resetFilter();
        }
    };

    const resetFilter = () => {
        setViewMode('home');
        setActiveArtist(null);
        setDisplaySongs(songs);
        setVisibleCount(10);
    };

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    const handleShowLiked = () => {
        navigate('/liked');
    };

    const handleLikedSongsClick = () => {
        setViewMode('liked');
        setDisplaySongs(likedSongs);
        setActivePlaylist(null);
        setActiveArtist(null);
    };

    const handleCreatePlaylist = () => {
        setShowCreateModal(true);
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleBannerSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageToCrop(reader.result);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleConfirmCrop = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            const croppedFile = new File([croppedImageBlob], "banner.jpg", { type: "image/jpeg" });
            setPlaylistForm(prev => ({ ...prev, bannerFile: croppedFile }));
            setIsCropping(false);
            setImageToCrop(null);
        } catch (e) {
            console.error(e);
        }
    };

    const submitCreatePlaylist = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', playlistForm.name);
        formData.append('description', playlistForm.description);
        if (playlistForm.thumbnailFile) {
            formData.append('thumbnail', playlistForm.thumbnailFile);
        }
        if (playlistForm.bannerFile) {
            formData.append('banner', playlistForm.bannerFile);
        }

        try {
            const res = await createPlaylist(formData);
            if (res.success) {
                setPlaylists([res.playlist, ...playlists]);
                setShowCreateModal(false);
                setPlaylistForm({ name: '', description: '', thumbnailFile: null, bannerFile: null });
            }
        } catch (err) {
            console.error("Create playlist failed:", err);
        }
    };

    const handleDeletePlaylist = async (playlistId, e) => {
        if (e) e.stopPropagation();
        if (!confirm("Are you sure you want to delete this collection?")) return;
        try {
            const res = await deletePlaylist(playlistId);
            if (res.success) {
                setPlaylists(playlists.filter(p => p._id !== playlistId));
                if (activePlaylist?._id === playlistId) {
                    resetFilter();
                }
            }
        } catch (err) {
            console.error("Delete playlist failed:", err);
        }
    };

    const handleAddSongToPlaylist = async (playlistId) => {
        if (!songToAssign) return;
        try {
            const res = await addSongToPlaylist(playlistId, songToAssign._id);
            if (res.success) {
                setShowAddToPlaylistModal(false);
                setSongToAssign(null);
                // Optionally show a toast or notification
            }
        } catch (err) {
            console.error("Add song to playlist failed:", err);
        }
    };

    const handlePlaylistClick = async (playlistId) => {
        setLoading(true);
        try {
            const res = await getPlaylistById(playlistId);
            if (res.success) {
                setViewMode('playlist');
                setActivePlaylist(res.playlist);
                setDisplaySongs(res.playlist.songs);
                setVisibleCount(20);
            }
        } catch (err) {
            console.error("Fetch playlist failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleProgressChange = (e) => {
        const time = Number(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const handleVolumeChange = (e) => {
        const vol = Number(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleNext = () => {
        const currentIndex = displaySongs.findIndex(s => s._id === currentSong._id);
        if (currentIndex < displaySongs.length - 1) {
            handlePlaySong(displaySongs[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const currentIndex = displaySongs.findIndex(s => s._id === currentSong._id);
        if (currentIndex > 0) {
            handlePlaySong(displaySongs[currentIndex - 1]);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout API failed:", err);
        } finally {
            dispatch(setUser(null));
            navigate('/login');
        }
    };

    const isSongLiked = (song) => {
        return likedSongIds.has(song?._id);
    };

    const SongCard = ({ song }) => (
        <div className="group relative flex flex-col" onClick={() => handlePlaySong(song)}>
            <div className="relative aspect-square mb-5 overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-500 cursor-pointer isolate">
                {/* Background Image with optimized scaling */}
                <img 
                    src={song.thumbnail} 
                    alt={song.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform" 
                />
                
                {/* Main Hover Overlay - Simplified blur for performance */}
                <div className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center transition-opacity duration-300 ${currentSong?._id === song._id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} z-10`}>
                    {currentSong?._id === song._id && isPlaying ? (
                        <div className="flex gap-1.5 items-end h-10">
                            <div className="w-1.5 bg-red-600 animate-music-bar-1"></div>
                            <div className="w-1.5 bg-red-600 animate-music-bar-2"></div>
                            <div className="w-1.5 bg-red-600 animate-music-bar-3"></div>
                            <div className="w-1.5 bg-red-600 animate-music-bar-2"></div>
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300">
                            <Play fill="white" size={32} className="ml-1" />
                        </div>
                    )}
                </div>

                {/* Quick Actions - Stabilized without jittery translations */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <button 
                        onClick={(e) => handleLike(song._id, e)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform ${isSongLiked(song) ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-100' : 'bg-black/60 text-white/70 hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100'}`}
                    >
                        <Heart size={18} fill={isSongLiked(song) ? "white" : "none"} />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setSongToAssign(song);
                            setShowAddToPlaylistModal(true);
                        }}
                        className="w-10 h-10 rounded-full bg-black/60 text-white/70 hover:bg-white hover:text-black flex items-center justify-center transition-all duration-300 transform opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 delay-75"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>
            <div className="px-1 group-hover:translate-x-1 transition-transform duration-300">
                <h4 className="font-black text-base tracking-tight truncate mb-0.5 hover:text-red-500 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewingSong(song); }}>{song.title}</h4>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] truncate opacity-80">{song.artist.join(" • ")}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white font-['Inter',sans-serif] flex">
            <audio 
                ref={audioRef} 
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleNext}
                onPlay={() => setIsPlaying(true)} 
                onPause={() => setIsPlaying(false)}
            />

            {/* Sidebar */}
            <aside className="w-[350px] flex flex-col gap-2 p-2 h-screen sticky top-0 hidden lg:flex shrink-0">
                <div className="bg-[#121212] rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-5 px-3 py-2 text-gray-400 hover:text-white transition-all cursor-pointer group" onClick={resetFilter}>
                        <Music className="group-hover:scale-110 transition-transform" size={24} />
                        <span className="font-black tracking-tight text-lg">Home</span>
                    </div>
                    <div className="relative flex items-center gap-5 px-3 py-2 text-gray-400 hover:text-white transition-all cursor-pointer group">
                        <Search className="group-hover:scale-110 transition-transform" size={24} />
                        <input 
                            type="text" 
                            placeholder="SEARCH TRACKS..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="bg-transparent border-none outline-none font-black tracking-tight text-lg placeholder:text-gray-600 w-full"
                        />
                    </div>
                </div>

                <div className="bg-[#121212] rounded-xl flex-1 flex flex-col min-h-0">
                    <div className="p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center gap-3 text-gray-400">
                            <Library size={24} />
                            <span className="font-black tracking-tight text-lg">Your Library</span>
                        </div>
                        <button 
                            onClick={handleCreatePlaylist}
                            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all text-gray-400 hover:text-white"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex gap-2 px-4 py-2">
                        <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-black tracking-widest uppercase transition-all">Playlists</button>
                        <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-black tracking-widest uppercase transition-all">Artists</button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-2 mt-2">
                        {/* Liked Songs Preview Section */}
                        {likedSongs.length > 0 && (
                            <div className="mb-6">
                                <div 
                                    onClick={handleLikedSongsClick}
                                    className={`flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group mb-2 bg-gradient-to-br from-indigo-900/40 to-black/40 border border-indigo-500/10 ${viewMode === 'liked' ? 'ring-1 ring-indigo-500/50 bg-indigo-900/20' : ''}`}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                        <Heart size={24} fill="white" className="text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black tracking-tight truncate text-sm">Liked Songs</h4>
                                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{likedSongs.length} Tracks</p>
                                    </div>
                                </div>
                                <div className="space-y-1 pl-2">
                                    {likedSongs.slice(0, 3).map(song => (
                                        <div 
                                            key={song._id}
                                            onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                                            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
                                        >
                                            <img src={song.thumbnail} className="w-8 h-8 rounded object-cover shadow-md" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[11px] font-bold truncate group-hover:text-red-500 transition-colors">{song.title}</p>
                                                <p className="text-[9px] text-gray-500 truncate">{song.artist[0]}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 ml-3 flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                            Your Vaults
                        </div>
                        {playlists.map(playlist => (
                            <div 
                                key={playlist._id}
                                onClick={() => handlePlaylistClick(playlist._id)}
                                className={`flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer group ${activePlaylist?._id === playlist._id ? 'bg-white/10' : ''}`}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-md bg-[#282828] flex items-center justify-center shrink-0 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                                        {playlist.thumbnail ? <img src={playlist.thumbnail} className="w-full h-full object-cover" /> : <ListMusic size={24} className="text-gray-400" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black tracking-tight truncate text-sm">{playlist.name}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Playlist • {user?.username}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleDeletePlaylist(playlist._id, e)}
                                    className="w-8 h-8 rounded-full hover:bg-red-600/20 flex items-center justify-center text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 bg-gradient-to-b from-[#1a1a1a] to-[#050505] m-2 ml-0 rounded-xl overflow-y-auto custom-scrollbar relative">
                {/* Main Content Area */}
                <div className="p-8 pb-32">
                    {/* Header Controls */}
                    <header className="mb-12 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {viewMode !== 'home' ? (
                                <button onClick={resetFilter} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                                    <ArrowLeft size={20} />
                                </button>
                            ) : null}
                            <h2 className="text-4xl font-black tracking-tighter italic uppercase">
                                {viewMode === 'artist' ? (
                                    <>VIBES BY <span className="text-red-600 not-italic">{activeArtist}</span></>
                                ) : viewMode === 'liked' ? (
                                    <>YOUR <span className="text-red-600 not-italic">COLLECTION</span></>
                                ) : viewMode === 'playlist' ? (
                                    <>{activePlaylist?.name} <span className="text-red-600 not-italic">VAULT</span></>
                                ) : (
                                    <>MADE FOR <span className="text-red-600 not-italic">{user?.username}</span></>
                                )}
                            </h2>
                        </div>

                        {user && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-4 bg-white/[0.03] p-1.5 pr-5 rounded-full border border-white/5">
                                    <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full border-2 border-red-500/50 object-cover" />
                                    <span className="text-xs font-black tracking-tight uppercase text-gray-400">{user.username}</span>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="p-3 hover:bg-red-600/10 text-gray-400 hover:text-red-500 rounded-full border border-white/5 transition-all active:scale-95 group"
                                    title="Logout"
                                >
                                    <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        )}
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <div className="w-16 h-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-6"></div>
                            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Syncing frequencies...</p>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {/* Rotating Horizontal Sections - Now as Moving Banners */}
                            {viewMode === 'home' && (
                                <div className="space-y-32 mb-24">
                                        {/* Liked Songs Moving Banner */}
                                        {likedSongs.length > 0 && (
                                            <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
                                                <div className="flex justify-between items-end mb-8 px-2">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-6 h-[1px] bg-indigo-500"></div>
                                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Your Resonance</span>
                                                        </div>
                                                        <h3 className="text-3xl font-black tracking-tight italic uppercase">Liked <span className="text-indigo-500 not-italic">Archive</span></h3>
                                                    </div>
                                                </div>
                                                
                                                <div className="relative h-[400px] w-full rounded-[3rem] overflow-hidden group/liked-hero shadow-2xl border border-white/5 bg-black">
                                                    {likedSongs.slice(0, 5).map((song, index) => (
                                                        <div 
                                                            key={song._id}
                                                            className={`absolute inset-0 transition-all duration-[1.2s] ease-in-out ${index === currentLikedSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
                                                        >
                                                            <img src={song.thumbnail} className="w-full h-full object-cover opacity-30 blur-sm scale-110" />
                                                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent p-12 flex items-center gap-10">
                                                                <div className={`w-64 h-64 rounded-2xl overflow-hidden shadow-2xl transition-all duration-1000 delay-300 ${index === currentLikedSlide ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                                                                    <img src={song.thumbnail} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className={`flex-1 transition-all duration-1000 delay-500 ${index === currentLikedSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2 block">Recently Resonated</span>
                                                                    <h4 className="text-6xl font-black italic uppercase tracking-tighter mb-2 truncate max-w-xl">{song.title}</h4>
                                                                    <p className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-8">{song.artist.join(" • ")}</p>
                                                                    <button 
                                                                        onClick={() => handlePlaySong(song)}
                                                                        className="h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center gap-3 transition-all font-black uppercase tracking-widest text-xs"
                                                                    >
                                                                        <Play fill="white" size={20} />
                                                                        Stream Now
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {/* Pagination */}
                                                    <div className="absolute bottom-10 right-12 flex gap-2">
                                                        {likedSongs.slice(0, 5).map((_, i) => (
                                                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentLikedSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        {/* Playlists Moving Banner */}
                                        {playlists.length > 0 && (
                                            <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
                                                <div className="flex justify-between items-end mb-8 px-2">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-6 h-[1px] bg-red-600"></div>
                                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Personal Vaults</span>
                                                        </div>
                                                        <h3 className="text-3xl font-black tracking-tight italic uppercase">Your <span className="text-red-600 not-italic">Collections</span></h3>
                                                    </div>
                                                </div>

                                                <div className="relative h-[400px] w-full rounded-[3rem] overflow-hidden group/playlist-hero shadow-2xl border border-white/5 bg-black">
                                                    {playlists.map((playlist, index) => (
                                                        <div 
                                                            key={playlist._id}
                                                            className={`absolute inset-0 transition-all duration-[1.2s] ease-in-out ${index === currentPlaylistSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
                                                        >
                                                            <img src={playlist.banner || playlist.thumbnail} className="w-full h-full object-cover opacity-40" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-12 flex flex-col justify-between">
                                                                <div className={`transition-all duration-1000 delay-300 ${index === currentPlaylistSlide ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                                                                            <ListMusic size={12} />
                                                                        </div>
                                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Active Vault</span>
                                                                    </div>
                                                                    <h4 className="text-8xl font-black italic uppercase tracking-tighter mb-4 leading-none">{playlist.name}</h4>
                                                                    {playlist.description && (
                                                                        <p className="text-gray-400 font-bold text-lg max-w-2xl leading-relaxed">
                                                                            {playlist.description}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className={`flex items-center gap-8 transition-all duration-1000 delay-500 ${index === currentPlaylistSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                                                    <button 
                                                                        onClick={() => handlePlaylistClick(playlist._id)}
                                                                        className="h-14 px-10 bg-white text-black rounded-full flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95 font-black uppercase tracking-widest text-xs"
                                                                    >
                                                                        Open Vault
                                                                    </button>
                                                                    <div className="flex flex-col border-l border-white/20 pl-6">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{playlist.songs?.length || 0} Tracks</span>
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Curated Library</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {/* Pagination */}
                                                    <div className="absolute top-12 right-12 flex flex-col gap-2">
                                                        {playlists.map((_, i) => (
                                                            <div key={i} className={`w-1 rounded-full transition-all duration-500 ${i === currentPlaylistSlide ? 'h-8 bg-red-600' : 'h-2 bg-white/20'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </section>
                                        )}
                                    </div>
                            )}

                            {/* Playlist Banner Header */}
                            {viewMode === 'playlist' && activePlaylist && (
                                <div className="relative h-[450px] w-full rounded-[3rem] overflow-hidden mb-12 group/banner shadow-2xl">
                                    <img 
                                        src={activePlaylist.banner} 
                                        alt="" 
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover/banner:scale-105 opacity-40 blur-[2px]" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-12">
                                        <div className="flex items-end gap-10 animate-in slide-in-from-bottom-10 duration-700">
                                            <div className="w-64 h-64 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden shrink-0 border border-white/10 group-hover/banner:scale-105 transition-transform duration-500">
                                                <img src={activePlaylist.thumbnail} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="mb-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                                        <ListMusic size={16} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Curated Vault</span>
                                                </div>
                                                <h1 className="text-8xl font-black italic uppercase tracking-tighter mb-4 leading-none">{activePlaylist.name}</h1>
                                                <p className="text-gray-400 font-bold text-lg max-w-3xl line-clamp-2">{activePlaylist.description || "No description provided for this collection of frequencies."}</p>
                                                
                                                <div className="flex items-center gap-8 mt-10">
                                                    <button 
                                                        onClick={() => displaySongs.length > 0 && handlePlaySong(displaySongs[0])}
                                                        className="h-16 px-10 bg-white text-black rounded-full flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95 font-black uppercase tracking-widest text-sm"
                                                    >
                                                        <Play fill="black" size={24} />
                                                        Start Session
                                                    </button>
                                                    <div className="flex flex-col border-l border-white/10 pl-8">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{displaySongs.length} Tracks Curated</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600/80 mt-1.5 flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse"></div>
                                                            Active Library
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Liked Songs Hero Banner */}
                            {viewMode === 'liked' && (
                                <div className="relative h-[400px] w-full rounded-[3rem] overflow-hidden mb-12 group/liked shadow-2xl bg-gradient-to-br from-indigo-950 via-[#0a0a0a] to-black">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                    <div className="absolute inset-0 flex flex-col justify-end p-12">
                                        <div className="flex items-end gap-10 animate-in slide-in-from-bottom-10 duration-700">
                                            <div className="w-56 h-56 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] shrink-0 border border-white/10">
                                                <Heart size={100} fill="white" className="text-white" />
                                            </div>
                                            <div className="mb-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                                                        <Heart size={16} fill="white" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Personal Collection</span>
                                                </div>
                                                <h1 className="text-8xl font-black italic uppercase tracking-tighter mb-4 leading-none">Your <span className="text-indigo-500">Vault</span></h1>
                                                <p className="text-gray-400 font-bold text-lg max-w-3xl">A curated archive of your most resonated late-night frequencies.</p>
                                                
                                                <div className="flex items-center gap-8 mt-10">
                                                    <button 
                                                        onClick={() => displaySongs.length > 0 && handlePlaySong(displaySongs[0])}
                                                        className="h-16 px-10 bg-white text-black rounded-full flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95 font-black uppercase tracking-widest text-sm"
                                                    >
                                                        <Play fill="black" size={24} />
                                                        Play All
                                                    </button>
                                                    <div className="flex flex-col border-l border-white/10 pl-8">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{likedSongs.length} Favorited Tracks</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1.5 flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse"></div>
                                                            Verified Archive
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Discovery Mix (Only on Home) */}
                            {viewMode === 'home' && randomSongs.length > 0 && (
                                <section>
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight italic uppercase">Discovery Mix</h3>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Curated late-night frequencies</p>
                                        </div>
                                        <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Show All</button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                                        {randomSongs.slice(0, 5).map(song => (
                                            <SongCard key={song._id} song={song} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Latest / Artist / Playlist Tracks */}
                            <section>
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight italic uppercase">
                                            {viewMode === 'home' ? 'Latest Frequencies' : 
                                             viewMode === 'artist' ? `Tracks by ${activeArtist}` : 
                                             viewMode === 'playlist' ? 'Playlist Tracks' : 'Your Library'}
                                        </h3>
                                    </div>
                                </div>
                                
                                {displaySongs.length > 0 ? (
                                    <div className="flex flex-col items-center">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 w-full">
                                            {displaySongs.slice(0, visibleCount).map((song) => (
                                                <SongCard key={song._id} song={song} />
                                            ))}
                                        </div>

                                        {displaySongs.length > visibleCount && (
                                            <button 
                                                onClick={handleShowMore}
                                                className="mt-16 px-12 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black tracking-[0.3em] uppercase text-[10px] transition-all flex items-center gap-4 group"
                                            >
                                                <span>Explore More</span>
                                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-40 bg-white/[0.02] rounded-[3rem] border border-white/5 border-dashed">
                                        <Music className="text-gray-800 mb-6" size={64} />
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2 text-gray-400">The stage is empty</h3>
                                        <p className="text-gray-600 text-sm font-bold">Try releasing a new track or check back later.</p>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </main>

            
            {viewingSong && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setViewingSong(null)}></div>
                    <div className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.15)] flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setViewingSong(null)}
                            className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-red-600 rounded-full flex items-center justify-center transition-all z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative group overflow-hidden">
                            <img src={viewingSong.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            {currentSong?._id === viewingSong._id && isPlaying && (
                                <div className="absolute inset-0 bg-red-600/10 backdrop-blur-[2px] flex items-center justify-center">
                                    <div className="flex gap-4 items-end h-full py-20">
                                        <div className="w-4 bg-white animate-music-bar-1 shadow-[0_0_30px_rgba(255,255,255,0.4)]"></div>
                                        <div className="w-4 bg-white animate-music-bar-2 shadow-[0_0_30px_rgba(255,255,255,0.4)]"></div>
                                        <div className="w-4 bg-white animate-music-bar-3 shadow-[0_0_30px_rgba(255,255,255,0.4)]"></div>
                                        <div className="w-4 bg-white animate-music-bar-1 shadow-[0_0_30px_rgba(255,255,255,0.4)]"></div>
                                        <div className="w-4 bg-white animate-music-bar-2 shadow-[0_0_30px_rgba(255,255,255,0.4)]"></div>
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-10">
                                <button className="w-full h-14 bg-white text-black font-black uppercase rounded-xl flex items-center justify-center gap-3 tracking-tighter">
                                    <Disc size={20} className="animate-spin" />
                                    Explore Visualizer
                                </button>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                            <div className="mb-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Track Insights</span>
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                        <Heart size={14} className="text-red-600" fill="currentColor" />
                                        <span className="text-xs font-black tracking-widest">{viewingSong.likes || 0} Likes</span>
                                    </div>
                                </div>
                                <h2 className="text-6xl font-black tracking-tighter italic uppercase mb-2">{viewingSong.title}</h2>
                                <div className="flex flex-wrap gap-3">
                                    {viewingSong.artist.map((art, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => handleArtistClick(art)}
                                            className="flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-red-600 cursor-pointer transition-colors bg-white/5 px-3 py-1.5 rounded-full"
                                        >
                                            <User size={12} className="text-red-600" />
                                            <span>{art}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-8 mb-12">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                        <Info size={18} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Description</p>
                                        <p className="text-gray-300 leading-relaxed font-medium">{viewingSong.description || "No description available for this masterpiece."}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                        <Calendar size={18} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Release Date</p>
                                        <p className="text-gray-300 font-black">{new Date(viewingSong.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => {
                                        handlePlaySong(viewingSong);
                                        setViewingSong(null);
                                    }}
                                    className="flex-1 h-16 bg-red-600 hover:bg-red-500 rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                                >
                                    <Play fill="white" size={24} />
                                    PLAY NOW
                                </button>
                                <button 
                                    onClick={(e) => handleLike(viewingSong._id, e)}
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isSongLiked(viewingSong) ? 'bg-red-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    <Heart size={24} fill={isSongLiked(viewingSong) ? "white" : "none"} />
                                </button>
                                <button className="w-16 h-16 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                                    <Share2 size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Player Bar */}
            {currentSong && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-3xl border-t border-white/5 px-8 py-3 z-50 animate-in slide-in-from-bottom-10 duration-500">
                    <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-8">
                        {/* Song Info */}
                        <div className="flex items-center gap-4 w-1/4">
                            <div className="relative shrink-0">
                                <img src={currentSong.thumbnail} alt="" className="w-12 h-12 rounded-lg shadow-2xl border border-white/5 object-cover" />
                                {isPlaying && (
                                    <div className="absolute inset-0 bg-red-600/40 rounded-lg flex items-center justify-center gap-0.5">
                                        <div className="w-1 h-3 bg-white animate-music-bar-1"></div>
                                        <div className="w-1 h-4 bg-white animate-music-bar-2"></div>
                                        <div className="w-1 h-2 bg-white animate-music-bar-3"></div>
                                    </div>
                                )}
                            </div>
                            <div className="truncate">
                                <h4 
                                    className="font-black text-base tracking-tighter truncate hover:text-red-500 transition-colors cursor-pointer"
                                    onClick={() => setViewingSong(currentSong)}
                                >
                                    {currentSong.title}
                                </h4>
                                <div className="flex gap-1 truncate">
                                    {currentSong.artist.map((art, idx) => (
                                        <span 
                                            key={idx}
                                            onClick={() => handleArtistClick(art)}
                                            className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-red-500 cursor-pointer"
                                        >
                                            {art}{idx < currentSong.artist.length - 1 ? "," : ""}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Controls & Progress */}
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                            <div className="flex items-center gap-6">
                                <SkipBack 
                                    size={18} 
                                    onClick={handleBack}
                                    className="text-gray-500 hover:text-white cursor-pointer transition-all active:scale-90" 
                                />
                                <button 
                                    onClick={() => handlePlaySong(currentSong)}
                                    className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                                >
                                    {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
                                </button>
                                <SkipForward 
                                    size={18} 
                                    onClick={handleNext}
                                    className="text-gray-500 hover:text-white cursor-pointer transition-all active:scale-90" 
                                />
                            </div>
                            
                            <div className="w-full flex items-center gap-4 text-[11px] font-black text-gray-500 tabular-nums">
                                <span>{formatTime(currentTime)}</span>
                                <div className="relative flex-1 h-4 flex items-center group">
                                    <input 
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={currentTime}
                                        onChange={handleProgressChange}
                                        className="absolute inset-0 w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-red-600 group-hover:h-2 transition-all"
                                        style={{
                                            background: `linear-gradient(to right, #dc2626 ${(currentTime/duration)*100}%, rgba(255,255,255,0.05) ${(currentTime/duration)*100}%)`
                                        }}
                                    />
                                </div>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-5 w-1/4 justify-end">
                            <button 
                                onClick={() => {
                                    setSongToAssign(currentSong);
                                    setShowAddToPlaylistModal(true);
                                }}
                                className="text-gray-500 hover:text-white transition-all hover:scale-110 active:scale-95"
                                title="Add to Playlist"
                            >
                                <Plus size={20} />
                            </button>
                            <button onClick={(e) => handleLike(currentSong._id, e)} className={`transition-all ${isSongLiked(currentSong) ? 'text-red-600' : 'text-gray-500 hover:text-white'} hover:scale-110 active:scale-95`}>
                                <Heart size={20} fill={isSongLiked(currentSong) ? "currentColor" : "none"} />
                            </button>
                            <button onClick={() => handleVolumeChange({ target: { value: volume === 0 ? 0.7 : 0 }})}>
                                {volume === 0 ? <VolumeX size={18} className="text-red-500" /> : volume < 0.5 ? <Volume1 size={18} className="text-gray-400" /> : <Volume2 size={18} className="text-gray-400" />}
                            </button>
                            <div className="w-32 relative flex items-center h-4 group">
                                <input 
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-white hover:accent-red-600 transition-all"
                                    style={{
                                        background: `linear-gradient(to right, white ${volume*100}%, rgba(255,255,255,0.05) ${volume*100}%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Create Playlist Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setShowCreateModal(false)}></div>
                    <form 
                        onSubmit={submitCreatePlaylist}
                        className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(220,38,38,0.1)] animate-in zoom-in-95 duration-300"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">New Collection</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Define your late-night frequency</p>
                            </div>
                            <button type="button" onClick={() => setShowCreateModal(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 block ml-1">Playlist Identity</label>
                                <input 
                                    type="text" 
                                    placeholder="PHANTOM ECHOES"
                                    required
                                    value={playlistForm.name}
                                    onChange={(e) => setPlaylistForm({ ...playlistForm, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 focus:border-red-600/50 rounded-2xl px-6 py-4 outline-none transition-all font-black text-lg placeholder:text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 block ml-1">Sonic Narrative (Description)</label>
                                <textarea 
                                    placeholder="Curated beats for the lost and found."
                                    value={playlistForm.description}
                                    onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 focus:border-red-600/50 rounded-2xl px-6 py-4 outline-none transition-all font-bold text-sm h-32 resize-none placeholder:text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 block ml-1">Cover Frequency (Thumbnail Image)</label>
                                <div className="relative group/upload">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setPlaylistForm({ ...playlistForm, thumbnailFile: e.target.files[0] })}
                                        className="hidden"
                                        id="playlist-thumbnail"
                                    />
                                    <label 
                                        htmlFor="playlist-thumbnail"
                                        className="w-full h-24 bg-white/5 border border-dashed border-white/10 hover:border-red-600/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all gap-2"
                                    >
                                        {playlistForm.thumbnailFile ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                                                    <Disc size={18} className="text-red-500" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-300">{playlistForm.thumbnailFile.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Plus size={20} className="text-gray-600 group-hover/upload:text-red-500 transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover/upload:text-gray-400 transition-colors">Select Visual frequency</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 block ml-1">Vault Hero (Wide Banner)</label>
                                <div className="relative group/upload-banner">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleBannerSelect}
                                        className="hidden"
                                        id="playlist-banner"
                                    />
                                    <label 
                                        htmlFor="playlist-banner"
                                        className="w-full h-24 bg-white/5 border border-dashed border-white/10 hover:border-red-600/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all gap-2 group/upload-banner"
                                    >
                                        {playlistForm.bannerFile ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                                                    <Check size={18} className="text-red-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Banner Selected</span>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase truncate max-w-[150px]">{playlistForm.bannerFile.name}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Camera size={20} className="text-gray-600 group-hover/upload-banner:text-red-500 transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover/upload-banner:text-gray-400 transition-colors">Select & Crop Hero Banner</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full h-16 bg-red-600 hover:bg-red-500 rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] mt-4"
                            >
                                <Plus size={24} />
                                INITIALIZE COLLECTION
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Add to Playlist Modal */}
            {showAddToPlaylistModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setShowAddToPlaylistModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(220,38,38,0.1)] animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8 px-2">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Assign to Vault</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Choose a destination for <span className="text-red-500">{songToAssign?.title}</span></p>
                            </div>
                            <button onClick={() => setShowAddToPlaylistModal(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-3 px-2">
                            {playlists.length > 0 ? playlists.map(playlist => (
                                <div 
                                    key={playlist._id}
                                    onClick={() => handleAddSongToPlaylist(playlist._id)}
                                    className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-red-600/10 border border-transparent hover:border-red-600/30 transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                                        {playlist.thumbnail ? <img src={playlist.thumbnail} className="w-full h-full object-cover" /> : <ListMusic size={24} className="text-gray-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black tracking-tight truncate text-sm">{playlist.name}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{playlist.songs?.length || 0} Tracks</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                        <Plus size={16} />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 px-4">
                                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-4">No collections found</p>
                                    <button 
                                        onClick={() => {
                                            setShowAddToPlaylistModal(false);
                                            setShowCreateModal(true);
                                        }}
                                        className="text-red-500 font-black text-xs uppercase hover:underline"
                                    >
                                        Create your first playlist
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Banner Crop Modal */}
            {isCropping && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setIsCropping(false)}></div>
                    <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.2)] animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-red-600/10 to-transparent">
                            <div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Composition Studio</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1">Frame your collection's narrative</p>
                            </div>
                            <button onClick={() => setIsCropping(false)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="relative h-[500px] bg-black">
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                style={{
                                    containerStyle: { background: '#000' },
                                    cropAreaStyle: { border: '2px solid #dc2626', boxShadow: '0 0 0 9999em rgba(0,0,0,0.85)' }
                                }}
                            />
                        </div>

                        <div className="p-10 bg-[#050505] flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <Move size={18} className="text-red-500" />
                                <input 
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="flex-1 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-red-600"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-12">{zoom}x</span>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setIsCropping(false)}
                                    className="flex-1 h-16 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmCrop}
                                    className="flex-[2] h-16 bg-red-600 hover:bg-red-500 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_40px_rgba(220,38,38,0.3)]"
                                >
                                    <Check size={20} />
                                    Finalize Composition
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
