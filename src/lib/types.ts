export interface Member {
  id: string;
  name: string;
  avatar_url: string;
  color: string;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  member_id: string;
  created_at: string;
  member?: Member;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  member_id: string;
  image_urls: string[];
  created_at: string;
  member?: Member;
}

export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  recurrence: "none" | "yearly" | "monthly";
  description: string;
  member_id: string;
  created_at: string;
  member?: Member;
}
