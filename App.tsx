import React, { useState } from 'react';
import { breakScriptIntoScenes } from './services/geminiService';
import { Scene, AppState, VisualStyle, VisualSubStyle } from './types';
import { SceneCard } from './components/SceneCard';
import { Clapperboard, FileText, Sparkles, AlertCircle, Film, Presentation, ChevronDown } from 'lucide-react';

const SAMPLE_SCRIPT = `INT. COFFEE SHOP - DAY

JANE (30s, disheveled) stares into her black coffee. The cafe is buzzing, but she is in a bubble of silence.

MARK (30s, sharp suit) enters, scanning the room. He spots Jane and approaches tentatively.

MARK
I didn't think you'd come.

Jane doesn't look up.

JANE
I needed the caffeine. Don't flatter yourself.

Mark pulls out a chair and sits. The tension is thick enough to cut with a knife.`;

const STYLE_OPTIONS = {
  CINEMATIC: [
    { id: 'PENCIL', label: 'Pencil Sketch' },
    { id: 'NOIR', label: 'Film Noir' },
    { id: 'DIGITAL', label: 'Digital Painting' },
    { id: 'WATERCOLOR', label: 'Watercolor' },
  ],
  EXPLAINER: [
    { id: 'MEMPHIS', label: 'Corporate Memphis' },
    { id: 'WHITEBOARD', label: 'Whiteboard Animation' },
    { id: 'ISOMETRIC', label: 'Isometric 3D' },
    { id: 'LINE_ART', label: 'Tech Line Art' },
  ]
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT_SCRIPT);
  const [scriptText, setScriptText] = useState(SAMPLE_SCRIPT);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('CINEMATIC');
  const [subStyle, setSubStyle] = useState<VisualSubStyle>('PENCIL');
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeScript = async () => {
    if (!scriptText.trim()) return;
    
    setAppState(AppState.ANALYZING);
    setError(null);
    
    try {
      const response = await breakScriptIntoScenes(scriptText);
      
      const newScenes: Scene[] = response.scenes.map((s, index) => ({
        ...s,
        id: `scene-${Date.now()}-${index}`,
        isGeneratingImage: false
      }));

      setScenes(newScenes);
      setAppState(AppState.STORYBOARD);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze script. Please try again.");
      setAppState(AppState.INPUT_SCRIPT);
    }
  };

  const handleUpdateScene = (updatedScene: Scene) => {
    setScenes(prev => prev.map(s => s.id === updatedScene.id ? updatedScene : s));
  };

  const resetApp = () => {
    setAppState(AppState.INPUT_SCRIPT);
    setScenes([]);
    setError(null);
  };

  const changeStyle = (style: VisualStyle) => {
    setVisualStyle(style);
    // Set default substyle based on new style
    if (style === 'CINEMATIC') {
      setSubStyle('PENCIL');
    } else {
      setSubStyle('MEMPHIS');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 cursor-pointer" onClick={resetApp}>
            <Clapperboard className="w-6 h-6" />
            <span className="font-bold text-xl text-white tracking-tight">StoryBoard AI</span>
          </div>
          <div className="flex items-center gap-4">
             {appState === AppState.STORYBOARD && (
               <button 
                 onClick={resetApp}
                 className="text-sm text-gray-400 hover:text-white transition-colors"
               >
                 New Project
               </button>
             )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* INPUT STATE */}
        {appState === AppState.INPUT_SCRIPT && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
                From <span className="text-indigo-400">Script</span> to <span className="text-indigo-400">Visuals</span> in Seconds.
              </h1>
              <p className="text-gray-400 text-lg">
                Paste your screenplay below. We'll break it down into scenes and help you visualize them with Gemini AI.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-850 border-b border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  script.txt
                </div>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
              </div>
              <textarea
                className="w-full h-96 p-6 bg-gray-900 text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-none"
                placeholder="Paste your script here..."
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
              />
              <div className="p-4 bg-gray-850 border-t border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Style Selector on Input Screen */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                   <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-700">
                      <button
                        onClick={() => changeStyle('CINEMATIC')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                          visualStyle === 'CINEMATIC' 
                            ? 'bg-gray-700 text-white shadow-sm ring-1 ring-gray-600' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <Film className="w-3.5 h-3.5" />
                        Cinematic
                      </button>
                      <button
                        onClick={() => changeStyle('EXPLAINER')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                          visualStyle === 'EXPLAINER' 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <Presentation className="w-3.5 h-3.5" />
                        Explainer
                      </button>
                   </div>

                   {/* Sub Style Dropdown */}
                   <div className="relative">
                      <select
                        value={subStyle}
                        onChange={(e) => setSubStyle(e.target.value as VisualSubStyle)}
                        className="appearance-none bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 pr-8 font-medium"
                      >
                        {STYLE_OPTIONS[visualStyle].map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <ChevronDown className="h-3 w-3" />
                      </div>
                   </div>
                </div>

                <button
                  onClick={handleAnalyzeScript}
                  disabled={!scriptText.trim()}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze & Breakdown
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANALYZING STATE */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in duration-700">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <Sparkles className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mt-8 mb-2">Analyzing Script...</h2>
            <p className="text-gray-400">Identifying scenes, characters, and actions.</p>
          </div>
        )}

        {/* STORYBOARD STATE */}
        {appState === AppState.STORYBOARD && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Storyboard</h2>
                <p className="text-gray-400 text-sm">
                  {scenes.length} scenes identified. Generate visuals to bring them to life.
                </p>
              </div>
              
              {/* Style Tabs and Dropdown */}
              <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-gray-900/50 p-2 rounded-xl border border-gray-800">
                <div className="bg-gray-800 p-1 rounded-lg flex items-center border border-gray-700">
                  <button
                    onClick={() => changeStyle('CINEMATIC')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      visualStyle === 'CINEMATIC' 
                        ? 'bg-gray-700 text-white shadow-sm' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    Cinematic
                  </button>
                  <button
                    onClick={() => changeStyle('EXPLAINER')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      visualStyle === 'EXPLAINER' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Presentation className="w-4 h-4" />
                    Explainer
                  </button>
                </div>

                <div className="h-8 w-[1px] bg-gray-700 hidden sm:block mx-1"></div>

                 {/* Sub Style Dropdown for Storyboard View */}
                 <div className="relative min-w-[160px]">
                      <select
                        value={subStyle}
                        onChange={(e) => setSubStyle(e.target.value as VisualSubStyle)}
                        className="appearance-none bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full px-4 py-2.5 pr-8 font-medium shadow-sm"
                      >
                        {STYLE_OPTIONS[visualStyle].map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                   </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {scenes.map((scene) => (
                <SceneCard 
                  key={scene.id} 
                  scene={scene} 
                  style={visualStyle}
                  subStyle={subStyle}
                  onUpdate={handleUpdateScene} 
                />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
