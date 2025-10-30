import React from 'react';
import { Search } from 'lucide-react';

interface User {
  email: string;
}

type Screen = 'home' | 'player' | 'admin';

interface HeaderProps {
    activeScreen: Screen;
    onNavigate: (screen: Screen) => void;
    currentUser: User | null;
    isAuthorizedAdmin: boolean;
    onSignOut: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const CricketIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-accent"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0z" />
    <path d="m22 2-6 6" />
    <path d="m13 13-1.5 1.5" />
    <path d="M14 11.5 16 14" />
  </svg>
);

const NavLink: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`font-semibold text-lg transition-colors duration-200 ${isActive ? 'text-accent' : 'text-gray-300 hover:text-white'}`}
    >
        {label}
    </button>
);

const Header: React.FC<HeaderProps> = ({ activeScreen, onNavigate, currentUser, isAuthorizedAdmin, onSignOut, searchQuery, setSearchQuery }) => {
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (activeScreen !== 'home') {
        onNavigate('home');
    }
  }

  return (
    <header className="bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Side: Logo & Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <CricketIcon />
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Cricket<span className="text-accent">Stream</span>
            </h1>
          </div>
          
          {/* Right Side: Navigation & User Profile */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <NavLink label="Home" isActive={activeScreen === 'home' || activeScreen === 'player'} onClick={() => onNavigate('home')} />
            
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text"
                    placeholder="Search streams..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="bg-slate-800/70 border border-slate-700 rounded-full py-2 pl-10 pr-4 w-40 md:w-64 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                />
            </div>

            {isAuthorizedAdmin && currentUser ? (
              <div className="flex items-center space-x-4">
                 <span className="font-semibold text-white hidden sm:block truncate max-w-[150px]" title={currentUser.email}>{currentUser.email}</span>
                 <button
                    onClick={() => onNavigate('admin')}
                    className={`font-bold py-2 px-4 rounded-lg border-2 transition-colors duration-300 text-sm ${activeScreen === 'admin' ? 'bg-accent text-black border-accent' : 'border-accent/50 text-accent hover:bg-accent hover:text-black'}`}
                 >
                    Admin Panel
                 </button>
                 <button 
                    onClick={onSignOut}
                    className="font-bold py-2 px-4 rounded-lg border-2 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-300 text-sm"
                 >
                    Sign Out
                 </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('admin')} 
                className={`font-bold py-2 px-5 rounded-lg border-2 transition-colors duration-300 ${activeScreen === 'admin' ? 'bg-accent text-black border-accent' : 'border-accent/50 text-accent hover:bg-accent hover:text-black'}`}
              >
                Account
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;