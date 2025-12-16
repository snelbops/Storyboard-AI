export interface Scene {
  id: string; // Unique ID for React keys
  sceneNumber: number;
  header: string; // e.g., INT. KITCHEN - DAY
  description: string; // Visual description for the storyboard
  characters: string[];
  imageUrl?: string; // Base64 data URL
  isGeneratingImage: boolean;
}

export interface ScriptAnalysisResponse {
  scenes: {
    sceneNumber: number;
    header: string;
    description: string;
    characters: string[];
  }[];
}

export enum AppState {
  INPUT_SCRIPT = 'INPUT_SCRIPT',
  ANALYZING = 'ANALYZING',
  STORYBOARD = 'STORYBOARD',
}

export type VisualStyle = 'CINEMATIC' | 'EXPLAINER';

export type VisualSubStyle = 
  | 'PENCIL' | 'NOIR' | 'DIGITAL' | 'WATERCOLOR' // Cinematic
  | 'MEMPHIS' | 'WHITEBOARD' | 'ISOMETRIC' | 'LINE_ART'; // Explainer
