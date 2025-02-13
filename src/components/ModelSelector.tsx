import React, { useEffect, useState } from 'react';
import { Model } from '../types/types';
import { ModelSettings, ModelSettingsInterface } from './ModelSettings';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelSelect: (model: string) => void;
  onSettingsChange: (settings: ModelSettingsInterface) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelSelect,
  onSettingsChange,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [currentSettings, setCurrentSettings] = useState(() => {
    const savedSettings = localStorage.getItem('modelSettings');
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          temperature: 0.7,
          numCores: Math.min(4, navigator.hardwareConcurrency || 4),
        };
  });

  // Load saved model on component mount
  useEffect(() => {
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel && models.some(model => model.name === savedModel)) {
      onModelSelect(savedModel);
    }
  }, [models, onModelSelect]);

  const handleModelSelect = (modelName: string) => {
    onModelSelect(modelName);
    localStorage.setItem('selectedModel', modelName);
    setShowSettings(true);
  };

  const handleSettingsSave = (settings: ModelSettingsInterface) => {
    setCurrentSettings(settings);
    onSettingsChange(settings);
    localStorage.setItem('modelSettings', JSON.stringify(settings));
  };

  return (
    <div className="model-selector-container">
      <div className="model-selector-header">
        <select
          value={selectedModel}
          onChange={e => handleModelSelect(e.target.value)}
          className="model-select"
        >
          <option value="">Select a model</option>
          {models.map(model => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
        <button
          className="settings-button"
          onClick={() => setShowSettings(true)}
          disabled={!selectedModel}
        >
          ⚙️ Settings
        </button>
      </div>

      <ModelSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSettingsSave}
        initialSettings={currentSettings}
      />
    </div>
  );
};
