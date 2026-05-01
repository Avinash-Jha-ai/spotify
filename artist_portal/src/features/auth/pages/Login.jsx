import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await handleLogin(formData);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black font-['Inter',sans-serif]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover opacity-60"
        style={{ mixBlendMode: 'screen' }}
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-stage-lights-flashing-in-the-dark-1111-large.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <div className="relative z-10 w-full max-w-md p-10 mx-4 bg-[#1a1a1a]/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(255,0,50,0.1)] animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">NOCTURNE <span className="text-red-600 not-italic">ARTISTS</span></h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Backstage access</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              placeholder="artist@nocturne.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-lg shadow-[0_0_25px_rgba(255,0,0,0.4)] transition-all transform hover:scale-[1.02] active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Entering backstage...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-gray-400 text-sm">
            New here?{' '}
            <Link to="/register" className="text-red-500 hover:text-red-400 font-bold transition-colors">
              Create Artist Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
