// Post types
export type PostStatus = 'queued' | 'approved' | 'rejected';
export type AccountType = 'onde' | 'frh' | 'magmatic';
export type PostType =
  | 'text'
  | 'image'
  | 'video'
  | 'link'
  | 'thread'
  | 'quote'
  | 'reflection'
  | 'behind_scenes'
  | 'dietro_le_quinte'
  | 'riflessione'
  | 'citazione'
  | 'lesson'
  | 'building'
  | 'tech'
  | 'tool'
  | 'progress'
  | 'thought';

export interface Post {
  id: string;
  text: string;
  account: AccountType;
  type: PostType;
  status: PostStatus;
  image?: string;
  video?: string;
  link?: LinkPreview;
  thread?: ThreadPost[];
  scheduledTime?: string;
  scheduledDate?: string;
  metadata?: {
    author?: string;
    source?: string;
    year?: string;
    book?: string;
  };
}

export interface ThreadPost {
  id: string;
  text: string;
  image?: string;
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

export interface AccountInfo {
  id: AccountType;
  displayName: string;
  username: string;
  avatar?: string;
  verified?: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Calendar data structure from JSON files
export interface CalendarData {
  onde?: CalendarPost[];
  freeriverhouse?: CalendarPost[];
  magmatic?: CalendarPost[];
  frh?: CalendarPost[];
  lastPosted?: {
    onde?: string | null;
    frh?: string | null;
  };
}

export interface CalendarPost {
  id: string;
  text: string;
  account?: AccountType;
  type: PostType;
  status?: PostStatus;
  image?: string;
  book?: string | null;
  metadata?: {
    author?: string;
    source?: string;
    year?: string;
  };
}
