import { createSupabaseServerClient } from '@/src/config/supabase-server';

export interface ViolationRecord {
  userId: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  moderationDetails: any;
  imageData?: any;
}

export interface BanInfo {
  is_banned: boolean;
  ban_reason?: string;
  banned_at?: string;
  banned_until?: string;
  is_permanent: boolean;
  violation_count: number;
}

export class UserModerationService {
  /**
   * Registra una violación de contenido
   */
  async recordViolation(violation: ViolationRecord): Promise<void> {
    const supabase = await createSupabaseServerClient();

    // Insertar violación
    const { error: violationError } = await supabase
      .from('content_violations')
      .insert({
        user_id: violation.userId,
        violation_type: violation.violationType,
        severity: violation.severity,
        moderation_details: violation.moderationDetails,
        image_data: violation.imageData || null,
      });

    if (violationError) {
      console.error('[UserModeration] Error recording violation:', violationError);
      throw new Error('Error al registrar violación');
    }

    // Incrementar contador de violaciones
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('violation_count')
      .eq('user_id', violation.userId)
      .single();

    const newCount = (currentProfile?.violation_count || 0) + 1;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        violation_count: newCount,
      })
      .eq('user_id', violation.userId);

    if (updateError) {
      console.error('[UserModeration] Error updating violation count:', updateError);
    }

    // Obtener el nuevo contador
    const { data: profile } = await supabase
      .from('profiles')
      .select('violation_count')
      .eq('user_id', violation.userId)
      .single();

    const violationCount = profile?.violation_count || 0;

    console.log(`[UserModeration] User ${violation.userId} violation count: ${violationCount}`);

    // Aplicar sanciones según el número de violaciones
    await this.applySanctions(violation.userId, violationCount, violation.severity);
  }

  /**
   * Aplica sanciones según el número de violaciones
   */
  private async applySanctions(
    userId: string,
    violationCount: number,
    severity: string
  ): Promise<void> {
    const supabase = await createSupabaseServerClient();

    let banReason = '';
    let bannedUntil: Date | null = null;

    // Severidad crítica = ban inmediato
    if (severity === 'critical') {
      banReason = 'Violación crítica de políticas de contenido';
      bannedUntil = null; // Ban permanente
    }
    // 3 o más violaciones = ban permanente
    else if (violationCount >= 3) {
      banReason = 'Múltiples violaciones de políticas de contenido';
      bannedUntil = null; // Ban permanente
    }
    // 2 violaciones = suspensión temporal 48 horas
    else if (violationCount === 2) {
      banReason = 'Segunda violación de políticas de contenido';
      bannedUntil = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas
    }
    // 1 violación = solo advertencia (no ban)
    else {
      console.log(`[UserModeration] Warning issued to user ${userId}`);
      return;
    }

    // Aplicar ban
    const { error } = await supabase
      .from('profiles')
      .update({
        is_banned: true,
        ban_reason: banReason,
        banned_at: new Date().toISOString(),
        banned_until: bannedUntil?.toISOString() || null,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('[UserModeration] Error applying ban:', error);
      throw new Error('Error al aplicar sanción');
    }

    console.log(`[UserModeration] User ${userId} banned:`, {
      reason: banReason,
      until: bannedUntil?.toISOString() || 'permanent',
    });
  }

  /**
   * Verifica si un usuario está baneado
   */
  async isUserBanned(userId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc('is_user_banned', {
      check_user_id: userId,
    });

    if (error) {
      console.error('[UserModeration] Error checking ban status:', error);
      return false;
    }

    return data === true;
  }

  /**
   * Obtiene información del ban de un usuario
   */
  async getBanInfo(userId: string): Promise<BanInfo | null> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc('get_ban_info', {
      check_user_id: userId,
    });

    if (error) {
      console.error('[UserModeration] Error getting ban info:', error);
      return null;
    }

    return data as BanInfo;
  }

  /**
   * Desbanea a un usuario (solo para admins)
   */
  async unbanUser(userId: string): Promise<void> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        is_banned: false,
        ban_reason: null,
        banned_at: null,
        banned_until: null,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('[UserModeration] Error unbanning user:', error);
      throw new Error('Error al desbanear usuario');
    }

    console.log(`[UserModeration] User ${userId} unbanned`);
  }
}

// Exportar instancia singleton
export const userModerationService = new UserModerationService();
