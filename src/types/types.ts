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
  id: string; // Changed from number to string to match UUID usage
  messages: Message[];
  timestamp: string;
  model: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  timestamp: string;
}
