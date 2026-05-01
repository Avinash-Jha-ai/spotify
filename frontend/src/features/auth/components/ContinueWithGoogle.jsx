import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../../configs/firebase.config';
import { useAuth } from '../hooks/useAuth';

const ContinueWithGoogle = () => {
    const [loading, setLoading] = useState(false);
    const { handleSocialLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Extract the required fields for backend
            const payload = {
                email: user.email,
                username: user.displayName,
                avatar: user.photoURL,
                googleId: user.uid
            };

            await handleSocialLogin(payload);
            navigate('/'); // Redirect to dashboard or home
        } catch (error) {
            console.error("Google Auth Error:", error);
            // Handle error, optionally show a toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            className="group flex items-center justify-center w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ letterSpacing: '0.02em' }}
        >
            <div className="flex items-center justify-center bg-white rounded-sm p-1 mr-3 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
            </div>
            <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
        </button>
    );
}

export default ContinueWithGoogle;