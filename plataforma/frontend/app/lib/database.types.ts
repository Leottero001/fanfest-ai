// ============================================================================
// FanFest AI — Database Types (TypeScript)
// ============================================================================
// Hand-written types matching the Supabase schema.
// After applying migrations, regenerate with: npx supabase gen types typescript
// ============================================================================

// -------------------------------------------------------
// Enums as union types
// -------------------------------------------------------

export type PlanTier = 'starter' | 'pro' | 'empresa';
export type PlanStatus = 'active' | 'trialing' | 'past_due' | 'suspended' | 'cancelled';
export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type BusinessCategory = 'gastrobar' | 'restaurante' | 'bar' | 'café';
export type ToneType = 'paisa' | 'premium';

export type EventStatus =
  | 'scheduled'
  | 'live'
  | 'halftime'
  | 'finished'
  | 'extra_time'
  | 'penalties'
  | 'postponed'
  | 'cancelled'
  | 'suspended';

export type TriggerType =
  | 'goal_home'
  | 'goal_away'
  | 'goal_any'
  | 'halftime'
  | 'match_start'
  | 'match_end'
  | 'manual';

export type CampaignType = 'auto' | 'manual' | 'scheduled';

export type CampaignStatus =
  | 'draft'
  | 'generating'
  | 'generated'
  | 'pending_approval'
  | 'approved'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'expired'
  | 'cancelled';

export type Platform = 'instagram' | 'facebook' | 'whatsapp' | 'tiktok' | 'x';

export type PublicationStatus =
  | 'pending'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'deleted'
  | 'scheduled';

export type MediaType = 'image' | 'video' | 'carousel' | 'story' | 'reel';

export type BetaBusinessStatus = 'new' | 'contacted' | 'qualified' | 'pilot_active' | 'rejected';

// -------------------------------------------------------
// Row types (what you get from SELECT)
// -------------------------------------------------------

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_admin: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  city: string;
  address: string | null;
  category: BusinessCategory | null;
  tone_default: ToneType;
  logo_url: string | null;
  cover_image_url: string | null;
  instagram_handle: string | null;
  facebook_page_id: string | null;
  whatsapp_number: string | null;
  plan_tier: PlanTier;
  plan_status: PlanStatus;
  plan_started_at: string | null;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
}

export interface SportsEvent {
  id: string;
  external_event_id: string | null;
  external_source: string | null;
  home_team: string;
  away_team: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  league: string | null;
  season: string | null;
  venue: string | null;
  status: EventStatus;
  home_score: number;
  away_score: number;
  match_minute: number;
  event_metadata: Record<string, unknown>;
  starts_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  discount_text: string | null;
  trigger_type: TriggerType;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  business_id: string;
  sports_event_id: string | null;
  promotion_id: string | null;
  campaign_type: CampaignType;
  trigger_event: string | null;
  status: CampaignStatus;
  tone: ToneType | null;
  neighborhood_context: string | null;
  context_snapshot: Record<string, unknown>;
  created_at: string;
  approved_at: string | null;
  expires_at: string | null;
  updated_at: string;
}

export interface AiGeneration {
  id: string;
  campaign_id: string;
  prompt_system: string | null;
  prompt_user: string;
  response_text: string | null;
  model: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  estimated_cost_usd: number | null;
  quality_score: number | null;
  is_selected: boolean;
  generated_at: string;
}

export interface Publication {
  id: string;
  campaign_id: string;
  ai_generation_id: string | null;
  platform: Platform;
  platform_post_id: string | null;
  platform_url: string | null;
  status: PublicationStatus;
  media_url: string | null;
  media_type: MediaType | null;
  caption_text: string | null;
  error_message: string | null;
  published_at: string | null;
  scheduled_for: string | null;
  created_at: string;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  publication_id: string | null;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  link_clicks: number;
  profile_visits: number;
  engagement_rate: number | null;
  estimated_revenue: number | null;
  reaction_time_secs: number | null;
  fetched_at: string;
  updated_at: string;
}

