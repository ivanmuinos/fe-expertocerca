import { ModerationPolicy, ModerationResult, ModerationDecision, ModerationLevel } from './types';

// Strict moderation policy - blocks POSSIBLE and above
export class StrictModerationPolicy implements ModerationPolicy {
  private readonly blockedLevels = [
    ModerationLevel.POSSIBLE,
    ModerationLevel.LIKELY,
    ModerationLevel.VERY_LIKELY,
  ];

  shouldAllow(result: ModerationResult): ModerationDecision {
    const violations: string[] = [];

    if (this.isBlocked(result.adult)) {
      violations.push('contenido adulto/desnudez');
    }
    if (this.isBlocked(result.violence)) {
      violations.push('violencia explícita');
    }
    if (this.isBlocked(result.racy)) {
      violations.push('contenido sugestivo');
    }
    if (this.isBlocked(result.spoof)) {
      violations.push('imagen manipulada/fake');
    }
    if (this.isBlocked(result.medical)) {
      violations.push('contenido médico sensible');
    }

    if (violations.length > 0) {
      return {
        allowed: false,
        reason: `Imagen rechazada por: ${violations.join(', ')}`,
        details: result,
      };
    }

    return {
      allowed: true,
      details: result,
    };
  }

  private isBlocked(level: ModerationLevel): boolean {
    return this.blockedLevels.includes(level);
  }
}
