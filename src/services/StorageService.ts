import { Message, ChatEntry } from '../types/types';

class StorageService {
  private readonly STORAGE_KEY = 'ollama-chats';
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

  async saveChat(messages: Message[], model: string, chatEntry: ChatEntry): Promise<void> {
    try {
      const chats = await this.loadAllChats();
      const updatedChats = [...chats.filter(ch => ch.id !== chatEntry.id), chatEntry];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedChats));
      this.notifyOtherTabs(chatEntry);
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  }

  async loadAllChats(): Promise<ChatEntry[]> {
    try {
      const chats = localStorage.getItem(this.STORAGE_KEY);
      return chats ? JSON.parse(chats) : [];
    } catch (error) {
      console.error('Error loading chats:', error);
      return [];
    }
  }

  async mergeChats(newChats: ChatEntry[]): Promise<void> {
    try {
      const existingChats = await this.loadAllChats();
      const mergedChats = [...existingChats, ...newChats];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedChats));

      // Notify other tabs about the update
      this.broadcastChannel.postMessage({
        type: 'CHATS_IMPORTED',
        chats: mergedChats,
      });
    } catch (error) {
      console.error('Error merging chats:', error);
      throw error;
    }
  }

  clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const storageService = new StorageService();
