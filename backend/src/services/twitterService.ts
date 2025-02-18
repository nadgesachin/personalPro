import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import fetch from 'node-fetch'; 

interface TwitterResponse {
  data?: {
    id: string;
  };
}

export class TwitterService {
  private oauth: OAuth;

  constructor() {
    this.oauth = new OAuth({
      consumer: {
        key: process.env.CONSUMER_KEY!,
        secret: process.env.CONSUMER_SECRET!,
      },
      signature_method: 'HMAC-SHA1',
      hash_function: (baseString: string, key: string) =>
        crypto.createHmac('sha1', key).update(baseString).digest('base64'),
    });
  }

  async requestToken() {
    const requestTokenURL = 'https://api.twitter.com/oauth/request_token?oauth_callback=oob&x_auth_access_type=write';
    const authHeader = this.oauth.toHeader(
      this.oauth.authorize({
        url: requestTokenURL,
        method: 'POST',
      })
    );

    const response = await fetch(requestTokenURL, {
      method: 'POST',
      headers: {
        Authorization: authHeader['Authorization'],
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch request token');
    }

    const data = await response.text();
    const parsedData = new URLSearchParams(data);
    return Object.fromEntries(parsedData);
  }

  async accessToken(oauthToken: string, oauthSecret: string, verifier: string) {
    const url = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauthToken}`;
    const authHeader = this.oauth.toHeader(
      this.oauth.authorize({
        url,
        method: 'POST',
      })
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader['Authorization'],
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch access token');
    }

    const data = await response.text();
    const parsedData = new URLSearchParams(data);
    return Object.fromEntries(parsedData);
  }

  async postTweet(tweet: any, oauth_token: string, oauth_token_secret?: string): Promise<TwitterResponse> {
   try {
    const url = 'https://api.twitter.com/2/tweets'; 

        const token = {
            key: oauth_token,
            secret: oauth_token_secret || '',
        };

        const headers = this.oauth.toHeader(
          this.oauth.authorize({
          url,
          method: 'POST'
      }, token));

      const request = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(tweet),
        headers: {
            Authorization: headers['Authorization'],
            'user-agent': 'V2CreateTweetJS',
            'content-type': 'application/json',
            'accept': 'application/json'
        }
    })
    if (!request.ok) {
        throw new Error('Failed to post tweet');
    }
    const body = await request.json();
    return body || {};

   } catch (error) {
    console.log('postTweet error: ', error);
    throw error;
   }
}
async  checkTokenValidity(oauth_token: string, oauth_token_secret: string): Promise<boolean> {
  try {
      const response = await fetch('https://api.twitter.com/1.1/account/verify_credentials.json', {
          method: 'GET',
          headers: {
              Authorization: `OAuth oauth_token="${oauth_token}", oauth_token_secret="${oauth_token_secret}"`
          }
      });
      return response.ok; 
  } catch (error) {
      console.error('Error checking token validity:', error);
      return false; 
  }
}

}