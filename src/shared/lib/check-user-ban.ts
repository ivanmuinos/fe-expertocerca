import { NextResponse } from 'next/server';
import { userModerationService } from './user-moderation';

/**
 * Middleware helper para verificar si un usuario está baneado
 * Retorna un NextResponse con error si está baneado, o null si está ok
 */
export async function checkUserBan(userId: string): Promise<NextResponse | null> {
  const isBanned = await userModerationService.isUserBanned(userId);
  
  if (!isBanned) {
    return null; // Usuario OK
  }

  const banInfo = await userModerationService.getBanInfo(userId);
  
  let banMessage = '';
  let banDetails = {};

  if (banInfo?.is_permanent) {
    banMessage = '🚫 Tu cuenta ha sido suspendida permanentemente.\n\nRazón: ' + (banInfo.ban_reason || 'Violaciones graves de políticas de contenido') + '\n\nSi crees que esto es un error, contacta a soporte.';
    banDetails = {
      type: 'permanent',
      reason: banInfo.ban_reason,
      banned_at: banInfo.banned_at,
      should_logout: true,
    };
  } else if (banInfo?.banned_until) {
    const bannedUntilDate = new Date(banInfo.banned_until);
    const now = new Date();
    const hoursRemaining = Math.ceil((bannedUntilDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    banMessage = `⏰ Tu cuenta ha sido suspendida temporalmente por ${hoursRemaining} horas más.\n\nRazón: ${banInfo.ban_reason}\n\nPodrás volver a usar la plataforma el ${bannedUntilDate.toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}.\n\nPor favor, cierra sesión e intenta más tarde.`;
    
    banDetails = {
      type: 'temporary',
      reason: banInfo.ban_reason,
      banned_until: banInfo.banned_until,
      hours_remaining: hoursRemaining,
      should_logout: true,
    };
  }

  return NextResponse.json(
    { 
      error: banMessage,
      banned: true,
      ban_details: banDetails,
    },
    { status: 403 }
  );
}
