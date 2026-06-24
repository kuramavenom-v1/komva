export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          status: "online" | "offline";
          last_seen: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          status?: "online" | "offline";
          last_seen?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          status?: "online" | "offline";
          last_seen?: string;
          created_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          type: "direct" | "group";
          name: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: "direct" | "group";
          name?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: "direct" | "group";
          name?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      chat_participants: {
        Row: {
          chat_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          chat_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          chat_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          content: string;
          edited_at: string | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          content: string;
          edited_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          sender_id?: string;
          content?: string;
          edited_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Chat = Database["public"]["Tables"]["chats"]["Row"];
export type ChatParticipant =
  Database["public"]["Tables"]["chat_participants"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
