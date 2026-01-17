/**
 * Onde Core Types
 * Shared types across the entire Onde platform
 */
export type ContentType = 'book' | 'music' | 'article' | 'podcast';
export interface Content {
    id: string;
    type: ContentType;
    title: string;
    author: string;
    description: string;
    status: ContentStatus;
    metadata: ContentMetadata;
    createdAt: Date;
    updatedAt: Date;
}
export type ContentStatus = 'draft' | 'editing' | 'review' | 'approved' | 'published';
export interface ContentMetadata {
    tags: string[];
    genre?: string;
    language: string;
    isbn?: string;
    isrc?: string;
    duration?: number;
    pageCount?: number;
}
export interface Book extends Content {
    type: 'book';
    chapters: Chapter[];
    format: BookFormat[];
}
export interface Chapter {
    id: string;
    title: string;
    content: string;
    order: number;
}
export type BookFormat = 'epub' | 'pdf' | 'mobi' | 'audiobook';
export interface MusicRelease extends Content {
    type: 'music';
    tracks: Track[];
    releaseType: ReleaseType;
    artwork?: string;
}
export interface Track {
    id: string;
    title: string;
    duration: number;
    audioUrl?: string;
    order: number;
}
export type ReleaseType = 'single' | 'ep' | 'album';
export type AgentType = 'editor' | 'marketer' | 'branding' | 'gtm' | 'social';
export interface Agent {
    id: string;
    type: AgentType;
    name: string;
    status: AgentStatus;
    capabilities: string[];
}
export type AgentStatus = 'idle' | 'working' | 'error' | 'offline';
export interface AgentTask {
    id: string;
    agentId: string;
    type: string;
    input: unknown;
    output?: unknown;
    status: TaskStatus;
    createdAt: Date;
    completedAt?: Date;
}
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';
export interface Campaign {
    id: string;
    name: string;
    contentId: string;
    channels: MarketingChannel[];
    status: CampaignStatus;
    budget?: number;
    startDate: Date;
    endDate?: Date;
    metrics: CampaignMetrics;
}
export type MarketingChannel = 'twitter' | 'instagram' | 'facebook' | 'email' | 'press';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
export interface CampaignMetrics {
    impressions: number;
    engagement: number;
    clicks: number;
    conversions: number;
}
export interface SocialPost {
    id: string;
    campaignId?: string;
    platform: MarketingChannel;
    content: string;
    mediaUrls?: string[];
    scheduledAt?: Date;
    publishedAt?: Date;
    status: PostStatus;
    metrics?: PostMetrics;
}
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export interface PostMetrics {
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
}
//# sourceMappingURL=index.d.ts.map