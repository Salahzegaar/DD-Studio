import React from 'react';
import Loader from './Loader';
// FIX: Replaced non-existent `TomatoMascotIcon` with `DDStudioIcon`, which is available in the Icons module.
import { DDStudioIcon } from './Icons';
import BeforeAfterSlider from './BeforeAfterSlider';

interface ImageViewerProps {
    productImage: { base64: string, mimeType: string } | null;
    generatedImage: { base64: string, mimeType: string } | null;
    isGenerating: boolean;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ productImage, generatedImage, isGenerating }) => {
    const productImageUrl = productImage ? `data:${productImage.mimeType};base64,${productImage.base64}` : null;
    const generatedImageUrl = generatedImage ? `data:${generatedImage.mimeType};base64,${generatedImage.base64}` : null;

    return (
        <div className="flex-grow bg-gray-800/50 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
            <div className="w-full h-full max-w-4xl max-h-4xl relative">
                {isGenerating && <Loader />}
                
                {!productImage && !isGenerating && (
                    <div className="text-center text-gray-500">
                        {/* FIX: Replaced non-existent `TomatoMascotIcon` with `DDStudioIcon`. */}
                        <DDStudioIcon className="w-24 h-24 mx-auto text-gray-700" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-400">AI Product Studio</h2>
                        <p className="mt-2">Upload a product image to get started.</p>
                    </div>
                )}
                
                {productImage && !generatedImage && (
                     <img src={productImageUrl!} alt="Your Product" className="w-full h-full object-contain rounded-lg" />
                )}

                {productImageUrl && generatedImageUrl && (
                    <BeforeAfterSlider 
                        beforeSrc={productImageUrl} 
                        afterSrc={generatedImageUrl}
                    />
                )}
            </div>
        </div>
    );
};

export default ImageViewer;