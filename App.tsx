
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import LiveStreamPlayer from './components/LiveStreamPlayer';
import StreamCard from './components/StreamCard';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import GoogleSignInScreen from './components/GoogleSignInScreen';
import { STREAMS } from './constants';
import type { Stream } from './types';

type Screen = 'home' | 'player' | 'admin';

interface User {
  email: string;
}

const VERCEL_DEPLOY_HOOK_URL = "https://api.vercel.com/v1/integrations/deploy/prj_VhbCfTr9g6Fq1JqbXG2tH2Ni5tdZ/9ATtqTyRU9";

const triggerVercelDeploy = () => {
  fetch(VERCEL_DEPLOY_HOOK_URL, { method: "POST" })
    .then(res => {
      if (res.ok) {
        console.log("Vercel deployment triggered successfully.");
      } else {
        res.json().then(err => {
            console.error("Failed to trigger Vercel deployment.", err);
            alert(`Failed to trigger site update. Vercel said: ${err?.error?.message || 'Unknown Error'}`);
        }).catch(() => {
            alert(`Failed to trigger site update and could not parse Vercel's error response.`);
        });
      }
    })
    .catch(err => {
        console.error("Error triggering Vercel deployment:", err);
        alert('An error occurred while trying to trigger the site update.');
    });
};

// FIX: Add `style` prop to allow for inline styling, which is used for animations.
const CricketBallIcon: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="url(#ballGradient)" stroke="#fff" strokeWidth="2"/>
    <defs>
      <radialGradient id="ballGradient" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#ff4d4d"/>
        <stop offset="100%" stopColor="#b30000"/>
      </radialGradient>
    </defs>
    <path d="M 50 2 A 48 48 0 0 0 50 98" stroke="#ffffff" strokeWidth="3" strokeDasharray="8 8" fill="none"/>
    <path d="M 2 50 A 48 48 0 0 0 98 50" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none"/>
  </svg>
);

const FloatingElements: React.FC = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden">
        <CricketBallIcon className="absolute top-[10%] left-[5%] w-24 h-24 opacity-10 animate-float" style={{ animationDuration: '20s' }} />
        <CricketBallIcon className="absolute top-[70%] left-[80%] w-16 h-16 opacity-5 animate-float" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
    </div>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
    </div>
);

const App: React.FC = () => {
  const [dbUrl, setDbUrl] = useState<string | null>(() => localStorage.getItem('streamsDbUrl'));
  const [streams, setStreams] = useState<Stream[]>(STREAMS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startUnmuted, setStartUnmuted] = useState(false);
  
  // Fetch streams on initial load or when the DB URL changes
  useEffect(() => {
    const fetchStreams = async () => {
      setIsLoading(true);
      if (dbUrl) {
        try {
          const response = await fetch(dbUrl);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setStreams(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to fetch streams:", error);
          alert("Error loading streams from the remote source. Please check the URL in the Admin Panel.");
          setStreams([]);
        }
      } else {
        // Fallback to localStorage if no DB URL
        try {
          const savedStreams = localStorage.getItem('cricketStreams');
          setStreams(savedStreams ? JSON.parse(savedStreams) : STREAMS);
        } catch (error) {
          console.error("Failed to load streams from localStorage:", error);
          setStreams(STREAMS);
        }
      }
      setIsLoading(false);
    };
    fetchStreams();
  }, [dbUrl]);

  const saveStreams = useCallback(async (updatedStreams: Stream[]) => {
      if (dbUrl) {
          try {
              const response = await fetch(dbUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedStreams),
              });
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              // On successful save, trigger a new deployment
              triggerVercelDeploy();
          } catch (error) {
              console.error("Failed to save streams:", error);
              alert("Error saving streams. Changes may not be visible on other devices.");
          }
      } else {
          localStorage.setItem('cricketStreams', JSON.stringify(updatedStreams));
      }
  }, [dbUrl]);

  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    if (userEmail) {
      setCurrentUser({ email: userEmail });
      setIsAuthorizedAdmin(true);
    }
  }, []);
  
  const handleSignIn = useCallback((email: string) => {
    const profile: User = { email };
    setCurrentUser(profile);
    sessionStorage.setItem('userEmail', email);
    setIsAuthorizedAdmin(true);
    setActiveScreen('admin');
  }, []);

  const handleSignOut = useCallback(() => {
    setCurrentUser(null);
    setIsAuthorizedAdmin(false);
    sessionStorage.removeItem('userEmail');
    setActiveScreen('home');
  }, []);

  const handleNavigate = (screen: Screen) => {
    if (screen !== 'player') {
      setSelectedStream(null);
    }
    if (screen === 'home') {
      setSearchQuery('');
    }
    setActiveScreen(screen);
  };

  const handleSelectStream = (stream: Stream, unmute: boolean = false) => {
    setSelectedStream(stream);
    setStartUnmuted(unmute);
    setActiveScreen('player');
  };

  const handleAddStream = (stream: Omit<Stream, 'id'>) => {
    const newStream: Stream = { ...stream, id: Date.now() };
    const updatedStreams = [...streams, newStream];
    setStreams(updatedStreams);
    saveStreams(updatedStreams);
  };

  const handleUpdateStream = (updatedStream: Stream) => {
    const updatedStreams = streams.map(s => (s.id === updatedStream.id ? updatedStream : s));
    setStreams(updatedStreams);
    saveStreams(updatedStreams);
    if (selectedStream && selectedStream.id === updatedStream.id) {
      setSelectedStream(updatedStream);
    }
  };

  const handleDeleteStream = (streamId: number) => {
    const updatedStreams = streams.filter(s => s.id !== streamId);
    setStreams(updatedStreams);
    saveStreams(updatedStreams);
  };
  
  const handleSetDbUrl = (url: string) => {
    localStorage.setItem('streamsDbUrl', url);
    setDbUrl(url);
  };
  
  const filteredStreams = useMemo(() => {
    if (!searchQuery) return streams;
    return streams.filter(stream => 
      stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.channelName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [streams, searchQuery]);
  
  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        if (isLoading) return <LoadingSpinner />;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" style={{ perspective: '1000px' }}>
            {filteredStreams.map(stream => (
              <StreamCard key={stream.id} stream={stream} onSelect={handleSelectStream} />
            ))}
            {filteredStreams.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-400">
                    <h2 className="text-2xl font-bold">No streams found</h2>
                    <p>{searchQuery ? "Try adjusting your search query." : "Add some streams in the Admin Panel."}</p>
                </div>
            )}
          </div>
        );
      case 'player':
        return selectedStream ? (
            <div className="max-w-5xl mx-auto animate-fade-in">
                <LiveStreamPlayer stream={selectedStream} startUnmuted={startUnmuted} />
            </div>
        ) : null;
      case 'admin':
        if (isAuthorizedAdmin) {
            return (
              <div className="max-w-4xl mx-auto animate-fade-in">
                <AdminPanel
                  streams={streams}
                  onAddStream={handleAddStream}
                  onUpdateStream={handleUpdateStream}
                  onDeleteStream={handleDeleteStream}
                  onSignOut={handleSignOut}
                  dbUrl={dbUrl}
                  onSetDbUrl={handleSetDbUrl}
                />
              </div>
            );
        }
        return <GoogleSignInScreen onSignIn={handleSignIn} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-stadium bg-cover bg-fixed bg-center text-white min-h-screen font-sans relative isolate">
      <div className="absolute inset-0 bg-[#05080f]/90 -z-20"></div>
      <FloatingElements />
      <Header 
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        isAuthorizedAdmin={isAuthorizedAdmin}
        onSignOut={handleSignOut}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;
