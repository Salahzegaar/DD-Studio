import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GenerationParams, ImageFile, UpscaleTarget, PromptSuggestion, RetouchOptions, IllustrationStylePreset } from '../types';

// According to guidelines, API key must be from process.env.API_KEY
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface AnalysisResult {
    // FIX: Added an index signature to make the type compatible with Record<string, string[]>.
    [key: string]: string[];
    camera: string[];
    lighting: string[];
    mockup: string[];
    manipulation: string[];
    retouch: string[];
    peopleRetouch: string[];
}

export const analyzeForCompositeSuggestions = async (productImage: ImageFile, referenceImage: ImageFile): Promise<AnalysisResult> => {
    const model = 'gemini-2.5-flash';

    const productPart = { inlineData: { mimeType: productImage.mimeType, data: productImage.base64 } };
    const referencePart = { inlineData: { mimeType: referenceImage.mimeType, data: referenceImage.base64 } };

    const prompt = `You are a professional art director. Analyze the provided product image (first) and the reference/style image (second).
    
    Your goal is to suggest the best technical and creative presets to create a high-end advertisement by placing the product into a NEW scene that is HEAVILY INSPIRED by the reference image's style, mood, and lighting. Do NOT suggest simply putting the product into the reference image.
    
    Your response MUST be in JSON format. Provide suggestions for the following categories by returning the preset 'id's.
    - "camera": Suggest 1-2 camera presets that would best frame the product in a scene like the reference.
    - "lighting": Suggest 1-2 lighting presets that mimic the reference image's mood.
    - "manipulation": Suggest 2-3 manipulation/FX presets to seamlessly blend the product and achieve the desired style (e.g., atmospheric effects, reflections).
    - "retouch": Suggest 1-2 essential product retouching presets.
    - "peopleRetouch": If the product is for people (e.g., makeup) or the reference has people, suggest 1 preset. Otherwise, return an empty array.
    - "mockup": Return an empty array. Mockups are not used with reference images.
    
    Example response:
    {
      "camera": ["hero-45"],
      "lighting": ["day-02"],
      "mockup": [],
      "manipulation": ["shadow-synthesis", "atmospheric-fx", "ibl-match"],
      "retouch": ["cleanup", "specular-control"],
      "peopleRetouch": []
    }`;


    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: { parts: [productPart, referencePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        camera: { type: Type.ARRAY, items: { type: Type.STRING } },
                        lighting: { type: Type.ARRAY, items: { type: Type.STRING } },
                        mockup: { type: Type.ARRAY, items: { type: Type.STRING } },
                        manipulation: { type: Type.ARRAY, items: { type: Type.STRING } },
                        retouch: { type: Type.ARRAY, items: { type: Type.STRING } },
                        peopleRetouch: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["camera", "lighting", "mockup", "manipulation", "retouch", "peopleRetouch"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AnalysisResult;
    } catch (error) {
        console.error("Error analyzing composite image:", error);
        throw new Error("Failed to get composite suggestions from AI.");
    }
};

export const generateImage = async (
    productImage: ImageFile,
    referenceImage: ImageFile | null,
    useMagicComposite: boolean,
    params: GenerationParams,
): Promise<{ base64: string; mimeType: string } | null> => {
    
    const {
        cameraPresets,
        lightingPresets,
        mockupPreset,
        manipulationPresets,
        retouchPresets,
        peopleRetouchPresets,
        exportSettings,
        customPrompt,
    } = params;

    const model = 'gemini-2.5-flash-image';
    
    let prompt = `You are an expert product photographer and digital artist.
Your task is to create a dynamic, professional advertisement image. The FIRST image is the primary subject (a product, logo, or graphic). You will place this subject into a newly generated, photorealistic scene.

--- MOST IMPORTANT RULE ---
The final output image's dimensions MUST strictly follow a ${exportSettings.aspectRatio} aspect ratio. This is a non-negotiable requirement.

--- PRIMARY SCENE GOAL ---\n`;

    if (mockupPreset && mockupPreset.id !== 'none') {
        prompt += `Place the subject from the FIRST image within a photorealistic "${mockupPreset.name}" environment. The subject must be integrated naturally into this scene. For context, a "${mockupPreset.name}" is: ${mockupPreset.description}.\n\n`;
    } else {
        prompt += "Place the subject from the FIRST image on a clean, elegant, professional studio backdrop that complements its style and the instructions below.\n\n";
    }

    prompt += `--- LOGO & GRAPHIC APPLICATION (VERY IMPORTANT) ---\n`;
    prompt += `If the subject in the FIRST image is a logo, sticker, text, or flat graphic, your primary task is NOT just to place it in the scene, but to **apply it realistically onto a surface within the scene**.
- If a mockup is selected (e.g., 'T-Shirt Model', 'Cafe Table' which implies a cup, 'Supermarket Shelf' which implies packaging), you MUST apply the logo to the relevant object in that mockup scene.
- The application must be realistic: the logo should wrap around curved surfaces, match the lighting and shadows of the object, and adopt the texture of the surface it's on (e.g., look like it's printed on fabric, etched on glass, etc.).
- The logo itself should remain clear and preserve its original colors and form.\n\n`;

    if (referenceImage) {
        prompt += `--- SCENE STYLE INSPIRATION ---\n`;
        prompt += `The SECOND image provided is a reference for the overall style and mood.
**IMPORTANT:** Do NOT composite the subject directly into the reference image.
Instead, the entire new scene you generate (whether it's the mockup or the studio backdrop) must be heavily INSPIRED by the reference image. Capture its atmosphere, lighting, color palette, and aesthetic. The final result must be a completely new and unique image that combines the product, the mockup scene, and the reference style.\n\n`;
    }
    
    prompt += "--- CREATIVE & TECHNICAL INSTRUCTIONS ---\n";
    prompt += "- **Composition**: If the subject is a physical product, it is CRITICAL to keep its exact composition, camera angle, and perspective from the original input image. Build the new scene *around* the product as it is. HOWEVER, if the subject is a logo/graphic being applied to a mockup surface, you should instead focus on placing the logo naturally on the mockup's surface, adjusting its perspective and wrapping it as needed for realism. Do not change the logo's core design.\n";
    prompt += `${useMagicComposite ? "**Magic Composite Mode is ON**: You have creative freedom to interpret these instructions to create the most stunning image possible.\n" : "**Manual Design Kit Mode is ON**: Strictly adhere to the following instructions.\n"}`;

    if (customPrompt) {
        prompt += `\n- **Creative Direction**: "${customPrompt}"\n`;
    }

    if (cameraPresets.length > 0 && cameraPresets.some(p => p.id !== 'none')) {
        prompt += `- **Camera Instructions**:\n`;
        cameraPresets.forEach(p => { if (p.id !== 'none') prompt += `  - ${p.name}: ${p.description}. Technical hint: ${p.metadata}\n`; });
    }
    
    if (lightingPresets.length > 0 && lightingPresets.some(p => p.id !== 'none')) {
        prompt += `- **Lighting Instructions**:\n`;
        lightingPresets.forEach(p => { if (p.id !== 'none') prompt += `  - ${p.name}: ${p.description}. Technical hint: ${p.metadata}\n`; });
    }
    
    prompt += "\n\n--- POST-PRODUCTION & RETOUCHING ---";

    if (retouchPresets.length > 0 && retouchPresets.some(p => p.id !== 'none')) {
        prompt += `\n- **Product Retouching**:\n`;
        retouchPresets.forEach(p => { if (p.id !== 'none') prompt += `  - ${p.name}: ${p.description}.\n`; });
    }

    if (peopleRetouchPresets.length > 0 && peopleRetouchPresets.some(p => p.id !== 'none')) {
        prompt += `- **People Retouching**:\n`;
        peopleRetouchPresets.forEach(p => { if (p.id !== 'none') prompt += `  - ${p.name}: ${p.description}.\n`; });
    }

    if (manipulationPresets.length > 0 && manipulationPresets.some(p => p.id !== 'none')) {
        prompt += `- **Creative Manipulations & FX**:\n`;
        manipulationPresets.forEach(p => { if (p.id !== 'none') prompt += `  - ${p.name}: ${p.description}.\n`; });
    }
    
    prompt += "\n--- FINAL EXPORT REQUIREMENTS ---\n";
    prompt += `- **Background**: ${exportSettings.transparent ? "The final image MUST have a transparent background (PNG format). If compositing, this means removing the original background but keeping all generated shadows and reflections for placing on another backdrop." : "The final image must have a fully rendered, opaque background."}\n`;
    prompt += "- **Output**: The final output must be ONLY the generated image. Do not add any text, watermarks, or annotations. The product is the hero.";
    
    const imagePart = {
        inlineData: {
            data: productImage.base64,
            mimeType: productImage.mimeType,
        },
    };
    
    const parts: any[] = [imagePart];

    if (referenceImage) {
        const referencePart = {
            inlineData: {
                data: referenceImage.base64,
                mimeType: referenceImage.mimeType,
            },
        };
        parts.push(referencePart);
    }

    parts.push({ text: prompt });

    try {
        const response = await genAI.models.generateContent({
            model,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        console.error("No image found in Gemini response.");
        return null;

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("The AI failed to generate an image. This could be due to a safety policy violation or an internal error.");
    }
};

export const generateDesignKitPrompt = async (
    productImage: ImageFile,
    referenceImage: ImageFile | null
): Promise<PromptSuggestion[]> => {
    const model = 'gemini-2.5-flash';
    
    const parts: any[] = [{ inlineData: { mimeType: productImage.mimeType, data: productImage.base64 } }];
    
    let promptText = '';

    if (referenceImage) {
        parts.push({ inlineData: { mimeType: referenceImage.mimeType, data: referenceImage.base64 } });
        promptText = `You are a world-class creative director specializing in high-end advertising. Your task is to generate 3 distinct and creative prompt variations for an AI image generator.

Analyze the provided product image (first) and the style reference image (second).

The goal is to place the product from the first image into a completely new, photorealistic scene that is heavily inspired by the style, mood, composition, camera angle, and lighting of the second image.

Each prompt variation must be a complete, detailed instruction for the AI. Give each variation a short, catchy title that reflects its creative direction. For example, a title could be "Cinematic Drama" or "Minimalist Serenity". The prompt itself should be descriptive and evocative.

Your response MUST be in JSON format. Do not output anything else.`;
    } else {
        promptText = `You are a world-class creative director specializing in high-end advertising. Your task is to generate 3 distinct and creative prompt variations for an AI image generator based on the provided product image.

For each variation, invent a completely new, photorealistic scene to place the product in. Each scene should have a different mood and style (e.g., one could be luxurious and dark, another bright and natural, a third futuristic and neon).

Each prompt variation must be a complete, detailed instruction for the AI. Give each variation a short, catchy title that reflects its creative direction. For example, a title could be "Cinematic Drama" or "Minimalist Serenity". The prompt itself should be descriptive and evocative.

Your response MUST be in JSON format. Do not output anything else.`;
    }
    
    parts.push({ text: promptText });

    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: { parts: parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            prompt: { type: Type.STRING },
                        },
                        required: ["title", "prompt"],
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PromptSuggestion[];
    } catch (error) {
        console.error("Error generating Design Kit prompt suggestions:", error);
        throw new Error("AI failed to generate creative prompt suggestions.");
    }
};

export const generateIllustrationPrompts = async (baseImage: ImageFile, referenceImage: ImageFile | null): Promise<PromptSuggestion[]> => {
    const model = 'gemini-2.5-flash';
    
    const parts: any[] = [{ inlineData: { mimeType: baseImage.mimeType, data: baseImage.base64 } }];
    let promptText = '';

    if (referenceImage) {
        parts.push({ inlineData: { mimeType: referenceImage.mimeType, data: referenceImage.base64 } });
        promptText = `You are a creative art director. Analyze the two provided images. The first is the 'base image' (the subject), and the second is the 'style reference'. Your task is to generate 3 distinct and creative prompts that describe how the base image could be re-imagined as an illustration in the artistic style of the reference image.

Each prompt should be a complete instruction for an illustration AI. Capture the mood, color palette, texture, and overall art direction from the style reference and apply it to the subject of the base image.

Give each variation a short, catchy title (e.g., "Gouache Storybook", "Cyberpunk Ink"). The prompt itself should be descriptive and evocative. Your response MUST be in JSON format. Do not output anything else.`;
    } else {
        promptText = `You are a creative artist. Analyze the provided static image. Your task is to generate 3 distinct and creative prompts that describe how this image could be re-imagined as an illustration.

Each prompt should suggest a different artistic style or theme. Be descriptive and evocative.
- Example 1 (Thematic): "A lone astronaut discovering this scene on a forgotten, alien planet, with two moons in the sky."
- Example 2 (Stylistic): "A vintage storybook illustration of this scene, with soft watercolors and charming, simple lines."
- Example 3 (Technical): "A detailed technical blueprint of the subject, showing its inner workings with annotations."

Give each variation a short, catchy title (e.g., "Cosmic Discovery", "Storybook Charm", "Technical Breakdown"). The prompt should be a complete instruction for an illustration generation AI. Your response MUST be in JSON format. Do not output anything else.`;
    }

    parts.push({ text: promptText });

    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: { parts: parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            prompt: { type: Type.STRING },
                        },
                        required: ["title", "prompt"],
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PromptSuggestion[];
    } catch (error) {
        console.error("Error generating illustration prompts:", error);
        throw new Error("AI failed to generate illustration prompts.");
    }
};

export const generateIllustration = async (
    baseImage: ImageFile,
    style: IllustrationStylePreset,
    detailFidelity: number,
    customPrompt: string,
    referenceImage: ImageFile | null
): Promise<{ base64: string; mimeType: string } | null> => {
    const model = 'gemini-2.5-flash-image';
    
    const parts: any[] = [{ inlineData: { data: baseImage.base64, mimeType: baseImage.mimeType } }];
    
    let promptText = `Act as a master illustrator with expertise in a wide range of artistic styles. Your task is to transform the provided base image into a high-quality illustration.`;

    let styleReferenceInstruction = '';
    if (referenceImage) {
        parts.push({ inlineData: { data: referenceImage.base64, mimeType: referenceImage.mimeType } });
        styleReferenceInstruction = `--- STYLE REFERENCE (TOP PRIORITY) ---
A style reference image has been provided. The final illustration's art direction—including color palette, mood, texture, and overall aesthetic—should be **heavily inspired by this reference image**. This is a higher priority than the style preset or custom prompt if they conflict.`;
    }
    
    let fidelityInstruction = '';
    if (detailFidelity > 80) {
        fidelityInstruction = "It is absolutely critical that you create a faithful illustration. The composition, subject, pose, and all key details from the original image MUST be preserved. This is a stylistic transformation, not a re-imagination.";
    } else if (detailFidelity > 40) {
        fidelityInstruction = "Preserve the main subject, composition, and key elements from the original image, but feel free to interpret the finer details and background in the chosen artistic style.";
    } else {
        fidelityInstruction = "Use the original image as a loose inspiration for a new illustration in the chosen style. The core subject should be recognizable, but you have creative freedom with the composition and details.";
    }

    let primaryStyleGoal = '';
    if (style.id === 'none') {
        primaryStyleGoal = `The illustration style should be guided primarily by the user's custom prompt. If the prompt is empty and no style reference is given, you have creative freedom to choose a suitable, beautiful illustration style.`;
    } else {
        primaryStyleGoal = `The illustration must be in the style of **${style.name}**. For context, this style is described as: "${style.description}".`;
    }

    promptText += `
${styleReferenceInstruction}

--- PRESET STYLE GOAL ---
${primaryStyleGoal}

--- DETAIL & COMPOSITION ---
**Fidelity Level: ${detailFidelity}/100.** ${fidelityInstruction}

--- ADDITIONAL CREATIVE DIRECTION ---
${customPrompt ? `The user has provided this specific direction: "${customPrompt}". Integrate this into your final artwork.` : "No additional creative direction was provided."}

--- FINAL OUTPUT REQUIREMENTS ---
- The final image must strictly adhere to the requested illustration style and reference.
- Maintain the aspect ratio of the original source image.
- The output must be ONLY the generated illustration. Do not add any text, watermarks, or annotations.`;

    parts.push({ text: promptText });

    try {
        const response = await genAI.models.generateContent({
            model,
            contents: { parts: parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating illustration:", error);
        throw new Error("The AI failed to generate the illustration.");
    }
};


export const generateRetouchPrompts = async (
    environmentPreset: string,
    styleVariety: 'normal' | 'wide',
    syncWithEnvironment: boolean
): Promise<string[]> => {
    const model = 'gemini-2.5-flash';

    let promptText = `Act as a senior portrait retoucher and colorist. Your task is to generate exactly 3 distinct, high-quality prompts for a photorealistic, cinematic portrait/fashion shot.

**Core Rules (Non-Negotiable):**
- **Face Priority:** All prompts must enforce the preservation of natural skin texture and pores. Mention subtle, professional Dodge & Burn for sculpting, and tasteful blemish removal. Avoid any language that suggests plastic smoothing, over-whitening, or halo sharpening.
- **Cinematic Quality:** Prompts should describe professional, high-end photography.
- **Concise Format:** Each prompt must be a single, flowing paragraph (2-4 sentences). Do not use bullet points.
- **Technical Tail:** Each prompt MUST end with a technical tail, formatted exactly like this: "— [lens mm], [aperture], ISO [value], [shutter hint], [DOF type], [grade note], high-resolution render."

**Generation Instructions:**
- **Variety Axis:** Generate three distinct prompts. They must vary significantly across lighting style (e.g., soft studio gels, golden hour, neon rim, high-key), camera angle (e.g., low-angle, 45° editorial, top-down), and mood/color grade (e.g., filmic, teal-orange, warm interior, cool night, neutral).
- **Style Variety Setting:** The user has selected "${styleVariety}" variety. "Normal" means creative but plausible variations. "Wide" means you should push for more dramatic and stylistically different options (e.g., one very dark and moody, one bright and airy, one abstract).
`;

    if (syncWithEnvironment) {
        promptText += `- **Environment Sync (ON):** You MUST adapt the prompt's wording to synergize with the selected environment: "${environmentPreset}". This includes referencing appropriate lighting (e.g., 'warm practicals' for 'Luxury Interior'), color temperature, grade, and shadow quality that would be found in that scene. The background description should also be inspired by the environment preset.\n`;
    } else {
        promptText += `- **Environment Sync (OFF):** You have creative freedom to suggest any background or environment, ignoring the user's current preset.\n`;
    }
    
    promptText += `
**Prompt Structure Guide:**
[Adjective stack for realism + tone] [genre: fashion/portrait/editorial] shot with [camera position & lens]. Lighting: [key style] + [fill/rim] tuned to [environment WB & mood]; shadows [soft/defined] with [contact shadow/halation]. Background: [gradient/backdrop/scene cue] matching [preset]; color grading [filmic/teal-orange/warm interior/cool night/neutral]. Focus on **face** (pores preserved, subtle dodge & burn, natural skin); output photorealistic and cinematic. — [lens mm], [aperture], ISO [value], [shutter hint], controlled DOF, [grade note], high-resolution render.

**Output Format:** Your response MUST be a JSON object with a single key "prompts" which is an array containing exactly three string elements. Example: {"prompts": ["First prompt text...", "Second prompt text...", "Third prompt text..."]}`;

    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: { parts: [{ text: promptText }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        prompts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                    },
                    required: ["prompts"],
                }
            }
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        if (result.prompts && result.prompts.length === 3) {
            return result.prompts;
        } else {
            throw new Error("AI did not return 3 prompts in the expected format.");
        }
    } catch (error) {
        console.error("Error generating retouch prompts:", error);
        throw new Error("AI failed to generate retouch prompts.");
    }
};


export const performSmartRetouch = async (
    personImage: ImageFile,
    options: RetouchOptions
): Promise<{ base64: string; mimeType: string } | null> => {
    const model = 'gemini-2.5-flash-image';
    const imagePart = { inlineData: { data: personImage.base64, mimeType: personImage.mimeType } };
    
    let promptText = `Act as a senior portrait retoucher and colorist. Your task is to perform a high-end, face-priority portrait retouch on the provided image. The goal is a natural, cinematic, and professional result, preserving the subject's identity and character. Adhere to the following professional studio standards:

--- PRIMARY DIRECTIVE: FACE QUALITY & NATURALISM ---
- **Face Priority is Always On:** The quality of the facial retouch is the highest priority. Ignore outfit or background corrections if they compromise facial realism.
- **Preserve Skin Texture:** This is non-negotiable. You must preserve natural skin texture, including pores and fine lines that define character. The final result must NOT look waxy, plastic, or overly smoothed. Your process should emulate frequency separation, correcting color and tone without destroying micro-texture.
- **Identity Preservation:** You must perfectly preserve the person's core facial features, structure, likeness, and identity.

--- STUDIO RETOUCHING PIPELINE ---
1.  **Cleanup (Blemishes & Distractions):**
    - ${options.removeBlemishes ? "Subtly remove temporary blemishes, pimples, redness, and minor scars. Gently reduce under-eye discoloration, but do not completely remove it to maintain realism." : ""}
    - Clean up distracting stray hairs/flyaways around the head without altering the hairstyle.
2.  **Tonal & Dimensional Enhancement (Dodge & Burn):**
    - Apply subtle, localized dodging and burning to enhance facial contours.
    - Gently lift midtones on the forehead, cheekbones, and the bridge of the nose to add dimension.
    - Delicately burn to add definition to the jawline and cheekbones. Avoid harsh, obvious contouring.
    - Control specular highlights to prevent hotspots, keeping them elegant and photographic.
3.  **Color & Tone Harmonization:**
    - Correct any white balance issues and neutralize unnatural color casts from the environment.
    - ${options.correctSkinTones ? "Even out skin tone variations for a healthy, unified complexion. Ensure skin tones look realistic and vibrant." : ""}
4.  **Detail & Clarity Enhancement:**
    - ${options.sharpen ? "Apply micro-contrast enhancement to eyes, eyebrows, and lips to make them pop subtly. Sharpen eyelashes and hair details without creating halos or artifacts." : ""}
5.  **Eyes & Teeth:**
    - Gently brighten the sclera (whites of the eyes) to remove slight redness.
    - Add a touch of clarity and light to the irises.
    - Subtly reduce yellowness in teeth if present. Do NOT over-whiten.
6.  **Background & Artistic Effects:**
    - **Background Blur (Bokeh):** Apply a background blur with an intensity of ${options.backgroundBlur}%. A value of 0 means no blur. Higher values create a stronger depth-of-field effect, drawing focus to the subject.
    - **HDR Effect:** Apply a subtle HDR effect with an intensity of ${options.hdrEffect}%. This should enhance detail in both shadows and highlights without looking unnatural.
    - **Vintage Fade:** Apply a vintage film color fade effect with an intensity of ${options.vintageFade}%. This should gently reduce contrast in the blacks and add a slight warm color cast.
    - ${options.glossySkin ? "**Glossy Skin:** Add a tasteful, high-fashion glossy sheen to skin highlights (e.g., cheekbones, bridge of the nose). This should look like a professional makeup effect, not oily skin." : ""}

--- ADVANCED USER CONTROLS ---
- **Smoothness Intensity:** ${options.smoothness}%. This controls the blending of skin tones. A higher value means smoother transitions, but be extremely careful not to lose pore texture.
- **Light Balance:** ${options.lightBalance}%. This adjusts the overall exposure and tonal balance. Harmonize the light to be cinematic and flattering.

--- FINAL OUTPUT ---
- The result must be a single, retouched image. Do not add text or watermarks.
- Uphold the highest standards of professional portrait retouching, avoiding all common artifacts like plastic skin, over-sharpening, crushed blacks, or clipped highlights.`;

    const prompt = { text: promptText };

    try {
        const response = await genAI.models.generateContent({
            model,
            contents: { parts: [imagePart, prompt] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        return null;
    } catch (error) {
        console.error("Error performing smart retouch:", error);
        throw new Error("The AI failed to retouch the image.");
    }
};

export const generateEnvironment = async (
    personImage: ImageFile,
    environmentPreset: string,
    options: RetouchOptions
): Promise<{ base64: string; mimeType: string } | null> => {
    const model = 'gemini-2.5-flash-image';
    const personPart = { inlineData: { data: personImage.base64, mimeType: personImage.mimeType } };

    let promptText = `Act as a senior portrait retoucher and colorist. Your task is a two-part, high-end compositing job.
    
--- PERSONA & OVERARCHING RULE ---
Preserve natural skin texture and pores, apply subtle Dodge & Burn for sculpting, correct blemishes tastefully, protect skin tones during grading, and always balance lighting to match the selected environment.

--- PART 1: HIGH-END FACE RETOUCH (TOP PRIORITY) ---
Before compositing, you MUST apply a professional studio-grade retouch to the person's face.
- **Face Priority is Always On:** The quality of the facial retouch is paramount.
- **Naturalism:** Preserve skin texture (pores) and the subject's identity perfectly. Emulate frequency separation. The result must not look plastic.
- **Cleanup:** ${options.removeBlemishes ? "Remove temporary blemishes, reduce under-eye discoloration." : ""}
- **Dodge & Burn:** Apply subtle D&B for sculpting and dimension.
- **Detail:** ${options.sharpen ? "Enhance micro-contrast in eyes/brows/lips." : ""}
- **Color:** ${options.correctSkinTones ? "Correct skin tones for a unified, healthy look." : ""}

--- PART 2: ENVIRONMENT HARMONIZATION & COMPOSITING ---
After the face retouch is complete, place the subject into the environment described below. The integration must be FLAWLESS and photorealistic.

- **Environment Goal:** `;

    if (environmentPreset === 'Auto-Match') {
        promptText += `Analyze the retouched person's clothing, expression, and mood to generate the most fitting, trendy, and photorealistic environment for them. The result should look like a genuine, high-end photograph taken on location.`;
    } else {
        promptText += `Generate a photorealistic "${environmentPreset}" environment.`;
    }

    if (options.environmentHarmony) {
        promptText += `
        
- **Harmonization Pipeline (Enabled):** You must perfectly harmonize the subject with the new scene.
  - **Light Direction:** The key light direction for the subject MUST be from the **${options.lightDirection}**. If 'Auto', detect the main light source in the generated environment and match it perfectly.
  - **Intensity & Ratio:** The key/fill ratio should be approximately ${options.keyFillRatio / 100}. A lower value means higher contrast. Ensure the subject's lighting intensity matches the scene to avoid a 'pasted on' look.
  - **Color Temperature & Grading:** The subject's white balance and color grade must align with the environment. Use the **'${options.wbAndGrade}'** preset as your guide. If 'Auto', select the most appropriate grade. For example, use a warm grade for interiors, a cool grade for neon scenes, or a cinematic teal-orange look where appropriate. Protect skin tones from unnatural color casts.
  - **Shadows & Grounding:** Generate a soft, grounded contact shadow consistent with the primary light source. The shadow softness should be around ${options.shadowSoftness}%. Add subtle ambient occlusion to avoid halos.
  - **Depth & Atmosphere:** When relevant to the preset (e.g., haze in Neon Alley, bokeh in outdoor shots), add gentle atmospheric depth to seat the subject realistically into the scene.
  `;
    } else {
        promptText += `\n- **Harmonization Pipeline (Disabled):** Perform a standard composite without advanced light matching. Attempt a basic integration.`;
    }

    promptText += `
- **Final Artistic Grade & Effects:** After compositing and harmonization, apply these final artistic adjustments to the entire image for a cohesive look:
  - **HDR Effect:** Apply a subtle HDR effect with an intensity of ${options.hdrEffect}%.
  - **Vintage Fade:** Apply a vintage film color fade with an intensity of ${options.vintageFade}%.
  - **Background Blur (Bokeh):** The environment you generate should naturally have a depth of field, but you can enhance this with an additional blur intensity of ${options.backgroundBlur}%. This will further separate the subject.
  - ${options.glossySkin ? "**Glossy Skin:** Ensure the high-fashion glossy sheen on the subject's skin highlights is preserved and looks natural within the new lighting." : ""}
    `;
    
    if (options.artistCommand) {
        promptText += `
- **Artist Command (Final Adjustment):** After all other steps, apply this subtle adjustment: "${options.artistCommand}". This command should refine, not override, the core instructions. Do not let it break skin realism.`;
    }

    promptText += `

--- FINAL OUTPUT ---
- The final composite must be indistinguishable from a real photograph. Avoid all artifacts (halos, perspective mismatch, etc.).
- The output must be ONLY the final generated image. Do not add text or watermarks.`;
    
    const textPart = { text: promptText };

    try {
        const response = await genAI.models.generateContent({
            model,
            contents: { parts: [personPart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating environment:", error);
        throw new Error("The AI failed to generate the environment.");
    }
};


export const upscaleImage = async (
    baseImage: { base64: string, mimeType: string },
    target: UpscaleTarget,
): Promise<{ base64: string; mimeType: string } | null> => {
    const model = 'gemini-2.5-flash-image';

    const imagePart = {
        inlineData: {
            data: baseImage.base64,
            mimeType: baseImage.mimeType,
        },
    };
    
    const targetResolutionText = target === 'hd'
        ? 'a high-definition resolution, approximately 2K (2048px on its longest side)'
        // NOTE: Request specifies "Upscale HD", 4K logic is kept for potential future use
        : 'an ultra-high-definition 4K resolution (4096px on its longest side)';
    
    const textPart = { text: `Please upscale this image to ${targetResolutionText}. 
    **Crucial instruction:** Preserve all original details, textures, sharpness, and lighting perfectly. Do not add, remove, or alter any elements or the style of the image. Avoid over-sharpening or creating edge halos. The goal is a clean, high-fidelity upscale for professional use. The output must be only the upscaled image.` };

    try {
        const response = await genAI.models.generateContent({
            model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        
        console.error("No image found in upscale response.");
        return null;

    } catch (error) {
        console.error("Error upscaling image:", error);
        throw new Error("The AI failed to upscale the image. This could be due to a safety policy violation or an internal error.");
    }
};

export const vectorizeImage = async (
    rasterImage: { base64: string; mimeType: string }
): Promise<string | null> => {
    const model = 'gemini-2.5-flash';
    const imagePart = { inlineData: { data: rasterImage.base64, mimeType: rasterImage.mimeType } };
    
    const promptText = `You are a vector graphics expert. Analyze the provided raster image, which is a clean, minimalist vector-style illustration. Your task is to convert this image into a clean, optimized, and valid SVG code representation. 
    - Use <path> elements primarily for all shapes.
    - Preserve the colors and forms as accurately as possible.
    - Do NOT include any raster data (like <image> tags or base64 data) in the SVG.
    - Do not use <style> tags; apply colors directly to path fills.
    - Ensure the SVG has a viewBox that matches the image's proportions.
    - The output must be ONLY the raw SVG code, starting with '<svg ...>' and ending with '</svg>'. Do not wrap it in markdown, comments, or any other text.`;

    try {
        const response = await genAI.models.generateContent({
            model,
            contents: { parts: [imagePart, { text: promptText }] }
        });

        // Basic validation to ensure we got something that looks like SVG
        const svgText = response.text.trim();
        if (svgText.startsWith('<svg') && svgText.endsWith('</svg>')) {
            return svgText;
        } else {
            console.error("AI response did not look like valid SVG:", svgText);
            throw new Error("The AI failed to generate valid SVG code.");
        }
    } catch (error) {
        console.error("Error vectorizing image:", error);
        throw new Error("The AI failed to convert the image to vector format.");
    }
};