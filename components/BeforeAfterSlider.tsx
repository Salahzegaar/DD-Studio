import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowsHorizontalIcon } from './Icons';
import { useLanguage } from '../App';

interface BeforeAfterSliderProps {
    beforeSrc: string;
    afterSrc: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeSrc, afterSrc }) => {
    const { t } = useLanguage();
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
    };

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);
    
    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    }, [isDragging, handleMove]);
    
    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging) return;
        handleMove(e.touches[0].clientX);
    }, [isDragging, handleMove]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    return (
        <div 
            ref={containerRef} 
            className="relative w-full h-full select-none cursor-ew-resize overflow-hidden rounded-lg group"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {/* Before Image */}
            <img
                src={beforeSrc}
                alt="Before"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
            {/* After Image (Clipped) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
                <img
                    src={afterSrc}
                    alt="After"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
            </div>

            {/* Labels */}
            <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                {t('before').toUpperCase()}
            </div>
             <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                {t('after').toUpperCase()}
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white/70 backdrop-blur-sm pointer-events-none transform -translate-x-1/2 group-hover:bg-white transition-colors duration-300"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-10 bg-gradient-to-br from-cyan-500 to-sky-500 backdrop-blur-sm rounded-lg flex items-center justify-center text-white shadow-2xl transition-transform duration-300 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                    <ArrowsHorizontalIcon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};

export default BeforeAfterSlider;