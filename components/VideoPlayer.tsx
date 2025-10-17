import React from 'react';

interface VideoPlayerProps {
    src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            <video
                key={src} // Force re-render when src changes
                src={src}
                controls
                autoPlay
                loop
                className="max-w-full max-h-full rounded-lg shadow-2xl shadow-black/30"
                style={{ objectFit: 'contain' }}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;
