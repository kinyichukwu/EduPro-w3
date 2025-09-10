import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabaseClient';

export default function Callback() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { initialize } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback process...');
        
        // Check for error in URL params first
        const errorParam = searchParams[0].get('error');
        const errorDescription = searchParams[0].get('error_description');
        
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setError(errorDescription ?? errorParam);
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login?error=oauth_failed');
          }, 2000);
          return;
        }

        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login?error=session_error');
          }, 2000);
          return;
        }

        if (sessionData.session) {
          console.log('Session found, initializing auth store...');
          
          // Initialize the auth store
          initialize();
          
          // Wait a moment for the store to update, then navigate
          setTimeout(() => {
            console.log('Navigating to dashboard...');
            setIsProcessing(false);
            // Use window.location.href for a hard navigation to avoid middleware timing issues
            window.location.href = '/dashboard/chats';
          }, 1000);
        } else {
          console.log('No session found, waiting for auth state change...');
          
          // Set up auth state listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state change in callback:', event, session);
            
            if (event === 'SIGNED_IN' && session) {
              console.log('User signed in, updating store and navigating...');
              initialize();
              subscription.unsubscribe();
              
              setTimeout(() => {
                setIsProcessing(false);
                window.location.href = '/dashboard';
              }, 1000);
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out during callback');
              subscription.unsubscribe();
              setError('Authentication failed');
              setIsProcessing(false);
              setTimeout(() => {
                navigate('/login?error=signed_out');
              }, 2000);
            }
          });

          // Set a timeout to prevent infinite waiting
          setTimeout(() => {
            console.log('Callback timeout reached');
            subscription.unsubscribe();
            if (isProcessing) {
              setError('Authentication timeout');
              setIsProcessing(false);
              setTimeout(() => {
                navigate('/login?error=timeout');
              }, 2000);
            }
          }, 10000);
        }
      } catch (error) {
        console.error('Callback error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login?error=callback_error');
        }, 2000);
      }
    };

    void handleAuthCallback();
  }, [navigate, initialize, searchParams, isProcessing]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
      {error ? (
        <>
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">Authentication Error</p>
          <p className="text-white/90 mt-2">{error}</p>
          <p className="text-sm text-white/50 mt-4">Redirecting to login...</p>
        </>
      ) : (
        <>
          <div className="flex mt-8 gap-x-2 justify-center items-center mb-6">
            <div className="w-3 h-3 bg-turbo-indigo rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-turbo-indigo rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-turbo-indigo rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="mt-4 text-white/90 text-xl font-semibold">
            {isProcessing ? 'Completing authentication...' : 'Redirecting to dashboard...'}
          </p>
        </>
      )}
    </div>
  );
}