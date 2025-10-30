
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    PlayIcon, PauseIcon, BackArrowIcon, CastIcon, RewindIcon, ForwardIcon, LockIcon, UnlockIcon, 
    SettingsIcon, BrightnessIcon, CheckIcon, VolumeUpIcon, VolumeOffIcon,
    FullscreenEnterIcon, FullscreenExitIcon, PictureInPictureIcon
} from './PlayerIcons';

declare const Hls: any;
declare const cast: any;
declare const chrome: any;

// FIX: Declare the google-cast-launcher custom element to make it known to TypeScript's JSX.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'google-cast-launcher': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface ProfessionalHlsPlayerProps {
  src: string;
  title: string;
  startUnmuted?: boolean;
}

const formatTime = (timeInSeconds: number) => {
  if (!isFinite(timeInSeconds)) return '00:00';
  const date = new Date(timeInSeconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
};

const ProfessionalHlsPlayer: React.FC<ProfessionalHlsPlayerProps> = ({ src, title, startUnmuted = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [levels, setLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [brightness, setBrightness] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(!startUnmuted);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16 / 9');
  const [isLive, setIsLive] = useState(false);
  const [isBehindLive, setIsBehindLive] = useState(false);
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState(-1);
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castDeviceName, setCastDeviceName] = useState('');
  const [isInPiP, setIsInPiP] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(false);
  
  const remotePlayer = useRef<any>(null);
  const remotePlayerController = useRef<any>(null);

  // --- CAST SDK INITIALIZATION ---
  useEffect(() => {
    window['__onGCastApiAvailable'] = (isAvailable) => {
      if (isAvailable) {
        const castContext = cast.framework.CastContext.getInstance();
        castContext.setOptions({
          receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });
        setIsCastAvailable(true);
        remotePlayer.current = new cast.framework.RemotePlayer();
        remotePlayerController.current = new cast.framework.RemotePlayerController(remotePlayer.current);
        
        const eventHandler = (e: any) => {
          if (e.field === 'playerState' && e.value) setIsPlaying(e.value === 'PLAYING' || e.value === 'BUFFERING');
          if (e.field === 'currentTime' && e.value) setCurrentTime(e.value);
          if (e.field === 'duration' && e.value) setDuration(e.value);
          if (e.field === 'volumeLevel' && e.value) setVolume(e.value);
          if (e.field === 'isMuted' && e.value !== null) setIsMuted(e.value);
        };

        remotePlayerController.current.addEventListener('playerStateChanged', eventHandler);
        remotePlayerController.current.addEventListener('currentTimeChanged', eventHandler);
        remotePlayerController.current.addEventListener('durationChanged', eventHandler);
        remotePlayerController.current.addEventListener('volumeLevelChanged', eventHandler);
        remotePlayerController.current.addEventListener('isMutedChanged', eventHandler);
        
        castContext.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event: any) => {
            if (event.sessionState === 'SESSION_STARTED' || event.sessionState === 'SESSION_RESUMED') {
                setIsCasting(true);
                setCastDeviceName(castContext.getCurrentSession().getCastDevice().friendlyName);
            } else if (event.sessionState === 'SESSION_ENDED') {
                setIsCasting(false);
                setCastDeviceName('');
            }
        });
      }
    };
    return () => {
        // Cleanup listeners if component unmounts
        if (remotePlayerController.current) {
            remotePlayerController.current.removeEventListener('playerStateChanged');
        }
    }
  }, []);

  const loadMediaForCast = useCallback(() => {
    const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (!castSession) return;
    const mediaInfo = new chrome.cast.media.MediaInfo(src, 'application/x-mpegURL');
    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = title;
    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    castSession.loadMedia(request).then(() => {
        console.log('Media loaded successfully on Chromecast');
        setIsCasting(true);
    }).catch((error: any) => console.error('Error loading media on Chromecast', error));
  }, [src, title]);

  useEffect(() => {
      if (isCasting) {
          loadMediaForCast();
      }
  }, [isCasting, loadMediaForCast]);
    
  // --- HLS & VIDEO ELEMENT SETUP ---
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(videoElement);
      hls.on('hlsMediaAttached', () => {
        videoElement.muted = isMuted;
        videoElement.volume = volume;
      });
      hls.on('hlsManifestParsed', (event, data) => {
        setIsLive(data.details.live);
        if (data.levels) setLevels(data.levels);
        if (hls.subtitleTracks.length) {
            setSubtitleTracks(hls.subtitleTracks);
            const browserLang = navigator.language.split('-')[0];
            const matchingTrack = hls.subtitleTracks.findIndex((track: any) => track.lang && track.lang.includes(browserLang));
            if (matchingTrack !== -1) {
                hls.subtitleTrack = matchingTrack;
                setCurrentSubtitleTrack(matchingTrack);
            }
        }
      });
      hls.on('hlsFragBuffering', () => setIsBuffering(true));
      hls.on('hlsFragBuffered', () => setIsBuffering(false));
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = src;
    }

    const handleTimeUpdate = () => {
      if (!isSeeking && videoRef.current) setCurrentTime(videoRef.current.currentTime);
    };
    const handleDurationChange = () => setDuration(videoElement.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleMetadata = () => {
        const { videoWidth, videoHeight } = videoElement;
        if (videoWidth > 0 && videoHeight > 0) setAspectRatio(`${videoWidth} / ${videoHeight}`);
    };
    const handleEnterPiP = () => setIsInPiP(true);
    const handleLeavePiP = () => setIsInPiP(false);
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('loadedmetadata', handleMetadata);
    videoElement.addEventListener('enterpictureinpicture', handleEnterPiP);
    videoElement.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('loadedmetadata', handleMetadata);
      videoElement.removeEventListener('enterpictureinpicture', handleEnterPiP);
      videoElement.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [src, isSeeking]);
  
  // --- CONTROLS VISIBILITY ---
  const hideControls = useCallback(() => {
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if ((isPlaying || isCasting) && !isSettingsOpen && !showVolumeSlider) setAreControlsVisible(false);
    }, 3000);
  }, [isPlaying, isCasting, isSettingsOpen, showVolumeSlider]);

  const showControls = useCallback(() => {
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    setAreControlsVisible(true);
    hideControls();
  }, [hideControls]);

  useEffect(() => {
    const container = playerContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', showControls);
      container.addEventListener('mouseleave', () => {
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if ((isPlaying || isCasting) && !isLocked && !isSettingsOpen) setAreControlsVisible(false);
      });
    }
    showControls();
    return () => {
      if (container) container.removeEventListener('mousemove', showControls);
    };
  }, [isPlaying, isCasting, isLocked, isSettingsOpen, showControls]);
  
  // --- LIVE STREAM STATUS ---
  useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const interval = setInterval(() => {
          if (!video.paused && hlsRef.current && isLive) {
              const liveSyncPosition = hlsRef.current.liveSyncPosition;
              if (typeof liveSyncPosition === 'number') {
                  setIsBehindLive(liveSyncPosition - video.currentTime > 15);
              }
          } else if (!isLive) {
              setIsBehindLive(false);
          }
      }, 2000);

      return () => clearInterval(interval);
  }, [isLive, isPlaying]);

  // --- PLAYER ACTIONS ---
  const togglePlayPause = useCallback(() => {
    if (isCasting) {
      remotePlayerController.current.playOrPause();
      return;
    }
    if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    }
  }, [isCasting]);
  
  const handleSeekPointerDown = () => setIsSeeking(true);
  
  const handleSeekPointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
    const seekTime = parseFloat((e.target as HTMLInputElement).value);
    if (isCasting) {
        remotePlayer.current.currentTime = seekTime;
        remotePlayerController.current.seek();
    } else if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
    setIsSeeking(false);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => setCurrentTime(parseFloat(e.target.value));
  
  const handleRewind = useCallback(() => { 
    if (isCasting) {
        remotePlayer.current.currentTime = Math.max(0, remotePlayer.current.currentTime - 10);
        remotePlayerController.current.seek();
    } else if (videoRef.current) {
        videoRef.current.currentTime -= 10;
    }
  }, [isCasting]);

  const handleForward = useCallback(() => { 
    if (isCasting) {
        remotePlayer.current.currentTime = Math.min(remotePlayer.current.duration, remotePlayer.current.currentTime + 10);
        remotePlayerController.current.seek();
    } else if (videoRef.current) {
        videoRef.current.currentTime += 10;
    }
  }, [isCasting]);

  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  
  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    if (!document.pictureInPictureEnabled) {
      console.warn('Picture-in-Picture is not supported by your browser.');
      return;
    }
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Error handling Picture-in-Picture:', error);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    if (isCasting) {
        remotePlayerController.current.muteOrUnmute();
    } else if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
    setIsMuted(newMuted);
  }, [isCasting, isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (isCasting) {
        remotePlayer.current.volumeLevel = newVolume;
        remotePlayerController.current.setVolumeLevel();
    } else if (videoRef.current) {
        videoRef.current.volume = newVolume;
        videoRef.current.muted = newVolume === 0;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleLevelChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      setIsDataSaver(false);
      setIsSettingsOpen(false);
    }
  };
  
  const toggleDataSaver = () => {
    const newIsDataSaver = !isDataSaver;
    setIsDataSaver(newIsDataSaver);
    if (hlsRef.current) {
      if (newIsDataSaver) {
        hlsRef.current.currentLevel = 0; // Index 0 is assumed to be the lowest quality
        setCurrentLevel(0);
      } else {
        hlsRef.current.currentLevel = -1; // Back to Auto
        setCurrentLevel(-1);
      }
    }
    setIsSettingsOpen(false);
  };

  const handleSubtitleChange = (trackIndex: number) => {
      if (hlsRef.current) {
          hlsRef.current.subtitleTrack = trackIndex;
          setCurrentSubtitleTrack(trackIndex);
      }
      setIsSettingsOpen(false);
  };
  
  const goToLive = useCallback(() => {
      if (videoRef.current && hlsRef.current?.liveSyncPosition) {
          videoRef.current.currentTime = hlsRef.current.liveSyncPosition;
      }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return;
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlayPause(); break;
        case 'KeyF': e.preventDefault(); toggleFullscreen(); break;
        case 'KeyP': e.preventDefault(); togglePiP(); break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
        case 'ArrowRight': e.preventDefault(); handleForward(); break;
        case 'ArrowLeft': e.preventDefault(); handleRewind(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, togglePlayPause, toggleFullscreen, togglePiP, toggleMute, handleForward, handleRewind]);
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const accentColor = '#00ff88';

  return (
    <div ref={playerContainerRef} className="relative w-full bg-black group select-none" style={{ aspectRatio }} onMouseMove={showControls} onClick={() => isLocked ? setIsLocked(false) : showControls()}>
      <video ref={videoRef} className={`w-full h-full ${isCasting ? 'opacity-0' : ''}`} style={{ filter: `brightness(${brightness})` }} onClick={(e) => { e.stopPropagation(); if (!isLocked) togglePlayPause(); }} playsInline autoPlay />
      
      {isCasting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-20">
              <CastIcon size={64} />
              <p className="mt-4 text-xl font-bold">Casting to {castDeviceName}</p>
              <p className="text-gray-400">{title}</p>
          </div>
      )}

      {isBuffering && !isCasting && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><div className="w-12 h-12 border-4 border-white/50 border-t-white rounded-full animate-spin"></div></div>}
      
      <div className={`absolute inset-0 text-white transition-opacity duration-300 ${areControlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <button onClick={(e) => { e.stopPropagation(); setIsLocked(false); }} className="p-4 bg-black/50 rounded-full"><UnlockIcon /></button>
          </div>
        )}
        {!isLocked && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
              <div className="flex items-center space-x-4"><button><BackArrowIcon /></button><span className="text-sm font-semibold bg-black/30 border border-white/30 rounded-full px-3 py-1">{title}</span></div>
              {/* FIX: Cast style prop to allow CSS custom properties and satisfy TypeScript. */}
              {isCastAvailable && <google-cast-launcher style={{ width: '24px', height: '24px', '--cast-button-color': 'white' } as React.CSSProperties}></google-cast-launcher>}
            </div>

            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-2 p-4 z-10">
                <BrightnessIcon />
                <input type="range" min="0.5" max="1.5" step="0.1" value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer range-sm vertical-slider" onClick={(e) => e.stopPropagation()} />
            </div>
            <style>{`.vertical-slider {-webkit-appearance: slider-vertical; writing-mode: bt-lr;}`}</style>

            <div className="absolute inset-0 flex items-center justify-center space-x-12 z-10">
              <button onClick={(e) => { e.stopPropagation(); handleRewind(); }}><RewindIcon /></button>
              <button onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} className="p-2">{isPlaying ? <PauseIcon large /> : <PlayIcon large />}</button>
              <button onClick={(e) => { e.stopPropagation(); handleForward(); }}><ForwardIcon /></button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              <input type="range" min="0" max={duration || 0} value={currentTime} 
                  onPointerDown={handleSeekPointerDown} onPointerUp={handleSeekPointerUp} onChange={handleScrub}
                  className="w-full h-1.5 bg-transparent rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, ${accentColor} ${progress}%, rgba(255, 255, 255, 0.3) ${progress}%)` }} onClick={(e) => e.stopPropagation()} />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-4">
                  <button onClick={(e) => { e.stopPropagation(); setIsLocked(true); }} className="flex items-center space-x-2 text-sm"><LockIcon /><span>Screen Lock</span></button>
                </div>
                <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2 text-sm font-mono">
                       {isLive && isBehindLive && <button onClick={goToLive} className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">LIVE</button>}
                       <span>{formatTime(currentTime)}</span> / <span>{isLive ? 'Live' : formatTime(duration)}</span>
                   </div>
                   <div className="relative">
                       <button onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(prev => !prev); }}><SettingsIcon /></button>
                       {isSettingsOpen && (
                         <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-md rounded-lg p-2 min-w-[240px] border border-white/20">
                           <h4 className="text-sm font-bold px-2 py-1 mb-1">Video Quality</h4>
                           <ul>
                             <li onClick={() => handleLevelChange(-1)} className="flex justify-between items-center text-sm hover:bg-white/10 rounded px-2 py-1 cursor-pointer">Auto {currentLevel === -1 && !isDataSaver && <CheckIcon />}</li>
                             {levels.map((level, index) => (<li key={level.height} onClick={() => handleLevelChange(index)} className="flex justify-between items-center text-sm hover:bg-white/10 rounded px-2 py-1 cursor-pointer">{level.height}p {currentLevel === index && !isDataSaver && <CheckIcon />}</li>))}
                           </ul>
                           <div className="h-px bg-white/20 my-2"></div>
                           <h4 className="text-sm font-bold px-2 py-1 mb-1">Playback</h4>
                            <ul>
                               <li onClick={toggleDataSaver} className="flex justify-between items-center text-sm hover:bg-white/10 rounded px-2 py-1 cursor-pointer">Data Saver (Lowest Quality) {isDataSaver && <CheckIcon />}</li>
                            </ul>
                           {subtitleTracks.length > 0 && <><div className="h-px bg-white/20 my-2"></div><h4 className="text-sm font-bold px-2 py-1 mb-1">Subtitles</h4></>}
                           <ul>
                             <li onClick={() => handleSubtitleChange(-1)} className="flex justify-between items-center text-sm hover:bg-white/10 rounded px-2 py-1 cursor-pointer">Off {currentSubtitleTrack === -1 && <CheckIcon />}</li>
                             {subtitleTracks.map((track, index) => (<li key={track.id} onClick={() => handleSubtitleChange(index)} className="flex justify-between items-center text-sm hover:bg-white/10 rounded px-2 py-1 cursor-pointer">{track.name} {currentSubtitleTrack === index && <CheckIcon />}</li>))}
                           </ul>
                         </div>
                       )}
                   </div>
                   <div className="relative flex items-center" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
                        <button onClick={(e) => { e.stopPropagation(); toggleMute(); }}>{isMuted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}</button>
                        <div className={`transition-all duration-300 overflow-hidden ${showVolumeSlider ? 'w-24 ml-2' : 'w-0'}`}>
                           <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" style={{ accentColor: accentColor }} onClick={(e) => e.stopPropagation()} />
                        </div>
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); togglePiP(); }}><PictureInPictureIcon /></button>
                   <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}>{isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfessionalHlsPlayer;
