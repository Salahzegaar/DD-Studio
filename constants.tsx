import React from 'react';
import { CameraPreset, LightingPreset, MockupPreset, ManipulationPreset, RetouchPreset, PeopleRetouchPreset, AspectRatio, LightDirection, WbAndGrade, IllustrationStylePreset } from './types';
import { CameraIcon, SunIcon, CubeTransparentIcon, WandIcon, ArrowsExpandIcon, LayersIcon, SlashIcon, UserIcon, PaintBrushIcon } from './components/Icons';

export const CAMERA_PRESETS: CameraPreset[] = [
    { id: 'none', name: 'None', description: 'No specific camera instructions. The AI will decide the best angle.', metadata: '', icon: <SlashIcon className="w-6 h-6" /> },
    { id: 'hero-45', name: "45° Hero", description: 'Highlights depth and logo. Great for main posts and thumbnails.', metadata: '35–50mm lens, pitch −5°, camera height 20–40cm', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'worms-eye', name: "Worm’s-Eye", description: 'Upward shot giving power to tall products (bottles, cans).', metadata: '14–24mm lens, pitch +30–45°', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'lay-flat-top-down', name: "Lay-Flat Top-Down", description: '90° top-down with graphic composition. Trendy for Instagram.', metadata: '24–35mm lens, pitch −90°', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'macro-edge-detail', name: "Macro Edge Detail", description: 'Extreme close-up on an edge or texture for detail shots.', metadata: '70–100mm macro lens, wide aperture', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'dutch-tilt', name: "Dutch Tilt", description: '10–20° camera roll for a dynamic, energetic feel. Ideal for Reels.', metadata: '24–35mm lens, roll 10-20°', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'product-portrait', name: "Product Portrait", description: 'Eye-level shot with split light to highlight shape and logo.', metadata: '50–85mm lens, eye-level', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'negative-space', name: "Negative Space", description: 'Small product in a large empty space, perfect for ad copy.', metadata: '35–50mm lens', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'in-hand-pov', name: "In-Hand POV", description: 'Perspective of a hand holding the product for a realistic feel.', metadata: '24–35mm lens, pitch −10°', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'levitation', name: "Levitation", description: 'Floating product with a contact shadow for a dynamic post.', metadata: '35mm lens', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'mirror-reflection', name: "Mirror Reflection", description: 'Smooth reflective surface with a soft, faded reflection for a premium feel.', metadata: '35–50mm lens', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'corner-clamp', name: "Corner Clamp", description: 'Product clamped to the corner of a wall or cube. Trendy and minimal.', metadata: '24–35mm lens', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'exploded-view', name: "Exploded View", description: 'Deconstructed layers of the product on a vertical axis.', metadata: '24–35mm lens, pitch −15°', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'backlit-flare', name: "Backlit Flare", description: 'Strong backlighting with a powerful rim light for a neon/tech mood.', metadata: '24–35mm lens', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'diagonal-shelf', name: "Diagonal Shelf", description: 'Product placed on a diagonal line to create movement and flow.', metadata: '35mm lens, roll 10°', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'swatch-tiles', name: "Swatch Tiles", description: 'Color/flavor tiles surrounding the product from a top-down view.', metadata: 'Top-down, 24–35mm lens', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'splash-pour', name: "Splash & Pour", description: 'Captures liquid movement around or from the product.', metadata: '35–50mm lens, high shutter speed', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'light-sweep', name: "Light Sweep", description: 'A diagonal light sweep with motion blur. Great for short videos.', metadata: '24–35mm lens, motion blur', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'behind-the-glass', name: "Behind-the-Glass", description: 'Shot from behind a wet or smudged glass pane for a dramatic mood.', metadata: '35–50mm lens', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'geometric-top', name: "Geometric Top", description: 'Simple 3D shapes around the product from a top-down view. Graphic style.', metadata: 'Top-down, 24–35mm lens', icon: <CameraIcon className="w-6 h-6" /> },
    { id: 'cross-section', name: "Cross-Section", description: 'Half of the product is cut away to show the inside.', metadata: '35–50mm lens', icon: <CameraIcon className="w-6 h-6" /> },
];


