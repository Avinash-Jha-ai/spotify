import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function Protected({ children }) {
    const { user, loading } = useSelector(state => state.auth);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== 'artist') {
        // If not an artist, maybe they should be redirected or logged out
        return <Navigate to="/login" />;
    }

    return children;
}
