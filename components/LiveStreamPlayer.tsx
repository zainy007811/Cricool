import React from 'react';
import type { Stream } from '../types';
import ProfessionalHlsPlayer from './ProfessionalHlsPlayer';

interface LiveStreamPlayerProps {
  stream: Stream;
  startUnmuted: boolean;
}

const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({ stream, startUnmuted }) => {
  
  let playerUrl = stream.url;
  if (stream.streamType === 'youtube') {
    try {
      const url = new URL(stream.url);
      const params = url.searchParams;

      if (startUnmuted) {
        // To play unmuted, browser policies often require user interaction, so we remove autoplay.
        params.delete('mute');
        params.delete('autoplay');
      } else {
        params.set('autoplay', '1');
        params.set('mute', '1');
      }
      url.search = params.toString();
      playerUrl = url.toString();
    } catch (e) {
      console.error("Failed to parse stream URL:", e);
      // Fallback to original URL if parsing fails
      playerUrl = stream.url;
    }
  }

  return (
    <div>
      <div className="overflow-hidden bg-black rounded-t-lg shadow-2xl shadow-accent/10">
        {stream.streamType === 'm3u8' ? (
          <ProfessionalHlsPlayer src={stream.url} title={stream.title} startUnmuted={startUnmuted} />
        ) : (
          <iframe
            key={stream.id}
            className="w-full aspect-video"
            src={playerUrl}
            title={stream.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        )}
      </div>
      <div className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border border-t-0 border-white/10 rounded-b-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{stream.title}</h1>
            <p className="text-base sm:text-lg text-gray-400 mt-1">{stream.channelName}</p>
          </div>
          {stream.isLive && (
            <div className="flex-shrink-0 flex items-center space-x-2">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <span className="text-sm font-bold text-red-400 uppercase tracking-wider">LIVE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPlayer;
