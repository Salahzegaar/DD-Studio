import React from 'react';

export interface Preset {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
}

export interface IllustrationStylePreset extends Preset {}

export interface CameraPreset extends Preset {
    metadata: string;
}

export interface LightingPreset extends Preset {
    metadata: string;
}

export interface MockupPreset extends Preset {
    // no extra fields
}

export interface ManipulationPreset extends Preset {
    // no extra fields
}

export interface PeopleRetouchPreset extends Preset {
    // no extra fields
}

export interface RetouchPreset extends Preset {
    // no extra fields
}

export type AspectRatio = '4:5' | '16:9';

export interface ExportSettings {
    aspectRatio: AspectRatio;
    transparent: boolean;
}

export interface ImageFile {
    file: File;
    base64: string;
    mimeType: string;
}

export interface GenerationParams {
    cameraPresets: CameraPreset[];
    lightingPresets: LightingPreset[];
    mockupPreset: MockupPreset;
    manipulationPresets: ManipulationPreset[];
    peopleRetouchPresets: PeopleRetouchPreset[];
    retouchPresets: RetouchPreset[];
    exportSettings: ExportSettings;
    customPrompt: string;
}

export type AppMode = 'design-kit' | 'creative-studio';
export type CreativeMode = 'illustrate' | 'retouch';
export type RetouchSubMode = 'smart' | 'environment';

export type LightDirection = 'Auto' | 'Left' | 'Right' | 'Top' | 'Back';
export type WbAndGrade = 'Auto' | 'Neutral' | 'Filmic' | 'Cinematic (Teal & Orange)' | 'Warm Interior' | 'Cool Night' | 'Monochrome' | 'Cross-Process';

export interface RetouchOptions {
    // Core Face Retouch
    smoothness: number;
    lightBalance: number;
    correctSkinTones: boolean;
    sharpen: boolean;
    removeBlemishes: boolean;
    
    // Artistic Effects
    backgroundBlur: number;
    hdrEffect: number;
    vintageFade: number;
    glossySkin: boolean;

    // Environment Harmonization
    environmentHarmony: boolean;
    lightDirection: LightDirection;
    keyFillRatio: number; // slider 0-100
    shadowSoftness: number; // slider 0-100
    wbAndGrade: WbAndGrade;
    artistCommand: string;
}


export type UpscaleTarget = 'hd' | '4k';

export interface HistoryItem {
    id: string;
    // For images, 'generated' holds the result.
    generated: { base64: string; mimeType: string };
    source: ImageFile;
    prompt: string;
    mode: AppMode;
    creativeSubMode?: CreativeMode;
}


export interface PromptSuggestion {
    title: string;
    prompt: string;
}