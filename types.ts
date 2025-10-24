export type MotionStyle = 'zoom' | 'pan' | 'depth' | 'ambient' | 'portrait';
export type AppState = 'API_KEY_CHECK' | 'API_KEY_SELECTION' | 'FORM' | 'GENERATING' | 'RESULT';
export type AspectRatio = '16:9' | '9:16';

export interface Memory {
  title: string;
  year?: number;
  motionStyle: string;
  originalPhoto: File;
  aspectRatio: AspectRatio;
}

/**
 * Defines the shape of the aistudio object available on the window,
 * which provides methods for interacting with the AI Studio environment,
 * specifically for handling API key selection.
 */
// FIX: Removed export to prevent TypeScript module resolution issues with global augmentation.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}
