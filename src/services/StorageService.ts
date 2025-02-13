interface ChatEntry {
  id: number;
  messages: Array<{
    role: 'assistant' | 'user';
    content: string;
  }>;
  timestamp: string;
  model: string;
}

class StorageService {
  private readonly CHAT_KEY = 'currentChat';
  private broadcastChannel: BroadcastChannel;

  constructor() {
    this.broadcastChannel = new BroadcastChannel('ollama-chat-sync');
    this.setupBroadcastListener();
  }

  private setupBroadcastListener() {
    this.broadcastChannel.onmessage = event => {
      if (event.data.type === 'CHAT_UPDATED') {
        window.dispatchEvent(
          new CustomEvent('chatUpdated', {
            detail: event.data.chat,
          })
        );
      }
    };
  }

  private notifyOtherTabs(chat: ChatEntry) {
    this.broadcastChannel.postMessage({
      type: 'CHAT_UPDATED',
      chat,
    });
  }

  async saveChat(
    messages: Array<{ role: 'assistant' | 'user'; content: string }>,
    model: string
  ): Promise<void> {
    try {
      const chatEntry: ChatEntry = {
        id: 1,
        messages,
        timestamp: new Date().toISOString(),
        model,
      };

      // Save to localStorage for persistence
      localStorage.setItem(this.CHAT_KEY, JSON.stringify(chatEntry));

      // Notify other tabs
      this.notifyOtherTabs(chatEntry);
    } catch (error) {
      console.error('Error saving chat:', error);
      throw error;
    }
  }

  async loadLatestChat(): Promise<ChatEntry | null> {
    try {
      const savedChat = localStorage.getItem(this.CHAT_KEY);
      if (savedChat) {
        return JSON.parse(savedChat);
      }
      return null;
    } catch (error) {
      console.error('Error loading chat:', error);
      return null;
    }
  }

  async clearStorage(): Promise<void> {
    try {
      localStorage.removeItem(this.CHAT_KEY);
      this.notifyOtherTabs({ id: 1, messages: [], timestamp: new Date().toISOString(), model: '' });
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
