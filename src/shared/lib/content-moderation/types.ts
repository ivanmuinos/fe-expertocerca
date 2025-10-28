// Types for content moderation
export enum ModerationLevel {
  VERY_UNLIKELY = 'VERY_UNLIKELY',
  UNLIKELY = 'UNLIKELY',
  POSSIBLE = 'POSSIBLE',
  LIKELY = 'LIKELY',
  VERY_LIKELY = 'VERY_LIKELY',
}

export interface ModerationResult {
  adult: ModerationLevel;
  violence: ModerationLevel;
  racy: ModerationLevel;
  spoof: ModerationLevel;
  medical: ModerationLevel;
}

export interface ModerationDecision {
  allowed: boolean;
  reason?: string;
  details: ModerationResult;
}

export interface ContentModerator {
  moderateImage(imageBuffer: Buffer): Promise<ModerationResult>;
}

export interface ModerationPolicy {
  shouldAllow(result: ModerationResult): ModerationDecision;
}
