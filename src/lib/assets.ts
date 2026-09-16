// ============================================================
// ASSET CONFIGURATION - Real visual assets for Math Rush
// ============================================================
// These URLs point to generated images that replace emoji-based UI.
// In production, these would be served from Supabase Storage or CDN.
// ============================================================

export const ASSETS = {
  // Skins
  skins: {
    cuyGamer: 'https://image.qwenlm.ai/generated-images/88ab4c3a-01d1-41c4-b17e-2e84faabf6ed/_result.png',
    cuyDorado: 'https://image.qwenlm.ai/generated-images/a10a7b6c-a6e8-4a96-99a6-ed451da3f033/_result.png',
    cuyCyberpunk: 'https://image.qwenlm.ai/generated-images/1a9a7a35-400d-4b78-a880-0247f3368945/_result.png',
    cuySamurai: 'https://image.qwenlm.ai/generated-images/e30ef96a-31cb-49e5-8ea7-1dccc0c93f14/_result.png',
  },
  // Mascots
  mascots: {
    llamaBlanca: 'https://image.qwenlm.ai/generated-images/4008da11-eb13-4253-b822-7c6ddae70000/_result.png',
    cuyMatematico: 'https://image.qwenlm.ai/generated-images/545477b5-0462-49b6-aa99-27f56d3c2a69/_result.png',
  },
  // Backgrounds
  backgrounds: {
    space: 'https://image.qwenlm.ai/generated-images/3468e72c-4148-4f9a-8565-9bc4c720942d/_result.png',
    neon: 'https://image.qwenlm.ai/generated-images/2f848f42-dfbb-47e8-ae21-15fdae7d3843/_result.png',
    math: 'https://image.qwenlm.ai/generated-images/f9b90eb8-0f91-4f1a-9fe1-4c3525451032/_result.png',
    nature: 'https://image.qwenlm.ai/generated-images/52ebb24b-1a72-466e-a214-e74ee4affcdc/_result.png',
  },
};

export type AssetKey = keyof typeof ASSETS.skins | keyof typeof ASSETS.mascots | keyof typeof ASSETS.backgrounds;

export function getAssetUrl(category: 'skins' | 'mascots' | 'backgrounds', key: string): string {
  const assets = ASSETS[category] as Record<string, string>;
  return assets[key] || '';
}
