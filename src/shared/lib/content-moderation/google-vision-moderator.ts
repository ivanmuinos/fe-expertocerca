import { ContentModerator, ModerationResult, ModerationLevel } from './types';

// Google Cloud Vision API implementation
export class GoogleVisionModerator implements ContentModerator {
  private apiKey: string;
  private endpoint = 'https://vision.googleapis.com/v1/images:annotate';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Google Cloud Vision API key is required');
    }
    this.apiKey = apiKey;
  }

  async moderateImage(imageBuffer: Buffer): Promise<ModerationResult> {
    try {
      const base64Image = imageBuffer.toString('base64');

      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'SAFE_SEARCH_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Google Vision API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const safeSearch = data.responses?.[0]?.safeSearchAnnotation;

      if (!safeSearch) {
        throw new Error('No safe search annotation in response');
      }

      return {
        adult: safeSearch.adult as ModerationLevel,
        violence: safeSearch.violence as ModerationLevel,
        racy: safeSearch.racy as ModerationLevel,
        spoof: safeSearch.spoof as ModerationLevel,
        medical: safeSearch.medical as ModerationLevel,
      };
    } catch (error) {
      console.error('[GoogleVisionModerator] Error:', error);
      throw error;
    }
  }
}
