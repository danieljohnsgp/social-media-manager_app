import { getValidToken } from './tokenManager';
import { supabase } from '../lib/supabase';

export interface PostContent {
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface PostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

async function postToTwitter(
  accessToken: string,
  content: PostContent
): Promise<PostResult> {
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to post to Twitter');
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.data.id,
      postUrl: `https://twitter.com/i/web/status/${data.data.id}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function postToLinkedIn(
  accessToken: string,
  content: PostContent,
  userId: string
): Promise<PostResult> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to post to LinkedIn');
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function postToFacebook(
  accessToken: string,
  content: PostContent,
  pageId: string
): Promise<PostResult> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.text,
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to post to Facebook');
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function postToInstagram(
  accessToken: string,
  content: PostContent,
  accountId: string
): Promise<PostResult> {
  try {
    if (!content.mediaUrl) {
      throw new Error('Instagram posts require an image or video');
    }

    const createResponse = await fetch(
      `https://graph.instagram.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: content.mediaUrl,
          caption: content.text,
          access_token: accessToken,
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.error?.message || 'Failed to create Instagram media');
    }

    const createData = await createResponse.json();
    const creationId = createData.id;

    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(error.error?.message || 'Failed to publish Instagram post');
    }

    const publishData = await publishResponse.json();
    return {
      success: true,
      postId: publishData.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function publishPost(
  accountId: string,
  content: PostContent
): Promise<PostResult> {
  try {
    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('platform, account_handle')
      .eq('id', accountId)
      .maybeSingle();

    if (error || !account) {
      throw new Error('Account not found');
    }

    const accessToken = await getValidToken(accountId, account.platform);

    let result: PostResult;

    switch (account.platform) {
      case 'twitter':
        result = await postToTwitter(accessToken, content);
        break;
      case 'linkedin':
        result = await postToLinkedIn(accessToken, content, account.account_handle);
        break;
      case 'facebook':
        result = await postToFacebook(accessToken, content, account.account_handle);
        break;
      case 'instagram':
        result = await postToInstagram(accessToken, content, account.account_handle);
        break;
      default:
        result = {
          success: false,
          error: `Unsupported platform: ${account.platform}`,
        };
    }

    if (result.success) {
      await supabase.from('posts').insert({
        account_id: accountId,
        content: content.text,
        media_url: content.mediaUrl,
        status: 'published',
        published_at: new Date().toISOString(),
        external_post_id: result.postId,
      });
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to publish post',
    };
  }
}

export async function publishToMultipleAccounts(
  accountIds: string[],
  content: PostContent
): Promise<{ accountId: string; result: PostResult }[]> {
  const results = await Promise.all(
    accountIds.map(async (accountId) => ({
      accountId,
      result: await publishPost(accountId, content),
    }))
  );

  return results;
}