// FIX: Corrected a typo in the type annotation for LIGHTING_PRESETS.
export const LIGHTING_PRESETS: LightingPreset[] = [
    { id: 'none', name: 'None', description: 'No specific lighting instructions. The AI will decide the best setup.', metadata: '', icon: <SlashIcon className="w-6 h-6" /> },
    { id: 'day-01', name: 'Day-01: Window Soft + Negative Fill', description: 'Soft, premium mood for skincare/matte packaging. Uses wide window light and a black flag to boost contrast.', metadata: 'key_type: window/soft, key_angle: 25°, fill: black flag right, ratio: 1:0.4, wb: 5400K, bg: neutral 60%', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'day-02', name: 'Day-02: Golden Back Rim', description: 'Creates a warm glow and edge for glass/liquids, using a low sun backlight and a golden front reflector.', metadata: 'back_key: low sun 35°, front_fill: gold reflector, ratio: 1:0.5, wb: 5000K, bloom: subtle', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'day-03', name: 'Day-03: Overcast Catalog', description: 'Very soft shadows, consistent for catalogs. Simulates an overcast sky as a giant softbox with a white bounce.', metadata: 'sky_softbox: yes, bottom_bounce: white board, ratio: 1:0.6, wb: 5600K, shadow_softness: high', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'night-01', name: 'Night-01: Low-Key Double Strip', description: 'Luxurious mood for metal/perfumes. Uses stripboxes with grids for rim lighting against a dark background.', metadata: 'strips_left_right + grids, front_key: 10–20%, ratio: 1:0.2, bg: #0E0E10, wb: 5200K', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'night-02', name: 'Night-02: Dark-Field Glass', description: 'Clearly defines glass edges using out-of-frame white panels against a black background to create strong rim lights.', metadata: 'side_panels: white, bg: black, back_kicker: mild, ratio: 1:0.15, edge_accent: strong', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'night-03', name: 'Night-03: Bright-Field Liquid', description: 'Highlights internal purity of liquids. Places the product before a lit backdrop, using black flags to define edges.', metadata: 'lit_backdrop: 70–80% L*, flags: black edges, front_fill: 20–30%, ratio: 1:0.3', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'night-04', name: 'Night-04: Parabolic Hard Specular', description: 'Creates a strong, crisp metallic shine for items like watches. Uses a focused deep parabolic reflector.', metadata: 'parabolic_focused: 120–150cm distance, flagging: tight, ratio: 1:0.15, micro_gloss: emphasized', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'night-05', name: 'Night-05: RGB Neo-Rim', description: 'Trendy neon mood for drinks/tech, using complementary colored lights like cyan and magenta for key and rim.', metadata: 'key: cyan 20–30%, rim: magenta 30–40%, wb: 5000K, reflection: 0.2 on plexi', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'night-06', name: 'Night-06: Fresnel Logo Punch', description: 'Dramatic, cinematic mood. A tightly focused fresnel spotlight highlights a logo or specific detail.', metadata: 'fresnel_spot on label, barn_doors tighten spill, soft_fill: 25%, ratio: 1:0.3', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'night-07', name: 'Night-07: Top Gradient Table', description: 'Ideal for clean packshots. A feathered top softbox creates a smooth gradient on the background surface.', metadata: 'top_softbox feathered to BG, angle: 20° behind product, ratio: 1:0.4, gradient_length: medium', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'night-08', name: 'Night-08: Cross-Polarized Clean', description: 'Essential for electronics and glossy surfaces. Matched polarizers on the light and lens cut out unwanted glare.', metadata: 'polarizers matched, key: soft 60–80cm from product, ratio: 1:0.5, glare_cut: strong', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'night-09', name: 'Gobo Patterns (Cut Shadows)', description: 'Storytelling mood for social media. An LED with a gobo projects shapes (window, leaves) as shadows.', metadata: 'key: LED with Gobo, fill: soft, ratio: 1:0.4, mood: storytelling', icon: <SunIcon className="w-6 h-6" /> },
    { id: 'night-10', name: 'Caustics Water Map', description: 'Luxurious water effect for beverages. A light source shines through rippling water to project caustics on the scene.', metadata: 'projector_through_water, key: soft, ratio: 1:0.4, effect: luxury water', icon: <SunIcon className="w-6 h-6" /> },
];

