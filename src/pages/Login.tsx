import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';

export default function Login() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={from} replace />;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email || password.length < 6) {
      setError('Use a valid email and a password of at least 6 characters');
      return;
    }
    setBusy(true);
    try {
      if (isSignUp) {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setInfo('Account created. You can sign in now.');
        setIsSignUp(false);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <img src="/images/hero-bazaar.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#07040d]/50" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="font-display text-3xl xl:text-4xl">Step into the night bazaar.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-xs tracking-[0.3em] uppercase text-amber-300/80">Member gate</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-2">{isSignUp ? 'Create a pass' : 'Welcome back'}</h1>
          <p className="text-sm text-stone-500 mt-3">Demo: demo@ottbazaar.in / password123</p>
          <form onSubmit={handleEmailAuth} className="mt-8 space-y-4">
            {error && <p className="text-rose-300 text-sm">{error}</p>}
            {info && <p className="text-emerald-300 text-sm">{info}</p>}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#14101c] border border-white/10 rounded-xl px-4 py-3"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#14101c] border border-white/10 rounded-xl px-4 py-3"
            />
            <button disabled={busy} className="w-full rounded-full bg-amber-400 text-[#1a1208] py-3 font-semibold disabled:opacity-50">
              {busy ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </form>
          <div className="my-5 text-center text-stone-500 text-sm">or</div>
          <button
            onClick={() => signInWithGoogle('OttBazaar')}
            className="w-full rounded-full border border-white/15 py-3 hover:border-amber-300/40"
          >
            Continue with Google
          </button>
          <button onClick={() => setIsSignUp(!isSignUp)} className="mt-6 text-sm text-stone-400 w-full">
            {isSignUp ? 'Already have a pass? Sign in' : 'New to the bazaar? Create a pass'}
          </button>
        </div>
      </div>
    </div>
  );
}
