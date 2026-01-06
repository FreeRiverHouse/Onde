'use server';

export interface InstagramPostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface InstagramCredentialsStatus {
  configured: boolean;
  accountName?: string;
  error?: string;
}

/**
 * Post an image to Instagram
 * Requires: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID
 */
export async function postToInstagram(
  imageUrl: string,
  caption: string
): Promise<InstagramPostResult> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    return {
      success: false,
      error: 'Credenziali Instagram non configurate. Aggiungi INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_BUSINESS_ACCOUNT_ID nel file .env.local'
    };
  }

  try {
    // Step 1: Create media container
    const createMediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken,
        }),
      }
    );

    const mediaData = await createMediaResponse.json();

    if (mediaData.error) {
      return {
        success: false,
        error: mediaData.error.message || 'Errore nella creazione del media container'
      };
    }

    const creationId = mediaData.id;

    // Step 2: Publish the media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (publishData.error) {
      return {
        success: false,
        error: publishData.error.message || 'Errore nella pubblicazione'
      };
    }

    return {
      success: true,
      postId: publishData.id,
      postUrl: `https://www.instagram.com/p/${publishData.id}/`,
    };
  } catch (error: any) {
    console.error('Instagram API Error:', error);
    return {
      success: false,
      error: error.message || 'Errore di connessione con Instagram'
    };
  }
}

/**
 * Post a Reel to Instagram
 */
export async function postReelToInstagram(
  videoUrl: string,
  caption: string,
  coverUrl?: string
): Promise<InstagramPostResult> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    return {
      success: false,
      error: 'Credenziali Instagram non configurate.'
    };
  }

  try {
    // Step 1: Create video container
    const createMediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: videoUrl,
          caption: caption,
          media_type: 'REELS',
          cover_url: coverUrl,
          access_token: accessToken,
        }),
      }
    );

    const mediaData = await createMediaResponse.json();

    if (mediaData.error) {
      return {
        success: false,
        error: mediaData.error.message
      };
    }

    // Step 2: Wait for video processing (poll status)
    const creationId = mediaData.id;
    let status = 'IN_PROGRESS';
    let attempts = 0;
    const maxAttempts = 30; // Max 5 minutes (10s intervals)

    while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s

      const statusResponse = await fetch(
        `https://graph.facebook.com/v18.0/${creationId}?fields=status_code&access_token=${accessToken}`
      );
      const statusData = await statusResponse.json();
      status = statusData.status_code;
      attempts++;
    }

    if (status !== 'FINISHED') {
      return {
        success: false,
        error: `Video processing failed: ${status}`
      };
    }

    // Step 3: Publish
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (publishData.error) {
      return {
        success: false,
        error: publishData.error.message
      };
    }

    return {
      success: true,
      postId: publishData.id,
      postUrl: `https://www.instagram.com/reel/${publishData.id}/`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Errore durante la pubblicazione del Reel'
    };
  }
}

/**
 * Check if Instagram credentials are configured
 */
export async function checkInstagramCredentials(): Promise<InstagramCredentialsStatus> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    return {
      configured: false,
      error: 'Credenziali non configurate'
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}?fields=username,name&access_token=${accessToken}`
    );
    const data = await response.json();

    if (data.error) {
      return {
        configured: false,
        error: data.error.message
      };
    }

    return {
      configured: true,
      accountName: data.username || data.name
    };
  } catch (error: any) {
    return {
      configured: false,
      error: error.message
    };
  }
}
