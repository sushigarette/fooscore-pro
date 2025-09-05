import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour notre application de baby-foot
export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
  updated_at: string
  main_hand?: 'left' | 'right'
  dominant_foot?: 'left' | 'right'
  club?: string
  company?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  default_rules: GameRules
  notifications_enabled: boolean
  theme: 'light' | 'dark' | 'system'
  language: 'fr' | 'en'
}

export interface GameRules {
  final_score: 5 | 7 | 10
  sets_enabled: boolean
  best_of?: 3 | 5
  overtime: boolean
  allow_own_goals: boolean
  allow_lobs: boolean
  handicap_enabled: boolean
}

export interface Venue {
  id: string
  name: string
  address?: string
  type: 'bar' | 'company' | 'home' | 'other'
  created_by: string
  created_at: string
  updated_at: string
}

export interface Table {
  id: string
  venue_id: string
  name: string
  qr_code: string
  rules: GameRules
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  created_by: string
  venue_id?: string
  is_permanent: boolean
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'captain' | 'member'
  joined_at: string
}

export interface Match {
  id: string
  table_id?: string
  venue_id?: string
  mode: '1v1' | '2v2'
  team_a_id: string
  team_b_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  score_a: number
  score_b: number
  sets_a: number
  sets_b: number
  rules: GameRules
  started_at?: string
  ended_at?: string
  created_at: string
  updated_at: string
  tournament_id?: string
}

export interface MatchSet {
  id: string
  match_id: string
  set_number: number
  score_a: number
  score_b: number
  winner: 'a' | 'b' | null
  created_at: string
}

export interface MatchEvent {
  id: string
  match_id: string
  event_type: 'goal' | 'undo' | 'timeout' | 'dispute'
  team: 'a' | 'b'
  player_id?: string
  set_number?: number
  minute?: number
  description?: string
  created_at: string
}

export interface Tournament {
  id: string
  name: string
  venue_id: string
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'
  max_teams: number
  status: 'draft' | 'registration' | 'in_progress' | 'completed'
  start_date: string
  end_date?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface TournamentStage {
  id: string
  tournament_id: string
  name: string
  stage_number: number
  is_active: boolean
  created_at: string
}

export interface TournamentFixture {
  id: string
  tournament_id: string
  stage_id: string
  team_a_id?: string
  team_b_id?: string
  match_id?: string
  round_number: number
  fixture_number: number
  winner_advances_to?: string
  loser_advances_to?: string
  status: 'pending' | 'in_progress' | 'completed' | 'bye'
  created_at: string
}

export interface Rating {
  id: string
  user_id: string
  mode: '1v1' | '2v2'
  venue_id?: string
  elo: number
  games_played: number
  wins: number
  losses: number
  draws: number
  created_at: string
  updated_at: string
}

export interface TeamRating {
  id: string
  team_id: string
  mode: '2v2'
  venue_id?: string
  elo: number
  games_played: number
  wins: number
  losses: number
  draws: number
  created_at: string
  updated_at: string
}

export interface Season {
  id: string
  name: string
  venue_id?: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'achievement' | 'milestone' | 'special'
  criteria: BadgeCriteria
  created_at: string
}

export interface BadgeCriteria {
  type: 'wins' | 'streak' | 'goals' | 'clean_sheet' | 'comeback' | 'mvp'
  value: number
  mode?: '1v1' | '2v2'
  venue_id?: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'match_invite' | 'match_start' | 'result_validated' | 'tournament_next_round' | 'challenge' | 'badge_earned'
  title: string
  message: string
  data?: Record<string, any>
  is_read: boolean
  created_at: string
}

export interface Dispute {
  id: string
  match_id: string
  reported_by: string
  reason: string
  status: 'open' | 'resolved' | 'dismissed'
  resolution?: string
  resolved_by?: string
  resolved_at?: string
  created_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  table_name: string
  record_id: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
} 