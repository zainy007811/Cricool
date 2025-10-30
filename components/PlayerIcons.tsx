
import React from 'react';
import {
    PlayCircle, PauseCircle, ArrowLeft, Cast, Lock, Unlock, Captions, Settings, Sun, Check,
    Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, PictureInPicture2,
    Home, Search, Shield
} from 'lucide-react';

const iconProps = {
  size: 24,
  strokeWidth: 2,
};

const largeIconProps = {
    size: 64,
    strokeWidth: 1.5,
};

const seekIconSize = 48;

// Main Play/Pause
export const PlayIcon: React.FC<{ large?: boolean }> = ({ large }) => (
    <PlayCircle {...(large ? largeIconProps : iconProps)} />
);

export const PauseIcon: React.FC<{ large?: boolean }> = ({ large }) => (
    <PauseCircle {...(large ? largeIconProps : iconProps)} />
);

// Top Bar
export const BackArrowIcon: React.FC = () => <ArrowLeft {...iconProps} />;
export const CastIcon: React.FC<{size?: number}> = ({size}) => <Cast {...(size ? {...iconProps, size} : iconProps)} />;

// Middle Controls - Custom seek icons with number
const SeekIconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative flex items-center justify-center" style={{ width: seekIconSize, height: seekIconSize }}>
        {children}
        <span className="absolute text-white text-xs font-bold select-none pointer-events-none">10</span>
    </div>
);

export const RewindIcon: React.FC = () => (
    <SeekIconWrapper>
        <RotateCcw size={seekIconSize * 0.8} strokeWidth={1.5} />
    </SeekIconWrapper>
);

export const ForwardIcon: React.FC = () => (
    <SeekIconWrapper>
        <RotateCw size={seekIconSize * 0.8} strokeWidth={1.5} />
    </SeekIconWrapper>
);

// Bottom Bar
export const LockIcon: React.FC = () => <Lock size={20} />;
export const UnlockIcon: React.FC = () => <Unlock size={32} />;
export const CaptionsIcon: React.FC = () => <Captions {...iconProps} />;
export const SettingsIcon: React.FC = () => <Settings {...iconProps} />;

// Brightness & Volume
export const BrightnessIcon: React.FC = () => <Sun {...iconProps} />;
export const VolumeUpIcon: React.FC = () => <Volume2 {...iconProps} />;
export const VolumeOffIcon: React.FC = () => <VolumeX {...iconProps} />;

// Fullscreen & PiP
export const FullscreenEnterIcon: React.FC = () => <Maximize {...iconProps} />;
export const FullscreenExitIcon: React.FC = () => <Minimize {...iconProps} />;
export const PictureInPictureIcon: React.FC = () => <PictureInPicture2 {...iconProps} />;

// Settings Menu
export const CheckIcon: React.FC = () => <Check size={20} strokeWidth={3} className="text-green-400" />;

// Bottom Nav Bar
export const HomeIcon: React.FC<{ size?: number }> = ({ size }) => <Home size={size || 28} />;
export const SearchIcon: React.FC<{ size?: number }> = ({ size }) => <Search size={size || 28} />;
// FIX: Add className to props to allow styling from parent components.
export const ShieldIcon: React.FC<{ size?: number; className?: string; }> = ({ size, className }) => <Shield size={size || 28} className={className} />;
