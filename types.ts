export type MotionStyle = 'zoom' | 'pan' | 'depth' | 'ambient' | 'portrait';
export type AppState = 'API_KEY_CHECK' | 'API_KEY_SELECTION' | 'FORM' | 'GENERATING' | 'RESULT' | 'GALLERY';
export type AspectRatio = '16:9' | '9:16';
export type VideoModel =
  | 'veo-3.1-fast-generate-preview'
  | 'veo-3.0-fast-generate-preview'
  | 'veo-3.0-generate-preview'
  | 'veo-3.0-fast-generate'
  | 'veo-3.0-generate'
  | 'veo-2.0-generate-001';

export interface Memory {
  title: string;
  year?: number;
  motionStyle: string;
  originalPhoto: File;
  aspectRatio: AspectRatio;
}

export interface SavedVideo {
  id: string;
  user_id: string;
  title: string;
  year?: number;
  motion_style: string;
  aspect_ratio: AspectRatio;
  video_url: string;
  created_at: string;
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
