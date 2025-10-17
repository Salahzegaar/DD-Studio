import React from 'react';
import { CameraPreset, LightingPreset, MockupPreset, ManipulationPreset, RetouchPreset, PeopleRetouchPreset, ExportSettings, ImageFile, UpscaleTarget } from '../types';
import { CAMERA_PRESETS, LIGHTING_PRESETS, MOCKUP_PRESETS, MANIPULATION_PRESETS, RETOUCH_PRESETS, PEOPLE_RETOUCH_PRESETS } from '../constants';
import { CameraIcon, SunIcon, CubeTransparentIcon, WandIcon, LayersIcon, UserIcon, CogIcon, ArrowsExpandIcon, DownloadIcon } from './Icons';
import AccordionItem from './AccordionItem';
import PresetSelector from './PresetSelector';
import ExportControls from './ExportControls';
import { useLanguage } from '../App';

interface ControlPanelProps {
    selectedCameras: CameraPreset[];
    onCameraSelect: (preset: CameraPreset) => void;
    selectedLightings: LightingPreset[];
    onLightingSelect: (preset: LightingPreset) => void;
    selectedMockups: MockupPreset[];
    onMockupSelect: (preset: MockupPreset) => void;
    selectedManipulations: ManipulationPreset[];
    onManipulationSelect: (preset: ManipulationPreset) => void;
    selectedPeopleRetouches: PeopleRetouchPreset[];
    onPeopleRetouchSelect: (preset: PeopleRetouchPreset) => void;
    selectedRetouches: RetouchPreset[];
    onRetouchSelect: (preset: RetouchPreset) => void;
    exportSettings: ExportSettings;
    setExportSettings: (settings: ExportSettings) => void;
    referenceImage: ImageFile | null;
    isAnalyzing: boolean;
    suggestedPresetIds: Record<string, string[]>;
    onGenerate: () => void;
    canGenerate: boolean;
    isLoading: boolean;
    generatedImage: { base64: string; mimeType: string } | null;
    isUpscaling: false | UpscaleTarget;
    onUpscale: (target: UpscaleTarget) => void;
    isOnline: boolean;
    upscaleMenuRef: React.RefObject<HTMLDivElement>;
    isUpscaleMenuOpen: boolean;
    setIsUpscaleMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
    selectedCameras,
    onCameraSelect,
    selectedLightings,
    onLightingSelect,
    selectedMockups,
    onMockupSelect,
    selectedManipulations,
    onManipulationSelect,
    selectedPeopleRetouches,
    onPeopleRetouchSelect,
    selectedRetouches,
    onRetouchSelect,
    exportSettings,
    setExportSettings,
    referenceImage,
    isAnalyzing,
    suggestedPresetIds,
    onGenerate,
    canGenerate,
    isLoading,
    generatedImage,
    isUpscaling,
    onUpscale,
    isOnline,
    upscaleMenuRef,
    isUpscaleMenuOpen,
    setIsUpscaleMenuOpen,
}) => {
    const { t } = useLanguage();
    return (
        <div className="flex-grow flex flex-col min-h-0">
            {/* Scrollable controls */}
            <div className="flex-grow overflow-y-auto p-4">
                <div className="space-y-2">
                    <AccordionItem title={t('camera')} icon={<CameraIcon className="w-6 h-6 text-cyan-400" />} isOpenDefault={false} isAnalyzing={isAnalyzing}>
                        <PresetSelector presets={CAMERA_PRESETS} selectedPresets={selectedCameras} onSelect={onCameraSelect} suggestedIds={suggestedPresetIds.camera} />
                    </AccordionItem>
                    <AccordionItem title={t('lighting')} icon={<SunIcon className="w-6 h-6 text-cyan-400" />} isAnalyzing={isAnalyzing}>
                        <PresetSelector presets={LIGHTING_PRESETS} selectedPresets={selectedLightings} onSelect={onLightingSelect} suggestedIds={suggestedPresetIds.lighting} />
                    </AccordionItem>
                    <AccordionItem
                        title={t('mockup')}
                        icon={<CubeTransparentIcon className="w-6 h-6 text-cyan-400" />}
                    >
                        <PresetSelector presets={MOCKUP_PRESETS} selectedPresets={selectedMockups} onSelect={onMockupSelect} />
                    </AccordionItem>
                    <AccordionItem title={t('manipulation')} icon={<LayersIcon className="w-6 h-6 text-cyan-400" />} isAnalyzing={isAnalyzing}>
                        <PresetSelector presets={MANIPULATION_PRESETS} selectedPresets={selectedManipulations} onSelect={onManipulationSelect} suggestedIds={suggestedPresetIds.manipulation} />
                    </AccordionItem>
                    <AccordionItem title={t('productRetouch')} icon={<WandIcon className="w-6 h-6 text-cyan-400" />} isAnalyzing={isAnalyzing}>
                        <PresetSelector presets={RETOUCH_PRESETS} selectedPresets={selectedRetouches} onSelect={onRetouchSelect} suggestedIds={suggestedPresetIds.retouch} />
                    </AccordionItem>
                    <AccordionItem title={t('peopleRetouch')} icon={<UserIcon className="w-6 h-6 text-cyan-400" />} isAnalyzing={isAnalyzing}>
                        <PresetSelector presets={PEOPLE_RETOUCH_PRESETS} selectedPresets={selectedPeopleRetouches} onSelect={onPeopleRetouchSelect} suggestedIds={suggestedPresetIds.peopleRetouch} />
                    </AccordionItem>
                    <AccordionItem title={t('exportSettings')} icon={<CogIcon className="w-6 h-6 text-cyan-400" />} isOpenDefault={true}>
                        <ExportControls settings={exportSettings} setSettings={setExportSettings} />
                    </AccordionItem>
                </div>
            </div>
            
            {/* Generation Controls Footer */}
            <div className="p-4 mt-auto border-t border-[var(--border-color)] flex-shrink-0">
               <div className="space-y-3">
                    <button
                        onClick={onGenerate}
                        disabled={!canGenerate}
                        className={`w-full py-3 px-4 text-lg font-bold rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] glow-on-hover ${
                            canGenerate 
                            ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/20' 
                            : 'bg-gray-700/50 border border-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        title={!isOnline ? t('offlineMessage') : ""}
                    >
                    {isLoading ? t('generating') : isAnalyzing ? t('aiThinking') : t('generateImage')}
                    {isLoading && <div className="w-6 h-6 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div>}
                    {isAnalyzing && <div className="w-6 h-6 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div>}
                    </button>
                    {generatedImage && !isLoading && (
                        <div className="flex gap-3">
                            <a 
                                href={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`} 
                                download="ai-product-shot.png"
                                className="w-full py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center bg-transparent text-gray-100 border border-white/50 hover:bg-white/10"
                            >
                                <DownloadIcon className="h-5 w-5 me-2" /> {t('download')}
                            </a>
                            <div className="relative w-full" ref={upscaleMenuRef}>
                                <button
                                    onClick={() => setIsUpscaleMenuOpen(prev => !prev)}
                                    disabled={!!isUpscaling || isLoading}
                                    className={`w-full py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center border ${
                                        !!isUpscaling || isLoading
                                        ? 'bg-gray-700/50 text-gray-400 border-transparent cursor-not-allowed'
                                        : 'bg-transparent text-gray-100 border-white/50 hover:bg-white/10'
                                    }`}
                                    title={t('upscaleTooltip')}
                                >
                                    {isUpscaling === 'hd' ? t('upscaling') : isUpscaling === '4k' ? t('upscaling') : t('upscale')}
                                    {isUpscaling 
                                        ? <div className="w-5 h-5 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div>
                                        : <ArrowsExpandIcon className="h-5 w-5 ms-2" />
                                    }
                                </button>
                                {isUpscaleMenuOpen && (
                                     <div className="absolute bottom-full mb-2 w-full bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg z-10 p-1 space-y-1">
                                        <button
                                            onClick={() => onUpscale('hd')}
                                            className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-200 rounded-md hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                                        >
                                            HD <span className="text-xs text-gray-400">(~2K)</span>
                                        </button>
                                        <button
                                            onClick={() => onUpscale('4k')}
                                            className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-200 rounded-md hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                                        >
                                            4K <span className="text-xs text-gray-400">(~4K)</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
               </div>
            </div>
        </div>
    );
};

export default ControlPanel;