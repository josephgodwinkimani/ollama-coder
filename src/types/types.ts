export interface Model {
  name: string;
  modified_at: string;
  size: number;
}

export interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp?: string;
  waitTime?: string; // Format: "MM:SS"
}

export interface ChatEntry {
  id: number;
  messages: Message[];
  timestamp: string;
  model: string;
}
