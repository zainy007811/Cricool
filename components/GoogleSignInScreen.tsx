
import React, { useState } from 'react';
import { ShieldIcon } from './PlayerIcons';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../constants';

interface GoogleSignInScreenProps {
  onSignIn: (email: string) => void;
}

const GoogleSignInScreen: React.FC<GoogleSignInScreenProps> = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setError('');
      onSignIn(email);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const inputClasses = "w-full bg-slate-800 p-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-white";

  return (
    <div className="flex flex-col items-center justify-center h-full text-center pt-20 animate-fade-in">
      <div className={`bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-2xl shadow-accent/10 max-w-md w-full ${error ? 'animate-shake' : ''}`}>
        <ShieldIcon size={48} className="mx-auto text-accent mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Admin Sign In</h1>
        <p className="text-gray-400 mb-8">Enter your credentials to manage streams.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className={inputClasses}
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={inputClasses}
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-dark font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg text-black"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoogleSignInScreen;
