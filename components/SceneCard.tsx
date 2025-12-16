import React, { useState } from 'react';
import { Scene, VisualStyle, VisualSubStyle } from '../types';
import { generateSceneImage, editSceneImage } from '../services/geminiService';
import { Wand2, RefreshCw, Loader2, Edit3, X } from 'lucide-react';

interface SceneCardProps {
  scene: Scene;
  style: VisualStyle;
  subStyle: VisualSubStyle;
  onUpdate: (updatedScene: Scene) => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, style, subStyle, onUpdate }) => {
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    onUpdate({ ...scene, isGeneratingImage: true });
    setError(null);
    try {
      const imageUrl = await generateSceneImage(scene.description, scene.header, style, subStyle);
      onUpdate({ ...scene, imageUrl, isGeneratingImage: false });
    } catch (err) {
      console.error(err);
      setError("Failed to generate image.");
      onUpdate({ ...scene, isGeneratingImage: false });
    }
  };

  const handleEditImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scene.imageUrl || !editPrompt.trim()) return;

    onUpdate({ ...scene, isGeneratingImage: true });
    setIsEditingPrompt(false); // Close modal/input
    setError(null);

    try {
      const newImageUrl = await editSceneImage(scene.imageUrl, editPrompt, style, subStyle);
      onUpdate({ ...scene, imageUrl: newImageUrl, isGeneratingImage: false });
      setEditPrompt('');
    } catch (err) {
      console.error(err);
      setError("Failed to edit image.");
      onUpdate({ ...scene, isGeneratingImage: false });
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-850">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-indigo-600 text-xs font-bold px-2 py-1 rounded text-white uppercase tracking-wider">
            Scene {scene.sceneNumber}
          </span>
          <span className="text-gray-400 text-xs truncate max-w-[150px]" title={scene.characters.join(', ')}>
            {scene.characters.join(', ')}
          </span>
        </div>
        <h3 className="font-bold text-lg text-gray-100 uppercase font-mono tracking-tight leading-tight">
          {scene.header}
        </h3>
      </div>

      {/* Image Area */}
      <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
        {scene.isGeneratingImage ? (
          <div className="flex flex-col items-center gap-3 text-indigo-400 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-medium">Rendering...</span>
          </div>
        ) : scene.imageUrl ? (
          <>
            <img 
              src={scene.imageUrl} 
              alt={scene.header} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
               <button 
                onClick={() => setIsEditingPrompt(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-transform transform hover:scale-105"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button 
                onClick={handleGenerate}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-transform transform hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            <p className="text-gray-500 mb-4 text-sm">No storyboard visual yet</p>
            <button 
              onClick={handleGenerate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto font-medium transition-all shadow-lg shadow-indigo-900/20"
            >
              <Wand2 className="w-4 h-4" />
              Generate
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="p-4 text-gray-300 text-sm leading-relaxed flex-grow border-t border-gray-700 bg-gray-800">
        <p>{scene.description}</p>
        {error && <p className="text-red-400 mt-2 text-xs">{error}</p>}
      </div>

      {/* Edit Prompt Overlay Modal */}
      {isEditingPrompt && (
        <div className="absolute inset-0 z-10 bg-gray-900/95 flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-indigo-400" />
              Edit Image
            </h4>
            <button 
              onClick={() => setIsEditingPrompt(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleEditImage} className="flex flex-col gap-3 flex-grow justify-center">
            <p className="text-xs text-gray-400">Describe how you want to change the image (e.g., "Add a cat", "Make it darker").</p>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="Enter your instructions..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-24"
              autoFocus
            />
            <button 
              type="submit"
              disabled={!editPrompt.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Apply Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
