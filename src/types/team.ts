export interface Team {
  id: string;
  name: string;
  description: string | null;
  age_group: string | null;
  season: string | null;
  logo_url: string | null;
  invite_code: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberPlayer {
  id: string;
  team_member_id: string;
  player_name: string;
  player_number: string | null;
  position: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'coach' | 'player' | 'parent';
  player_name: string | null;
  player_number: string | null;
  position: string | null;
  parent_email: string | null;
  status: 'pending' | 'active' | 'inactive';
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  players?: TeamMemberPlayer[];
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  invite_type: 'player' | 'parent' | 'coach';
  player_name: string | null;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface TeamPost {
  id: string;
  team_id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  has_liked?: boolean;
}

export interface TeamPostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface TeamEvent {
  id: string;
  team_id: string;
  title: string;
  event_type: 'practice' | 'game' | 'tournament' | 'meeting' | 'other';
  event_date: string;
  event_time: string;
  end_time: string | null;
  location: string | null;
  opponent: string | null;
  is_home: boolean | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}
