import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getLikedSongs, likeSong } from '../service/song.api';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, Heart, ArrowLeft, Disc, Clock, Share2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function LikedSongs() {
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const [likedSongs, setLikedSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef(null);

    useEffect(() => {
        fetchLikedSongs();
    }, []);

    const fetchLikedSongs = async () => {
        try {
            const res = await getLikedSongs();
            if (res.success) {
                const validSongs = (res.songs || []).filter(s => s !== null);
                setLikedSongs(validSongs);
                if (validSongs.length > 0 && !currentSong) {
                    setCurrentSong(validSongs[0]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch liked songs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentSong && audioRef.current) {
            audioRef.current.src = currentSong.song;
            audioRef.current.volume = volume;
            if (isPlaying) {
                audioRef.current.play().catch(err => console.error("Playback failed:", err));
            }
        }
    }, [currentSong]);

    const handleTogglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handlePlaySong = (song) => {
        if (currentSong?._id === song._id) {
            handleTogglePlay();
        } else {
            setCurrentSong(song);
            setIsPlaying(true);
        }
    };

    const handleNext = () => {
        const currentIndex = likedSongs.findIndex(s => s._id === currentSong?._id);
        if (currentIndex < likedSongs.length - 1) {
            handlePlaySong(likedSongs[currentIndex + 1]);
        }
    };

    const handlePrev = () => {
        const currentIndex = likedSongs.findIndex(s => s._id === currentSong?._id);
        if (currentIndex > 0) {
            handlePlaySong(likedSongs[currentIndex - 1]);
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

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleUnlike = async (songId, e) => {
        if (e) e.stopPropagation();
        try {
            const res = await likeSong(songId);
            if (res.success && res.message !== "song liked") {
                const newList = likedSongs.filter(s => s._id !== songId);
                setLikedSongs(newList);
                if (currentSong?._id === songId) {
                    if (newList.length > 0) setCurrentSong(newList[0]);
                    else setCurrentSong(null);
                }
            }
        } catch (err) {
            console.error("Unlike failed:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-6"></div>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Library...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row font-['Inter',sans-serif] overflow-hidden">
            <audio 
                ref={audioRef} 
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleNext}
                onPlay={() => setIsPlaying(true)} 
                onPause={() => setIsPlaying(false)}
            />

            {/* Left Side: Big Player Control */}
            <div className="w-full lg:w-[45%] h-full lg:h-screen p-8 lg:p-12 flex flex-col bg-gradient-to-br from-red-950/20 to-black border-r border-white/5 sticky top-0">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12 group w-fit"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Back to Discovery</span>
                </button>

                {currentSong ? (
                    <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
                        <div className="relative aspect-square mb-10 group overflow-hidden rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                            <img 
                                src={currentSong.thumbnail} 
                                alt={currentSong.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                            />
                            {isPlaying && (
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
                        </div>

                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-5xl lg:text-6xl font-black tracking-tighter italic uppercase mb-2 truncate">{currentSong.title}</h2>
                            <p className="text-red-500 font-black uppercase tracking-[0.3em] text-sm">
                                {currentSong.artist.join(" • ")}
                            </p>
                        </div>

                        <div className="space-y-8 bg-white/5 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md">
                            <div className="space-y-2">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={duration || 0} 
                                    value={currentTime} 
                                    onChange={handleSeek}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600"
                                />
                                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button className="text-gray-500 hover:text-white transition-colors"><Share2 size={20}/></button>
                                <div className="flex items-center gap-8">
                                    <button onClick={handlePrev} className="text-white/60 hover:text-white transition-all hover:scale-110 active:scale-95"><SkipBack size={32} fill="currentColor" /></button>
                                    <button 
                                        onClick={handleTogglePlay}
                                        className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all"
                                    >
                                        {isPlaying ? <Pause fill="white" size={32} /> : <Play fill="white" size={32} className="ml-1" />}
                                    </button>
                                    <button onClick={handleNext} className="text-white/60 hover:text-white transition-all hover:scale-110 active:scale-95"><SkipForward size={32} fill="currentColor" /></button>
                                </div>
                                <button onClick={() => handleUnlike(currentSong._id)} className="text-red-600 hover:scale-110 transition-all"><Heart size={24} fill="currentColor" /></button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <Music className="text-gray-800 mb-6" size={80} />
                        <h3 className="text-2xl font-black uppercase italic text-gray-500">Your heart is quiet</h3>
                        <p className="text-gray-600 font-bold max-w-xs mt-2">Go discover some tracks and add them to your collection.</p>
                    </div>
                )}
            </div>

            {/* Right Side: Liked List */}
            <div className="flex-1 h-screen overflow-y-auto custom-scrollbar p-8 lg:p-20 bg-black">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em] mb-4 block">Your frequency</span>
                            <h1 className="text-6xl font-black tracking-tighter italic uppercase">Liked <span className="text-red-600 not-italic">Library</span></h1>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-black text-red-600 leading-none">{likedSongs.length}</p>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Tracks Total</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {likedSongs.map((song, index) => {
                            if (!song) return null;
                            return (
                                <div 
                                    key={song._id}
                                    onClick={() => handlePlaySong(song)}
                                    className={`group flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer ${currentSong?._id === song._id ? 'bg-red-600/10 border-red-600/30' : 'bg-[#0a0a0a] border-white/5 hover:border-red-600/20 hover:bg-white/[0.02]'}`}
                                >
                                    <div className="text-gray-600 font-black text-xs w-6 group-hover:text-red-600 transition-colors">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>
                                    
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl relative shrink-0">
                                        <img src={song.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        {currentSong?._id === song._id && isPlaying && (
                                            <div className="absolute inset-0 bg-red-600/20 backdrop-blur-[1px] flex items-center justify-center">
                                                <div className="flex gap-1 items-end h-full py-4">
                                                    <div className="w-1 bg-white animate-music-bar-1"></div>
                                                    <div className="w-1 bg-white animate-music-bar-2"></div>
                                                    <div className="w-1 bg-white animate-music-bar-3"></div>
                                                    <div className="w-1 bg-white animate-music-bar-1"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-black text-lg truncate ${currentSong?._id === song._id ? 'text-red-500' : 'group-hover:text-red-500'} transition-colors`}>{song.title}</h4>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{song.artist?.join(", ")}</p>
                                    </div>

                                    <div className="hidden md:flex items-center gap-8 text-[10px] font-black text-gray-500 uppercase tracking-widest shrink-0">
                                        <span className="flex items-center gap-1.5"><Clock size={12} /> 3:45</span>
                                        <button 
                                            onClick={(e) => handleUnlike(song._id, e)}
                                            className="text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:scale-125"
                                        >
                                            <Heart size={16} fill="currentColor" />
                                        </button>
                                    </div>
                                    <MoreHorizontal className="text-gray-700 hover:text-white transition-colors" size={20} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>
    );
}
