
import React, { useState, useCallback, useEffect, useRef, useContext, createContext } from 'react';
import { CameraPreset, LightingPreset, MockupPreset, ManipulationPreset, PeopleRetouchPreset, RetouchPreset, ExportSettings, ImageFile, GenerationParams, AppMode, CreativeMode, HistoryItem, UpscaleTarget, PromptSuggestion, RetouchOptions, RetouchSubMode, LightDirection, WbAndGrade, IllustrationStylePreset } from './types';
import { CAMERA_PRESETS, LIGHTING_PRESETS, MOCKUP_PRESETS, MANIPULATION_PRESETS, PEOPLE_RETOUCH_PRESETS, RETOUCH_PRESETS, ENVIRONMENT_PRESETS, LIGHT_DIRECTIONS, WB_AND_GRADES, ILLUSTRATION_STYLE_PRESETS } from './constants';
import { generateImage, analyzeForCompositeSuggestions, performSmartRetouch, generateEnvironment, upscaleImage, generateDesignKitPrompt, generateIllustration, generateIllustrationPrompts, generateRetouchPrompts, vectorizeImage } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import { DDStudioIcon, SparklesIcon, WandIcon, WifiOffIcon, FacebookIcon, BehanceIcon, WhatsAppIcon, InstagramIcon, HistoryIcon, ArrowsExpandIcon, DownloadIcon, ArrowsContractIcon, CloseIcon, FilmIcon, FaceSmileIcon, CheckIcon, UpscaleIcon, EnvironmentIcon, CogIcon, RefreshIcon, ClipboardCopyIcon, PaintBrushIcon, PhotoIcon, SvgIcon } from './components/Icons';
import MagicCompositeToggle from './components/MagicCompositeToggle';
import AccordionItem from './components/AccordionItem';
import { translations } from './i18n';

// --- I18n Setup ---
type Language = 'en' | 'ar';
interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<Language>('en');

    const t = useCallback((key: string, fallback?: string): string => {
        const langTranslations = translations[lang];
        const keyParts = key.split('.');
        let result: any = langTranslations;
        for (const part of keyParts) {
            if (result && typeof result === 'object' && part in result) {
                result = result[part];
            } else {
                // Fallback to English if key not found in current language
                const enTranslations = translations.en;
                let enResult: any = enTranslations;
                for (const enPart of keyParts) {
                     if (enResult && typeof enResult === 'object' && enPart in enResult) {
                        enResult = enResult[enPart];
                     } else {
                        return fallback || key;
                     }
                }
                return enResult || fallback || key;
            }
        }
        return typeof result === 'string' ? result : (fallback || key);
    }, [lang]);

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

interface HistoryPanelProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
    const { t } = useLanguage();
    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <HistoryIcon className="w-6 h-6 text-gray-200" />
                <h3 className="font-semibold text-gray-100 text-lg">{t('historyTitle')}</h3>
            </div>
            {history.length === 0 ? (
                <div className="text-center text-sm text-gray-300 border border-dashed border-[var(--border-color)] rounded-lg py-8 px-4">
                    <p>{t('historyEmpty')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {history.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className="aspect-square bg-white/10 rounded-lg overflow-hidden group relative focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
                            title={t('historyViewTooltip')}
                        >
                            <img
                                src={`data:${item.generated.mimeType};base64,${item.generated.base64}`}
                                alt={t('historyItemAlt')}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white text-xs font-bold">{t('view')}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface PromptSuggestionsModalProps {
    isOpen: boolean;
    suggestions: PromptSuggestion[];
    onSelect: (prompt: string) => void;
    onClose: () => void;
}

const PromptSuggestionsModal: React.FC<PromptSuggestionsModalProps> = ({ isOpen, suggestions, onSelect, onClose }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-[rgba(16,18,42,0.5)] backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl shadow-2xl shadow-black/20 w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-gray-100">{t('promptSuggestionsTitle')}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors" aria-label={t('close')}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="overflow-y-auto p-5 space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(suggestion.prompt)}
                            className="w-full text-left p-4 rounded-lg bg-white/5 border-2 border-transparent hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 transform hover:scale-[1.02] active:scale-[1] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <p className="font-semibold text-cyan-300">{suggestion.title}</p>
                            <p className="text-gray-200 mt-1 text-sm">{suggestion.prompt}</p>
                        </button>
                    ))}
                </div>
                <div className="p-5 border-t border-[var(--border-color)] text-center">
                    <p className="text-xs text-gray-400">{t('promptSuggestionsFooter')}</p>
                </div>
            </div>
        </div>
    );
};


const getFullscreenElement = () => {
    const doc = document as any;
    return doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement || null;
}

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, disabled = false }) => (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
        <label className="font-medium text-gray-200">{label}</label>
        <button
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                checked ? 'bg-cyan-500' : 'bg-gray-600'
            } ${disabled ? 'cursor-not-allowed' : ''}`}
            role="switch"
            aria-checked={checked}
        >
            <span
                className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 flex items-center justify-center ${
                    checked ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                }`}
            >
                {checked && <CheckIcon className="w-3 h-3 text-cyan-500" />}
            </span>
        </button>
    </div>
);