export interface PromptTemplate {
  id: string;
  key: string;
  name: string;
  system_prompt: string | null;
  user_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BetaBusiness {
  id: string;
  owner_name: string;
  owner_role: string | null;
  whatsapp: string;
  email: string;
  owner_instagram: string | null;
  business_name: string;
  business_type: string;
  neighborhood: string;
  city: string;
  instagram: string | null;
  capacity_approx: string | null;
  will_stream_world_cup: boolean;
  current_promo_methods: string[] | null;
  world_cup_interest: string[] | null;
  wants_free_pilot: boolean;
  status: BetaBusinessStatus;
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------
// Insert types (what you pass to INSERT — optional fields)
// -------------------------------------------------------

export type ProfileInsert = Pick<Profile, 'id'> & Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
export type BusinessInsert = Pick<Business, 'name' | 'slug' | 'neighborhood'> & Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>;
export type BusinessMemberInsert = Pick<BusinessMember, 'business_id' | 'user_id'> & Partial<Pick<BusinessMember, 'role'>>;
export type SportsEventInsert = Pick<SportsEvent, 'home_team' | 'away_team' | 'starts_at'> & Partial<Omit<SportsEvent, 'id' | 'updated_at'>>;
export type PromotionInsert = Pick<Promotion, 'business_id' | 'name'> & Partial<Omit<Promotion, 'id' | 'created_at' | 'updated_at'>>;
export type CampaignInsert = Pick<Campaign, 'business_id'> & Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at'>>;
export type AiGenerationInsert = Pick<AiGeneration, 'campaign_id' | 'prompt_user'> & Partial<Omit<AiGeneration, 'id' | 'generated_at'>>;
export type PublicationInsert = Pick<Publication, 'campaign_id' | 'platform'> & Partial<Omit<Publication, 'id' | 'created_at'>>;
export type CampaignAnalyticsInsert = Pick<CampaignAnalytics, 'campaign_id'> & Partial<Omit<CampaignAnalytics, 'id' | 'fetched_at' | 'updated_at'>>;
export type PromptTemplateInsert = Pick<PromptTemplate, 'key' | 'name' | 'user_template'> & Partial<Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>>;
export type BetaBusinessInsert = Pick<BetaBusiness, 'owner_name' | 'whatsapp' | 'email' | 'business_name' | 'business_type' | 'neighborhood'> & Partial<Omit<BetaBusiness, 'id' | 'created_at' | 'updated_at'>>;

// -------------------------------------------------------
// Update types (all fields optional except id)
// -------------------------------------------------------

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
export type BusinessUpdate = Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>;
export type SportsEventUpdate = Partial<Omit<SportsEvent, 'id' | 'updated_at'>>;
export type PromotionUpdate = Partial<Omit<Promotion, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;
export type CampaignUpdate = Partial<Omit<Campaign, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;
export type AiGenerationUpdate = Partial<Pick<AiGeneration, 'quality_score' | 'is_selected'>>;
export type PublicationUpdate = Partial<Omit<Publication, 'id' | 'campaign_id' | 'created_at'>>;
export type CampaignAnalyticsUpdate = Partial<Omit<CampaignAnalytics, 'id' | 'campaign_id' | 'fetched_at' | 'updated_at'>>;
export type PromptTemplateUpdate = Partial<Omit<PromptTemplate, 'id' | 'key' | 'created_at' | 'updated_at'>>;
export type BetaBusinessUpdate = Partial<Omit<BetaBusiness, 'id' | 'created_at' | 'updated_at'>>;

// -------------------------------------------------------
// Supabase Database type (for createClient<Database>)
// -------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      businesses: {
        Row: Business;
        Insert: BusinessInsert;
        Update: BusinessUpdate;
      };
      business_members: {
        Row: BusinessMember;
        Insert: BusinessMemberInsert;
        Update: Partial<Pick<BusinessMember, 'role'>>;
      };
      sports_events: {
        Row: SportsEvent;
        Insert: SportsEventInsert;
        Update: SportsEventUpdate;
      };
      promotions: {
        Row: Promotion;
        Insert: PromotionInsert;
        Update: PromotionUpdate;
      };
      campaigns: {
        Row: Campaign;
        Insert: CampaignInsert;
        Update: CampaignUpdate;
      };
      ai_generations: {
        Row: AiGeneration;
        Insert: AiGenerationInsert;
        Update: AiGenerationUpdate;
      };
      publications: {
        Row: Publication;
        Insert: PublicationInsert;
        Update: PublicationUpdate;
      };
      campaign_analytics: {
        Row: CampaignAnalytics;
        Insert: CampaignAnalyticsInsert;
        Update: CampaignAnalyticsUpdate;
      };
      prompt_templates: {
        Row: PromptTemplate;
        Insert: PromptTemplateInsert;
        Update: PromptTemplateUpdate;
      };
      beta_businesses: {
        Row: BetaBusiness;
        Insert: BetaBusinessInsert;
        Update: BetaBusinessUpdate;
      };
    };
    Functions: {
      is_member_of: {
        Args: { target_business_id: string };
        Returns: boolean;
      };
      user_business_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
    };
  };
};
