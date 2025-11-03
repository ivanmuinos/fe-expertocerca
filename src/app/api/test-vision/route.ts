import { NextRequest, NextResponse } from 'next/server';
import { createModerationService } from '@/src/shared/lib/content-moderation';

/**
 * Endpoint para probar que Google Cloud Vision funciona
 * GET /api/test-vision
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar que las credenciales estén configuradas
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

    if (!credentials && !apiKey) {
      return NextResponse.json({
        error: 'No credentials configured',
        message: 'GOOGLE_CLOUD_CREDENTIALS or GOOGLE_CLOUD_VISION_API_KEY must be set',
      }, { status: 500 });
    }

    // Crear el servicio
    const moderationService = createModerationService();

    // Imagen de prueba (1x1 pixel transparente en base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');

    console.log('[TEST-VISION] Testing moderation service...');
    const decision = await moderationService.checkImage(testImageBuffer);

    return NextResponse.json({
      success: true,
      message: 'Google Cloud Vision is working!',
      testResult: {
        allowed: decision.allowed,
        reason: decision.reason,
        details: decision.details,
      },
      credentials: {
        hasCredentials: !!credentials,
        hasApiKey: !!apiKey,
        usingMethod: credentials ? 'Service Account' : 'API Key',
      },
    });
  } catch (error: any) {
    console.error('[TEST-VISION] Error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