export const MOCKUP_PRESETS: MockupPreset[] = [
    { id: 'none', name: 'None (Plain Backdrop)', description: 'Product on a simple studio background.', icon: <SlashIcon className="w-6 h-6" /> },
    { id: 'shelf', name: 'Supermarket Shelf', description: 'Realistic in-store environment.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'cafe', name: 'Cafe Table', description: 'Lifestyle shot in a cozy cafe.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'billboard', name: 'Urban Billboard', description: 'Large-scale outdoor advertising in a city.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'tshirt', name: 'T-Shirt Model', description: 'Product design on a clothing mockup.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'forest', name: 'Nature Scene', description: 'Product in a natural, outdoor setting.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'beach', name: 'Beach Sunset', description: 'On wet sand with a dramatic sunset.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'mountain', name: 'Mountain Peak', description: 'On a rock with a majestic mountain vista.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'garden', name: 'Lush Garden', description: 'Amongst flowers and foliage.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'podium', name: 'Marble Podium', description: 'On a clean, minimalist marble block.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'bookshelf', name: 'Bookshelf Display', description: 'Product placed naturally on a stylish bookshelf.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'pedestal', name: 'Minimalist Pedestal', description: 'Product featured on a simple, elegant pedestal or plinth.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
    { id: 'outdoor_billboard', name: 'Outdoor Billboard', description: 'Product advertised on a large billboard in a natural or highway setting.', icon: <CubeTransparentIcon className="w-6 h-6" /> },
];

export const MANIPULATION_PRESETS: ManipulationPreset[] = [
    { id: 'none', name: 'None', description: 'No specific manipulations. AI will perform basic compositing.', icon: <SlashIcon className="w-6 h-6" /> },
    { id: 'smart-masking', name: 'Smart Masking Suite', description: 'Advanced masking with hair/edge refinement and depth mattes.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'frequency-separation', name: 'Frequency Separation (Product-Safe)', description: 'Separates texture and color for non-destructive retouching on artificial surfaces.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'displacement-map', name: 'Displacement / Normal Maps', description: 'Project logos or patterns realistically onto curved surfaces.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'perspective-match', name: 'Perspective Match', description: 'Syncs product perspective and vanishing lines with the background.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'shadow-synthesis', name: 'Shadow Catch & Synthesis', description: 'Generate realistic shadows on new surfaces, simulating studio lighting.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'ibl-match', name: 'IBL / HDR Match', description: 'Matches the product\'s lighting environment to the background HDR.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'texture-projection', name: 'Texture Projection', description: 'Project textures (stone, fabric, etc.) with correct perspective and blending.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'liquid-fx', name: 'Liquid/Splash FX', description: 'Add realistic liquid splashes with motion blur and droplets.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'atmospheric-fx', name: 'Fog/Haze/Particles', description: 'Introduce atmospheric depth with subtle fog, haze, or dust particles.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'tilt-shift', name: 'Tilt-Shift / DoF Craft', description: 'Apply a selective focus effect to draw attention to the brand.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'glitch-fx', name: 'Glitch/Scanline (Subtle)', description: 'Subtle glitch and scanline effects for a tech mood without degrading the brand.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'exploded-cutaway', name: 'Exploded & Cutaway', description: 'Deconstruct layers or create cutaway views with accurate shadows.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'cloth-warp', name: 'Cloth/Label Warp', description: 'Realistically warp labels or designs onto fabric or packaging.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'gradient-map', name: 'Gradient Map Look', description: 'Apply a fast, editable, and unified color mood using gradient maps.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'chromatic-aberration', name: 'Chromatic Aberration (Micro)', description: 'Adds subtle chromatic aberration at edges for a realistic lens effect.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'grain-halation', name: 'Grain & Halation', description: 'Apply fine grain and highlight halation for a filmic style.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'motion-trails', name: 'Motion Trails / Swipe', description: 'Create subtle motion trails or swipes to convey speed and dynamism.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'reflection-compositing', name: 'Reflection Compositing', description: 'Composite realistic reflections with accurate perspective and opacity.', icon: <LayersIcon className="w-6 h-6" /> },
    { id: 'neon-rim', name: 'Neon Rim Pack', description: 'Add controlled neon rim lighting with bloom and color dodge effects.', icon: <LayersIcon className="w-6 h-6" /> },
];

export const PEOPLE_RETOUCH_PRESETS: PeopleRetouchPreset[] = [
    { id: 'none', name: 'None', description: 'No specific retouching for people.', icon: <SlashIcon className="w-6 h-6" /> },
    { id: 'natural-skin', name: 'Natural Skin', description: 'Subtle blemish removal and skin tone evening. Preserves skin texture.', icon: <UserIcon className="w-6 h-6" /> },
    { id: 'frequency-separation-skin', name: 'Frequency Separation (Skin)', description: 'Advanced skin retouching. Smooths tones while preserving natural texture like pores. Reduces wrinkles.', icon: <UserIcon className="w-6 h-6" /> },
    { id: 'dodge-burn', name: 'Dodge & Burn', description: 'Non-destructive contouring to enhance facial features and add dimension.', icon: <UserIcon className="w-6 h-6" /> },
    { id: 'eye-enhance', name: 'Eye Enhancement', description: 'Brightens sclera, enhances iris color, and sharpens eyelashes.', icon: <UserIcon className="w-6 h-6" /> },
    { id: 'hair-cleanup', name: 'Hair Cleanup', description: 'Removes distracting flyaway hairs and refines the hairline.', icon: <UserIcon className="w-6 h-6" /> },
    { id: 'clothing-retouch', name: 'Clothing & Fabric Retouch', description: 'Removes wrinkles, lint, and stains from clothing. Fixes fabric shape and texture.', icon: <UserIcon className="w-6 h-6" /> },
    { id: 'glamour-glow', name: 'Glamour Glow', description: 'Adds a soft, diffused glow to skin highlights for a high-fashion effect.', icon: <UserIcon className="w-6 h-6" /> },
];

export const RETOUCH_PRESETS: RetouchPreset[] = [
    { id: 'none', name: 'None', description: 'No specific retouching. AI will perform basic cleanup.', icon: <SlashIcon className="w-6 h-6" /> },
    { id: 'cleanup', name: 'Clean-Up & Dust Removal', description: 'Remove dust, lint, fine scratches, and fix label imperfections.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'edge-refine', name: 'Edge Refinement', description: 'Soften or sharpen edges, remove clipping halos, and apply anti-aliasing.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'specular-control', name: 'Specular Control', description: 'Adjust highlights: reduce burnout, enhance metal/glass reflections.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'texture-pop', name: 'Texture Pop', description: 'Enhance matte, leather, or rubber textures with micro-contrast.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'micro-detail-preservation', name: 'Micro-Detail Preservation', description: 'Uses advanced techniques to protect and retain fine textures (fabric weave, brushed metal, skin pores) during all retouching and manipulation steps.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'polish', name: 'Plastic/Metal Polish', description: 'Reduce micro-scratches and unify surface glossiness.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'label-warp', name: 'Label Warp Fix', description: 'Correct sticker distortions, perspective, and cylindrical curvature.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'color-master', name: 'Color Mastering', description: 'Apply correct white balance, general toning, and match Pantone/Brand colors.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'variant-gen', name: 'Variant Generator', description: 'Create color/flavor variations using smart masks on specific parts.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'shadows', name: 'Shadow Types', description: 'Generate shadow types: Contact, Drop, Ambient, or Floating.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'reflection-builder', name: 'Reflection Builder', description: 'Create soft mirror, graded glass, or 15-40% subtle reflections.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'relight', name: 'Relight (AI/Depth)', description: 'Relight using a depth map for soft rim, key, or fill lights.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'deband-denoise', name: 'De-Band & De-Noise', description: 'Remove gradient banding and correct high ISO noise.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'glass-fx', name: 'Glass Bloom & Caustics', description: 'Add a subtle glow to glass/liquids and generate artificial caustics.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'liquid-cleanup', name: 'Liquid Cleanup', description: 'Remove unwanted bubbles/pools and unify liquid viscosity.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'print-proof', name: 'Print-Ready Proof', description: 'Perform gamut check, TAC, and apply print-specific sharpening.', icon: <WandIcon className="w-6 h-6" /> },
    { id: 'upscale', name: 'Upscale & Detail', description: 'AI upscaling with smart sharpening for web or outdoor media.', icon: <WandIcon className="w-6 h-6" /> },
];

export const EXPORT_ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
    { value: '4:5', label: 'Portrait' },
    { value: '16:9', label: 'Landscape' },
];

export const ILLUSTRATION_STYLE_PRESETS: IllustrationStylePreset[] = [
    { id: 'none', name: 'Custom Prompt Style', description: 'No specific style preset. The AI will be guided primarily by your custom text prompt.', icon: <SlashIcon className="w-6 h-6" /> },
    { id: 'vector', name: 'Clean Vector Art', description: 'Sharp lines, flat colors, and smooth gradients. Ideal for logos and modern graphics.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'watercolor', name: 'Watercolor Painting', description: 'Soft, transparent washes of color with bleeding edges, capturing a delicate, airy feel.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'pencil-sketch', name: 'Graphite Pencil Sketch', description: 'Detailed monochromatic drawing with realistic shading, texture, and cross-hatching.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'ink-drawing', name: 'Bold Ink Drawing', description: 'High-contrast black and white illustration with strong, confident lines and dramatic shadows.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'digital-painting', name: 'Digital Oil Painting', description: 'Rich, painterly strokes with visible brush texture, mimicking a classic oil on canvas.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'anime', name: 'Anime / Manga Style', description: 'Vibrant colors, distinct character designs, and dynamic action lines typical of Japanese animation.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'comic-book', name: 'American Comic Book', description: 'Inked outlines, halftone dot patterns for shading, and a bold, graphic color palette.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'low-poly', name: 'Low Poly Geometric', description: 'A stylized, abstract look using a mesh of polygonal shapes to form the image.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'storybook', name: 'Vintage Storybook', description: 'Charming, whimsical style with soft colors and clear outlines, reminiscent of classic children\'s books.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'blueprint', name: 'Technical Blueprint', description: 'A schematic-style drawing with white lines on a blue background, showing technical details.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'charcoal', name: 'Charcoal Drawing', description: 'A moody, expressive style with rich blacks, soft grays, and smudged textures.', icon: <PaintBrushIcon className="w-6 h-6" /> },
    { id: 'gouache', name: 'Matte Gouache', description: 'Opaque, flat colors with a matte finish, perfect for a bold, graphic illustration style.', icon: <PaintBrushIcon className="w-6 h-6" /> },
];

export const ENVIRONMENT_PRESETS = [
    "Auto-Match",
    "Editorial Studio",
    "Luxury Interior",
    "Modern Office",
    "Golden Hour Outdoor",
    "Neon Alley",
    "Minimal Grey Seamless",
    "Cinematic Teal-Orange",
    "High-Key Beauty",
    "Low-Key Drama",
    "Urban Night",
    "Fashion Runway",
    "Gallery/Museum",
    "Desert Sun",
    "Rainy Street"
];

export const LIGHT_DIRECTIONS: LightDirection[] = ['Auto', 'Left', 'Right', 'Top', 'Back'];

export const WB_AND_GRADES: WbAndGrade[] = ['Auto', 'Neutral', 'Filmic', 'Cinematic (Teal & Orange)', 'Warm Interior', 'Cool Night', 'Monochrome', 'Cross-Process'];