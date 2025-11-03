import { ModerationService } from './moderation-service';
import { GoogleVisionModerator } from './google-vision-moderator';
import { StrictModerationPolicy } from './strict-policy';

// Factory pattern for creating moderation service
export function createModerationService(): ModerationService {
  // Soportar tanto API Key como Service Account credentials
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;

  if (!apiKey && !credentials) {
    throw new Error(
      'GOOGLE_CLOUD_VISION_API_KEY or GOOGLE_CLOUD_CREDENTIALS environment variable must be set'
    );
  }

  const moderator = new GoogleVisionModerator(apiKey, credentials);
  const policy = new StrictModerationPolicy();

  return new ModerationService(moderator, policy);
}
