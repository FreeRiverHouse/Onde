/**
 * Dashboard Sync Module
 *
 * Sincronizza i post tra il Telegram bot locale e la dashboard onde.surf (D1)
 *
 * Flusso:
 * 1. Quando un post viene creato localmente → push to D1 via /api/sync
 * 2. Quando un post viene approvato su dashboard → pull and post to X
 * 3. Dopo posting su X → mark as posted in D1
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { PendingPost, postToX, sendPostResult, getTelegramBot, CHAT_ID } from './pending-posts';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const SYNC_URL = process.env.DASHBOARD_SYNC_URL || 'https://onde.surf/api/sync';
const SYNC_SECRET = process.env.SYNC_SECRET || 'onde-sync-2026';

// Track seen pending posts to avoid duplicate notifications
const seenPendingPosts = new Set<string>();

interface SyncResponse {
  success: boolean;
  posts?: any[];
  post?: any;
  error?: string;
  synced?: number;
}

/**
 * Push a new post to the dashboard D1 database
 */
export async function pushPostToDashboard(post: {
  account: 'frh' | 'onde' | 'magmatic';
  content: string;
  scheduled_for?: string;
  media_files?: string[];
}): Promise<SyncResponse> {
  try {
    const response = await fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SYNC_SECRET}`,
      },
      body: JSON.stringify({
        action: 'add_post',
        account: post.account,
        content: post.content,
        status: 'pending',
        scheduled_for: post.scheduled_for,
        media_files: post.media_files,
        source: 'telegram',
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    return await response.json() as SyncResponse;
  } catch (error: any) {
    console.error('Error pushing post to dashboard:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all posts from the dashboard D1 database
 */
export async function getPostsFromDashboard(): Promise<SyncResponse> {
  try {
    const response = await fetch(SYNC_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SYNC_SECRET}`,
      },
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    return await response.json() as SyncResponse;
  } catch (error: any) {
    console.error('Error getting posts from dashboard:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark a post as posted in the dashboard D1 database
 */
export async function markPostAsPostedInDashboard(postId: string, postUrl: string): Promise<SyncResponse> {
  try {
    const response = await fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SYNC_SECRET}`,
      },
      body: JSON.stringify({
        action: 'mark_posted',
        post_id: postId,
        post_url: postUrl,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    return await response.json() as SyncResponse;
  } catch (error: any) {
    console.error('Error marking post as posted:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process approved posts from dashboard - post to X and mark as posted
 */
export async function processApprovedPostsFromDashboard(): Promise<{ processed: number; errors: string[] }> {
  const result = { processed: 0, errors: [] as string[] };

  try {
    const syncResponse = await getPostsFromDashboard();

    if (!syncResponse.success || !syncResponse.posts) {
      result.errors.push(syncResponse.error || 'Failed to get posts');
      return result;
    }

    // Filter approved posts that haven't been posted yet
    const approvedPosts = syncResponse.posts.filter(
      (p: any) => p.status === 'approved' && !p.posted_at
    );

    console.log(`Found ${approvedPosts.length} approved posts to process`);

    for (const dashboardPost of approvedPosts) {
      // Convert dashboard format to local format
      const localPost: PendingPost = {
        id: dashboardPost.id,
        text: dashboardPost.content,
        account: dashboardPost.account,
        status: 'approved',
        mediaFiles: dashboardPost.media_files,
        createdAt: dashboardPost.created_at,
        approvedAt: dashboardPost.approved_at,
      };

      // Post to X
      const postResult = await postToX(localPost);

      if (postResult.success && postResult.url) {
        // Mark as posted in dashboard
        await markPostAsPostedInDashboard(dashboardPost.id, postResult.url);

        // Send notification
        await sendPostResult(localPost, true, postResult.url);

        result.processed++;
        console.log(`✅ Posted: ${postResult.url}`);
      } else {
        result.errors.push(`Post ${dashboardPost.id}: ${postResult.error}`);
        console.error(`❌ Error posting ${dashboardPost.id}:`, postResult.error);
      }
    }

    return result;
  } catch (error: any) {
    result.errors.push(error.message);
    return result;
  }
}

/**
 * Notify about new pending posts from dashboard that need approval
 */
async function notifyNewPendingPosts(posts: any[]): Promise<number> {
  const tg = getTelegramBot();
  let notified = 0;

  // Filter posts created from dashboard (not telegram) that are pending
  const dashboardPosts = posts.filter(
    (p: any) => p.status === 'pending' &&
                p.source === 'dashboard' &&
                !seenPendingPosts.has(p.id)
  );

  for (const post of dashboardPosts) {
    seenPendingPosts.add(post.id);

    const accountLabel = post.account === 'frh' ? '@FreeRiverHouse' :
                         post.account === 'onde' ? '@Onde_FRH' : '@magmatic__';

    const preview = post.content.length > 200
      ? post.content.substring(0, 200) + '...'
      : post.content;

    const message = `📝 *Nuovo post da Dashboard*\n\n` +
      `Account: ${accountLabel}\n` +
      `Fonte: onde.surf\n\n` +
      `\`\`\`\n${preview}\n\`\`\``;

    try {
      await tg.telegram.sendMessage(CHAT_ID, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Approva', callback_data: `approve_post_${post.id}` },
              { text: '❌ Rifiuta', callback_data: `reject_post_${post.id}` },
            ],
            [
              { text: '🌐 Vedi su Dashboard', url: 'https://onde.surf/social' },
            ],
          ],
        },
      });
      notified++;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  return notified;
}

/**
 * Sync check - run periodically to process approved posts AND notify about new ones
 */
export async function syncCheck(): Promise<void> {
  console.log('🔄 Running dashboard sync check...');

  // Get all posts from dashboard
  const syncResponse = await getPostsFromDashboard();

  if (syncResponse.success && syncResponse.posts) {
    // 1. Notify about new pending posts from dashboard
    const notified = await notifyNewPendingPosts(syncResponse.posts);
    if (notified > 0) {
      console.log(`📬 Notified about ${notified} new pending post(s)`);
    }
  }

  // 2. Process approved posts (post to X)
  const result = await processApprovedPostsFromDashboard();

  if (result.processed > 0) {
    console.log(`✅ Processed ${result.processed} posts`);
  }

  if (result.errors.length > 0) {
    console.log(`⚠️ Errors: ${result.errors.join(', ')}`);
  }
}

/**
 * Approve a post in D1 via sync API
 */
export async function approvePostInD1(postId: string): Promise<SyncResponse> {
  try {
    const response = await fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SYNC_SECRET}`,
      },
      body: JSON.stringify({
        action: 'approve_post',
        post_id: postId,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    return await response.json() as SyncResponse;
  } catch (error: any) {
    console.error('Error approving post in D1:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reject a post in D1 via sync API
 */
export async function rejectPostInD1(postId: string): Promise<SyncResponse> {
  try {
    const response = await fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SYNC_SECRET}`,
      },
      body: JSON.stringify({
        action: 'reject_post',
        post_id: postId,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    return await response.json() as SyncResponse;
  } catch (error: any) {
    console.error('Error rejecting post in D1:', error);
    return { success: false, error: error.message };
  }
}

// Export for CLI testing
if (require.main === module) {
  syncCheck().then(() => {
    console.log('Sync check complete');
    process.exit(0);
  });
}
