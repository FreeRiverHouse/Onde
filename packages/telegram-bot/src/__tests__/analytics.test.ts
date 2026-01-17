import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatReportMessage, getWeeklyTrend } from '../analytics.js';
import type { DailyReport, AccountMetrics } from '../analytics.js';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(() => false),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(() => '[]'),
  writeFileSync: vi.fn(),
}));

describe('Analytics', () => {
  describe('formatReportMessage', () => {
    it('should format a daily report correctly', () => {
      const report: DailyReport = {
        date: '2026-01-06',
        account: 'TestAccount',
        metrics: {
          timestamp: new Date(),
          account: 'TestAccount',
          followers: 1000,
          following: 100,
          tweets: 500,
          listed: 10,
        },
        changes: {
          followers: 15,
          following: 2,
          tweets: 3,
        },
        topTweets: [
          {
            id: '1',
            text: 'This is a top tweet with great engagement!',
            createdAt: new Date(),
            likes: 50,
            retweets: 10,
            replies: 5,
          },
        ],
        engagementSummary: {
          totalLikes: 200,
          totalRetweets: 50,
          totalReplies: 30,
          avgEngagement: 14,
        },
      };

      const message = formatReportMessage(report);

      expect(message).toContain('REPORT @TestAccount');
      expect(message).toContain('2026-01-06');
      expect(message).toContain('Followers:* 1000');
      expect(message).toContain('(+15)');
      expect(message).toContain('200 like');
      expect(message).toContain('50 retweet');
      expect(message).toContain('Top Tweet');
    });

    it('should handle negative follower changes', () => {
      const report: DailyReport = {
        date: '2026-01-06',
        account: 'TestAccount',
        metrics: {
          timestamp: new Date(),
          account: 'TestAccount',
          followers: 985,
          following: 100,
          tweets: 500,
          listed: 10,
        },
        changes: {
          followers: -15,
          following: 0,
          tweets: 1,
        },
        topTweets: [],
        engagementSummary: {
          totalLikes: 0,
          totalRetweets: 0,
          totalReplies: 0,
          avgEngagement: 0,
        },
      };

      const message = formatReportMessage(report);

      expect(message).toContain('(-15)');
    });

    it('should not show change indicator when change is zero', () => {
      const report: DailyReport = {
        date: '2026-01-06',
        account: 'TestAccount',
        metrics: {
          timestamp: new Date(),
          account: 'TestAccount',
          followers: 1000,
          following: 100,
          tweets: 500,
          listed: 10,
        },
        changes: {
          followers: 0,
          following: 0,
          tweets: 0,
        },
        topTweets: [],
        engagementSummary: {
          totalLikes: 0,
          totalRetweets: 0,
          totalReplies: 0,
          avgEngagement: 0,
        },
      };

      const message = formatReportMessage(report);

      // Should not contain (+0) or (-0)
      expect(message).not.toMatch(/\([+-]0\)/);
    });

    it('should handle empty top tweets gracefully', () => {
      const report: DailyReport = {
        date: '2026-01-06',
        account: 'TestAccount',
        metrics: {
          timestamp: new Date(),
          account: 'TestAccount',
          followers: 1000,
          following: 100,
          tweets: 500,
          listed: 10,
        },
        changes: {
          followers: 0,
          following: 0,
          tweets: 0,
        },
        topTweets: [],
        engagementSummary: {
          totalLikes: 0,
          totalRetweets: 0,
          totalReplies: 0,
          avgEngagement: 0,
        },
      };

      const message = formatReportMessage(report);

      expect(message).not.toContain('Top Tweet');
    });
  });

  describe('getWeeklyTrend', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return stable trend when no history', () => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(false);

      const trend = getWeeklyTrend('TestAccount');

      expect(trend.trend).toBe('stable');
      expect(trend.weeklyGrowth).toBe(0);
      expect(trend.dailyAvg).toBe(0);
    });

    it('should return stable trend when less than 7 days of history', () => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify([
        { timestamp: new Date().toISOString(), followers: 100 },
        { timestamp: new Date().toISOString(), followers: 105 },
      ]));

      const trend = getWeeklyTrend('TestAccount');

      expect(trend.trend).toBe('stable');
      expect(trend.weeklyGrowth).toBe(0);
    });
  });
});
