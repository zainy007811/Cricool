import React from 'react';
import type { Stream } from '../types';
import { VolumeUpIcon } from './PlayerIcons';

interface StreamCardProps {
  stream: Stream;
  onSelect: (stream: Stream, unmute: boolean) => void;
}

const StreamCard: React.FC<StreamCardProps> = ({ stream, onSelect }) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget: card } = e;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    card.style.transform = `rotateY(${x}deg) rotateX(${-y}deg) scale(1.05)`;
    card.style.transition = 'transform 0.1s ease-out';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'rotateY(0) rotateX(0) scale(1)';
    e.currentTarget.style.transition = 'transform 0.5s ease-in-out';
  };
  
  return (
    <div
      onClick={() => onSelect(stream, false)}
      className="bg-slate-900/50 rounded-2xl overflow-hidden cursor-pointer group animate-fade-in-up"
      style={{ transformStyle: 'preserve-3d', transform: 'rotateY(0) rotateX(0) scale(1)', transition: 'transform 0.5s ease-in-out' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="relative w-full aspect-video bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${stream.thumbnailUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        {stream.isLive && (
          <div className="absolute top-3 right-3 text-xs font-bold bg-red-600 text-white px-2 py-1 rounded-md shadow-lg animate-pulse">LIVE</div>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 backdrop-blur-md rounded-b-2xl border-t border-white/10 flex justify-between items-center">
        <div className="flex-1 overflow-hidden">
            <h3 className="text-lg font-bold text-white truncate">{stream.title}</h3>
            <p className="text-sm text-gray-300 mt-1 truncate">{stream.channelName}</p>
        </div>
        <button
            onClick={(e) => {
                e.stopPropagation();
                onSelect(stream, true);
            }}
            className="ml-2 p-2 rounded-full text-white hover:bg-accent/20 transition-colors flex-shrink-0"
            aria-label="Play with sound"
            title="Play with sound"
        >
            <VolumeUpIcon />
        </button>
      </div>
    </div>
  );
};

export default StreamCard;
