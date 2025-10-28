import { ModerationService } from './moderation-service';
import { GoogleVisionModerator } from './google-vision-moderator';
import { StrictModerationPolicy } from './strict-policy';

// Factory pattern for creating moderation service
export function createModerationService(): ModerationService {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GOOGLE_CLOUD_VISION_API_KEY environment variable is not set'
    );
  }

  const moderator = new GoogleVisionModerator(apiKey);
  const policy = new StrictModerationPolicy();

  return new ModerationService(moderator, policy);
}
