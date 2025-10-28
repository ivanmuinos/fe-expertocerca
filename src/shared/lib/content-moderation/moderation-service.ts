import { ContentModerator, ModerationPolicy, ModerationDecision } from './types';

// Service that coordinates moderation (Single Responsibility)
export class ModerationService {
  constructor(
    private moderator: ContentModerator,
    private policy: ModerationPolicy
  ) {}

  async checkImage(imageBuffer: Buffer): Promise<ModerationDecision> {
    try {
      // Get moderation result from the moderator
      const result = await this.moderator.moderateImage(imageBuffer);

      // Apply policy to determine if image should be allowed
      const decision = this.policy.shouldAllow(result);

      console.log('[ModerationService] Decision:', {
        allowed: decision.allowed,
        reason: decision.reason,
        details: decision.details,
      });

      return decision;
    } catch (error) {
      console.error('[ModerationService] Error checking image:', error);
      throw new Error('Error al verificar la imagen. Por favor intenta de nuevo.');
    }
  }
}
