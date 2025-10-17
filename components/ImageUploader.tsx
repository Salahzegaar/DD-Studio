import React, { useState, useRef, useCallback } from 'react';
import { DownloadIcon } from './Icons';
import { useLanguage } from '../App';

interface ImageUploaderProps {
    title: string;
    description: string;
    onImageChange: (image: { file: File; base64: string; mimeType: string } | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, description, onImageChange }) => {
    const { t } = useLanguage();
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback((file: File | null) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please paste or select an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setPreview(reader.result as string);
            onImageChange({ file, base64: base64String, mimeType: file.type });
        };
        reader.readAsDataURL(file);
    }, [onImageChange]);


    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);
    
    const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if(file){
                   processFile(file);
                }
                event.preventDefault();
                break; 
            }
        }
    }, [processFile]);


    const handleRemove = () => {
        setPreview(null);
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <h3 className="font-semibold text-gray-100 text-lg">{title}</h3>
            <p className="text-sm text-gray-300 mb-3">{description}</p>
            <div
                className="relative border border-[var(--border-color)] bg-black/20 rounded-xl p-4 text-center cursor-pointer hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onClick={() => fileInputRef.current?.click()}
                onPaste={handlePaste}
                tabIndex={0}
                role="button"
                aria-label={t('imageUploaderAriaLabel')}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="max-h-36 mx-auto rounded-lg" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                            className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-red-500 transition-all scale-90 opacity-80 group-hover:scale-100 group-hover:opacity-100"
                            aria-label={t('removeImageAriaLabel')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </>
                ) : (
                    <div className="py-4">
                        <DownloadIcon className="mx-auto h-10 w-10 text-gray-300 group-hover:text-cyan-400 transition-colors" />
                        <p className="mt-2 font-medium text-gray-200">{t('clickToUpload')}</p>
                        <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>
        </div>
    );
};

export default ImageUploader;