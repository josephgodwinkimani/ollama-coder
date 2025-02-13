import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';

interface ModelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ModelSettingsInterface) => void;
  initialSettings: ModelSettingsInterface;
}

export interface ModelSettingsInterface {
  temperature: number;
  numCores: number;
}

export const ModelSettings: React.FC<ModelSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings,
}) => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<ModelSettingsInterface>(initialSettings);

  const handleSave = () => {
    onSave(settings);
    showToast('Model settings saved!', 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="model-settings">
        <h2>Model Settings</h2>

        <div className="settings-group">
          <label>
            Temperature
            <div className="setting-control">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    temperature: parseFloat(e.target.value),
                  }))
                }
              />
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    temperature: parseFloat(e.target.value),
                  }))
                }
              />
            </div>
            <div className="setting-description">
              Controls randomness: 0 is focused, 2 is more creative
            </div>
          </label>
        </div>

        <div className="settings-group">
          <label>
            Number of Cores
            <div className="setting-control">
              <input
                type="range"
                min="1"
                max={navigator.hardwareConcurrency || 8}
                step="1"
                value={settings.numCores}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    numCores: parseInt(e.target.value),
                  }))
                }
              />
              <input
                type="number"
                min="1"
                max={navigator.hardwareConcurrency || 8}
                value={settings.numCores}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    numCores: parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="setting-description">
              Number of CPU cores to use (max: {navigator.hardwareConcurrency || 8})
            </div>
          </label>
        </div>

        <div className="modal-actions">
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </Modal>
  );
};
