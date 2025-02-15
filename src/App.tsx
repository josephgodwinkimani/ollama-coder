import { useEffect, useState } from 'react';
import { ollamaApi } from './api/ollamaApi';
import './App.css';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { ClearDataButton } from './components/ClearDataButton';
import { FileUpload } from './components/FileUpload';
import { ModelSelector } from './components/ModelSelector';
import { ModelSettingsInterface } from './components/ModelSettings';
import { WaitingIndicator } from './components/WaitingIndicator';
import { ToastProvider } from './context/ToastContext';
import { storageService } from './services/StorageService';
import { Message, Model } from './types/types';
import { modelStorage } from './utils/modelStorage';

function App() {
  const [models, setModels] = useState<Model[]>([]);
  const [modelSettings, setModelSettings] = useState({
    temperature: 0.7,
    numCores: Math.min(4, navigator.hardwareConcurrency || 4),
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('selectedModel') || '';
  });
  const [fileContent, setFileContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateTime, setDateTime] = useState('');
  const [waitStartTime, setWaitStartTime] = useState<number | null>(null);
  const [waitEndTime, setWaitEndTime] = useState<number | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await loadModels();
      loadModelSettings();
      await loadChatHistory();
    };

    initialize();

    // Set up chat sync listener
    const handleChatUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.messages) {
        setMessages(event.detail.messages);
        if (event.detail.model) {
          setSelectedModel(event.detail.model);
        }
      }
    };

    // Update time every second
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = formatDateTime(now);
      setDateTime(formattedDate);
    };

    updateDateTime(); // Initial update
    const timeInterval = setInterval(updateDateTime, 1000);

    window.addEventListener('chatUpdated', handleChatUpdate as EventListener);

    return () => {
      window.removeEventListener('chatUpdated', handleChatUpdate as EventListener);
      clearInterval(timeInterval);
    };
  }, []);

  const loadModels = async () => {
    try {
      const response = await ollamaApi.listModels();
      setModels(response?.models as Model[]);

      // Validate saved model against available models
      const validModel = modelStorage.validateSavedModel(response.models.map(m => m.name));
      setSelectedModel(validModel);
    } catch (error) {
      console.error('Error fetching models:', error);
      modelStorage.clearModel(); // Clear saved model on error
      setSelectedModel('');
    }
  };

  const handleSettingsChange = (settings: ModelSettingsInterface) => {
    setModelSettings(settings);
    // Save settings to localStorage
    localStorage.setItem('modelSettings', JSON.stringify(settings));
  };

  const formatDateTime = (date: Date): string => {
    const pad = (num: number): string => num.toString().padStart(2, '0');

    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const loadModelSettings = () => {
    const savedSettings = localStorage.getItem('modelSettings');
    if (savedSettings) {
      setModelSettings(JSON.parse(savedSettings));
    }
  };

  const loadChatHistory = async () => {
    try {
      const chat = await storageService.loadLatestChat();
      if (chat && chat?.messages && chat?.messages?.length > 0) {
        console.log('Loading chat history:', chat);
        setMessages(chat?.messages);
        if (chat?.model) {
          setSelectedModel(chat?.model);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleFileContent = (content: string, filename: string) => {
    // Create a message with the file content
    const fileMessage = `Using this file named "${filename}" with the content:\n\`\`\`${filename}\n${content}\n\`\`\`\n`;

    console.log(fileMessage);
    // Add file content for later
    setFileContent(fileMessage);
  };

  const calculateWaitTime = (startTime: number, endTime: number): string => {
    const elapsedSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedModel || !content) return;

    // Combine user's message with file content if available
    const messageContent = fileContent ? `${fileContent}\n\n${content}` : content;

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    const startTime = Date.now();
    setWaitStartTime(startTime);

    try {
      // Send the combined message to Ollama
      const messagesToSend = [...messages, { ...userMessage, content: messageContent }];
      const response = await ollamaApi.chat(selectedModel, messagesToSend, {
        temperature: modelSettings?.temperature,
        num_cores: modelSettings?.numCores,
      });
      const endTime = Date.now();
      setWaitEndTime(endTime);

      const waitTime = calculateWaitTime(startTime, endTime);

      const assistantMessage: Message = {
        ...response.message,
        timestamp: new Date().toISOString(),
        waitTime,
      };

      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);

      // Save to storage
      await storageService.saveChat(newMessages, selectedModel);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setWaitStartTime(null);
      setWaitEndTime(null);
    }
  };

  // Add this function in your App component
  const handleClearAll = () => {
    // Clear messages
    setMessages([]);

    // Clear model selection
    setSelectedModel('');
    modelStorage.clearModel();

    // Reset model settings to defaults
    const defaultSettings = {
      temperature: 0.7,
      numCores: Math.min(4, navigator.hardwareConcurrency || 4),
    };
    setModelSettings(defaultSettings);

    // Clear localStorage
    localStorage.removeItem('modelSettings');
    localStorage.removeItem('selectedModel');
    storageService.clearStorage();

    // Clear file content if any
    setFileContent('');
  };

  return (
    <ToastProvider>
      <div className="app-container">
        <header className="header">
          <div className="logo-container">
            <a href="/">
              <img src="/images/ollama.png" alt="Ollama Logo" className="logo-image" />
            </a>
          </div>
          <div className="header-info">
            <div className="info-line">
              <ClearDataButton onClear={handleClearAll} />
            </div>
          </div>
        </header>

        <main className="main-content">
          <div className="chat-container">
            <div className="model-selector">
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
                onSettingsChange={handleSettingsChange}
              />
              <FileUpload onFileContent={handleFileContent} />
            </div>

            <div className="chat-messages">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  Start a conversation by sending a message
                </div>
              )}
              <WaitingIndicator isWaiting={isLoading} startTime={waitStartTime} />
            </div>

            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
