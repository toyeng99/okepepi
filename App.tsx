import React, { useState, useEffect, useCallback } from 'react';
import { Character, Scene, ArtStyleValue, AspectRatioValue } from './types';
import { ArtStyleOptions, DEFAULT_ART_STYLE, AspectRatioOptions, DEFAULT_ASPECT_RATIO } from './constants';
import { generateImage, generateEnhancedPromptWithReferences, isApiKeySet } from './services/geminiService';

import Header from './components/Header';
import Footer from './components/Footer';
import CharacterManager from './components/CharacterManager';
import StyleSelector from './components/StyleSelector';
import AspectRatioSelector from './components/AspectRatioSelector';
import SceneEditor from './components/SceneEditor';
import StoryboardGrid from './components/StoryboardGrid';
import ApiKeyWarning from './components/ApiKeyWarning';
import EditPromptModal from './components/EditPromptModal';
import LoadingSpinner from './components/LoadingSpinner';


const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedArtStyle, setSelectedArtStyle] = useState<ArtStyleValue>(DEFAULT_ART_STYLE);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioValue>(DEFAULT_ASPECT_RATIO);
  
  const [isSceneEditorOpen, setIsSceneEditorOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);

  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [sceneForPromptEdit, setSceneForPromptEdit] = useState<Scene | null>(null);
  
  const [apiKeyAvailable, setApiKeyAvailable] = useState(true); 
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

  useEffect(() => {
    setApiKeyAvailable(isApiKeySet());
  }, []);

  const updateSceneState = (sceneId: string, updates: Partial<Scene>) => {
    setScenes(prevScenes => prevScenes.map(s => s.id === sceneId ? { ...s, ...updates } : s));
  };

  // This function now primarily serves as a way to get a basic text prompt for UI/initial population
  // or as a fallback if the enhanced prompt generation fails.
  const constructBasicTextPrompt = useCallback((scene: Scene, artStyle: ArtStyleValue, aspectRatio: AspectRatioValue): string => {
    let prompt = scene.userText;
    const sceneCharsData = scene.characterIds
      .map(id => characters.find(c => c.id === id))
      .filter((c): c is Character => !!c);

    if (sceneCharsData.length > 0) {
      prompt += "\n\nCharacters involved: ";
      prompt += sceneCharsData.map(c => `${c.name} (${c.description})`).join("; ");
    }
    
    const artStyleLabel = ArtStyleOptions.find(o => o.value === artStyle)?.label || "photorealistic";
    prompt += `\n\nArt Style: ${artStyle}. Emphasize ${artStyleLabel.toLowerCase()} qualities.`;

    const aspectRatioLabel = AspectRatioOptions.find(o => o.value === aspectRatio)?.label || "16:9";
    prompt += `\n\nImage Aspect Ratio Hint: ${aspectRatio}. Generate image with a ${aspectRatioLabel.toLowerCase()} aspect ratio.`;
    
    prompt += ` Consider camera angles or shot types if implied by the scene description (e.g., wide shot, close-up, eye-level).`;
    return prompt.trim();
  }, [characters]);


  const handleGenerateScene = useCallback(async (sceneId: string, customFinalPrompt?: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    if (!apiKeyAvailable) {
        updateSceneState(sceneId, { generating: false, error: "API Key not configured." });
        return;
    }

    updateSceneState(sceneId, { generating: true, error: undefined, imageUrl: undefined });
    
    let finalPromptToUse = customFinalPrompt || scene.finalPrompt;

    try {
      // Step 1: Generate or use existing enhanced prompt
      if (!finalPromptToUse) {
        const sceneCharactersInScene = scene.characterIds
            .map(id => characters.find(c => c.id === id))
            .filter((c): c is Character => !!c);

        finalPromptToUse = await generateEnhancedPromptWithReferences(
          scene.userText,
          sceneCharactersInScene,
          characters, // Pass all characters for lookup
          selectedArtStyle,
          selectedAspectRatio
        );
        updateSceneState(sceneId, { finalPrompt: finalPromptToUse });
      }
      
      // Step 2: Generate image using the (potentially enhanced) prompt
      const imageUrl = await generateImage(finalPromptToUse, selectedAspectRatio);
      updateSceneState(sceneId, { imageUrl, generating: false });

    } catch (error) {
      console.error(`Error generating panel ${scene.panelNumber}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during generation process.';
      updateSceneState(sceneId, { error: errorMessage, generating: false });
      // If enhanced prompt failed, the error would be from generateEnhancedPromptWithReferences.
      // If image generation failed, it would be from generateImage.
      // We might want to store the basic prompt if enhanced one fails and allow retry.
      if (!finalPromptToUse && scene.userText) { // If prompt enhancement failed, populate finalPrompt with basic for editing
          const basicFallbackPrompt = constructBasicTextPrompt(scene, selectedArtStyle, selectedAspectRatio);
          updateSceneState(sceneId, { finalPrompt: basicFallbackPrompt });
      }
    }
  }, [scenes, characters, apiKeyAvailable, selectedArtStyle, selectedAspectRatio, constructBasicTextPrompt]);


  const handleSaveScene = (sceneData: { text: string; characterIds: string[] }, sceneIdToUpdate?: string) => {
    if (sceneIdToUpdate) {
      setScenes(prevScenes =>
        prevScenes.map(s =>
          s.id === sceneIdToUpdate ? { 
            ...s, 
            userText: sceneData.text, 
            characterIds: sceneData.characterIds, 
            imageUrl: undefined, // Reset image and prompt as scene details changed
            error: undefined, 
            finalPrompt: undefined 
          } : s
        )
      );
    } else {
      const newScene: Scene = {
        id: Date.now().toString(),
        panelNumber: scenes.length + 1,
        userText: sceneData.text,
        characterIds: sceneData.characterIds,
        generating: false,
      };
      setScenes(prevScenes => [...prevScenes, newScene]);
    }
    setIsSceneEditorOpen(false);
    setEditingScene(null);
  };

  const handleDeleteScene = (sceneId: string) => {
    if (window.confirm("Are you sure you want to delete this scene panel?")) {
      setScenes(prevScenes => prevScenes.filter(s => s.id !== sceneId).map((s, index) => ({ ...s, panelNumber: index + 1 })));
    }
  };

  const openSceneEditorForNew = () => {
    setEditingScene(null);
    setIsSceneEditorOpen(true);
  };

  const openSceneEditorForEdit = (scene: Scene) => {
    setEditingScene(scene);
    setIsSceneEditorOpen(true);
  };
  
  const openPromptEditor = (scene: Scene) => {
    // If no finalPrompt (enhanced prompt) exists yet, construct a basic one for editing.
    // The user can then refine this, or it will be enhanced on next generation if not edited.
    if (!scene.finalPrompt && scene.userText) { 
        const initialBasicPrompt = constructBasicTextPrompt(scene, selectedArtStyle, selectedAspectRatio);
        setSceneForPromptEdit({...scene, finalPrompt: initialBasicPrompt});
    } else {
        setSceneForPromptEdit(scene);
    }
    setIsPromptEditorOpen(true);
  };

  const handleRegenerateWithEditedPrompt = (sceneId: string, newPrompt: string) => {
    // When regenerating with an edited prompt, this newPrompt *is* the final prompt.
    updateSceneState(sceneId, { finalPrompt: newPrompt }); 
    handleGenerateScene(sceneId, newPrompt); 
  };

  const handleBatchGenerate = async () => {
    if (!apiKeyAvailable) {
        alert("API Key is not configured. Cannot generate images.");
        return;
    }
    setIsBatchGenerating(true);
    const scenesToGenerate = scenes.filter(s => !s.imageUrl && !s.generating && !s.error);
    if (scenesToGenerate.length === 0) {
        alert("No scenes to generate or all scenes are already processed/generating.");
        setIsBatchGenerating(false);
        return;
    }

    for (const scene of scenesToGenerate) {
        // handleGenerateScene will internally manage creating/using the finalPrompt
        await handleGenerateScene(scene.id); 
    }
    setIsBatchGenerating(false);
  };
  
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all characters and scenes? This action cannot be undone.")) {
        setCharacters([]);
        setScenes([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {!apiKeyAvailable && <ApiKeyWarning />}
      <Header />
      
      <main className={`container mx-auto p-4 flex-grow ${!apiKeyAvailable ? 'pt-16' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Controls */}
          <div className="lg:col-span-1 space-y-6">
            <CharacterManager characters={characters} onCharactersChange={setCharacters} />
            <StyleSelector selectedStyle={selectedArtStyle} onStyleChange={setSelectedArtStyle} />
            <AspectRatioSelector selectedAspectRatio={selectedAspectRatio} onAspectRatioChange={setSelectedAspectRatio} />
            
            <div className="p-4 bg-slate-800 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-sky-300 mb-3">Storyboard Actions</h2>
                <div className="space-y-3">
                    <button
                        onClick={openSceneEditorForNew}
                        className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-md shadow transition-colors flex items-center justify-center"
                        disabled={isBatchGenerating}
                    >
                        <i className="fas fa-plus-square mr-2"></i> Add Scene Panel
                    </button>
                    <button
                        onClick={handleBatchGenerate}
                        className="w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md shadow transition-colors flex items-center justify-center"
                        disabled={isBatchGenerating || scenes.filter(s => !s.imageUrl && !s.error && !s.generating).length === 0}
                    >
                        {isBatchGenerating ? (
                            <><LoadingSpinner size="sm" /> <span className="ml-2">Generating All...</span></>
                        ) : (
                            <><i className="fas fa-images mr-2"></i> Generate All Pending</>
                        )}
                    </button>
                     <button
                        onClick={handleClearAll}
                        className="w-full px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-md shadow transition-colors flex items-center justify-center"
                        disabled={isBatchGenerating}
                    >
                        <i className="fas fa-trash-alt mr-2"></i> Clear Project
                    </button>
                </div>
            </div>
          </div>

          {/* Right Column: Storyboard Grid */}
          <div className="lg:col-span-2">
            <StoryboardGrid
              scenes={scenes}
              characters={characters}
              onEditSceneText={openSceneEditorForEdit}
              onEditPrompt={openPromptEditor}
              onDeleteScene={handleDeleteScene}
              onRegenerateScene={(sceneId) => handleGenerateScene(sceneId)} 
            />
          </div>
        </div>
      </main>

      <Footer />

      {isSceneEditorOpen && (
        <SceneEditor
          isOpen={isSceneEditorOpen}
          onClose={() => setIsSceneEditorOpen(false)}
          onSaveScene={handleSaveScene}
          sceneToEdit={editingScene}
          characters={characters}
          title={editingScene ? `Edit Panel ${editingScene.panelNumber}` : "Add New Scene Panel"}
        />
      )}

      {isPromptEditorOpen && sceneForPromptEdit && (
          <EditPromptModal
            isOpen={isPromptEditorOpen}
            onClose={() => setIsPromptEditorOpen(false)}
            scene={sceneForPromptEdit}
            onRegenerateWithPrompt={handleRegenerateWithEditedPrompt}
          />
      )}

    </div>
  );
};

export default App;