interface PromptGeneratorProps {
    onGenerate: () => void;
    isLoading: boolean;
    prompts: string[] | null;
    styleVariety: 'normal' | 'wide';
    onStyleVarietyChange: (value: 'normal' | 'wide') => void;
    syncWithEnv: boolean;
    onSyncWithEnvChange: (value: boolean) => void;
    onUsePrompt: (prompt: string) => void;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ onGenerate, isLoading, prompts, styleVariety, onStyleVarietyChange, syncWithEnv, onSyncWithEnvChange, onUsePrompt }) => {
    const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
    const { t } = useLanguage();

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-200 text-sm">{t('styleVariety')}</label>
                    <div className="flex items-center bg-black/20 rounded-md p-0.5 border border-[var(--border-color)] text-xs">
                        <button onClick={() => onStyleVarietyChange('normal')} className={`px-2 py-1 rounded-sm transition-colors ${styleVariety === 'normal' ? 'bg-cyan-500/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}>{t('normal')}</button>
                        <button onClick={() => onStyleVarietyChange('wide')} className={`px-2 py-1 rounded-sm transition-colors ${styleVariety === 'wide' ? 'bg-cyan-500/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}>{t('wide')}</button>
                    </div>
                </div>
                <Toggle label={t('syncWithEnvironment')} checked={syncWithEnv} onChange={onSyncWithEnvChange} />
                <Toggle label={t('lockFacePriority')} checked={true} onChange={() => {}} disabled={true} />
            </div>

            {!prompts && (
                 <button onClick={onGenerate} disabled={isLoading} className={`w-full py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center border-2 ${isLoading ? 'border-gray-500 text-gray-400 cursor-not-allowed' : 'border-cyan-500 text-cyan-300 hover:bg-cyan-500/10'}`}>
                    {isLoading ? t('generating') : t('generatePrompts')}
                    {isLoading ? <div className="w-5 h-5 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div> : <SparklesIcon className="h-5 w-5 ms-2" />}
                </button>
            )}

            {prompts && (
                <div className="space-y-3 pt-2">
                    <h4 className="font-semibold text-gray-100">{t('aiSuggestions')}:</h4>
                    {prompts.map((prompt, index) => (
                        <div key={index} className="p-3 bg-white/5 rounded-lg border border-transparent hover:border-cyan-500/30 transition-all">
                            <p className="text-sm text-gray-300 italic">"{prompt}"</p>
                            <div className="flex items-center gap-2 mt-3">
                                <button onClick={() => onUsePrompt(prompt)} className="text-xs font-bold bg-cyan-500/20 text-cyan-200 px-3 py-1 rounded-md hover:bg-cyan-500/40 transition-colors">{t('usePrompt')}</button>
                                <button onClick={() => handleCopy(prompt, index)} className="text-xs font-bold bg-gray-500/20 text-gray-200 px-3 py-1 rounded-md hover:bg-gray-500/40 transition-colors flex items-center gap-1.5">
                                    <ClipboardCopyIcon className="w-3 h-3" />
                                    {copiedIndex === index ? t('copied') : t('copy')}
                                </button>
                            </div>
                        </div>
                    ))}
                    <button onClick={onGenerate} disabled={isLoading} className={`w-full py-2 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center bg-black/20 border-2 ${isLoading ? 'border-gray-600 text-gray-500 cursor-not-allowed' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10'}`}>
                        {isLoading ? t('generating') : t('refreshTrio')}
                        {isLoading ? <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div> : <RefreshIcon className="w-4 h-4 ms-2" />}
                    </button>
                </div>
            )}
        </div>
    );
};

const AppContent: React.FC = () => {
    const { lang, setLang, t } = useLanguage();
    const [appMode, setAppMode] = useState<AppMode>('design-kit');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isFullscreen, setIsFullscreen] = useState(!!getFullscreenElement());

    // --- Design Kit State ---
    const [productImage, setProductImage] = useState<ImageFile | null>(null);
    const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
    const [generatedImage, setGeneratedImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [selectedCameras, setSelectedCameras] = useState<CameraPreset[]>([CAMERA_PRESETS[0]]);
    const [selectedLightings, setSelectedLightings] = useState<LightingPreset[]>([LIGHTING_PRESETS[0]]);
    const [selectedMockups, setSelectedMockups] = useState<MockupPreset[]>([MOCKUP_PRESETS[0]]);
    const [selectedManipulations, setSelectedManipulations] = useState<ManipulationPreset[]>([MANIPULATION_PRESETS[0]]);
    const [selectedPeopleRetouches, setSelectedPeopleRetouches] = useState<PeopleRetouchPreset[]>([PEOPLE_RETOUCH_PRESETS[0]]);
    const [selectedRetouches, setSelectedRetouches] = useState<RetouchPreset[]>([RETOUCH_PRESETS[0]]);
    const [dkExportSettings, setDkExportSettings] = useState<ExportSettings>({ aspectRatio: '4:5', transparent: false });
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [useMagicComposite, setUseMagicComposite] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [suggestedPresetIds, setSuggestedPresetIds] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingDKPrompt, setIsGeneratingDKPrompt] = useState(false);
    const [suggestedDKPrompts, setSuggestedDKPrompts] = useState<PromptSuggestion[] | null>(null);
    const [isDKPromptModalOpen, setIsDKPromptModalOpen] = useState(false);
    
    // --- Creative Studio State ---
    const [creativeMode, setCreativeMode] = useState<CreativeMode>('illustrate');
    const [isGeneratingCreative, setIsGeneratingCreative] = useState(false);
    const [creativeError, setCreativeError] = useState<string | null>(null);
    
    // Illustrate Mode State
    const [illustrationImage, setIllustrationImage] = useState<ImageFile | null>(null);
    const [illustrationReferenceImage, setIllustrationReferenceImage] = useState<ImageFile | null>(null);
    const [illustrationCustomPrompt, setIllustrationCustomPrompt] = useState<string>('');
    const [illustrationResultImage, setIllustrationResultImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [isGeneratingIllustration, setIsGeneratingIllustration] = useState(false);
    const [selectedIllustrationStyle, setSelectedIllustrationStyle] = useState<IllustrationStylePreset>(ILLUSTRATION_STYLE_PRESETS[0]);
    const [illustrationDetailFidelity, setIllustrationDetailFidelity] = useState(75);
    const [useIllustrationStylePreset, setUseIllustrationStylePreset] = useState(true);
    const [generationStatusText, setGenerationStatusText] = useState('');
    const [isVectorizing, setIsVectorizing] = useState(false);
    const [isIllustrationDownloadMenuOpen, setIsIllustrationDownloadMenuOpen] = useState(false);
    const illustrationDownloadMenuRef = useRef<HTMLDivElement>(null);

    const [suggestedCreativePrompts, setSuggestedCreativePrompts] = useState<PromptSuggestion[] | null>(null);
    const [isCreativePromptModalOpen, setIsCreativePromptModalOpen] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

    // Retouch Mode State
    const [personImage, setPersonImage] = useState<ImageFile | null>(null);
    const [retouchResultImage, setRetouchResultImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [retouchSubMode, setRetouchSubMode] = useState<RetouchSubMode>('smart');
    const [retouchOptions, setRetouchOptions] = useState<RetouchOptions>({
        smoothness: 50,
        lightBalance: 50,
        correctSkinTones: true,
        sharpen: true,
        removeBlemishes: true,
        backgroundBlur: 0,
        hdrEffect: 0,
        vintageFade: 0,
        glossySkin: false,
        environmentHarmony: true,
        lightDirection: 'Auto',
        keyFillRatio: 50,
        shadowSoftness: 50,
        wbAndGrade: 'Auto',
        artistCommand: '',
    });
    const [selectedEnvironment, setSelectedEnvironment] = useState<string>(ENVIRONMENT_PRESETS[0]);
    const [generatedRetouchPrompts, setGeneratedRetouchPrompts] = useState<string[] | null>(null);
    const [isGeneratingRetouchPrompts, setIsGeneratingRetouchPrompts] = useState(false);
    const [promptStyleVariety, setPromptStyleVariety] = useState<'normal' | 'wide'>('normal');
    const [syncPromptWithEnv, setSyncPromptWithEnv] = useState(true);

    // --- History & Upscale State ---
    const [generationHistory, setGenerationHistory] = useState<HistoryItem[]>([]);
    const [isUpscaling, setIsUpscaling] = useState<false | UpscaleTarget>(false);
    const [upscaleError, setUpscaleError] = useState<string | null>(null);
    const [isUpscaleMenuOpen, setIsUpscaleMenuOpen] = useState(false);
    const upscaleMenuRef = useRef<HTMLDivElement>(null);

    // --- Global State Handlers ---
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const handleClickOutside = (event: MouseEvent) => {
            if (upscaleMenuRef.current && !upscaleMenuRef.current.contains(event.target as Node)) {
                setIsUpscaleMenuOpen(false);
            }
            if (illustrationDownloadMenuRef.current && !illustrationDownloadMenuRef.current.contains(event.target as Node)) {
                setIsIllustrationDownloadMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        const handleFullscreenChange = () => { setIsFullscreen(!!getFullscreenElement()); };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = useCallback(() => {
        const docEl = document.documentElement as any;
        const doc = document as any;
        if (!getFullscreenElement()) {
            (docEl.requestFullscreen || docEl.webkitRequestFullscreen).call(docEl).catch((err: Error) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
        }
    }, []);

    // --- Effects and Handlers for Design Kit ---
    useEffect(() => {
        const runAnalysis = async () => {
            if (appMode === 'design-kit' && productImage && referenceImage && useMagicComposite) {
                setIsAnalyzing(true);
                setSuggestedPresetIds({}); 
                try {
                    const suggestions = await analyzeForCompositeSuggestions(productImage, referenceImage);
                    if (suggestions.camera?.length) setSelectedCameras(CAMERA_PRESETS.filter(p => suggestions.camera.includes(p.id)));
                    if (suggestions.lighting?.length) setSelectedLightings(LIGHTING_PRESETS.filter(p => suggestions.lighting.includes(p.id)));
                    if (suggestions.manipulation?.length) setSelectedManipulations(MANIPULATION_PRESETS.filter(p => suggestions.manipulation.includes(p.id)));
                    if (suggestions.retouch?.length) setSelectedRetouches(RETOUCH_PRESETS.filter(p => suggestions.retouch.includes(p.id)));
                    if (suggestions.peopleRetouch?.length) setSelectedPeopleRetouches(PEOPLE_RETOUCH_PRESETS.filter(p => suggestions.peopleRetouch.includes(p.id)));
                    setSuggestedPresetIds(suggestions);
                } catch (e) {
                     console.error("Failed to analyze for composite suggestions:", e);
                     setError("AI analysis failed. Please check the console for details.");
                } finally {
                    setIsAnalyzing(false);
                }
            }
        };
        runAnalysis();
    }, [productImage, referenceImage, useMagicComposite, appMode]);


    const createToggleHandler = useCallback(<T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, presets: readonly T[]) => (preset: T) => {
        setter(prev => {
            const isSelected = prev.some(p => p.id === preset.id);
            const nonePreset = presets.find(p => p.id === 'none')!;
            if (preset.id === 'none') return [nonePreset];
            let newSelection;
            if (isSelected) {
                if (prev.length === 1) return [nonePreset];
                newSelection = prev.filter(p => p.id !== preset.id);
            } else {
                newSelection = [...prev.filter(p => p.id !== 'none'), preset];
            }
            return newSelection;
        });
    }, []);

    const handleCameraToggle = createToggleHandler(setSelectedCameras, CAMERA_PRESETS);
    const handleLightingToggle = createToggleHandler(setSelectedLightings, LIGHTING_PRESETS);
    const handleManipulationToggle = createToggleHandler(setSelectedManipulations, MANIPULATION_PRESETS);
    const handlePeopleRetouchToggle = createToggleHandler(setSelectedPeopleRetouches, PEOPLE_RETOUCH_PRESETS);
    const handleRetouchToggle = createToggleHandler(setSelectedRetouches, RETOUCH_PRESETS);
    const handleMockupSelect = useCallback((preset: MockupPreset) => {
        setSelectedMockups(current => current[0]?.id === preset.id ? [MOCKUP_PRESETS[0]] : [preset]);
    }, []);
    
    const handleMagicCompositeToggle = (enabled: boolean) => {
        setUseMagicComposite(enabled);
        if (!enabled) {
            setSelectedCameras([CAMERA_PRESETS[0]]);
            setSelectedLightings([LIGHTING_PRESETS[0]]);
            setSelectedManipulations([MANIPULATION_PRESETS[0]]);
            setSelectedRetouches([RETOUCH_PRESETS[0]]);
            setSelectedPeopleRetouches([PEOPLE_RETOUCH_PRESETS[0]]);
            setSuggestedPresetIds({});
        }
    };

    const handleDesignKitGeneration = useCallback(async () => {
        if (!isOnline || !productImage) {
            setError(isOnline ? "Please upload a product image first." : "You are offline. Please check your internet connection.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setUpscaleError(null);
        setGeneratedImage(null);
        const params: GenerationParams = { cameraPresets: selectedCameras, lightingPresets: selectedLightings, mockupPreset: selectedMockups[0], manipulationPresets: selectedManipulations, peopleRetouchPresets: selectedPeopleRetouches, retouchPresets: selectedRetouches, exportSettings: dkExportSettings, customPrompt };
        try {
            const result = await generateImage(productImage, referenceImage, useMagicComposite, params);
            if (result) {
                setGeneratedImage(result);
                const newHistoryItem: HistoryItem = { id: new Date().toISOString(), source: productImage, generated: result, prompt: customPrompt, mode: 'design-kit' };
                setGenerationHistory(prev => [newHistoryItem, ...prev].slice(0, 12));
            } else {
                setError("The AI could not generate an image. Please try again.");
            }
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [productImage, referenceImage, useMagicComposite, selectedCameras, selectedLightings, selectedMockups, selectedManipulations, selectedPeopleRetouches, selectedRetouches, dkExportSettings, customPrompt, isOnline]);
    
     const handleGenerateDKPrompt = useCallback(async () => {
        if (!productImage) {
            setError("Please upload a product image to generate prompt suggestions.");
            return;
        }
        setIsGeneratingDKPrompt(true);
        setError(null);
        try {
            const suggestions = await generateDesignKitPrompt(productImage, referenceImage);
            if (suggestions && suggestions.length > 0) {
                setSuggestedDKPrompts(suggestions);
                setIsDKPromptModalOpen(true);
            } else {
                setError("The AI could not generate any prompt suggestions.");
            }
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred during prompt generation.");
        } finally {
            setIsGeneratingDKPrompt(false);
        }
    }, [productImage, referenceImage]);
    
    // --- Creative Studio Handlers ---

    const handleGenerateCreativePrompts = useCallback(async () => {
        const baseImage = creativeMode === 'illustrate' ? illustrationImage : null;
        if (!baseImage) {
            setCreativeError("Please upload a base image first.");
            return;
        }
        setIsGeneratingPrompt(true);
        setCreativeError(null);
        setSuggestedCreativePrompts(null);
        try {
            let suggestions = await generateIllustrationPrompts(baseImage, illustrationReferenceImage);
            if (suggestions && suggestions.length > 0) {
                setSuggestedCreativePrompts(suggestions);
                setIsCreativePromptModalOpen(true);
            } else {
                setCreativeError("The AI could not generate any suggestions.");
            }
        } catch (e) {
            console.error(e);
            setCreativeError(e instanceof Error ? e.message : "An unknown error occurred during prompt generation.");
        } finally {
            setIsGeneratingPrompt(false);
        }
    }, [illustrationImage, illustrationReferenceImage, creativeMode]);

    const handleGenerateIllustration = useCallback(async () => {
        if (!isOnline || !illustrationImage) {
            setCreativeError(!isOnline ? "You are offline." : "Please upload an image to illustrate.");
            return;
        }
        setIsGeneratingIllustration(true);
        setCreativeError(null);
        setIllustrationResultImage(null);
        setGenerationStatusText("Sketching your vision...");

        try {
            const styleToUse = useIllustrationStylePreset ? selectedIllustrationStyle : ILLUSTRATION_STYLE_PRESETS.find(p => p.id === 'none')!;
            const result = await generateIllustration(illustrationImage, styleToUse, illustrationDetailFidelity, illustrationCustomPrompt, illustrationReferenceImage);
            if(result) {
                setIllustrationResultImage(result);
                const newHistoryItem: HistoryItem = { id: new Date().toISOString(), source: illustrationImage, generated: result, prompt: illustrationCustomPrompt, mode: 'creative-studio', creativeSubMode: 'illustrate' };
                setGenerationHistory(prev => [newHistoryItem, ...prev].slice(0, 12));
            } else {
                setCreativeError("The AI could not generate an illustration. Please try a different style or image.");
            }
        } catch (e) {
            console.error(e);
            setCreativeError(e instanceof Error ? e.message : "An unknown error occurred during illustration.");
        } finally {
            setIsGeneratingIllustration(false);
            setGenerationStatusText("");
        }
    }, [isOnline, illustrationImage, selectedIllustrationStyle, illustrationDetailFidelity, illustrationCustomPrompt, illustrationReferenceImage, useIllustrationStylePreset]);
    
    const handleDownloadVector = async () => {
        if (!illustrationResultImage) return;
        setIsIllustrationDownloadMenuOpen(false);
        setIsVectorizing(true);
        setCreativeError(null);
        setGenerationStatusText('Vectorizing image...');
  
        try {
            const svgCode = await vectorizeImage(illustrationResultImage);
            if (svgCode) {
                const blob = new Blob([svgCode], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tomato-ai-illustration.svg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                setCreativeError("The AI could not convert the image to SVG.");
            }
        } catch (e) {
            console.error(e);
            setCreativeError(e instanceof Error ? e.message : "An unknown error occurred during vectorization.");
        } finally {
            setIsVectorizing(false);
            setGenerationStatusText('');
        }
    };

    const handleSmartRetouch = useCallback(async () => {
        if (!isOnline || !personImage) {
            setCreativeError(!isOnline ? "You are offline." : "Please upload a portrait to retouch.");
            return;
        }
        setIsGeneratingCreative(true);
        setGenerationStatusText('Performing high-end face retouch...');
        setCreativeError(null);
        setRetouchResultImage(null);
        try {
            const result = await performSmartRetouch(personImage, retouchOptions);
            if (result) {
                setRetouchResultImage(result);
                const newHistoryItem: HistoryItem = { id: new Date().toISOString(), source: personImage, generated: result, prompt: "Smart Studio Retouch", mode: 'creative-studio', creativeSubMode: 'retouch' };
                setGenerationHistory(prev => [newHistoryItem, ...prev].slice(0, 12));
            } else {
                setCreativeError("The AI could not retouch the image.");
            }
        } catch (e) {
            console.error(e);
            setCreativeError(e instanceof Error ? e.message : "An unknown error occurred during retouching.");
        } finally {
            setIsGeneratingCreative(false);
            setGenerationStatusText('');
        }
    }, [personImage, isOnline, retouchOptions]);

    const handleEnvironmentGeneration = useCallback(async () => {
        if (!isOnline || !personImage) {
            setCreativeError(!isOnline ? "You are offline." : "Please upload a portrait.");
            return;
        }
        setIsGeneratingCreative(true);
        setGenerationStatusText('Harmonizing light, color, and shadows...');
        setCreativeError(null);
        setRetouchResultImage(null);
        try {
            const result = await generateEnvironment(personImage, selectedEnvironment, retouchOptions);
            if (result) {
                setRetouchResultImage(result);
                const newHistoryItem: HistoryItem = { id: new Date().toISOString(), source: personImage, generated: result, prompt: `Environment: ${selectedEnvironment}`, mode: 'creative-studio', creativeSubMode: 'retouch' };
                setGenerationHistory(prev => [newHistoryItem, ...prev].slice(0, 12));
            } else {
                setCreativeError("The AI could not generate the environment.");
            }
        } catch (e) {
            console.error(e);
            setCreativeError(e instanceof Error ? e.message : "An unknown error occurred during environment generation.");
        } finally {
            setIsGeneratingCreative(false);
            setGenerationStatusText('');
        }
    }, [personImage, selectedEnvironment, isOnline, retouchOptions]);

    const handleGenerateRetouchPrompts = useCallback(async () => {
        setIsGeneratingRetouchPrompts(true);
        setCreativeError(null);
        try {
            const prompts = await generateRetouchPrompts(selectedEnvironment, promptStyleVariety, syncPromptWithEnv);
            setGeneratedRetouchPrompts(prompts);
        } catch (e) {
            console.error(e);
            setCreativeError(e instanceof Error ? e.message : "An unknown error occurred during prompt generation.");
        } finally {
            setIsGeneratingRetouchPrompts(false);
        }
    }, [selectedEnvironment, promptStyleVariety, syncPromptWithEnv]);


    const handleHistorySelect = (item: HistoryItem) => {
        setAppMode(item.mode);
        setError(null);
        setCreativeError(null);
        setUpscaleError(null);
        
        // Reset all results
        setGeneratedImage(null);
        setRetouchResultImage(null);
        setIllustrationResultImage(null);
        
        if (item.mode === 'design-kit') {
            setProductImage(item.source);
            setGeneratedImage(item.generated);
            setCustomPrompt(item.prompt);
        } else if (item.mode === 'creative-studio') {
            setCreativeMode(item.creativeSubMode || 'illustrate');
            if (item.creativeSubMode === 'illustrate') {
                setIllustrationImage(item.source);
                setIllustrationCustomPrompt(item.prompt);
                setIllustrationResultImage(item.generated);
            } else { // 'retouch'
                setPersonImage(item.source);
                setRetouchResultImage(item.generated);
            }
        }
    };

    const handleUpscale = async (target: UpscaleTarget) => {
        setIsUpscaleMenuOpen(false);
        const imageToUpscale = appMode === 'design-kit' ? generatedImage : (creativeMode === 'retouch' ? retouchResultImage : illustrationResultImage);
        const sourceImage = appMode === 'design-kit' ? productImage : (creativeMode === 'retouch' ? personImage : illustrationImage);
        
        if (!imageToUpscale || !sourceImage) return;

        setIsUpscaling(target);
        setUpscaleError(null);
        setError(null);
        setCreativeError(null);
        setGenerationStatusText('Upscaling with detail preservation...');

        try {
            const upscaledResult = await upscaleImage(imageToUpscale, target);
            if (upscaledResult) {
                const promptForHistory = appMode === 'design-kit' ? customPrompt : `Upscaled to ${target.toUpperCase()}`;
                if (appMode === 'design-kit') {
                    setGeneratedImage(upscaledResult);
                } else if (creativeMode === 'retouch') {
                    setRetouchResultImage(upscaledResult);
                } else {
                    setIllustrationResultImage(upscaledResult);
                }
                const newHistoryItem: HistoryItem = { id: new Date().toISOString() + `-upscaled-${target}`, source: sourceImage, generated: upscaledResult, prompt: promptForHistory, mode: appMode, creativeSubMode: appMode === 'creative-studio' ? creativeMode : undefined };
                setGenerationHistory(prev => [newHistoryItem, ...prev].slice(0, 12));
            } else {
                setUpscaleError("The AI could not upscale the image.");
            }
        } catch (e) {
            console.error(e);
            setUpscaleError(e instanceof Error ? e.message : "An unknown error occurred during upscaling.");
        } finally {
            setIsUpscaling(false);
            setGenerationStatusText('');
        }
    };


    const ModeSwitcher = () => (
        <div className="flex items-center bg-black/20 rounded-lg p-1 border border-[var(--border-color)]">
            <button
                onClick={() => setAppMode('design-kit')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${appMode === 'design-kit' ? 'bg-cyan-500/20 text-white' : 'text-gray-200 hover:text-white'}`}
            >
                <WandIcon className="w-5 h-5" /> {t('designKit')}
            </button>
            <button
                onClick={() => setAppMode('creative-studio')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${appMode === 'creative-studio' ? 'bg-cyan-500/20 text-white' : 'text-gray-200 hover:text-white'}`}
            >
                <SparklesIcon className="w-5 h-5" /> {t('creativeStudio')}
            </button>
        </div>
    );
    
    const OfflineBanner = () => (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-500/10 backdrop-blur-sm border-t border-yellow-500/30 text-yellow-200 p-3 text-center text-sm z-50 flex items-center justify-center gap-3">
            <WifiOffIcon className="w-5 h-5" />
            <span>{t('offlineMessage')}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent text-gray-200 flex flex-col font-sans">
            <header className="bg-[var(--panel-bg)] backdrop-blur-lg border-b border-[var(--border-color)] px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <DDStudioIcon className="w-8 h-8" />
                    <h1 className="text-xl font-bold text-white">{t('headerTitle')}</h1>
                </div>
                <div className="hidden lg:block"><ModeSwitcher /></div>
                <div className="flex items-center gap-4">
                     <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-sm font-semibold text-cyan-300 hover:text-white transition-colors bg-black/20 px-3 py-1 rounded-md border border-cyan-500/50">
                        {lang === 'en' ? 'العربية' : 'English'}
                    </button>
                    <div className="hidden sm:block text-sm text-gray-300 text-right">
                        <div>
                           <span className="font-semibold text-gray-100">{t('developerLabel')} </span> 
                           {lang === 'ar' ? `${t('developerName1')} و ${t('developerName2')}` : `${t('developerName1')} & ${t('developerName2')}`}
                        </div>
                         <div className="flex items-center justify-end gap-1.5 mt-1">
                            <span className="text-xs">{t('donateLabel')}</span>
                            <a href="https://wsend.co/213676356472" target="_blank" rel="noopener noreferrer" aria-label={t('donateLabel')} title={t('donateLabel')}>
                                <WhatsAppIcon className="w-5 h-5 text-green-400 hover:text-green-300 transition-colors" />
                            </a>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-white/20 hidden sm:block"></div>
                    <div className="flex items-center gap-4 text-gray-200">
                        <button onClick={toggleFullscreen} className="hover:text-white transition-colors" aria-label={isFullscreen ? t('exitFullscreen') : t('enterFullscreen')} title={isFullscreen ? t('exitFullscreenEsc') : t('enterFullscreen')}>
                            {isFullscreen ? <ArrowsContractIcon className="w-6 h-6" /> : <ArrowsExpandIcon className="w-6 h-6" />}
                        </button>
                        <a href="https://www.facebook.com/son.zeze.28/" target="_blank" rel="noopener noreferrer" title="Facebook"><FacebookIcon className="w-6 h-6 hover:text-white transition-colors animate-pulse-color-social" /></a>
                        <a href="https://www.behance.net/hire/dashboard/projects" target="_blank" rel="noopener noreferrer" title="Behance"><BehanceIcon className="w-6 h-6 hover:text-white transition-colors animate-pulse-color-social" /></a>
                        <a href="https://wsend.co/213676356472" target="_blank" rel="noopener noreferrer" title="WhatsApp"><WhatsAppIcon className="w-6 h-6 hover:text-white transition-colors animate-pulse-color-social" /></a>
                        <a href="https://www.instagram.com/son.zeg/" target="_blank" rel="noopener noreferrer" title="Instagram"><InstagramIcon className="w-6 h-6 hover:text-white transition-colors animate-pulse-color-social" /></a>
                    </div>
                </div>
            </header>
            <div className="lg:hidden p-3 bg-[var(--panel-bg)] backdrop-blur-lg border-b border-[var(--border-color)] flex justify-center"><ModeSwitcher /></div>
            
            {appMode === 'design-kit' && (
                <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 gap-8 p-8 max-w-screen-2xl mx-auto w-full overflow-hidden">
                    <div className="lg:col-span-3 bg-[var(--panel-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-6 flex flex-col space-y-6 overflow-y-auto shadow-xl shadow-black/20">
                        <ImageUploader title={t('productImageTitle')} description={t('productImageDescription')} onImageChange={setProductImage} />
                        <ImageUploader title={t('referenceImageTitle')} description={t('referenceImageDescription')} onImageChange={setReferenceImage} />
                        <MagicCompositeToggle isEnabled={useMagicComposite} onToggle={handleMagicCompositeToggle} />
                        <div>
                            <h3 className="font-semibold text-gray-100 text-lg">{t('creativePromptTitle')}</h3>
                            <p className="text-sm text-gray-300 mb-3">{t('creativePromptDescription')}</p>
                            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder={t('promptPlaceholder')} className="w-full bg-black/20 border border-[var(--border-color)] rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 transition-colors h-28 resize-y" />
                             <button onClick={handleGenerateDKPrompt} disabled={!productImage || isGeneratingDKPrompt || isLoading} className={`mt-3 w-full py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center border-2 ${!productImage || isGeneratingDKPrompt || isLoading ? 'border-gray-500 text-gray-400 cursor-not-allowed' : 'border-cyan-500 text-cyan-300 hover:bg-cyan-500/10'}`}>
                                {isGeneratingDKPrompt ? t('thinking') : t('suggestWithAI')}
                                {isGeneratingDKPrompt ? <div className="w-5 h-5 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div> : <SparklesIcon className="h-5 w-5 ms-2" />}
                            </button>
                        </div>
                         <div className="border-t border-[var(--border-color)] pt-6"><HistoryPanel history={generationHistory} onSelect={handleHistorySelect} /></div>
                    </div>
                    <div className="lg:col-span-6 flex flex-col">
                        <div className="flex-grow bg-[var(--panel-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-2 flex flex-col items-center justify-center relative min-h-[50vh] lg:min-h-0 shadow-xl shadow-black/20">
                            <div className={`w-full h-auto max-h-full relative transition-all duration-300 ease-in-out ${dkExportSettings.aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/5]'}`}>
                                <div className="absolute inset-0 border border-dashed border-white/20 rounded-lg pointer-events-none" />
                                <div className="relative w-full h-full p-1">
                                    {(isLoading || !!isUpscaling) && <Loader />}
                                    {!(isLoading || !!isUpscaling) && !generatedImage && (
                                        <div className="w-full h-full text-center p-8 flex flex-col items-center justify-center animate-pulse-slow">
                                            <DDStudioIcon className="w-20 h-20 opacity-10 mb-6" />
                                            <p className="text-lg font-medium text-gray-200">{t('creationPlaceholderTitle')}</p>
                                            <p className="text-sm text-gray-300">{t('creationPlaceholderSubtitle')}</p>
                                        </div>
                                    )}
                                    {generatedImage && productImage && !(isLoading || !!isUpscaling) && <BeforeAfterSlider beforeSrc={`data:${productImage.mimeType};base64,${productImage.base64}`} afterSrc={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`} />}
                                    {(error || upscaleError) && !(isLoading || !!isUpscaling) && (
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl">
                                            <div className="text-center text-red-400"><p className="text-lg font-bold">{t('operationFailed')}</p><p className="text-sm mt-2 max-w-sm">{error || upscaleError}</p></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-3 bg-[var(--panel-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl flex flex-col overflow-hidden shadow-xl shadow-black/20">
                        <div className="p-4 border-b border-[var(--border-color)] flex-shrink-0"><h2 className="text-lg font-bold tracking-[0.3em] text-center uppercase text-white">{t('designKit')}</h2></div>
                        <ControlPanel selectedCameras={selectedCameras} onCameraSelect={handleCameraToggle} selectedLightings={selectedLightings} onLightingSelect={handleLightingToggle} selectedMockups={selectedMockups} onMockupSelect={handleMockupSelect} selectedManipulations={selectedManipulations} onManipulationSelect={handleManipulationToggle} selectedPeopleRetouches={selectedPeopleRetouches} onPeopleRetouchSelect={handlePeopleRetouchToggle} selectedRetouches={selectedRetouches} onRetouchSelect={handleRetouchToggle} exportSettings={dkExportSettings} setExportSettings={setDkExportSettings} referenceImage={referenceImage} isAnalyzing={isAnalyzing} suggestedPresetIds={suggestedPresetIds} onGenerate={handleDesignKitGeneration} canGenerate={!!productImage && !isLoading && isOnline} isLoading={isLoading} generatedImage={generatedImage} isUpscaling={isUpscaling} onUpscale={handleUpscale} isOnline={isOnline} upscaleMenuRef={upscaleMenuRef} isUpscaleMenuOpen={isUpscaleMenuOpen} setIsUpscaleMenuOpen={setIsUpscaleMenuOpen} />
                    </div>
                </main>
            )}

            {appMode === 'creative-studio' && (
                <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-screen-2xl mx-auto w-full overflow-hidden">
                    <div className="lg:col-span-4 bg-[var(--panel-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-6 flex flex-col space-y-6 overflow-y-auto shadow-xl shadow-black/20">
                        <div className="flex items-center bg-black/20 rounded-lg p-1 border border-[var(--border-color)]">
                            <button onClick={() => setCreativeMode('illustrate')} className={`w-1/2 px-4 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${creativeMode === 'illustrate' ? 'bg-cyan-500/20 text-white' : 'text-gray-200 hover:text-white'}`}><PaintBrushIcon className="w-5 h-5" /> {t('illustrate')}</button>
                            <button onClick={() => setCreativeMode('retouch')} className={`w-1/2 px-4 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${creativeMode === 'retouch' ? 'bg-cyan-500/20 text-white' : 'text-gray-200 hover:text-white'}`}><FaceSmileIcon className="w-5 h-5" /> {t('retouch')}</button>
                        </div>
                        
                        {creativeMode === 'illustrate' && (
                            <>
                                <ImageUploader title={t('baseImageTitle')} description={t('baseImageDescription')} onImageChange={setIllustrationImage} />
                                <ImageUploader title={t('styleReferenceTitle')} description={t('styleReferenceDescription')} onImageChange={setIllustrationReferenceImage} />
                                <div>
                                    <h3 className="font-semibold text-gray-100 text-lg">{t('illustrationStyleTitle')}</h3>
                                    <div className="p-3 bg-black/20 rounded-lg border border-[var(--border-color)] mt-3 space-y-2">
                                        <Toggle 
                                            label={t('useStylePreset')} 
                                            checked={useIllustrationStylePreset} 
                                            onChange={setUseIllustrationStylePreset} 
                                        />
                                        <p className="text-xs text-gray-400 -mt-1">
                                            {useIllustrationStylePreset 
                                                ? t('useStylePresetOn') 
                                                : t('useStylePresetOff')}
                                        </p>
                                    </div>
                                    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 transition-opacity duration-300 ${!useIllustrationStylePreset ? 'opacity-40 pointer-events-none' : ''}`}>
                                        {ILLUSTRATION_STYLE_PRESETS.map(preset => (
                                            <button 
                                                key={preset.id}
                                                onClick={() => setSelectedIllustrationStyle(preset)}
                                                className={`py-2 px-1 text-xs text-center font-semibold rounded-md transition-all border-2 ${selectedIllustrationStyle.id === preset.id && useIllustrationStylePreset ? 'bg-cyan-500/20 border-cyan-500' : 'bg-black/20 border-transparent hover:border-cyan-500/50'}`}
                                                title={t(preset.description)}
                                            >
                                                {t(preset.name)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="font-medium text-gray-200 text-base">{t('detailFidelityTitle')}</label>
                                        <span className="text-sm font-mono text-cyan-300">{illustrationDetailFidelity}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-3">{t('detailFidelityDescription')}</p>
                                    <input type="range" min="0" max="100" value={illustrationDetailFidelity} onChange={(e) => setIllustrationDetailFidelity(+e.target.value)} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-100 text-lg">{t('creativePromptOptionalTitle')}</h3>
                                    <p className="text-sm text-gray-300 mb-3">{t('creativePromptOptionalDescription')}</p>
                                    <textarea 
                                        value={illustrationCustomPrompt} 
                                        onChange={(e) => setIllustrationCustomPrompt(e.target.value)} 
                                        placeholder={
                                            selectedIllustrationStyle.id === 'none' 
                                            ? t('customStylePlaceholder')
                                            : t('styleEnhancementPlaceholder')
                                        }
                                        className="w-full bg-black/20 border border-[var(--border-color)] rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 transition-colors h-24 resize-y" 
                                    />
                                    <button onClick={handleGenerateCreativePrompts} disabled={!illustrationImage || isGeneratingPrompt || isGeneratingIllustration || isVectorizing} className={`mt-3 w-full py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center border-2 ${!illustrationImage || isGeneratingPrompt || isGeneratingIllustration || isVectorizing ? 'border-gray-500 text-gray-400 cursor-not-allowed' : 'border-cyan-500 text-cyan-300 hover:bg-cyan-500/10'}`}>
                                        {isGeneratingPrompt ? t('thinking') : t('suggestWithAI')}
                                        {isGeneratingPrompt ? <div className="w-5 h-5 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div> : <SparklesIcon className="h-5 w-5 ms-2" />}
                                    </button>
                                </div>
                                <div className="pt-4 flex-grow flex flex-col justify-end space-y-3">
                                    <button onClick={handleGenerateIllustration} disabled={!illustrationImage || isGeneratingIllustration || isVectorizing} className={`w-full py-3 px-4 text-lg font-bold rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] glow-on-hover ${!illustrationImage || isGeneratingIllustration || isVectorizing ? 'bg-gray-700/50 border border-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/20'}`}>
                                        {isGeneratingIllustration ? t('illustrating') : t('illustrateImage')}
                                        {isGeneratingIllustration ? <div className="w-6 h-6 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div> : <PaintBrushIcon className="h-6 w-6 ms-2" />}
                                    </button>
                                    
                                    {illustrationResultImage && !isGeneratingIllustration && (
                                        <div className="flex gap-3">
                                            <button onClick={() => handleUpscale('hd')} disabled={!illustrationResultImage || !!isUpscaling || isGeneratingIllustration || isVectorizing} className={`w-full py-2 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center bg-black/20 border-2 ${!illustrationResultImage || !!isUpscaling || isGeneratingIllustration || isVectorizing ? 'border-gray-600 text-gray-500 cursor-not-allowed' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10'}`}>
                                                {isUpscaling ? generationStatusText : t('upscaleHD')} {!!isUpscaling ? <div className="w-5 h-5 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div> : <UpscaleIcon className="w-5 h-5 ms-2" />}
                                            </button>
                                            <div className="relative w-full" ref={illustrationDownloadMenuRef}>
                                                <button 
                                                    onClick={() => setIsIllustrationDownloadMenuOpen(p => !p)} 
                                                    disabled={!!isUpscaling || isGeneratingIllustration || isVectorizing}
                                                    className={`w-full py-2 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center bg-black/20 border-2 ${!!isUpscaling || isGeneratingIllustration || isVectorizing ? 'border-gray-600 text-gray-500 cursor-not-allowed' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10'}`}
                                                >
                                                    {t('download')} <DownloadIcon className="w-5 h-5 ms-2" />
                                                </button>
                                                {isIllustrationDownloadMenuOpen && (
                                                    <div className="absolute bottom-full mb-2 w-full bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg z-10 p-1 space-y-1">
                                                        <a 
                                                            href={`data:${illustrationResultImage.mimeType};base64,${illustrationResultImage.base64}`} 
                                                            download="tomato-ai-illustration.png"
                                                            onClick={() => setIsIllustrationDownloadMenuOpen(false)}
                                                            className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-200 rounded-md hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                                                        >
                                                            <PhotoIcon className="w-5 h-5 text-cyan-400" /> {t('downloadPNG')}
                                                        </a>
                                                        <button
                                                            onClick={handleDownloadVector}
                                                            disabled={selectedIllustrationStyle.id !== 'vector' || isVectorizing}
                                                            className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-200 rounded-md hover:bg-cyan-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                            title={selectedIllustrationStyle.id !== 'vector' ? t('vectorOnlyWarning') : t('downloadSVGTooltip')}
                                                        >
                                                            <SvgIcon className="w-5 h-5 text-cyan-400" /> 
                                                            {isVectorizing ? t('vectorizing') : t('downloadSVG')}
                                                            {isVectorizing && <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin ms-1"></div>}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {creativeMode === 'retouch' && (
                             <>
                                <ImageUploader title={t('portraitImageTitle')} description={t('portraitImageDescription')} onImageChange={setPersonImage} />
                                
                                <div>
                                    <label className="text-sm font-semibold text-gray-300 mb-2 block">{t('retouchMode')}</label>
                                    <div className="flex items-center bg-black/20 rounded-lg p-1 border border-[var(--border-color)]">
                                        <button onClick={() => setRetouchSubMode('smart')} className={`w-1/2 px-3 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${retouchSubMode === 'smart' ? 'bg-cyan-500/20 text-white' : 'text-gray-300 hover:text-white'}`}><WandIcon className="w-5 h-5" /> {t('smartStudioRetouch')}</button>
                                        <button onClick={() => setRetouchSubMode('environment')} className={`w-1/2 px-3 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${retouchSubMode === 'environment' ? 'bg-cyan-500/20 text-white' : 'text-gray-300 hover:text-white'}`}><EnvironmentIcon className="w-5 h-5" /> {t('environmentMatch')}</button>
                                    </div>
                                </div>
                                
                                <AccordionItem title={t('promptGenerator')} icon={<SparklesIcon className="w-6 h-6 text-cyan-400" />}>
                                    <PromptGenerator
                                        onGenerate={handleGenerateRetouchPrompts}
                                        isLoading={isGeneratingRetouchPrompts}
                                        prompts={generatedRetouchPrompts}
                                        styleVariety={promptStyleVariety}
                                        onStyleVarietyChange={setPromptStyleVariety}
                                        syncWithEnv={syncPromptWithEnv}
                                        onSyncWithEnvChange={setSyncPromptWithEnv}
                                        onUsePrompt={(prompt) => setRetouchOptions(o => ({ ...o, artistCommand: prompt }))}
                                    />
                                </AccordionItem>

                                <AccordionItem title={t('advancedRetouchTitle')} icon={<CogIcon className="w-6 h-6 text-cyan-400"/>} isOpenDefault={false}>
                                    <div className="space-y-5 p-2">
                                        <div className="mt-2 p-2 text-center text-xs text-cyan-200 bg-cyan-500/10 rounded-md border border-cyan-500/30">
                                            <strong>{t('facePriority')}:</strong> {t('facePriorityDesc')}
                                        </div>

                                        <h4 className="font-semibold text-gray-100 text-base border-b border-[var(--border-color)] pb-2">{t('coreFaceRetouch')}</h4>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="font-medium text-gray-200 text-sm">{t('smoothnessIntensity')}</label>
                                                <span className="text-sm font-mono text-cyan-300">{retouchOptions.smoothness}</span>
                                            </div>
                                            <input type="range" min="0" max="100" value={retouchOptions.smoothness} onChange={(e) => setRetouchOptions(o => ({...o, smoothness: +e.target.value}))} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="font-medium text-gray-200 text-sm">{t('lightBalance')}</label>
                                                 <span className="text-sm font-mono text-cyan-300">{retouchOptions.lightBalance}</span>
                                            </div>
                                            <input type="range" min="0" max="100" value={retouchOptions.lightBalance} onChange={(e) => setRetouchOptions(o => ({...o, lightBalance: +e.target.value}))} />
                                        </div>
                                        <div className="space-y-3 pt-2">
                                            <Toggle label={t('skinToneCorrection')} checked={retouchOptions.correctSkinTones} onChange={(c) => setRetouchOptions(o => ({...o, correctSkinTones: c}))} />
                                            <Toggle label={t('sharpenEnhance')} checked={retouchOptions.sharpen} onChange={(c) => setRetouchOptions(o => ({...o, sharpen: c}))} />
                                            <Toggle label={t('removeBlemishes')} checked={retouchOptions.removeBlemishes} onChange={(c) => setRetouchOptions(o => ({...o, removeBlemishes: c}))} />
                                        </div>

                                        <h4 className="font-semibold text-gray-100 text-base border-b border-[var(--border-color)] pb-2 pt-4">{t('artisticEffects')}</h4>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="font-medium text-gray-200 text-sm">{t('backgroundBlur')}</label>
                                                <span className="text-sm font-mono text-cyan-300">{retouchOptions.backgroundBlur}</span>
                                            </div>
                                            <input type="range" min="0" max="100" value={retouchOptions.backgroundBlur} onChange={(e) => setRetouchOptions(o => ({...o, backgroundBlur: +e.target.value}))} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="font-medium text-gray-200 text-sm">{t('hdrEffect')}</label>
                                                <span className="text-sm font-mono text-cyan-300">{retouchOptions.hdrEffect}</span>
                                            </div>
                                            <input type="range" min="0" max="100" value={retouchOptions.hdrEffect} onChange={(e) => setRetouchOptions(o => ({...o, hdrEffect: +e.target.value}))} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="font-medium text-gray-200 text-sm">{t('vintageFade')}</label>
                                                <span className="text-sm font-mono text-cyan-300">{retouchOptions.vintageFade}</span>
                                            </div>
                                            <input type="range" min="0" max="100" value={retouchOptions.vintageFade} onChange={(e) => setRetouchOptions(o => ({...o, vintageFade: +e.target.value}))} />
                                        </div>
                                         <Toggle label={t('glossySkin')} checked={retouchOptions.glossySkin} onChange={(c) => setRetouchOptions(o => ({...o, glossySkin: c}))} />

                                        <div className={`pt-4 ${retouchSubMode !== 'environment' ? 'opacity-40 pointer-events-none' : ''}`}>
                                            <h4 className="font-semibold text-gray-100 text-base border-b border-[var(--border-color)] pb-2 mb-4">{t('envHarmonization')}</h4>
                                            <div className="space-y-5">
                                                <Toggle label={t('environmentHarmony')} checked={retouchOptions.environmentHarmony} onChange={(c) => setRetouchOptions(o => ({...o, environmentHarmony: c}))} disabled={retouchSubMode !== 'environment'}/>
                                                <div>
                                                    <label className="font-medium text-gray-200 text-sm mb-2 block">{t('lightDirection')}</label>
                                                    <div className="grid grid-cols-5 gap-1">
                                                        {LIGHT_DIRECTIONS.map(dir => (
                                                            <button key={dir} onClick={() => setRetouchOptions(o => ({...o, lightDirection: dir}))} className={`py-1.5 px-1 text-xs font-semibold rounded-md transition-all border-2 ${retouchOptions.lightDirection === dir ? 'bg-cyan-500/20 border-cyan-500' : 'bg-black/20 border-transparent hover:border-cyan-500/50'}`}>{t(dir)}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="font-medium text-gray-200 text-sm">{t('keyFillRatio')}</label>
                                                        <span className="text-sm font-mono text-cyan-300">{retouchOptions.keyFillRatio}</span>
                                                    </div>
                                                    <input type="range" min="0" max="100" value={retouchOptions.keyFillRatio} onChange={(e) => setRetouchOptions(o => ({...o, keyFillRatio: +e.target.value}))} />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="font-medium text-gray-200 text-sm">{t('shadowSoftness')}</label>
                                                        <span className="text-sm font-mono text-cyan-300">{retouchOptions.shadowSoftness}</span>
                                                    </div>
                                                    <input type="range" min="0" max="100" value={retouchOptions.shadowSoftness} onChange={(e) => setRetouchOptions(o => ({...o, shadowSoftness: +e.target.value}))} />
                                                </div>
                                                <div>
                                                    <label className="font-medium text-gray-200 text-sm mb-2 block">{t('wbAndGrade')}</label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {WB_AND_GRADES.map(grade => (
                                                            <button key={grade} onClick={() => setRetouchOptions(o => ({...o, wbAndGrade: grade}))} className={`py-2 px-1 text-xs font-semibold rounded-md transition-all border-2 ${retouchOptions.wbAndGrade === grade ? 'bg-cyan-500/20 border-cyan-500' : 'bg-black/20 border-transparent hover:border-cyan-500/50'}`}>{t(grade)}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="font-medium text-gray-200 text-sm mb-2 block">{t('artistCommand')}</label>
                                                    <textarea value={retouchOptions.artistCommand} onChange={(e) => setRetouchOptions(o => ({...o, artistCommand: e.target.value}))} placeholder={t('artistCommandPlaceholder')} className="w-full bg-black/20 border border-[var(--border-color)] rounded-lg p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 transition-colors h-20 resize-y text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionItem>

                                {retouchSubMode === 'environment' && (
                                     <div>
                                        <label className="text-sm font-semibold text-gray-300 mb-2 block">{t('environmentPresets')}</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {ENVIRONMENT_PRESETS.map(preset => (
                                                <button 
                                                    key={preset}
                                                    onClick={() => setSelectedEnvironment(preset)}
                                                    className={`py-2 px-1 text-xs font-semibold rounded-md transition-all border-2 ${selectedEnvironment === preset ? 'bg-cyan-500/20 border-cyan-500' : 'bg-black/20 border-transparent hover:border-cyan-500/50'}`}
                                                >
                                                    {t(preset)}
                                                </button>
                                            ))}
                                        </div>
                                     </div>
                                )}
                                
                                <div className="pt-4 flex-grow flex flex-col justify-end space-y-3">
                                    <button onClick={handleSmartRetouch} disabled={!personImage || retouchSubMode !== 'smart' || isGeneratingCreative} className={`w-full py-3 px-4 text-lg font-bold rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] glow-on-hover ${!personImage || retouchSubMode !== 'smart' || isGeneratingCreative ? 'bg-gray-700/50 border border-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-600/20'}`}>
                                        {isGeneratingCreative && retouchSubMode === 'smart' ? generationStatusText : t('smartRetouch')} {isGeneratingCreative && retouchSubMode === 'smart' ? <div className="w-6 h-6 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div> : '⚡'}
                                    </button>
                                     <button onClick={handleEnvironmentGeneration} disabled={!personImage || retouchSubMode !== 'environment' || isGeneratingCreative} className={`w-full py-3 px-4 text-lg font-bold rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] glow-on-hover ${!personImage || retouchSubMode !== 'environment' || isGeneratingCreative ? 'bg-gray-700/50 border border-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/20'}`}>
                                        {isGeneratingCreative && retouchSubMode === 'environment' ? generationStatusText : t('generateEnvironment')} {isGeneratingCreative && retouchSubMode === 'environment' ? <div className="w-6 h-6 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div> : '🌆'}
                                    </button>
                                     <div className="flex gap-3">
                                        <button onClick={() => handleUpscale('hd')} disabled={!retouchResultImage || !!isUpscaling || isGeneratingCreative} className={`w-full py-2 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center bg-black/20 border-2 ${!retouchResultImage || !!isUpscaling || isGeneratingCreative ? 'border-gray-600 text-gray-500 cursor-not-allowed' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10'}`}>
                                            {isUpscaling ? generationStatusText : t('upscaleHD')} {!!isUpscaling ? <div className="w-5 h-5 border-2 border-t-white border-white/30 rounded-full animate-spin ms-2"></div> : <UpscaleIcon className="w-5 h-5 ms-2" />}
                                        </button>
                                        <a 
                                            href={retouchResultImage ? `data:${retouchResultImage.mimeType};base64,${retouchResultImage.base64}` : undefined} 
                                            download="tomato-ai-retouch.png"
                                            className={`w-full py-2 px-4 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center bg-black/20 border-2 ${!retouchResultImage || isGeneratingCreative || !!isUpscaling ? 'border-gray-600 text-gray-500 cursor-not-allowed pointer-events-none' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10'}`}
                                        >
                                            {t('download')} <DownloadIcon className="w-5 h-5 ms-2" />
                                        </a>
                                     </div>
                                </div>
                             </>
                        )}
                        <div className="border-t border-[var(--border-color)] pt-6"><HistoryPanel history={generationHistory} onSelect={handleHistorySelect} /></div>
                    </div>
                    
                    <div className="lg:col-span-8 bg-[var(--panel-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-2 flex flex-col items-center justify-center relative min-h-[50vh] lg:min-h-0 overflow-y-auto shadow-xl shadow-black/20">
                        {(isGeneratingIllustration || isGeneratingCreative || !!isUpscaling || isVectorizing) && <Loader><p className="mt-4 text-lg font-semibold text-cyan-300">{generationStatusText}</p></Loader>}
                        
                        {creativeMode === 'illustrate' && !(isGeneratingIllustration || !!isUpscaling || isVectorizing) && (
                            !illustrationResultImage ? (
                                <div className="text-center p-8 flex flex-col items-center justify-center animate-pulse-slow">
                                    <PaintBrushIcon className="w-20 h-20 opacity-10 mb-6" />
                                    <p className="text-lg font-medium text-gray-200">{t('illustrationPlaceholderTitle')}</p>
                                    <p className="text-sm text-gray-300">{t('illustrationPlaceholderSubtitle')}</p>
                                </div>
                            ) : illustrationImage && <BeforeAfterSlider beforeSrc={`data:${illustrationImage.mimeType};base64,${illustrationImage.base64}`} afterSrc={`data:${illustrationResultImage.mimeType};base64,${illustrationResultImage.base64}`} />
                        )}

                        {creativeMode === 'retouch' && !(isGeneratingCreative || !!isUpscaling) && (
                            !retouchResultImage ? (
                                <div className="text-center p-8 flex flex-col items-center justify-center animate-pulse-slow">
                                    <FaceSmileIcon className="w-20 h-20 opacity-10 mb-6" />
                                    <p className="text-lg font-medium text-gray-200">{t('retouchPlaceholderTitle')}</p>
                                    <p className="text-sm text-gray-300">{t('retouchPlaceholderSubtitle')}</p>
                                </div>
                            ) : personImage && <BeforeAfterSlider beforeSrc={`data:${personImage.mimeType};base64,${personImage.base64}`} afterSrc={`data:${retouchResultImage.mimeType};base64,${retouchResultImage.base64}`} />
                        )}

                         {(creativeError || upscaleError) && !(isGeneratingCreative || isGeneratingIllustration || !!isUpscaling || isVectorizing) && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl">
                                <div className="text-center text-red-400"><p className="text-lg font-bold">{t('operationFailed')}</p><p className="text-sm mt-2 max-w-sm">{creativeError || upscaleError}</p></div>
                            </div>
                        )}
                    </div>
                </main>
            )}

            {isDKPromptModalOpen && suggestedDKPrompts && (
                <PromptSuggestionsModal isOpen={isDKPromptModalOpen} suggestions={suggestedDKPrompts} onSelect={(p) => { setCustomPrompt(p); setIsDKPromptModalOpen(false); }} onClose={() => setIsDKPromptModalOpen(false)} />
            )}

            {isCreativePromptModalOpen && suggestedCreativePrompts && (
                <PromptSuggestionsModal isOpen={isCreativePromptModalOpen} suggestions={suggestedCreativePrompts} onSelect={(p) => {
                    if (creativeMode === 'illustrate') setIllustrationCustomPrompt(p);
                    setIsCreativePromptModalOpen(false);
                }} onClose={() => setIsCreativePromptModalOpen(false)} />
            )}

            {!isOnline && <OfflineBanner />}
        </div>
    );
};

const App: React.FC = () => (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
);


export default App;