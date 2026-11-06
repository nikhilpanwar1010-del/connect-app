export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MessageType = 'text' | 'image' | 'audio' | 'sticker' | 'special_heart';
export type MessageStatus = 'sent' | 'delivered' | 'seen';

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  status_message: string | null;
  is_online: boolean;
  last_seen: string;
  created_at?: string;
  updated_at?: string;
}

export interface Room {
  id: string;
  name: string;
  invite_code: string;
  passcode: string | null;
  created_by: string | null;
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: Profile;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  media_url?: string | null;
  reply_to_id?: string | null;
  reply_to?: Message | null;
  status: MessageStatus;
  is_edited: boolean;
  created_at: string;
  updated_at?: string;
  reactions?: Reaction[];
  sender_profile?: Profile;
}

export interface Memory {
  id: string;
  room_id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  memory_date: string;
  created_at: string;
  user_profile?: Profile;
}

export interface ProposalRecord {
  id: string;
  invite_code: string;
  sender_id?: string | null;
  recipient_name: string;
  answer: string;
  answered_at: string;
}
