import React from 'react';
import { ExportSettings, AspectRatio } from '../types';
import { EXPORT_ASPECT_RATIOS } from '../constants';
import { useLanguage } from '../App';
import { CheckIcon } from './Icons';

interface ExportControlsProps {
    settings: ExportSettings;
    setSettings: (settings: ExportSettings) => void;
    hideTransparency?: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({ settings, setSettings, hideTransparency = false }) => {
    const { t } = useLanguage();

    const handleAspectRatioChange = (value: AspectRatio) => {
        setSettings({ ...settings, aspectRatio: value });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">{t('aspectRatio')}</label>
                <div className="flex items-center bg-black/20 rounded-lg p-1 border border-[var(--border-color)]">
                    {EXPORT_ASPECT_RATIOS.map(ratio => (
                        <button
                            key={ratio.value}
                            onClick={() => handleAspectRatioChange(ratio.value)}
                            className={`w-1/2 px-3 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${settings.aspectRatio === ratio.value ? 'bg-cyan-500/20 text-white' : 'text-gray-200 hover:text-white hover:bg-white/10'}`}
                        >
                            {t(ratio.label)} ({ratio.value})
                        </button>
                    ))}
                </div>
            </div>
            {!hideTransparency && (
                <div className="flex items-center justify-between pt-2">
                    <label htmlFor="transparent" className="font-medium text-gray-200">
                        {t('transparentBackground')}
                    </label>
                    <button
                        id="transparent"
                        onClick={() => setSettings({ ...settings, transparent: !settings.transparent })}
                        className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                            settings.transparent ? 'bg-cyan-500' : 'bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={settings.transparent}
                    >
                        <span
                            className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 flex items-center justify-center ${
                                settings.transparent ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                            }`}
                        >
                             {settings.transparent && <CheckIcon className="w-3 h-3 text-cyan-500" />}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportControls;
