import { ContentModerator, ModerationPolicy, ModerationDecision, ModerationLevel } from './types';

// Service that coordinates moderation (Single Responsibility)
export class ModerationService {
  constructor(
    private moderator: ContentModerator,
    private policy: ModerationPolicy
  ) {}

  async checkImage(imageBuffer: Buffer): Promise<ModerationDecision> {
    // Verificar si la moderación está habilitada
    const isModerationEnabled = process.env.ENABLE_IMAGE_MODERATION === 'true';

    if (!isModerationEnabled) {
      console.log('[ModerationService] ⚠️ Moderation is DISABLED (development mode)');
      // En desarrollo, permitir todas las imágenes sin moderar
      return {
        allowed: true,
        details: {
          adult: ModerationLevel.VERY_UNLIKELY,
          violence: ModerationLevel.VERY_UNLIKELY,
          racy: ModerationLevel.VERY_UNLIKELY,
          spoof: ModerationLevel.VERY_UNLIKELY,
          medical: ModerationLevel.VERY_UNLIKELY,
        },
      };
    }

    try {
      console.log('[ModerationService] ✅ Moderation is ENABLED (production mode)');
      
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
