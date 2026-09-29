/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing' | 'recording';
  verified: boolean;
  role?: string;
  bio?: string;
  category?: string;
  links?: {
    label: string;
    url: string;
  }[];
  email?: string;
  simulatedPassword?: string;
  bannedStatus?: 'none' | 'temp' | 'perm';
  bannedUntil?: string;
  deactivated?: boolean;
  emailVerified?: boolean;
  verificationCode?: string;
  lastSeen?: string; // ISO String of last action or tab-close
}

export interface EmojiReaction {
  emoji: string;
  count: number;
  users: string[]; // ids of users who reacted
}

export interface Message {
  id: string;
  senderId: string; // 'me' or user id
  senderName: string;
  text?: string;
  audioUrl?: string;
  audioDuration?: number; // in seconds
  imageUrl?: string;
  videoUrl?: string;
  timestamp: string; // HH:MM
  date: string; // YYYY-MM-DD
  status: 'sent' | 'delivered' | 'read';
  reactions?: EmojiReaction[];
  isAiResponse?: boolean;
  deletedForEveryone?: boolean;
  deletedByUsers?: string[]; // IDs of users who deleted the message for themselves
  createdAt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  isGroup: boolean;
  avatar: string;
  verified: boolean;
  participants: UserProfile[];
  participantIds?: string[];
  messages: Message[];
  unreadCount: number;
  category: 'direct' | 'group' | 'ai' | 'verified';
  pinned?: boolean;
}
